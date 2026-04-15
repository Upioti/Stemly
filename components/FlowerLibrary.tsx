"use client";
import React, { useState } from "react";
import { CATEGORIES, varietiesByCategory, FlowerVariety } from "@/lib/presets/flowers";
import { useBouquet } from "@/lib/store";

function FlowerCard({ v }: { v: FlowerVariety }) {
  const addStem = useBouquet((s) => s.addStem);
  const [previewVariant, setPreviewVariant] = useState(1);

  return (
    <div className="group">
      <button
        onClick={() => addStem(v.id)}
        className="w-full surface-hi p-1.5 hover:bg-[var(--surface-hover)] transition-colors flex flex-col items-center rounded-lg"
      >
        <div className="w-full aspect-[2/3] flex items-center justify-center overflow-hidden rounded-md">
          <img
            src={v.thumbPath(previewVariant)}
            alt={v.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
            loading="lazy"
            draggable={false}
          />
        </div>
        <div className="text-[9px] text-[var(--text-3)] group-hover:text-[var(--text)] transition-colors mt-1 text-center leading-tight font-medium truncate w-full px-0.5">
          {v.name}
        </div>
      </button>
      <div className="flex justify-center gap-0.5 mt-0.5">
        {[1, 2, 3].map((vn) => (
          <button
            key={vn}
            onClick={() => addStem(v.id, vn)}
            onMouseEnter={() => setPreviewVariant(vn)}
            onMouseLeave={() => setPreviewVariant(1)}
            className={`w-5 h-4 text-[8px] font-mono rounded transition-colors ${
              previewVariant === vn
                ? "text-[var(--text)] bg-[var(--surface-hover)]"
                : "text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {vn}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FlowerLibrary() {
  const [openCat, setOpenCat] = useState<string>("roses");

  return (
    <div className="space-y-1">
      {CATEGORIES.map((cat) => {
        const isOpen = openCat === cat.id;
        const varieties = varietiesByCategory(cat.id);
        return (
          <div key={cat.id}>
            <button
              onClick={() => setOpenCat(isOpen ? "" : cat.id)}
              className="w-full flex items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
            >
              <span>{cat.label}</span>
              <span className="text-[10px] font-mono opacity-50">{varieties.length}</span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-2 gap-1 pb-2">
                {varieties.map((v) => (
                  <FlowerCard key={v.id} v={v} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
