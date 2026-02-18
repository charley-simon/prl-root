use std::{
    fs,
    io::Write,
    path::PathBuf,
    sync::{Arc, Mutex},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use ratatui::{
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph},
    Terminal,
};
use crossterm::{
    event::{self, Event as CEvent, KeyCode, KeyEvent, KeyEventKind, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use anyhow::Result;
use serde_json::Value;
use tungstenite::{connect, Message};

// ─────────────────────────────────────────────
// Mode du prompt
// ─────────────────────────────────────────────
#[derive(Clone, PartialEq, Debug)]
enum PromptMode {
    Command,          // mode normal : envoie des commandes au serveur
    FilterLogs,       // mode filtre logs : >terme
    FilterTraces,     // mode filtre traces : F puis terme
}

// ─────────────────────────────────────────────
// Niveau de verbosité des logs
// ─────────────────────────────────────────────
#[derive(Clone, Copy, PartialEq, Debug)]
enum LogLevel {
    All,
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    fn next(self) -> Self {
        match self {
            Self::All   => Self::Debug,
            Self::Debug => Self::Info,
            Self::Info  => Self::Warn,
            Self::Warn  => Self::Error,
            Self::Error => Self::All,
        }
    }
    fn label(self) -> &'static str {
        match self {
            Self::All   => "ALL",
            Self::Debug => "DEBUG",
            Self::Info  => "INFO",
            Self::Warn  => "WARN",
            Self::Error => "ERROR",
        }
    }
    fn color(self) -> Color {
        match self {
            Self::All   => Color::White,
            Self::Debug => Color::DarkGray,
            Self::Info  => Color::Cyan,
            Self::Warn  => Color::Yellow,
            Self::Error => Color::Red,
        }
    }
    fn accepts(self, entry: LogLevel) -> bool {
        match self {
            Self::All   => true,
            Self::Debug => true,
            Self::Info  => !matches!(entry, Self::Debug),
            Self::Warn  => matches!(entry, Self::Warn | Self::Error),
            Self::Error => matches!(entry, Self::Error),
        }
    }
}

// ─────────────────────────────────────────────
// Entrée de log stockée en mémoire
// ─────────────────────────────────────────────
#[derive(Clone)]
struct LogEntry {
    text:  String,
    level: LogLevel,
    color: Color,
}

// ─────────────────────────────────────────────
// Helpers : filtre sous-chaîne insensible casse
// ─────────────────────────────────────────────
fn matches_filter(text: &str, filter: &str) -> bool {
    if filter.is_empty() { return true; }
    text.to_lowercase().contains(&filter.to_lowercase())
}

/// Découpe une ligne en spans pour mettre le terme en surbrillance
fn highlight_line(text: &str, filter: &str, base_color: Color) -> Line<'static> {
    if filter.is_empty() {
        return Line::from(Span::styled(text.to_string(), Style::default().fg(base_color)));
    }
    let lower_text   = text.to_lowercase();
    let lower_filter = filter.to_lowercase();
    let mut spans    = Vec::new();
    let mut cursor   = 0usize;

    while let Some(pos) = lower_text[cursor..].find(&lower_filter) {
        let abs = cursor + pos;
        // texte avant le match
        if abs > cursor {
            spans.push(Span::styled(
                text[cursor..abs].to_string(),
                Style::default().fg(base_color),
            ));
        }
        // le match en surbrillance
        spans.push(Span::styled(
            text[abs..abs + filter.len()].to_string(),
            Style::default()
                .fg(Color::Black)
                .bg(Color::Yellow)
                .add_modifier(Modifier::BOLD),
        ));
        cursor = abs + filter.len();
    }
    // reste après le dernier match
    if cursor < text.len() {
        spans.push(Span::styled(
            text[cursor..].to_string(),
            Style::default().fg(base_color),
        ));
    }
    Line::from(spans)
}

// ─────────────────────────────────────────────
// Commandes connues pour l'autocomplétion
// ─────────────────────────────────────────────
const COMMANDS: &[&str] = &[
    "ping",
    "status",
    "start trace",
    "stop trace",
    "pause trace",
];

/// Retourne la liste des commandes qui commencent par `prefix` (insensible casse)
fn autocomplete(prefix: &str) -> Vec<String> {
    let lower = prefix.to_lowercase();
    COMMANDS
        .iter()
        .filter(|cmd| cmd.starts_with(&lower as &str))
        .map(|s| s.to_string())
        .collect()
}

