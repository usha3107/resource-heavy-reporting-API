import { Request, Response } from 'express';
import { reportStore } from '../store';
import { AccessDeniedError } from '../../proxies/ProtectionReportProxy';

/**
 * Controller to handle reports endpoint requests.
 */
export class ReportsController {
  /**
   * GET /api/reports
   * Returns list of available report metadata without instantiating Heavy subjects.
   */
  public static listReports(req: Request, res: Response): Response {
    const reports = reportStore.getAllReports();
    return res.status(200).json(reports);
  }

  /**
   * GET /api/reports/:id/generate
   * Generates a report for authorized role.
   */
  public static generateReport(req: Request, res: Response): Response {
    const { id } = req.params;
    const role = (req.query.role as string) || '';

    const report = reportStore.getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    try {
      const content = report.generate(role);
      return res.status(200).json({
        id: report.getId(),
        content: content
      });
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        return res.status(403).json({ error: 'Access Denied' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
