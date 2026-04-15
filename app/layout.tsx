import "./globals.css";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "stemly — send a hand-made bouquet",
  description: "Design and send a digital bouquet to someone. 130+ flowers, 7 categories, no account needed.",
  metadataBase: new URL("https://stemly.mat.pics"),
  openGraph: {
    title: "stemly ✿ send a hand-made bouquet",
    description: "Design digital bouquets with artistic flower images. Roses, lilies, orchids, tulips, peonies — arrange them in a vase or paper wrap and send a link.",
    siteName: "stemly",
    type: "website",
    url: "https://stemly.mat.pics",
  },
  twitter: {
    card: "summary_large_image",
    title: "stemly ✿ send a hand-made bouquet",
    description: "Design and send a digital bouquet to someone.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
