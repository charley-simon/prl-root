// public/app.js
import
import { Engine } from 'linklab'

// ==================== LOGGER ====================

const logger = {
  header(text) {
    console.log('\n' + '='.repeat(60))
    console.log(`🎵 ${text}`)
    console.log('='.repeat(60))
  },

  section(text) {
    console.log('\n' + '-'.repeat(60))
    console.log(`📊 ${text}`)
    console.log('-'.repeat(60))
  },

  success(text) {
    console.log(`✅ ${text}`)
  },

  info(text) {
    console.log(`ℹ️  ${text}`)
  },

  path(text) {
    console.log(`🎼 ${text}`)
  },

  artist(name, era) {
    console.log(`👤 ${name} (${era})`)
  },

  track(title, artist, year) {
    console.log(`🎵 "${title}" by ${artist} (${year})`)
  },

  connection(from, to, via, weight) {
    console.log(`   ${from} --[${via}]--> ${to} (weight: ${weight})`)
  },

  result(path, weight) {
    console.log('\n🎯 PATH FOUND!')
    console.log(`   Nodes: ${path.nodes.length}`)
    console.log(`   Total weight: ${weight}`)
    console.log(`   Path: ${path.nodes.join(' → ')}`)
  },

  table(data) {
    console.table(data)
  }
}

// ==================== DATA LOADER ====================

class DataLoader {
  static async load() {
    logger.header('LOADING MUSICIANS DATA')

    try {
      const [artists, tracks, graph] = await Promise.all([
        fetch('/data/artists.json').then(r => r.json()),
        fetch('/data/tracks.json').then(r => r.json()),
        fetch('/data/graph.json').then(r => r.json())
      ])

      logger.success('Data loaded successfully')
      logger.info(`Artists: ${artists.length}`)
      logger.info(`Tracks: ${tracks.length}`)
      logger.info(`Relations: ${graph.relations.length}`)

      logger.section('ARTISTS OVERVIEW')
      logger.table(artists.map(a => ({
        Name: a.name,
        Era: a.era,
        Genre: a.genre,
        Country: a.country
      })))

      logger.section('TRACKS OVERVIEW')
      logger.table(tracks.map(t => ({
        Title: t.title,
        Artist: artists.find(a => a.id === t.artist)?.name || t.artist,
        Year: t.year,
        Samples: t.samples?.length || 0
      })))

      return { artists, tracks, graph }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      throw error
    }
  }
}

// ==================== GRAPH NAVIGATOR ====================

