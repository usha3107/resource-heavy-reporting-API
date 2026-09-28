import { Report } from '../core/Report';
import { VirtualReportProxy } from '../proxies/VirtualReportProxy';
import { ProtectionReportProxy } from '../proxies/ProtectionReportProxy';

/**
 * Report Repository / In-memory store.
 * Holds proxies initialized on application startup.
 */
class ReportStore {
  private reportsMap: Map<string, Report> = new Map();

  constructor() {
    this.seedStore();
  }

  /**
   * Seeds the in-memory store with required report proxies.
   */
  public seedStore(): void {
    this.reportsMap.clear();

    // report-1: Title "Financial Q1", Requires role: admin
    const report1Virtual = new VirtualReportProxy('report-1', 'Financial Q1', 'admin');
    const report1Protected = new ProtectionReportProxy(report1Virtual, 'admin');
    this.reportsMap.set('report-1', report1Protected);

    // report-2: Title "User Analytics", Requires role: manager
    const report2Virtual = new VirtualReportProxy('report-2', 'User Analytics', 'manager');
    const report2Protected = new ProtectionReportProxy(report2Virtual, 'manager');
    this.reportsMap.set('report-2', report2Protected);

    // report-3: Title "System Status", Requires role: guest
    const report3Virtual = new VirtualReportProxy('report-3', 'System Status', 'guest');
    const report3Protected = new ProtectionReportProxy(report3Virtual, 'guest');
    this.reportsMap.set('report-3', report3Protected);
  }

  /**
   * Returns all available reports metadata array.
   */
  public getAllReports(): Array<{ id: string; title: string; required_role: string }> {
    const list: Array<{ id: string; title: string; required_role: string }> = [];
    for (const report of this.reportsMap.values()) {
      list.push({
        id: report.getId(),
        title: report.getTitle(),
        required_role: report.getRequiredRole()
      });
    }
    return list;
  }

  /**
   * Retrieves a report by its ID.
   */
  public getReportById(id: string): Report | undefined {
    return this.reportsMap.get(id);
  }

  /**
   * Resets all proxies in store for test isolation.
   */
  public resetStore(): void {
    this.seedStore();
  }
}

export const reportStore = new ReportStore();
