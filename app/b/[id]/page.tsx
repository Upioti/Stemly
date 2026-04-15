import { getBouquet, getBouquetImage } from "@/lib/storage";
import { notFound } from "next/navigation";
import { RecipientView } from "./view";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = await getBouquet(id);
  if (!b) return {};

  const hasImage = !!(await getBouquetImage(id));
  const imageUrl = hasImage ? `https://stemly.mat.pics/api/bouquet/${id}/png` : undefined;

  const title = b.message?.to
    ? `A bouquet for ${b.message.to} ✿`
    : "Someone sent you a bouquet ✿";
  const description = b.message?.text
    ? `"${b.message.text.slice(0, 100)}"${b.message.from ? ` — ${b.message.from}` : ""}`
    : "Open to see your hand-made digital bouquet.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 1200 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BouquetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBouquet(id);
  if (!b) notFound();

  const hasImage = !!(await getBouquetImage(id));
  const imageUrl = hasImage ? `/api/bouquet/${id}/png` : null;

  return <RecipientView bouquet={b} imageUrl={imageUrl} />;
}
