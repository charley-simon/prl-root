// formatters/MetroFormatter.ts

import type { Path, Relation } from '../../../../linklab/src'
import type { PathFormatter } from './BaseFormatter'

export class MetroFormatter implements PathFormatter {
  format(path: Path): string {
    const segments = this.identifySegments(path)

    let output = '\n🚇 ITINÉRAIRE DÉTAILLÉ\n'
    output += '='.repeat(60) + '\n\n'

    segments.forEach((segment, i) => {
      if (segment.type === 'DIRECT') {
        output += this.formatDirectSegment(segment, i === 0)
      } else {
        output += this.formatTransferSegment(segment)
      }
    })

    output += '\n' + '='.repeat(60)
    output += `\n⏱️  Durée totale : ${path.totalWeight} minutes\n`
    output += `📍 ${path.nodes.length} stations\n`

    return output
  }

  formatResult(result: any): string {
    if (!result.path) return 'Aucun chemin trouvé'
    return this.format(result.path)
  }

  // ==================== PRIVATE ====================

  private identifySegments(path: Path): Segment[] {
    const segments: Segment[] = []
    let currentSegment: DirectSegment | null = null

    path.relations.forEach((rel, i) => {
      if (rel.via === 'Correspondance') {
        // Sauvegarder le segment en cours
        if (currentSegment) {
          segments.push(currentSegment)
        }

        // Ajouter la correspondance
        segments.push({
          type: 'TRANSFER',
          station: path.nodes[i],
          fromLine: currentSegment?.line || '?',
          toLine: this.extractLineNumber(path.relations[i + 1]?.via || '?'),
          duration: rel.weight
        })

        currentSegment = null
      } else {
        // Trajet direct
        const line = this.extractLineNumber(rel.via)

        if (!currentSegment || currentSegment.line !== line) {
          // Sauvegarder le segment précédent
          if (currentSegment) {
            segments.push(currentSegment)
          }

          // Nouveau segment
          currentSegment = {
            type: 'DIRECT',
            line,
            from: path.nodes[i],
            to: path.nodes[i + 1],
            stations: [path.nodes[i], path.nodes[i + 1]],
            direction: this.extractDirection(rel),
            duration: rel.weight
          }
        } else {
          // Continuer le segment actuel
          currentSegment.to = path.nodes[i + 1]
          currentSegment.stations.push(path.nodes[i + 1])
          currentSegment.duration += rel.weight
        }
      }
    })

    // Ajouter le dernier segment
    if (currentSegment) {
      segments.push(currentSegment)
    }

    return segments
  }

  private formatDirectSegment(segment: DirectSegment, isFirst: boolean): string {
    const stationName = this.cleanStationName(segment.from)
    const lineIcon = this.getLineIcon(segment.line)

    let output = ''

    if (isFirst) {
      output += `📍 Départ : ${stationName}\n\n`
    }

    output += `${lineIcon} Prendre la Ligne ${segment.line}`

    if (segment.direction) {
      output += ` direction ${this.cleanStationName(segment.direction)}`
    }

    output += `\n`
    output += `   ${segment.stations.length - 1} station(s) - ${segment.duration} min\n`
    output += `   ↓\n`
    output += `📍 Descendre à : ${this.cleanStationName(segment.to)}\n\n`

    return output
  }

  private formatTransferSegment(segment: TransferSegment): string {
    const stationName = this.cleanStationName(segment.station)
    const fromIcon = this.getLineIcon(segment.fromLine)
    const toIcon = this.getLineIcon(segment.toLine)

    let output = `🔄 Correspondance à ${stationName}\n`
    output += `   ${fromIcon} Ligne ${segment.fromLine} → ${toIcon} Ligne ${segment.toLine}\n`
    output += `   Temps de marche : ${segment.duration} min\n\n`

    return output
  }

  private cleanStationName(name: string): string {
    return name
      .replace('Station-', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private extractLineNumber(via: string): string {
    const match = via.match(/Ligne[- ](\d+)/)
    return match ? match[1] : via
  }

  private extractDirection(rel: Relation): string | undefined {
    return rel.metadata?.direction
  }

  private getLineIcon(line: string): string {
    const icons: Record<string, string> = {
      '1': '🟡',
      '2': '🔵',
      '3': '🟢',
      '4': '🟣',
      '5': '🟠',
      '6': '🩵',
      '7': '🩷',
      '8': '🟤',
      '9': '💛',
      '10': '💚',
      '11': '🤎',
      '12': '💙',
      '13': '🩶 ', // Pourquoi dois je ajouter un blanc pour que ce soit aligné avec les autres en sortie
      '14': '💜'
    }
    return icons[line] || '🚇'
  }
}

// ==================== TYPES ====================

type Segment = DirectSegment | TransferSegment

type DirectSegment = {
  type: 'DIRECT'
  line: string
  from: string
  to: string
  stations: string[]
  direction?: string
  duration: number
}

type TransferSegment = {
  type: 'TRANSFER'
  station: string
  fromLine: string
  toLine: string
  duration: number
}