fn main() -> Result<()> {
    // --- Terminal setup ---
    enable_raw_mode()?;
    let mut stdout = std::io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // --- Shared state ---
    let traces  = Arc::new(Mutex::new(Vec::<String>::new()));
    let logs    = Arc::new(Mutex::new(Vec::<LogEntry>::new()));
    let metrics = Arc::new(Mutex::new(String::from("CPU: --% | MEM: --MB")));

    let input_buffer  = Arc::new(Mutex::new(String::new()));
    let prompt_mode   = Arc::new(Mutex::new(PromptMode::Command));

    let history_path = history_file_path();
    let initial_history = load_history(&history_path);
    let history_len = initial_history.len();
    let history: Arc<Mutex<Vec<String>>>         = Arc::new(Mutex::new(initial_history));
    let history_index: Arc<Mutex<Option<usize>>> = Arc::new(Mutex::new(None));
    let connected = Arc::new(Mutex::new(false));

    // Pause scroll
    let traces_paused = Arc::new(Mutex::new(false));
    let logs_paused   = Arc::new(Mutex::new(false));
    let traces_scroll: Arc<Mutex<u16>> = Arc::new(Mutex::new(0));
    let logs_scroll:   Arc<Mutex<u16>> = Arc::new(Mutex::new(0));

    // Niveaux de verbosité
    let log_level = Arc::new(Mutex::new(LogLevel::All));

    // Filtres actifs (terme validé, vide = pas de filtre)
    let filter_logs:   Arc<Mutex<String>> = Arc::new(Mutex::new(String::new()));
    let filter_traces: Arc<Mutex<String>> = Arc::new(Mutex::new(String::new()));

    // Autocomplétion : liste des candidats et index courant
    let ac_candidates: Arc<Mutex<Vec<String>>>   = Arc::new(Mutex::new(Vec::new()));
    let ac_index:      Arc<Mutex<Option<usize>>>  = Arc::new(Mutex::new(None));

    // --- Connexion WebSocket ---
    let (ws_stream, _) = connect("ws://127.0.0.1:9000/admin")
        .map_err(|e| anyhow::anyhow!(
            "Connexion WebSocket échouée: {}.\nServeur lancé ? (npx tsx backend/engine/server.ts)", e
        ))?;

    *connected.lock().unwrap() = true;

    // Log du chargement de l'historique (visible dès le premier rendu)
    if history_len > 0 {
        push_log(&logs, &format!("📖 Historique chargé — {} commandes (↑↓ pour naviguer)", history_len), LogLevel::Info, Color::DarkGray);
    }

    let ws = Arc::new(Mutex::new(ws_stream));
    let (tx, rx) = std::sync::mpsc::channel::<String>();

    // ─────────────────────────────────────────
    // Thread lecture WebSocket
    // ─────────────────────────────────────────
    {
        let ws_clone        = ws.clone();
        let logs_clone      = logs.clone();
        let traces_clone    = traces.clone();
        let metrics_clone   = metrics.clone();
        let connected_clone = connected.clone();

        thread::spawn(move || {
            loop {
                let msg = { ws_clone.lock().unwrap().read() };

                match msg {
                    Ok(Message::Text(text)) => {
                        for line in text.lines() {
                            if line.is_empty() { continue; }
                            match serde_json::from_str::<Value>(line) {
                                Ok(json) => {
                                    let event_type = json.get("type").and_then(|v| v.as_str()).unwrap_or("");
                                    match event_type {
                                        "metrics" => {
                                            let cpu = json.get("cpu").and_then(|v| v.as_f64()).unwrap_or(0.0);
                                            let mem = json.get("mem").and_then(|v| v.as_f64()).unwrap_or(0.0);
                                            *metrics_clone.lock().unwrap() = format!("CPU: {:.1}% | MEM: {:.1}MB", cpu, mem);
                                        }
                                        "trace" => {
                                            let msg = json.get("message").and_then(|v| v.as_str()).unwrap_or(line).to_string();
                                            let mut t = traces_clone.lock().unwrap();
                                            t.push(msg);
                                            if t.len() > 2000 { t.remove(0); }
                                        }
                                        "pong"   => push_log(&logs_clone, "SERVER → pong", LogLevel::Info, Color::Green),
                                        "log"    => {
                                            let msg       = json.get("message").and_then(|v| v.as_str()).unwrap_or("").to_string();
                                            let raw_level = json.get("level").and_then(|v| v.as_str()).unwrap_or("info");
                                            let (level, color) = parse_level(raw_level);
                                            push_log(&logs_clone, &format!("LOG    → {}", msg), level, color);
                                        }
                                        "status" => {
                                            let tracing = json.get("tracing").and_then(|v| v.as_bool()).unwrap_or(false);
                                            let clients = json.get("clients").and_then(|v| v.as_u64()).unwrap_or(0);
                                            push_log(&logs_clone, &format!("STATUS → tracing={} clients={}", tracing, clients), LogLevel::Info, Color::Cyan);
                                        }
                                        "error"  => {
                                            let msg = json.get("message").and_then(|v| v.as_str()).unwrap_or("erreur inconnue").to_string();
                                            push_log(&logs_clone, &format!("ERROR  → {}", msg), LogLevel::Error, Color::Red);
                                        }
                                        _        => push_log(&logs_clone, &format!("SERVER → {}", line), LogLevel::Debug, Color::DarkGray),
                                    }
                                }
                                Err(_) => push_log(&logs_clone, &format!("RAW    → {}", line), LogLevel::Debug, Color::DarkGray),
                            }
                        }
                    }
                    Ok(Message::Close(_)) => {
                        *connected_clone.lock().unwrap() = false;
                        push_log(&logs_clone, "SERVER → connexion fermée", LogLevel::Warn, Color::Yellow);
                        break;
                    }
                    Err(e) => {
                        *connected_clone.lock().unwrap() = false;
                        push_log(&logs_clone, &format!("WS ERROR → {}", e), LogLevel::Error, Color::Red);
                        break;
                    }
                    _ => {}
                }
            }
        });
    }

    // ─────────────────────────────────────────
    // Thread écriture WebSocket
    // ─────────────────────────────────────────
    {
        let ws_clone   = ws.clone();
        let logs_clone = logs.clone();
        thread::spawn(move || {
            while let Ok(line) = rx.recv() {
                if let Err(e) = ws_clone.lock().unwrap().send(Message::Text(line.into())) {
                    push_log(&logs_clone, &format!("WS SEND ERROR → {}", e), LogLevel::Error, Color::Red);
                    break;
                }
            }
        });
    }

    // ─────────────────────────────────────────
    // Boucle principale
    // ─────────────────────────────────────────
    loop {
        terminal.draw(|f| {
            let size = f.area();

            let v_chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([Constraint::Length(3), Constraint::Min(5), Constraint::Length(3)])
                .split(size);

            let h_chunks = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([Constraint::Percentage(60), Constraint::Percentage(40)])
                .split(v_chunks[1]);

            // ── Metrics ──────────────────────────────────────────────────
            let metrics_text  = metrics.lock().unwrap().clone();
            let is_connected  = *connected.lock().unwrap();
            let current_level = *log_level.lock().unwrap();
            let fl            = filter_logs.lock().unwrap().clone();
            let ft            = filter_traces.lock().unwrap().clone();

            let mut metric_spans = vec![
                Span::styled(
                    if is_connected { "● CONNECTÉ" } else { "○ DÉCONNECTÉ" },
                    Style::default()
                        .fg(if is_connected { Color::Green } else { Color::Red })
                        .add_modifier(Modifier::BOLD),
                ),
                Span::raw(format!("   {}   │   Logs: ", metrics_text)),
                Span::styled(current_level.label(), Style::default().fg(current_level.color()).add_modifier(Modifier::BOLD)),
            ];
            if !fl.is_empty() {
                metric_spans.push(Span::raw("   │   "));
                metric_spans.push(Span::styled(format!("🔍 logs:\"{}\"", fl), Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)));
            }
            if !ft.is_empty() {
                metric_spans.push(Span::raw("   "));
                metric_spans.push(Span::styled(format!("🔍 traces:\"{}\"", ft), Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD)));
            }

            f.render_widget(
                Paragraph::new(Line::from(metric_spans))
                    .block(Block::default()
                        .title(Span::styled("Metrics", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)))
                        .borders(Borders::ALL)
                        .border_style(Style::default().fg(Color::Cyan))),
                v_chunks[0],
            );

            // ── Traces (panneau gauche) ───────────────────────────────────
            let t_paused     = *traces_paused.lock().unwrap();
            let traces_guard = traces.lock().unwrap();
            let ft_active    = ft.clone();

            let trace_lines: Vec<Line> = traces_guard
                .iter()
                .filter(|line| matches_filter(line, &ft_active))
                .map(|line| highlight_line(line, &ft_active, Color::Magenta))
                .collect();

            let t_height = h_chunks[0].height.saturating_sub(2) as usize;
            let t_scroll = if t_paused {
                *traces_scroll.lock().unwrap()
            } else {
                trace_lines.len().saturating_sub(t_height) as u16
            };

            let t_title = {
                let total   = traces_guard.len();
                let visible = trace_lines.len();
                if !ft_active.is_empty() {
                    if t_paused {
                        format!("Traces [PAUSE ↑↓ T=reprendre] 🔍\"{}\" {}/{}", ft_active, visible, total)
                    } else {
                        format!("Traces [<=filtre T=pause] 🔍\"{}\" {}/{}", ft_active, visible, total)
                    }
                } else if t_paused {
                    format!("Traces [PAUSE ↑↓ T=reprendre] {}", total)
                } else {
                    format!("Traces [<=filtre T=pause] {}", total)
                }
            };

            f.render_widget(
                Paragraph::new(trace_lines)
                    .block(Block::default()
                        .title(Span::styled(t_title, Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD)))
                        .borders(Borders::ALL)
                        .border_style(Style::default().fg(
                            if ft_active.is_empty() { Color::Magenta } else { Color::Yellow }
                        )))
                    .scroll((t_scroll, 0)),
                h_chunks[0],
            );

            // ── Logs (panneau droit) ──────────────────────────────────────
            let l_paused   = *logs_paused.lock().unwrap();
            let logs_guard = logs.lock().unwrap();
            let fl_active  = fl.clone();

            let log_lines: Vec<Line> = logs_guard
                .iter()
                .filter(|e| current_level.accepts(e.level) && matches_filter(&e.text, &fl_active))
                .map(|e| highlight_line(&e.text, &fl_active, e.color))
                .collect();

            let l_height = h_chunks[1].height.saturating_sub(2) as usize;
            let l_scroll = if l_paused {
                *logs_scroll.lock().unwrap()
            } else {
                log_lines.len().saturating_sub(l_height) as u16
            };

            let l_title = {
                let total   = logs_guard.len();
                let visible = log_lines.len();
                if !fl_active.is_empty() {
                    if l_paused {
                        format!("Logs [PAUSE ↑↓ L=reprendre] 🔍\"{}\" {}/{}", fl_active, visible, total)
                    } else {
                        format!("Logs [>=filtre Tab={}->{} L=pause] 🔍\"{}\" {}/{}", current_level.label(), current_level.next().label(), fl_active, visible, total)
                    }
                } else if l_paused {
                    format!("Logs [PAUSE ↑↓ L=reprendre] {}/{}", visible, total)
                } else {
                    format!("Logs [>=filtre Tab={}->{} L=pause] {}/{}", current_level.label(), current_level.next().label(), visible, total)
                }
            };

            f.render_widget(
                Paragraph::new(log_lines)
                    .block(Block::default()
                        .title(Span::styled(l_title, Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)))
                        .borders(Borders::ALL)
                        .border_style(Style::default().fg(
                            if fl_active.is_empty() { Color::Yellow } else { Color::Yellow }
                        )))
                    .scroll((l_scroll, 0)),
                h_chunks[1],
            );

            // ── Prompt ────────────────────────────────────────────────────
            let inp  = input_buffer.lock().unwrap().clone();
            let mode = prompt_mode.lock().unwrap().clone();
            let cands = ac_candidates.lock().unwrap().clone();
            let ac_idx = *ac_index.lock().unwrap();

            let (prompt_text, prompt_title, border_color) = match mode {
                PromptMode::FilterLogs => (
                    format!("🔍 logs> {}", inp),
                    "Filtre Logs  Entrée=valider  Esc=annuler  (vide=reset)".to_string(),
                    Color::Yellow,
                ),
                PromptMode::FilterTraces => (
                    format!("🔍 traces> {}", inp),
                    "Filtre Traces  Entrée=valider  Esc=annuler  (vide=reset)".to_string(),
                    Color::Magenta,
                ),
                PromptMode::Command => {
                    // Affiche les candidats d'autocomplétion dans le titre si disponibles
                    let title = if !cands.is_empty() && !inp.is_empty() {
                        let candidates_str = cands
                            .iter()
                            .enumerate()
                            .map(|(i, c)| {
                                if Some(i) == ac_idx { format!("[{}]", c) } else { c.clone() }
                            })
                            .collect::<Vec<_>>()
                            .join("  ");
                        format!("Tab: {}", candidates_str)
                    } else {
                        "Prompt  Ctrl+Q=quit | Esc=effacer | <=traces | >=logs | T=pause | L=pause | Tab=complétion/verbosité | Ctrl+S=export".to_string()
                    };
                    (format!("> {}", inp), title, Color::Green)
                }
            };

            // On doit passer prompt_title en &str mais on a un String — on render directement
            f.render_widget(
                Paragraph::new(prompt_text)
                    .block(Block::default()
                        .title(Span::styled(prompt_title, Style::default().fg(border_color).add_modifier(Modifier::BOLD)))
                        .borders(Borders::ALL)
                        .border_style(Style::default().fg(border_color))),
                v_chunks[2],
            );
        })?;

        // ─────────────────────────────────────────
        // Gestion des événements clavier
        // ─────────────────────────────────────────
        if event::poll(Duration::from_millis(50))? {
            if let CEvent::Key(KeyEvent { code, kind, modifiers, .. }) = event::read()? {
                if !matches!(kind, KeyEventKind::Press | KeyEventKind::Repeat) {
                    continue;
                }

                let mode = prompt_mode.lock().unwrap().clone();

                // ════════════════════════════════════════
                // Mode filtre logs (>terme)
                // ════════════════════════════════════════
                if mode == PromptMode::FilterLogs {
                    match code {
                        KeyCode::Enter => {
                            let term = input_buffer.lock().unwrap().clone();
                            *filter_logs.lock().unwrap() = term;
                            input_buffer.lock().unwrap().clear();
                            *prompt_mode.lock().unwrap() = PromptMode::Command;
                            *logs_scroll.lock().unwrap() = 0;
                        }
                        KeyCode::Esc => {
                            input_buffer.lock().unwrap().clear();
                            *prompt_mode.lock().unwrap() = PromptMode::Command;
                            // Vide tous les événements restants dans le buffer
                            // pour éviter qu'un Esc double ne quitte le programme
                            while event::poll(Duration::from_millis(0)).unwrap_or(false) {
                                let _ = event::read();
                            }
                        }
                        KeyCode::Backspace => { input_buffer.lock().unwrap().pop(); }
                        KeyCode::Char(c)   => { input_buffer.lock().unwrap().push(c); }
                        _ => {}
                    }
                    continue;
                }

                // ════════════════════════════════════════
                // Mode filtre traces (F puis terme)
                // ════════════════════════════════════════
                if mode == PromptMode::FilterTraces {
                    match code {
                        KeyCode::Enter => {
                            let term = input_buffer.lock().unwrap().clone();
                            *filter_traces.lock().unwrap() = term;
                            input_buffer.lock().unwrap().clear();
                            *prompt_mode.lock().unwrap() = PromptMode::Command;
                            *traces_scroll.lock().unwrap() = 0;
                        }
                        KeyCode::Esc => {
                            input_buffer.lock().unwrap().clear();
                            *prompt_mode.lock().unwrap() = PromptMode::Command;
                            // Vide tous les événements restants dans le buffer
                            while event::poll(Duration::from_millis(0)).unwrap_or(false) {
                                let _ = event::read();
                            }
                        }
                        KeyCode::Backspace => { input_buffer.lock().unwrap().pop(); }
                        KeyCode::Char(c)   => { input_buffer.lock().unwrap().push(c); }
                        _ => {}
                    }
                    continue;
                }

                // ════════════════════════════════════════
                // Mode commande normal
                // ════════════════════════════════════════
                let prompt_empty = input_buffer.lock().unwrap().is_empty();

                match code {
                    // ── Activer filtre logs (>) ───────────────────────────
                    KeyCode::Char('>') if prompt_empty => {
                        *prompt_mode.lock().unwrap() = PromptMode::FilterLogs;
                        // Pré-remplir avec le filtre actuel pour modification facile
                        let current = filter_logs.lock().unwrap().clone();
                        *input_buffer.lock().unwrap() = current;
                    }

                    // ── Activer filtre traces (<) ─────────────────────────
                    KeyCode::Char('<') if prompt_empty => {
                        *prompt_mode.lock().unwrap() = PromptMode::FilterTraces;
                        let current = filter_traces.lock().unwrap().clone();
                        *input_buffer.lock().unwrap() = current;
                    }

                    // ── Tab : verbosité (prompt vide) ou autocomplétion ───
                    KeyCode::Tab => {
                        if prompt_empty {
                            // Prompt vide → cycle verbosité comme avant
                            let mut lvl = log_level.lock().unwrap();
                            *lvl = lvl.next();
                            *logs_scroll.lock().unwrap() = 0;
                        } else {
                            // Prompt non vide → autocomplétion
                            let prefix = input_buffer.lock().unwrap().clone();
                            let mut cands = ac_candidates.lock().unwrap();
                            let mut idx   = ac_index.lock().unwrap();

                            // Recalcule les candidats si le préfixe a changé
                            // (détecte un nouvel appui Tab sur un préfixe différent)
                            let fresh = autocomplete(&prefix);
                            let prefix_changed = cands.is_empty()
                                || (!fresh.is_empty() && !cands.contains(&prefix));

                            if prefix_changed {
                                *cands = fresh;
                                *idx   = None;
                            }

                            if cands.is_empty() {
                                // Aucun candidat : ne fait rien
                            } else if cands.len() == 1 {
                                // Un seul candidat : complète directement
                                *input_buffer.lock().unwrap() = cands[0].clone();
                                *idx = Some(0);
                            } else {
                                // Plusieurs candidats : cycle Tab→Tab→Tab
                                let next = match *idx {
                                    None         => 0,
                                    Some(i)      => (i + 1) % cands.len(),
                                };
                                *input_buffer.lock().unwrap() = cands[next].clone();
                                *idx = Some(next);
                            }
                        }
                    }

                    // ── Pause traces (T) ──────────────────────────────────
                    KeyCode::Char('t') if prompt_empty => {
                        let mut p = traces_paused.lock().unwrap();
                        if *p {
                            *p = false;
                            *traces_scroll.lock().unwrap() = 0;
                        } else {
                            let t      = traces.lock().unwrap();
                            let height = terminal.size()?.height.saturating_sub(8) as usize;
                            *traces_scroll.lock().unwrap() = t.len().saturating_sub(height) as u16;
                            *p = true;
                        }
                    }

                    // ── Pause logs (L) ────────────────────────────────────
                    KeyCode::Char('l') if prompt_empty => {
                        let mut p = logs_paused.lock().unwrap();
                        if *p {
                            *p = false;
                            *logs_scroll.lock().unwrap() = 0;
                        } else {
                            let l      = logs.lock().unwrap();
                            let height = terminal.size()?.height.saturating_sub(8) as usize;
                            *logs_scroll.lock().unwrap() = l.len().saturating_sub(height) as u16;
                            *p = true;
                        }
                    }

                    // ── Scroll ↑ ──────────────────────────────────────────
                    // ── ↑ : scroll si pause, sinon historique ────────────
                    KeyCode::Up => {
                        if prompt_empty {
                            // Priorité 1 : scroll panneau en pause
                            if *traces_paused.lock().unwrap() {
                                let mut s = traces_scroll.lock().unwrap();
                                *s = s.saturating_sub(1);
                            } else if *logs_paused.lock().unwrap() {
                                let mut s = logs_scroll.lock().unwrap();
                                *s = s.saturating_sub(1);
                            } else {
                                // Priorité 2 : historique (prompt vide = commence depuis la fin)
                                let new_val = {
                                    let hist = history.lock().unwrap();
                                    if hist.is_empty() { None } else {
                                        let idx = history_index.lock().unwrap();
                                        let new_idx = match *idx {
                                            Some(i) if i > 0 => i - 1,
                                            Some(_) => 0,
                                            None => hist.len() - 1,
                                        };
                                        Some((new_idx, hist[new_idx].clone()))
                                    }
                                };
                                if let Some((new_idx, val)) = new_val {
                                    *input_buffer.lock().unwrap() = val;
                                    *history_index.lock().unwrap() = Some(new_idx);
                                }
                            }
                        } else {
                            // Prompt non vide : historique direct
                            let new_val = {
                                let hist = history.lock().unwrap();
                                if hist.is_empty() { None } else {
                                    let idx = history_index.lock().unwrap();
                                    let new_idx = match *idx {
                                        Some(i) if i > 0 => i - 1,
                                        Some(_) => 0,
                                        None => hist.len() - 1,
                                    };
                                    Some((new_idx, hist[new_idx].clone()))
                                }
                            };
                            if let Some((new_idx, val)) = new_val {
                                *input_buffer.lock().unwrap() = val;
                                *history_index.lock().unwrap() = Some(new_idx);
                            }
                        }
                    }

                    // ── ↓ : scroll si pause, sinon historique ────────────
                    KeyCode::Down => {
                        if prompt_empty {
                            // Priorité 1 : scroll panneau en pause
                            if *traces_paused.lock().unwrap() {
                                let mut s = traces_scroll.lock().unwrap();
                                *s += 1;
                            } else if *logs_paused.lock().unwrap() {
                                let mut s = logs_scroll.lock().unwrap();
                                *s += 1;
                            } else {
                                // Priorité 2 : historique
                                let new_val = {
                                    let hist = history.lock().unwrap();
                                    let idx  = history_index.lock().unwrap();
                                    if let Some(i) = *idx {
                                        let new_idx = if i + 1 < hist.len() { i + 1 } else { hist.len() - 1 };
                                        Some((new_idx, hist[new_idx].clone()))
                                    } else { None }
                                };
                                if let Some((new_idx, val)) = new_val {
                                    *input_buffer.lock().unwrap() = val;
                                    *history_index.lock().unwrap() = Some(new_idx);
                                }
                            }
                        } else {
                            // Prompt non vide : historique direct
                            let new_val = {
                                let hist = history.lock().unwrap();
                                let idx  = history_index.lock().unwrap();
                                if let Some(i) = *idx {
                                    let new_idx = if i + 1 < hist.len() { i + 1 } else { hist.len() - 1 };
                                    Some((new_idx, hist[new_idx].clone()))
                                } else { None }
                            };
                            if let Some((new_idx, val)) = new_val {
                                *input_buffer.lock().unwrap() = val;
                                *history_index.lock().unwrap() = Some(new_idx);
                            }
                        }
                    }

                    // ── Ctrl+S : export sauvegarde (AVANT Char(c) !) ─────────
                    KeyCode::Char('s') if modifiers.contains(KeyModifiers::CONTROL) => {
                        let filename = save_to_file(&traces, &logs);
                        push_log(&logs, &format!("💾 Sauvegardé → {}", filename), LogLevel::Info, Color::Green);
                    }

                    // ── Saisie commande (ignore les combinaisons Ctrl+x) ──────
                    KeyCode::Char(c) if !modifiers.contains(KeyModifiers::CONTROL) => {
                        input_buffer.lock().unwrap().push(c);
                        // Toute frappe reset l'état d'autocomplétion
                        ac_candidates.lock().unwrap().clear();
                        *ac_index.lock().unwrap() = None;
                    }
                    KeyCode::Backspace => {
                        input_buffer.lock().unwrap().pop();
                        ac_candidates.lock().unwrap().clear();
                        *ac_index.lock().unwrap() = None;
                    }

                    KeyCode::Enter => {
                        let line = {
                            let mut buf = input_buffer.lock().unwrap();
                            let l = buf.clone();
                            buf.clear();
                            l
                        };
                        if !line.is_empty() {
                            push_log(&logs, &format!("> {}", line), LogLevel::Info, Color::Cyan);
                            let _ = tx.send(line.clone());
                            // Dédup style bash : n'ajoute pas si identique à la dernière commande
                            let mut hist = history.lock().unwrap();
                            if hist.last().map(|s| s.as_str()) != Some(&line) {
                                hist.push(line.clone());
                                // Tronque à 100 entrées max (supprime les plus anciennes)
                                if hist.len() > 100 {
                                    hist.remove(0);
                                }
                                // Sauvegarde immédiate sur disque
                                append_history(&history_path, &line);
                            }
                            *history_index.lock().unwrap() = None;
                        }
                    }


                    // ── Ctrl+Q : quitter ──────────────────────────────────
                    KeyCode::Char('q') if modifiers.contains(KeyModifiers::CONTROL) => {
                        break;
                    }

                    // ── Esc : efface le prompt uniquement ─────────────────
                    KeyCode::Esc => {
                        let mut buf = input_buffer.lock().unwrap();
                        buf.clear();
                        drop(buf);
                        *history_index.lock().unwrap() = None;
                    }
                    _ => {}
                }
            }
        }
    }

    // --- Restauration terminal ---
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

