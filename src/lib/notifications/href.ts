import { ROUTES } from "@/config/routes";

/**
 * All notification deep-links go to Approvals.
 * Approving/rejecting leave & comp-off happens only on that page.
 */
export function getNotificationHref(_actionUrl?: string | null): string {
  return ROUTES.approvals;
}
