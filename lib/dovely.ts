// dovely integration (https://dovely.mat.pics): send a bouquet inside a letter carried by a pigeon.
// Kept tiny and dependency free on purpose.

export const DOVELY_ORIGIN = "https://dovely.mat.pics";

/** Link that opens dovely's letter editor with this bouquet attached. */
export function dovelyLetterUrl(bouquetId: string): string {
  return `${DOVELY_ORIGIN}/crear?ramo=${encodeURIComponent(bouquetId)}`;
}

/**
 * Validates a `?return=` value. Only absolute https URLs on dovely are allowed (no open redirects).
 * Returns the normalized URL string, or null when it is not allowed.
 */
export function safeDovelyReturn(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith(`${DOVELY_ORIGIN}/`)) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.origin !== DOVELY_ORIGIN || u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Appends `ramo={id}` to an allowed return URL (replacing any previous `ramo`). */
export function dovelyReturnWithBouquet(returnUrl: string, bouquetId: string): string {
  const u = new URL(returnUrl);
  u.searchParams.set("ramo", bouquetId);
  return u.toString();
}

/** Reads and validates `?return=` from the current location (client only). */
export function readDovelyReturn(): string | null {
  if (typeof window === "undefined") return null;
  return safeDovelyReturn(new URLSearchParams(window.location.search).get("return"));
}

/** Button label in the visitor's language (stemly is English, dovely speaks Spanish first). */
export function pigeonLabel(lang: string | undefined): string {
  return lang?.toLowerCase().startsWith("es") ? "Mandar con una paloma ✉" : "Send with a pigeon ✉";
}
