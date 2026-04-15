import { Bouquet } from "./bouquet";

// Cloudflare KV-backed storage. KV namespace bound as BOUQUETS_KV in wrangler.jsonc.
// Falls back to in-memory map for local dev without bindings.

const memStore: Record<string, string> = {};

async function getKV(): Promise<{ get: (key: string) => Promise<string | null>; put: (key: string, value: string) => Promise<void> } | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext();
    const kv = (env as Record<string, any>).BOUQUETS_KV;
    return kv ?? null;
  } catch {
    return null;
  }
}

export async function saveBouquet(b: Bouquet): Promise<Bouquet> {
  const kv = await getKV();
  const json = JSON.stringify(b);
  if (kv) {
    await kv.put(b.id!, json);
  } else {
    memStore[b.id!] = json;
  }
  return b;
}

export async function getBouquet(id: string): Promise<Bouquet | null> {
  const kv = await getKV();
  if (kv) {
    const val = await kv.get(id);
    return val ? JSON.parse(val) : null;
  }
  const val = memStore[id];
  return val ? JSON.parse(val) : null;
}

export async function saveBouquetImage(id: string, base64: string): Promise<void> {
  const kv = await getKV();
  const key = `img-${id}`;
  if (kv) {
    await kv.put(key, base64);
  } else {
    memStore[key] = base64;
  }
}

export async function getBouquetImage(id: string): Promise<string | null> {
  const kv = await getKV();
  const key = `img-${id}`;
  if (kv) {
    return await kv.get(key);
  }
  return memStore[key] ?? null;
}
