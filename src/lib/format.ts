const sek = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat("sv-SE");

export function formatSek(value: number | null | undefined): string {
  if (value == null) return "–";
  return sek.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "–";
  return numberFmt.format(value);
}

export function formatPercent(value: number | string | null | undefined): string {
  if (value == null) return "–";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "–";
  return `${n.toFixed(2).replace(".", ",")} %`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "–";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "–";
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "–";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "–";
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function formatMonth(value: string | Date | null | undefined): string {
  if (!value) return "–";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "–";
  const s = new Intl.DateTimeFormat("sv-SE", { month: "long", year: "numeric" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Hur färsk en säkerhetskopia är, i timmar. */
export function hoursSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return (Date.now() - d.getTime()) / 36e5;
}

export function relativeAge(value: string | null | undefined): string {
  const h = hoursSince(value);
  if (h == null) return "Aldrig";
  if (h < 1) return "Mindre än en timme sedan";
  if (h < 24) return `${Math.round(h)} tim sedan`;
  const days = Math.round(h / 24);
  return days === 1 ? "1 dygn sedan" : `${days} dygn sedan`;
}
