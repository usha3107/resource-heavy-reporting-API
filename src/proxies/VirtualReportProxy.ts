import { Report } from '../core/Report';
import { HeavyReportGenerator } from '../core/HeavyReportGenerator';

/**
 * Virtual Proxy.
 * Defers creation of the expensive HeavyReportGenerator until core generate method is called.
 */
export class VirtualReportProxy implements Report {
  private id: string;
  private title: string;
  private requiredRole: string;
  private realSubject: Report | null = null;

  constructor(id: string, title: string, requiredRole: string = 'guest') {
    this.id = id;
    this.title = title;
    this.requiredRole = requiredRole;
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    // Returns cached title without instantiating HeavyReportGenerator
    return this.title;
  }

  public getRequiredRole(): string {
    // Returns cached role requirement without instantiating HeavyReportGenerator
    return this.requiredRole;
  }

  public generate(userRole: string): string {
    // Lazy initialization: Instantiate real subject only on first generate() call
    if (!this.realSubject) {
      this.realSubject = new HeavyReportGenerator(this.id, this.title, this.requiredRole);
    }
    return this.realSubject.generate(userRole);
  }

  /**
   * Helper to check if real subject has been instantiated.
   */
  public isInstantiated(): boolean {
    return this.realSubject !== null;
  }

  /**
   * Resets the proxy reference for testing isolation.
   */
  public resetProxy(): void {
    this.realSubject = null;
  }
}
