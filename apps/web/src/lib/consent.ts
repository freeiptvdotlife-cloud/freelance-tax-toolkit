// Minimal consent-state store, backed by localStorage.
//
// NOT an IAB TCF-certified CMP. This is a functional stopgap so ad-script loading
// can be gated behind a real consent choice today. Before applying for AdSense with
// EEA/UK traffic, replace this with Google's Funding Choices (available once the
// AdSense account is approved — no publisher ID exists yet) or a TCF v2.2-certified
// partner (Quantcast Choice, CookieYes, Cookiebot, etc.), per
// docs/09-autonomous-deep-research.md Section 9.

export type ConsentChoice = "accepted" | "rejected";

export interface ConsentState {
  choice: ConsentChoice;
  ads: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = "consent-state-v1";
const CONSENT_EVENT = "consent-change";

export function getConsentState(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    // Private browsing / blocked storage — treat as no consent recorded yet.
    return null;
  }
}

export function setConsentState(choice: ConsentChoice): ConsentState {
  const state: ConsentState = {
    choice,
    ads: choice === "accepted",
    analytics: choice === "accepted",
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // If storage is blocked, the banner will just reappear next visit — acceptable
    // degradation, since we never want to load ad/analytics scripts without a
    // successfully recorded "accepted" choice.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  return state;
}

export function clearConsentState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function hasAdConsent(): boolean {
  return getConsentState()?.ads === true;
}

export function onConsentChange(handler: (state: ConsentState | null) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<ConsentState | null>).detail);
  window.addEventListener(CONSENT_EVENT, listener);
  return () => window.removeEventListener(CONSENT_EVENT, listener);
}
