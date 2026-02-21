# CLI Admin — Documentation Technique

## Vue d'ensemble

Console d'administration TUI (Text User Interface) écrite en **Rust**, connectée à un serveur **Fastify/Node.js** via **WebSocket**. Conçue pour superviser un backend en temps réel : visualisation des métriques, des logs et des traces, envoi de commandes administratives.

---

## Stack technique

| Composant     | Technologie         | Rôle                                |
| ------------- | ------------------- | ----------------------------------- |
| Langage       | Rust                | Binaire natif, gestion mémoire sûre |
| TUI           | ratatui + crossterm | Rendu terminal, gestion clavier     |
| Transport     | tungstenite         | Client WebSocket                    |
| Sérialisation | serde_json          | Parsing des events JSON             |
| Erreurs       | anyhow              | Propagation d'erreurs ergonomique   |

### Cargo.toml

```toml
[dependencies]
ratatui       = "0.29"
crossterm     = "0.28"
tungstenite   = "0.24"
serde_json    = "1"
anyhow        = "1"
```

---

## Architecture

### Threading

Le programme utilise **3 threads** :

```
Thread principal        — boucle de rendu (50ms) + gestion clavier
Thread lecture WS       — lit les messages WebSocket en continu
Thread écriture WS      — reçoit les commandes via mpsc::channel et les envoie au serveur
```

La communication inter-threads repose sur :

- `Arc<Mutex<T>>` pour l'état partagé (logs, traces, métriques, filtres...)
- `std::sync::mpsc::channel<String>` pour envoyer les commandes du thread principal vers le thread d'écriture WebSocket

### Pourquoi séparer lecture et écriture WebSocket ?

`tungstenite::WebSocket` n'est pas `Clone` et ne peut pas être partagé directement entre threads en lecture et écriture simultanées. La solution retenue : encapsuler le stream dans un `Arc<Mutex<WebSocket>>`. Le thread de lecture lock brièvement pour un `read()`, le thread d'écriture lock pour un `send()`. Les deux ne lockent jamais en même temps grâce au `mpsc::channel` qui sérialise les écritures.

---

## Protocole WebSocket

### Connexion

```
ws://127.0.0.1:9000/admin
```

### Format des messages

Tous les messages sont des **lignes JSON** (`\n` terminé).

#### Serveur → CLI (events reçus)

```typescript
// Métriques système (toutes les secondes)
{ "type": "metrics", "cpu": 45.2, "mem": 234.1 }

// Trace applicative
{ "type": "trace", "message": "[req-0042] [DB] preparing SQL — 12.34ms" }

// Log avec niveau
{ "type": "log", "level": "info" | "warn" | "error" | "debug", "message": "..." }

// Réponse à ping
{ "type": "pong" }

// Réponse à status
{ "type": "status", "tracing": true, "clients": 2 }

// Erreur commande inconnue
{ "type": "error", "message": "Commande inconnue: xyz" }
```

#### CLI → Serveur (commandes envoyées)

Les commandes sont envoyées en **texte brut** (pas de JSON requis) :

```
ping
status
start trace
stop trace
pause trace
```

Le serveur accepte aussi le format JSON `{ "type": "ping" }` etc.

---

## Structure du code

### Types principaux

```rust
// Mode courant du prompt — détermine le comportement des touches
enum PromptMode {
    Command,       // mode normal, envoie au serveur
    FilterLogs,    // saisie d'un filtre pour le panneau Logs
    FilterTraces,  // saisie d'un filtre pour le panneau Traces
}

// Niveau de verbosité pour filtrer les logs
enum LogLevel { All, Debug, Info, Warn, Error }

// Entrée stockée en mémoire dans le Vec<LogEntry>
struct LogEntry {
    text:  String,    // texte affiché
    level: LogLevel,  // niveau pour le filtrage
    color: Color,     // couleur ratatui
}
```

### État partagé (Arc<Mutex<T>>)

```rust
traces:         Vec<String>      // messages de trace (panneau gauche)
logs:           Vec<LogEntry>    // logs/events (panneau droit)
metrics:        String           // texte affiché dans la barre du haut
input_buffer:   String           // contenu courant du prompt
prompt_mode:    PromptMode       // mode du prompt
history:        Vec<String>      // historique des commandes
history_index:  Option<usize>    // position dans l'historique (↑↓)
connected:      bool             // état de la connexion WS
traces_paused:  bool             // pause du scroll traces
logs_paused:    bool             // pause du scroll logs
traces_scroll:  u16              // offset scroll manuel traces
logs_scroll:    u16              // offset scroll manuel logs
log_level:      LogLevel         // filtre de verbosité courant
filter_logs:    String           // terme de filtre actif pour logs
filter_traces:  String           // terme de filtre actif pour traces
ac_candidates:  Vec<String>      // candidats autocomplétion courants
ac_index:       Option<usize>    // index sélectionné dans les candidats
```

---

## Layout TUI

```
┌─────────────────────────────────────────────────────────────┐
│  Metrics  ● CONNECTÉ   CPU: 45.2% | MEM: 234.1MB  │ Logs: INFO  │
├────────────────────────────────┬────────────────────────────┤
│  Traces [<=filtre T=pause] 847 │  Logs [>=filtre Tab] 12/87 │
│                                │                            │
│  [req-0042] [DB] SQL — 12ms    │  [INFO]  GET /api 200 12ms │
│  [req-0043] [AUTH] JWT — 0.8ms │  [WARN]  réponse lente     │
│  [req-0044] [CACHE] hit — 2ms  │  [ERROR] DB timeout        │
│  ...                           │  ...                       │
├────────────────────────────────┴────────────────────────────┤
│  Prompt  Ctrl+Q=quit | Esc=effacer | Tab=complétion | ...   │
│  > start tr[ace]  status                                    │
└─────────────────────────────────────────────────────────────┘
```

