// formatters/BaseFormatter.ts

import type { Path, EngineStepResult } from '../../../../linklab/src'

export interface PathFormatter {
  /**
   * Formate un Path pour l'affichage humain
   */
  format(path: Path): string

  /**
   * Formate un résultat complet de pathfinding
   */
  formatResult(result: EngineStepResult): string
}
