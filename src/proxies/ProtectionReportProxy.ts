import { Report } from '../core/Report';

/**
 * Custom error thrown when protection proxy access control fails.
 */
export class AccessDeniedError extends Error {
  constructor(message: string = 'Access Denied') {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

/**
 * Protection Proxy.
 * Controls access to the underlying Report based on user roles.
 */
export class ProtectionReportProxy implements Report {
  private underlyingReport: Report;
  private requiredRole: string;

  constructor(underlyingReport: Report, requiredRole: string) {
    this.underlyingReport = underlyingReport;
    this.requiredRole = requiredRole;
  }

  public getId(): string {
    return this.underlyingReport.getId();
  }

  public getTitle(): string {
    // Public metadata delegation
    return this.underlyingReport.getTitle();
  }

  public getRequiredRole(): string {
    return this.requiredRole;
  }

  public generate(userRole: string): string {
    // Intercept call and verify permissions
    if (!userRole || userRole !== this.requiredRole) {
      throw new AccessDeniedError('Access Denied');
    }

    // Forward request if role matches
    return this.underlyingReport.generate(userRole);
  }

  /**
   * Returns the wrapped report object.
   */
  public getUnderlyingReport(): Report {
    return this.underlyingReport;
  }
}
