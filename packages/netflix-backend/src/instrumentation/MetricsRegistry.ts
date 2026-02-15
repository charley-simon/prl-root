export type CounterMap = Record<string, number>;
export type TimerMap = Record<
  string,
  { count: number; total: number; min: number; max: number }
>;

export class MetricsRegistry {
  private static counters: Record<string, number> = {};
  private static timers: Record<string, { count: number; total: number }> = {};

  static reset() {
    this.counters = {};
    this.timers = {};
  }

  static increment(name: string, value = 1) {
    this.counters[name] = (this.counters[name] ?? 0) + value;
  }

  /**
   * Enregistre la durée d'une opération
   * @param name clé de la métrique
   * @param duration en millisecondes
   */
  static incrementTimer(name: string, duration: number) {
    if (!this.timers[name]) this.timers[name] = { count: 0, total: 0 };
    this.timers[name].count += 1;
    this.timers[name].total += duration;
  }

  static snapshot() {
    return {
      counters: { ...this.counters },
      timers: { ...this.timers },
    };
  }
}
