import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import type { WebSocket, RawData } from 'ws'
import readline from 'node:readline'

const app = Fastify({ logger: true })
await app.register(websocket)

// --- État simulé ---
let tracing = false
let traceInterval: ReturnType<typeof setInterval> | null = null
const clients = new Set<WebSocket>()

// --- Types ---
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

type Event =
  | { type: 'metrics'; cpu: number; mem: number }
  | { type: 'trace'; message: string }
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'pong' }
  | { type: 'status'; tracing: boolean; clients: number }
  | { type: 'error'; message: string }

// --- Broadcast à tous les CLI connectés ---
function broadcast(event: Event) {
  const msg = JSON.stringify(event)
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg)
    }
  }
}

function send(ws: WebSocket, event: Event) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(event))
  }
}

// --- Simulation métriques toutes les secondes ---
setInterval(() => {
  broadcast({
    type: 'metrics',
    cpu: Number((Math.random() * 100).toFixed(1)),
    mem: Number((Math.random() * 512).toFixed(1))
  })
}, 1000)

// --- Simulation logs serveur périodiques ---
const LOG_MESSAGES: { level: LogLevel; message: string }[] = [
  { level: 'info', message: 'GET /api/users 200 (12ms)' },
  { level: 'info', message: 'GET /api/products 200 (8ms)' },
  { level: 'info', message: 'POST /api/orders 201 (45ms)' },
  { level: 'warn', message: 'GET /api/sessions 200 (320ms) — réponse lente' },
  { level: 'info', message: 'WebSocket client connecté (id: ws-4421)' },
  { level: 'info', message: 'Cache hit: products_list (TTL: 42s restants)' },
  { level: 'warn', message: 'Rate limit proche pour IP 192.168.1.42 (87/100)' },
  { level: 'error', message: 'Échec connexion DB: timeout après 5000ms' },
  { level: 'info', message: 'Job "send_emails" terminé: 12 emails envoyés' },
  { level: 'warn', message: 'Mémoire heap à 78% — GC en cours' },
  { level: 'info', message: 'PUT /api/users/99 200 (23ms)' },
  { level: 'error', message: 'POST /api/payments 500 — stripe timeout' },
  { level: 'info', message: 'DELETE /api/sessions/old 200 — 34 sessions expirées supprimées' },
  { level: 'debug', message: 'Token JWT validé pour user_id=1042' },
  { level: 'info', message: 'Svelte client reconnecté après 3s' }
]

setInterval(() => {
  if (clients.size === 0) return
  const entry = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]
  broadcast({ type: 'log', level: entry.level, message: entry.message })
}, 1500)

// --- Simulation traces (seulement si tracing actif) ---
const MODULES = ['auth', 'db', 'cache', 'router', 'ws', 'mailer', 'payment']
const ACTIONS = [
  'resolving query',
  'executing middleware',
  'parsing request body',
  'checking JWT',
  'hitting cache',
  'opening DB connection',
  'preparing SQL',
  'dispatching event',
  'serializing response',
  'closing pool'
]

let traceCounter = 0

function startTracing() {
  if (traceInterval) return
  tracing = true
  traceCounter = 0

  traceInterval = setInterval(() => {
    // Envoie 1 à 3 traces par tick pour simuler un vrai flux
    const count = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < count; i++) {
      const module = MODULES[Math.floor(Math.random() * MODULES.length)]
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
      const duration = (Math.random() * 50).toFixed(2)
      const reqId = `req-${String(traceCounter++).padStart(4, '0')}`

      broadcast({
        type: 'trace',
        message: `[${reqId}] [${module?.toUpperCase()}] ${action} — ${duration}ms`
      })
    }
  }, 200)

  broadcast({ type: 'log', level: 'info', message: '▶ Trace démarrée' })
}

function stopTracing() {
  if (traceInterval) {
    clearInterval(traceInterval)
    traceInterval = null
  }
  tracing = false
  broadcast({
    type: 'log',
    level: 'info',
    message: `■ Trace stoppée (${traceCounter} events émis)`
  })
}

function pauseTracing() {
  if (traceInterval) {
    clearInterval(traceInterval)
    traceInterval = null
  }
  // tracing reste true pour indiquer qu'on est en pause (pas stoppé)
  broadcast({
    type: 'log',
    level: 'warn',
    message: `⏸ Trace en pause (${traceCounter} events émis jusqu'ici)`
  })
}

// --- Gestion des commandes ---
function handleCommand(line: string, ws: WebSocket) {
  let cmd: { type: string } | null = null
  try {
    cmd = JSON.parse(line) as { type: string }
  } catch {
    cmd = { type: line.toLowerCase().trim() }
  }

  switch (cmd?.type) {
    case 'ping':
      send(ws, { type: 'pong' })
      break

    case 'start trace':
    case 'start_trace':
      startTracing()
      break

    case 'stop trace':
    case 'stop_trace':
      stopTracing()
      break

    case 'pause trace':
    case 'pause_trace':
      pauseTracing()
      break

    case 'status':
      send(ws, { type: 'status', tracing, clients: clients.size })
      break

    default:
      send(ws, { type: 'error', message: `Commande inconnue: "${cmd?.type}"` })
  }
}

// --- Route WebSocket pour le CLI ---
app.register(async app => {
  app.get('/admin', { websocket: true }, socket => {
    console.error('CLI admin connecté')
    clients.add(socket)

    // Message de bienvenue
    send(socket, { type: 'log', level: 'info', message: '✓ CLI connecté au serveur mock' })
    send(socket, {
      type: 'log',
      level: 'info',
      message: 'Commandes: ping | start trace | stop trace | pause trace | status'
    })

    socket.on('message', (raw: RawData) => {
      const line = raw.toString().trim()
      console.error(`Commande reçue: ${line}`)
      handleCommand(line, socket)
    })

    socket.on('close', () => {
      clients.delete(socket)
      console.error('CLI admin déconnecté')
      // Si plus aucun client, on stoppe les traces
      if (clients.size === 0 && tracing) {
        stopTracing()
      }
    })
  })
})

// --- Route HTTP mock (pour ne pas casser le reste) ---
app.get('/health', async () => ({ status: 'ok', tracing, clients: clients.size }))

// --- Lancement ---
try {
  await app.listen({ port: 9000, host: '127.0.0.1' })
  console.error('Serveur mock sur http://127.0.0.1:9000')
  console.error('WebSocket admin sur ws://127.0.0.1:9000/admin')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