fn push_log(logs: &Arc<Mutex<Vec<LogEntry>>>, text: &str, level: LogLevel, color: Color) {
    if let Ok(mut l) = logs.lock() {
        l.push(LogEntry { text: text.to_string(), level, color });
        if l.len() > 1000 { l.remove(0); }
    }
}

fn parse_level(raw: &str) -> (LogLevel, Color) {
    match raw {
        "error" => (LogLevel::Error, Color::Red),
        "warn"  => (LogLevel::Warn,  Color::Yellow),
        "debug" => (LogLevel::Debug, Color::DarkGray),
        _       => (LogLevel::Info,  Color::White),
    }
}

// ─────────────────────────────────────────────
// Historique persistant (~/.cli_history)
// ─────────────────────────────────────────────

/// Retourne le chemin de ~/.cli_history
fn history_file_path() -> PathBuf {
    dirs_home().join(".cli_history")
}

/// Récupère le dossier home de l'utilisateur
fn dirs_home() -> PathBuf {
    // HOME sur Linux/Mac, USERPROFILE sur Windows
    std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

/// Charge l'historique depuis le fichier (max 100 dernières lignes)
fn load_history(path: &PathBuf) -> Vec<String> {
    let content = match fs::read_to_string(path) {
        Ok(c)  => c,
        Err(_) => return Vec::new(), // fichier absent = historique vide, pas d'erreur
    };
    let lines: Vec<String> = content
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.to_string())
        .collect();
    // Garde uniquement les 100 dernières
    if lines.len() > 100 {
        lines[lines.len() - 100..].to_vec()
    } else {
        lines
    }
}

