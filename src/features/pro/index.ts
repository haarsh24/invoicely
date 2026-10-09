/**
 * Pro Plan & Feature Flags Scaffold (Phase 2 readiness)
 * In Phase 1, all core invoicing features are 100% free with a clean made-with badge.
 */

export interface ProLicense {
  licenseKey: string;
  activatedAt: string;
  expiresAt?: string;
  customerEmail?: string;
}

const PRO_LICENSE_STORAGE_KEY = "invoicely_pro_license";

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(PRO_LICENSE_STORAGE_KEY);
    if (!raw) return false;
    const license = JSON.parse(raw) as ProLicense;
    return !!license.licenseKey && license.licenseKey.trim().length > 0;
  } catch {
    return false;
  }
}

export function saveProLicense(license: ProLicense): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRO_LICENSE_STORAGE_KEY, JSON.stringify(license));
}

export function clearProLicense(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRO_LICENSE_STORAGE_KEY);
}
