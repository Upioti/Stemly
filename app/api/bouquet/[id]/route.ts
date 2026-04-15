import { NextResponse } from "next/server";
import { getBouquet } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBouquet(id);
  if (!b) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(b);
}
