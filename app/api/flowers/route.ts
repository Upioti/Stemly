import { NextResponse } from "next/server";
import { CATEGORIES, VARIETIES } from "@/lib/presets/flowers";
import { DOVELY_ORIGIN } from "@/lib/dovely";

// Flower manifest for dovely's pressed flowers, generated from lib/presets/flowers.tsx so nothing is hardcoded there.
// Static: rebuilt on every deploy.
export const dynamic = "force-static";

export function GET() {
  const body = {
    version: 1,
    categories: CATEGORIES,
    varieties: VARIETIES.map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      variants: Array.from({ length: v.variants }, (_, i) => ({
        variant: i + 1,
        src: v.imagePath(i + 1),
        thumb: v.thumbPath(i + 1),
      })),
    })),
  };
  return NextResponse.json(body, {
    headers: {
      "Access-Control-Allow-Origin": DOVELY_ORIGIN,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