class MusiciansNavigator {
  constructor(data) {
    this.artists = data.artists
    this.tracks = data.tracks
    this.graph = data.graph

    logger.section('GRAPH STRUCTURE')
    logger.info(`Total nodes: ${this.getUniqueNodes().size}`)
    logger.info(`Total relations: ${this.graph.relations.length}`)

    // Group relations by type
    const byType = {}
    this.graph.relations.forEach(r => {
      byType[r.via] = (byType[r.via] || 0) + 1
    })

    logger.info('Relations by type:')
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`)
    })
  }

  getUniqueNodes() {
    const nodes = new Set()
    this.graph.relations.forEach(r => {
      nodes.add(r.fromEntity)
      nodes.add(r.toEntity)
    })
    return nodes
  }

  findPath(fromArtist, toArtist) {
    logger.header(`FINDING PATH: ${fromArtist} → ${toArtist}`)

    const fromId = `artist-${fromArtist}`
    const toId = `artist-${toArtist}`

    logger.info(`From: ${fromId}`)
    logger.info(`To: ${toId}`)

    // Create engine
    logger.section('CREATING PATHFINDING ENGINE')
    const engine = Engine.forPathfinding(this.graph, {
      from: fromId,
      to: toId,
      maxPaths: 5
    })

    logger.success('Engine created')
    logger.info(`Mode: ${engine.getMode()}`)

    // Run pathfinding
    logger.section('RUNNING PATHFINDING')
    return engine.run().then(results => {
      if (results.length === 0 || !results[0].path) {
        console.log('❌ No path found')
        return null
      }

      const path = results[0].path
      logger.success('Path found!')

      // Display detailed path
      logger.section('PATH DETAILS')
      console.log(`Nodes: ${path.nodes.length}`)
      console.log(`Total weight: ${path.totalWeight}`)
      console.log('')

      // Step by step
      path.nodes.forEach((node, i) => {
        if (node.startsWith('artist-')) {
          const artistId = node.replace('artist-', '')
          const artist = this.artists.find(a => a.id === artistId)
          if (artist) {
            logger.artist(artist.name, artist.era)
          }
        } else if (node.startsWith('track-')) {
          const trackId = node.replace('track-', '')
          const track = this.tracks.find(t => t.id === trackId)
          if (track) {
            const artist = this.artists.find(a => a.id === track.artist)
            logger.track(track.title, artist?.name || track.artist, track.year)
          }
        }

        // Show relation
        if (i < path.relations.length) {
          const rel = path.relations[i]
          logger.connection(
            rel.fromEntity,
            rel.toEntity,
            rel.via,
            rel.weight
          )
        }
      })

      logger.section('SUMMARY')
      logger.result(path, path.totalWeight)

      // Calculate degrees of separation
      const artistCount = path.nodes.filter(n => n.startsWith('artist-')).length
      logger.info(`Degrees of separation: ${artistCount - 1}`)

      // Era span
      const years = path.nodes
        .filter(n => n.startsWith('track-'))
        .map(n => {
          const trackId = n.replace('track-', '')
          return this.tracks.find(t => t.id === trackId)?.year
        })
        .filter(y => y)

      if (years.length > 0) {
        const minYear = Math.min(...years)
        const maxYear = Math.max(...years)
        logger.info(`Era span: ${minYear} - ${maxYear} (${maxYear - minYear} years)`)
      }

      return path
    })
  }
}

// ==================== CANVAS VISUALIZER ====================

class CanvasVisualizer {
  constructor(canvas, data) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.data = data
    this.nodes = []
    this.selectedFrom = null
    this.selectedTo = null
    this.currentPath = null

    this.resize()
    window.addEventListener('resize', () => this.resize())

    this.setupNodes()
    this.render()

    logger.section('CANVAS INITIALIZED')
    logger.info(`Canvas size: ${canvas.width}x${canvas.height}`)
    logger.info(`Nodes: ${this.nodes.length}`)
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
    this.render()
  }

  setupNodes() {
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const radius = Math.min(centerX, centerY) - 100

    // Artists in a circle
    const artists = this.data.artists
    artists.forEach((artist, i) => {
      const angle = (i / artists.length) * Math.PI * 2
      this.nodes.push({
        id: `artist-${artist.id}`,
        type: 'artist',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        label: artist.name,
        data: artist
      })
    })

    // Tracks in the center (simplified - just a few key ones)
    const keyTracks = this.data.tracks.filter(t =>
      t.id === 'soul-makossa' ||
      t.id === 'wanna-be-startin-somethin' ||
      t.id === 'gettin-jiggy-wit-it'
    )

    keyTracks.forEach((track, i) => {
      this.nodes.push({
        id: `track-${track.id}`,
        type: 'track',
        x: centerX + (i - 1) * 100,
        y: centerY,
        label: track.title,
        data: track
      })
    })
  }

  render() {
    const ctx = this.ctx

    // Background (aged paper)
    ctx.fillStyle = '#f5f5dc'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Paper grain
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(139,90,43,${Math.random() * 0.05})`
      ctx.fillRect(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        1, 1
      )
    }

    // Draw connections from graph
    this.drawConnections()

    // Draw path if exists
    if (this.currentPath) {
      this.drawPath()
    }

    // Draw nodes
    this.drawNodes()
  }

  drawConnections() {
    const ctx = this.ctx

    // Draw a subset of relations (to avoid clutter)
    this.data.graph.relations
      .filter(r => r.via === 'samples') // Only show sample relations
      .forEach(rel => {
        const from = this.nodes.find(n => n.id === rel.fromEntity)
        const to = this.nodes.find(n => n.id === rel.toEntity)

        if (from && to) {
          ctx.strokeStyle = 'rgba(139,90,43,0.2)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()
        }
      })
  }

  drawPath() {
    const ctx = this.ctx
    const path = this.currentPath

    // Draw path connections
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 4
    ctx.shadowBlur = 15
    ctx.shadowColor = '#00ff00'

    for (let i = 0; i < path.nodes.length - 1; i++) {
      const from = this.nodes.find(n => n.id === path.nodes[i])
      const to = this.nodes.find(n => n.id === path.nodes[i + 1])

      if (from && to) {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }
    }

    ctx.shadowBlur = 0
  }

  drawNodes() {
    const ctx = this.ctx

    this.nodes.forEach(node => {
      const isInPath = this.currentPath &&
        this.currentPath.nodes.includes(node.id)

      const isSelected = node === this.selectedFrom ||
        node === this.selectedTo

      // Node circle
      if (node.type === 'artist') {
        ctx.fillStyle = isInPath ? '#ff6b6b' : '#c97064'
      } else {
        ctx.fillStyle = isInPath ? '#4ecdc4' : '#7ba8a3'
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, isSelected ? 12 : 8, 0, Math.PI * 2)
      ctx.fill()

      // Border
      ctx.strokeStyle = isSelected ? '#ffd700' : '#b87333'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()

      // Label
      ctx.fillStyle = '#2b2b2b'
      ctx.font = 'bold 11px "IM Fell DW Pica"'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y + 25)
    })
  }

  handleClick(x, y) {
    const clicked = this.nodes.find(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return dist < 15 && node.type === 'artist' // Only artists clickable
    })

    return clicked
  }

  setPath(path) {
    this.currentPath = path
    this.render()
  }

  reset() {
    this.selectedFrom = null
    this.selectedTo = null
    this.currentPath = null
    this.render()
  }
}

