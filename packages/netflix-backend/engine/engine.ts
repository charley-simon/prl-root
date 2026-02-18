import readline from 'node:readline'
import { stdin, stdout } from 'node:process'

type Command = { type: 'ping' } | { type: 'stop' }

type Event =
  | { type: 'metrics'; cpu: number; mem: number }
  | { type: 'pong' }
  | { type: 'bye' }
  | { type: 'error' }

const rl = readline.createInterface({
  input: stdin,
  terminal: false
})

// simulation métriques temps réel
setInterval(() => {
  const event: Event = {
    type: 'metrics',
    cpu: Number((Math.random() * 100).toFixed(1)),
    mem: Number((Math.random() * 100).toFixed(1))
  }

  stdout.write(JSON.stringify(event) + '\n')
}, 1000)

// réception commandes
rl.on('line', line => {
  line = line.trim()

  // essayer JSON
  let cmd: Command | null = null
  try {
    cmd = JSON.parse(line) as Command
  } catch {
    // fallback : interpréter la ligne brute comme type de commande
    cmd = { type: line } as Command
  }

  // maintenant cmd.type contient "ping", "stop", etc.
  if (cmd.type === 'ping') {
    const event: Event = { type: 'pong' }
    stdout.write(JSON.stringify(event) + '\n')
  }

  if (cmd.type === 'stop') {
    const event: Event = { type: 'bye' }
    stdout.write(JSON.stringify(event) + '\n')
    process.exit(0)
  }
})
