// src/core/Logger.ts

/**
 * Simple logger for LinkLab
 *
 * Can be disabled in production or replaced with custom implementation
 */
export class Logger {
  private enabled: boolean

  constructor(enabled: boolean = true) {
    this.enabled = enabled
  }

  info(message: string, data?: any): void {
    if (!this.enabled) return
    console.log(`ℹ️  ${message}`, data ?? '')
  }

  warn(message: string, data?: any): void {
    if (!this.enabled) return
    console.warn(`⚠️  ${message}`, data ?? '')
  }

  error(message: string, error?: any): void {
    if (!this.enabled) return
    console.error(`❌ ${message}`, error ?? '')
  }

  debug(message: string, data?: any): void {
    if (!this.enabled) return
    console.debug(`🔍 ${message}`, data ?? '')
  }

  disable(): void {
    this.enabled = false
  }

  enable(): void {
    this.enabled = true
  }
}
