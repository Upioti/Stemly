"use client";
import React, { useRef, useState, useCallback } from "react";
import { useBouquet } from "@/lib/store";
import { varietyById } from "@/lib/presets/flowers";

export function LayerPanel() {
  const { bouquet, selectedId, select, toggleLock, removeStem, reorderStem } = useBouquet();
  const sorted = [...bouquet.stems].sort((a, b) => b.z - a.z);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDropIndex = useCallback((clientY: number) => {
    if (!containerRef.current) return null;
    const children = Array.from(containerRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return children.length;
  }, []);

  const onPointerDown = (e: React.PointerEvent, id: string, index: number) => {
    // Only start drag from the grip handle
    const target = e.target as HTMLElement;
    if (!target.closest("[data-grip]")) return;
    e.preventDefault();
    e.stopPropagation();
    dragIdRef.current = id;
    setDragIdx(index);
    setOverIdx(index);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragIdRef.current === null) return;
    const idx = getDropIndex(e.clientY);
    setOverIdx(idx);
  };

  const onPointerUp = () => {
    if (dragIdRef.current !== null && overIdx !== null && dragIdx !== null && overIdx !== dragIdx) {
      const targetIdx = overIdx > dragIdx ? overIdx - 1 : overIdx;
      if (targetIdx !== dragIdx) {
        reorderStem(dragIdRef.current, targetIdx);
      }
    }
    dragIdRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  if (sorted.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="space-y-0.5 max-h-[200px] overflow-auto"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {sorted.map((st, index) => {
        const v = varietyById(st.varietyId);
        const isSelected = st.id === selectedId;
        const isDragging = dragIdx === index;
        const showDropAbove = overIdx !== null && dragIdx !== null && overIdx !== dragIdx && index === overIdx;

        return (
          <div
            key={st.id}
            onPointerDown={(e) => onPointerDown(e, st.id, index)}
            onClick={() => select(st.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-[11px] ${
              isSelected
                ? "bg-[rgba(167,139,250,0.12)] border border-[rgba(167,139,250,0.25)]"
                : "hover:bg-[rgba(255,255,255,0.03)] border border-transparent"
            }`}
            style={{
              opacity: isDragging ? 0.4 : 1,
              borderTopColor: showDropAbove ? "rgba(96,165,250,0.7)" : undefined,
              borderTopWidth: showDropAbove ? 2 : undefined,
            }}
          >
            <span
              data-grip
              className="flex-shrink-0 cursor-grab active:cursor-grabbing text-[var(--text-3)] text-[11px] select-none touch-none"
              title="Drag to reorder"
            >
              ⠿
            </span>
            <img
              src={v.thumbPath(st.variant)}
              alt={v.name}
              className="w-7 h-9 object-contain flex-shrink-0 pointer-events-none"
              draggable={false}
              style={{ opacity: st.locked ? 0.5 : 1 }}
            />
            <div className="flex-1 min-w-0 pointer-events-none">
              <div className="truncate font-medium text-[var(--text)]">{v.name}</div>
              <div className="text-[9px] text-[var(--text-3)]">v{st.variant} · z{st.z}</div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); toggleLock(st.id); }}
                className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                title={st.locked ? "Unlock" : "Lock"}
              >
                {st.locked ? "🔒" : "🔓"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeStem(st.id); }}
                className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[#fb7185]"
                title="Delete"
              >×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
