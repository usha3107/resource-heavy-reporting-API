/**
 * Centralized Metrics Tracker to count how many times HeavyReportGenerator is instantiated.
 */
export class MetricsTracker {
  private static instantiations: number = 0;

  /**
   * Increments the instantiation counter.
   * MUST be called inside the HeavyReportGenerator constructor.
   */
  public static increment(): void {
    this.instantiations++;
  }

  /**
   * Returns the total count of heavy objects created.
   */
  public static getCount(): number {
    return this.instantiations;
  }

  /**
   * Resets the instantiation counter to zero.
   */
  public static reset(): void {
    this.instantiations = 0;
  }
}
