"use client";
import React, { useEffect, useState } from "react";
import { dovelyLetterUrl, pigeonLabel } from "@/lib/dovely";

/** "Send with a pigeon ✉": opens dovely's letter editor with this bouquet attached. */
export function DovelyLink({ bouquetId, className = "btn w-full justify-center" }: { bouquetId: string; className?: string }) {
  // English on the server render, then the visitor's language after mount (no hydration mismatch).
  const [label, setLabel] = useState(() => pigeonLabel("en"));
  useEffect(() => setLabel(pigeonLabel(navigator.language)), []);
  return (
    <a href={dovelyLetterUrl(bouquetId)} className={className} data-testid="dovely-link">
      {label}
    </a>
  );
}
