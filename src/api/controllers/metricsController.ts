import { Request, Response } from 'express';
import { MetricsTracker } from '../../core/MetricsTracker';
import { reportStore } from '../store';

/**
 * Controller to handle metrics endpoint requests.
 */
export class MetricsController {
  /**
   * GET /api/metrics
   * Returns current count of HeavyReportGenerator instantiations.
   */
  public static getMetrics(req: Request, res: Response): Response {
    return res.status(200).json({
      total_instantiations: MetricsTracker.getCount()
    });
  }

  /**
   * POST /api/metrics/reset
   * Resets metrics counter and proxy store for testing isolation.
   */
  public static resetMetrics(req: Request, res: Response): Response {
    MetricsTracker.reset();
    reportStore.resetStore();
    return res.status(200).json({
      message: 'Metrics reset successfully'
    });
  }
}
