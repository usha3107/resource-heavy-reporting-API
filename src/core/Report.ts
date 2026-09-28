/**
 * The Subject Interface.
 * Defines the common contract for both Real Subjects and Proxies.
 */
export interface Report {
  /**
   * Returns the unique report identifier.
   */
  getId(): string;

  /**
   * Returns the title of the report (cheap metadata operation).
   */
  getTitle(): string;

  /**
   * Returns the required role to access and generate this report.
   */
  getRequiredRole(): string;

  /**
   * Generates the actual report content (expensive operation).
   * @param userRole The role of the user requesting the report generation.
   */
  generate(userRole: string): string;
}