/// Ajoute une commande à la fin du fichier (append — rapide, pas de réécriture)
fn append_history(path: &PathBuf, line: &str) {
    let mut file = match fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
    {
        Ok(f)  => f,
        Err(_) => return,
    };
    let _ = writeln!(file, "{}", line);
}
fn save_to_file(
    traces: &Arc<Mutex<Vec<String>>>,
    logs:   &Arc<Mutex<Vec<LogEntry>>>,
) -> String {
    // Horodatage simple sans dépendance externe (secondes depuis epoch)
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    // Convertit en YYYYMMDD_HHmmss (UTC approximatif)
    let s   = secs % 60;
    let m   = (secs / 60) % 60;
    let h   = (secs / 3600) % 24;
    let d   = (secs / 86400) % 31 + 1;    // approx
    let mo  = (secs / (86400 * 30)) % 12 + 1;
    let y   = 1970 + secs / (86400 * 365);
    let timestamp = format!("{:04}{:02}{:02}_{:02}{:02}{:02}", y, mo, d, h, m, s);

    let filename = format!("cli_export_{}.txt", timestamp);
    let mut content = String::new();

    // En-tête
    content.push_str(&format!("═══ CLI EXPORT — {} ═══\n\n", timestamp));

    // Section Traces
    content.push_str("─── TRACES ────────────────────────────────────────\n");
    let traces_guard = traces.lock().unwrap();
    if traces_guard.is_empty() {
        content.push_str("(aucune trace)\n");
    } else {
        for line in traces_guard.iter() {
            content.push_str(line);
            content.push('\n');
        }
    }

    // Section Logs
    content.push_str("\n─── LOGS ──────────────────────────────────────────\n");
    let logs_guard = logs.lock().unwrap();
    if logs_guard.is_empty() {
        content.push_str("(aucun log)\n");
    } else {
        for entry in logs_guard.iter() {
            let level_tag = match entry.level {
                LogLevel::Error => "[ERROR]",
                LogLevel::Warn  => "[WARN] ",
                LogLevel::Info  => "[INFO] ",
                LogLevel::Debug => "[DEBUG]",
                LogLevel::All   => "[ALL]  ",
            };
            content.push_str(&format!("{} {}\n", level_tag, entry.text));
        }
    }

    content.push_str(&format!("\n═══ {} traces  {}  logs ═══\n",
        traces_guard.len(), logs_guard.len()));

    match fs::write(&filename, &content) {
        Ok(_)  => filename,
        Err(e) => format!("ERREUR sauvegarde: {}", e),
    }
}
