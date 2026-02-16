export class MetricsRegistry {
  private counters: Record<string, number> = {}
  private timers: Record<string, number[]> = {}
  private histograms: Record<string, number[]> = {}

  // -------- Counters --------

  counter(name: string) {
    return {
      inc: (value = 1) => {
        this.counters[name] = (this.counters[name] ?? 0) + value
      }
    }
  }

  getCounter(name: string): number {
    return this.counters[name] ?? 0
  }

  // -------- Timers --------

  timer(name: string) {
    return {
      record: (durationMs: number) => {
        if (!this.timers[name]) this.timers[name] = []
        this.timers[name].push(durationMs)
      }
    }
  }

  getTimer(name: string): number[] {
    return this.timers[name] ?? []
  }

  // -------- Histograms --------

  histogram(name: string) {
    return {
      record: (value: number) => {
        if (!this.histograms[name]) this.histograms[name] = []
        this.histograms[name].push(value)
      }
    }
  }

  getHistogram(name: string): number[] {
    return this.histograms[name] ?? []
  }

  // -------- Reset (tests) --------

  reset() {
    this.counters = {}
    this.timers = {}
    this.histograms = {}
  }
}

// singleton global
export const metricsRegistry = new MetricsRegistry()
