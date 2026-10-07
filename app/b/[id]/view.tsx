"use client";
import React from "react";
import { motion } from "framer-motion";
import type { Bouquet } from "@/lib/bouquet";
import { DovelyLink } from "@/components/DovelyLink";

export function RecipientView({ bouquet, imageUrl }: { bouquet: Bouquet; imageUrl: string | null }) {
  const m = bouquet.message ?? {};
  return (
    <main className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,124,255,0.15), transparent 60%)" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}
        className="panel max-w-xl w-full overflow-hidden mx-auto">
        {m.to && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-center pt-7 text-lg text-[var(--text-dim)]">
            For <span className="font-semibold text-white">{m.to}</span>
          </motion.div>
        )}
        <div className="aspect-square relative">
          {imageUrl ? (
            <img src={imageUrl} alt="Bouquet" className="w-full h-full object-contain rounded-xl" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-3)]">
              Loading...
            </div>
          )}
        </div>
        <div className="p-5 sm:p-7 space-y-4">
          {m.text && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="text-white/90 italic text-lg leading-relaxed">&ldquo;{m.text}&rdquo;</motion.p>
          )}
          {m.from && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="text-right text-sm text-[var(--text-dim)]">— {m.from}</motion.p>
          )}
          <div className="flex gap-2 pt-3">
            <a href="/create" className="btn btn-primary flex-1 justify-center">Send one back</a>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="btn flex-1 justify-center">
              Copy link
            </button>
          </div>
          {bouquet.id && <DovelyLink bouquetId={bouquet.id} />}
        </div>
      </motion.div>
    </main>
  );
}