Le layout est construit avec deux `Layout` ratatui imbriqués :

- **Vertical** : `[Length(3), Min(5), Length(3)]` → metrics / contenu / prompt
- **Horizontal** dans le contenu : `[Percentage(60), Percentage(40)]` → traces / logs

---

## Fonctionnalités détaillées

### Filtrage en temps réel

Les filtres s'appliquent **au moment du rendu uniquement** — les données brutes en mémoire ne sont jamais modifiées. Cela permet de changer de filtre sans perdre d'historique.

```rust
// Filtre : sous-chaîne insensible à la casse
fn matches_filter(text: &str, filter: &str) -> bool {
    text.to_lowercase().contains(&filter.to_lowercase())
}
```

La surbrillance est implémentée en découpant chaque ligne en `Vec<Span>` : les segments avant/après le match gardent la couleur d'origine, le match lui-même reçoit `fg(Black).bg(Yellow).BOLD`.

### Niveaux de verbosité

Le filtre de niveau s'applique **en plus** du filtre textuel sur le panneau Logs :

```rust
fn accepts(self, entry: LogLevel) -> bool {
    match self {
        All   => true,
        Debug => true,                                    // tout
        Info  => !matches!(entry, Debug),                 // sans debug
        Warn  => matches!(entry, Warn | Error),           // warn + error
        Error => matches!(entry, Error),                  // errors seules
    }
}
```

### Autocomplétion

Cycle Tab sur les commandes connues définies dans `COMMANDS: &[&str]`. L'état est réinitialisé à chaque frappe de caractère ou Backspace. Un seul candidat → complétion directe. Plusieurs → cycle Tab→Tab→Tab avec indication visuelle `[commande]` dans le titre du prompt.

### Historique persistant

- Fichier : `~/.cli_history` (résolu via `$HOME` ou `$USERPROFILE` sur Windows)
- Chargement au démarrage : 100 dernières lignes
- Sauvegarde : **append** immédiat à chaque commande (pas de réécriture complète)
- Déduplication style bash : ignoré si identique à la commande précédente
- Limite mémoire : 100 entrées max, suppression FIFO

### Export

`Ctrl+S` génère `cli_export_YYYYMMDD_HHmmss.txt` dans le répertoire courant. L'horodatage est calculé manuellement depuis `SystemTime::now()` sans dépendance externe (`chrono` non requis).

---

## Raccourcis clavier

### Mode Command (normal)

| Touche    | Action                                      |
| --------- | ------------------------------------------- |
| `Entrée`  | Envoie la commande au serveur               |
| `Esc`     | Efface le prompt                            |
| `Ctrl+Q`  | Quitte le programme                         |
| `Ctrl+S`  | Export logs+traces dans un fichier horodaté |
| `Tab`     | Autocomplétion (prompt non vide)            |
| `Tab`     | Cycle verbosité logs (prompt vide)          |
| `↑` / `↓` | Historique des commandes                    |
| `↑` / `↓` | Scroll manuel (si un panneau en pause)      |
| `T`       | Pause/reprise scroll Traces                 |
| `L`       | Pause/reprise scroll Logs                   |
| `<`       | Active le mode filtre Traces                |
| `>`       | Active le mode filtre Logs                  |

### Mode filtre (`<` ou `>`)

| Touche   | Action                         |
| -------- | ------------------------------ |
| `Entrée` | Valide et applique le filtre   |
| `Esc`    | Annule, retour en mode Command |
| (vide)   | Entrée vide = reset du filtre  |

> **Note Windows** : après `Esc` en mode filtre, le buffer d'événements est vidé (`event::poll(0ms)`) pour éviter qu'un double événement `Press` ne déclenche une action en mode Command.

---

## Ajouter des commandes

Éditer le tableau `COMMANDS` dans `main.rs` :

```rust
const COMMANDS: &[&str] = &[
    "ping",
    "status",
    "start trace",
    "stop trace",
    "pause trace",
    // ajouter ici
    "reload config",
    "flush cache",
];
```

L'autocomplétion et l'aide contextuelle sont automatiquement mises à jour.

---

## Brancher sur un vrai serveur Fastify

### 1. Changer l'URL de connexion

```rust
// main.rs ligne ~204
let (ws_stream, _) = connect("ws://MON_SERVEUR:PORT/admin")
```

### 2. Côté serveur Fastify — ajouter la route WebSocket

```typescript
import websocket from '@fastify/websocket'

app.register(websocket)
app.register(async app => {
  app.get('/admin', { websocket: true }, socket => {
    // Broadcast des events : metrics, trace, log, status, error, pong
    socket.on('message', raw => {
      const cmd = raw.toString().trim()
      // Gérer : ping, status, start trace, stop trace, pause trace, ...
    })
  })
})
```

### 3. Format des events à envoyer depuis Fastify

```typescript
// Toujours des lignes JSON terminées par \n
socket.send(JSON.stringify({ type: 'metrics', cpu: 45.2, mem: 234.1 }) + '\n')
socket.send(JSON.stringify({ type: 'log', level: 'info', message: 'GET /api 200' }) + '\n')
socket.send(JSON.stringify({ type: 'trace', message: '[req-001] handler start' }) + '\n')
```

---

## Fichiers du projet

```
backend/
├── cli/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs          ← source unique (~950 lignes)
└── engine/
    ├── server.ts             ← serveur mock Fastify pour les tests
    ├── package.json
    └── tsconfig.json
```

Lancement :

```bash
# Terminal 1 — serveur mock
cd backend/engine && npx tsx server.ts

# Terminal 2 — CLI
cd backend/cli && cargo run
```
