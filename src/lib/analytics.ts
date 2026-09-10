type TrackPayload = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Konverteringsspårning. Skickar till dataLayer om en mätlösning finns,
 * annars loggas händelsen lokalt. Inga personuppgifter får skickas här.
 */
export function track(event: string, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  const entry = { event, ...payload, ts: Date.now() };
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(entry);
    return;
  }
  window.dataLayer = [entry];
}
