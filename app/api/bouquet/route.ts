import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveBouquet, saveBouquetImage } from "@/lib/storage";
import type { Bouquet } from "@/lib/bouquet";

export async function POST(req: Request) {
  const body = await req.json();
  const { image, ...bouquetData } = body as Bouquet & { image?: string };
  const id = nanoid(8);
  const saved = await saveBouquet({ ...bouquetData, id, createdAt: Date.now() });

  if (image) {
    await saveBouquetImage(id, image);
  }

  return NextResponse.json({ id: saved.id });
}
