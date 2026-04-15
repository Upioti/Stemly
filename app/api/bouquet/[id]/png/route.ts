import { NextResponse } from "next/server";
import { getBouquetImage } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base64 = await getBouquetImage(id);
  if (!base64) return NextResponse.json({ error: "not found" }, { status: 404 });

  const binary = Buffer.from(base64, "base64");
  return new NextResponse(binary, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