// ==================== APP ====================

class App {
  async init() {
    logger.header('MUSICIANS KNOWLEDGE GRAPH')
    logger.info('Steampunk Edition')
    logger.info('Powered by LinkLab Engine')

    // Load data
    const data = await DataLoader.load()

    // Create navigator
    this.navigator = new MusiciansNavigator(data)

    // Create visualizer
    const canvas = document.getElementById('canvas')
    this.visualizer = new CanvasVisualizer(canvas, data)

    // Setup UI
    this.setupUI()

    // Demo: Find a path automatically
    logger.header('DEMO: AUTOMATIC PATHFINDING')
    this.findPath('will-smith', 'manu-dibango')
  }

  setupUI() {
    const canvas = document.getElementById('canvas')
    const resetBtn = document.getElementById('reset-btn')

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const clicked = this.visualizer.handleClick(x, y)

      if (clicked) {
        if (!this.visualizer.selectedFrom) {
          this.visualizer.selectedFrom = clicked
          this.updateUI('from', clicked.label)
          logger.info(`Selected FROM: ${clicked.label}`)
        } else if (!this.visualizer.selectedTo && clicked !== this.visualizer.selectedFrom) {
          this.visualizer.selectedTo = clicked
          this.updateUI('to', clicked.label)
          logger.info(`Selected TO: ${clicked.label}`)

          // Find path
          const fromId = this.visualizer.selectedFrom.id.replace('artist-', '')
          const toId = clicked.id.replace('artist-', '')
          this.findPath(fromId, toId)
        }

        this.visualizer.render()
      }
    })

    resetBtn.addEventListener('click', () => {
      logger.info('RESET')
      this.visualizer.reset()
      this.resetUI()
      resetBtn.disabled = true
    })
  }

  async findPath(fromId, toId) {
    const path = await this.navigator.findPath(fromId, toId)

    if (path) {
      this.visualizer.setPath(path)
      this.showResult(path)
      document.getElementById('reset-btn').disabled = false
    }
  }

  updateUI(type, label) {
    const el = document.getElementById(`artist-${type}`)
    el.textContent = label
    el.classList.add('active')
  }

  resetUI() {
    document.getElementById('artist-from').textContent = '~ AWAIT SELECTION ~'
    document.getElementById('artist-to').textContent = '~ SELECT ORIGIN ~'
    document.getElementById('artist-from').classList.remove('active')
    document.getElementById('artist-to').classList.remove('active')
    document.getElementById('result-panel').classList.remove('active')
  }

  showResult(path) {
    const panel = document.getElementById('result-panel')

    // Degrees
    const artistCount = path.nodes.filter(n => n.startsWith('artist-')).length
    document.getElementById('degrees').textContent = artistCount - 1

    // Path display
    const pathDisplay = document.getElementById('path-display')
    pathDisplay.innerHTML = path.nodes
      .map(nodeId => {
        if (nodeId.startsWith('artist-')) {
          const artistId = nodeId.replace('artist-', '')
          const artist = this.navigator.artists.find(a => a.id === artistId)
          return `<strong>${artist?.name || nodeId}</strong>`
        } else {
          const trackId = nodeId.replace('track-', '')
          const track = this.navigator.tracks.find(t => t.id === trackId)
          return `"${track?.title || nodeId}"`
        }
      })
      .join(' → ')

    // Era span
    const years = path.nodes
      .filter(n => n.startsWith('track-'))
      .map(n => {
        const trackId = n.replace('track-', '')
        return this.navigator.tracks.find(t => t.id === trackId)?.year
      })
      .filter(y => y)

    if (years.length > 0) {
      const minYear = Math.min(...years)
      const maxYear = Math.max(...years)
      document.getElementById('era-span').textContent = `${minYear} - ${maxYear}`
    }

    panel.classList.add('active')
  }
}

// ==================== START ====================

const app = new App()
app.init().catch(console.error)
