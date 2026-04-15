"use client";
import React, { useRef, useState } from "react";
import { Bouquet, Stem } from "@/lib/bouquet";
import { varietyById, BACKGROUNDS } from "@/lib/presets/flowers";
import { HolderBack, HolderFront } from "./Vase";

type Props = {
  bouquet: Bouquet;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (id: string, patch: Partial<Stem>, commit?: boolean) => void;
  onLayerUp?: (id: string) => void;
  onLayerDown?: (id: string) => void;
  onRemove?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  width?: number;
  height?: number;
  interactive?: boolean;
};

const STAGE_W = 720;
const STAGE_H = 720;
const IMG_W = 200;
const IMG_H = 300;

type DragMode = "move" | "rotate" | "scale";

export function BouquetStage({ bouquet, selectedId, onSelect, onChange, onLayerUp, onLayerDown, onRemove, onToggleLock, width = STAGE_W, height = STAGE_H, interactive = true }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [drag, setDrag] = useState<{ id: string; mode: DragMode; dx: number; dy: number; startScale: number; startRot: number; cx: number; cy: number } | null>(null);
  const stemPointerRef = useRef(false);
  const pinchRef = useRef<{ startDist: number; startScale: number; id: string } | null>(null);

  const bg = BACKGROUNDS[bouquet.background] ?? BACKGROUNDS.midnight;
  const stems = [...bouquet.stems].sort((a, b) => a.z - b.z);

  const toSvg = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * width,
      y: ((clientY - rect.top) / rect.height) * height,
    };
  };

  const onStemDown = (e: React.PointerEvent, st: Stem) => {
    if (!interactive) return;
    e.stopPropagation();
    e.preventDefault();
    stemPointerRef.current = true;
    onSelect?.(st.id);
    if (st.locked) return;
    const p = toSvg(e.clientX, e.clientY);
    setDrag({ id: st.id, mode: "move", dx: p.x - st.x * width, dy: p.y - st.y * height, startScale: st.scale, startRot: st.rotation, cx: st.x * width, cy: st.y * height });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onHandleDown = (e: React.PointerEvent, st: Stem, mode: DragMode) => {
    if (!interactive || st.locked) return;
    e.stopPropagation();
    e.preventDefault();
    stemPointerRef.current = true;
    const p = toSvg(e.clientX, e.clientY);
    const anchorX = st.x * width;
    const anchorY = st.y * height;
    // Use visual center of the bounding box (midpoint of the flower image) for scale reference
    const visualCenterX = anchorX;
    const visualCenterY = anchorY - (IMG_H * st.scale) / 2;
    const cx = mode === "scale" ? visualCenterX : anchorX;
    const cy = mode === "scale" ? visualCenterY : anchorY;
    setDrag({ id: st.id, mode, dx: p.x, dy: p.y, startScale: st.scale, startRot: st.rotation, cx, cy });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    e.preventDefault();
    const st = bouquet.stems.find((s) => s.id === drag.id);
    if (!st || st.locked) return;
    const p = toSvg(e.clientX, e.clientY);
    if (drag.mode === "move") {
      const nx = Math.max(0.05, Math.min(0.95, (p.x - drag.dx) / width));
      const ny = Math.max(0.1, Math.min(0.85, (p.y - drag.dy) / height));
      onChange?.(drag.id, { x: nx, y: ny }, false);
    } else if (drag.mode === "rotate") {
      const cx = st.x * width;
      const cy = st.y * height;
      const ang = (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI + 90;
      const clamped = Math.max(-60, Math.min(60, ang));
      onChange?.(drag.id, { rotation: clamped }, false);
    } else if (drag.mode === "scale") {
      const dist = Math.hypot(p.x - drag.cx, p.y - drag.cy);
      const startDist = Math.hypot(drag.dx - drag.cx, drag.dy - drag.cy);
      if (startDist < 5) return;
      const s = Math.max(0.3, Math.min(2.5, drag.startScale * (dist / startDist)));
      onChange?.(drag.id, { scale: s }, false);
    }
  };

  const onPointerUp = () => setDrag(null);

  const handleStageClick = () => {
    if (!interactive) return;
    if (stemPointerRef.current) {
      stemPointerRef.current = false;
      return;
    }
    onSelect?.(null);
  };

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) return;

    const getTouchDist = (t: TouchList) => {
      if (t.length < 2) return 0;
      return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2 && selectedId) {
        const st = bouquet.stems.find(s => s.id === selectedId);
        if (st && !st.locked) {
          e.preventDefault();
          pinchRef.current = { startDist: getTouchDist(e.touches), startScale: st.scale, id: st.id };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dist = getTouchDist(e.touches);
        const ratio = dist / pinchRef.current.startDist;
        const s = Math.max(0.3, Math.min(2.5, pinchRef.current.startScale * ratio));
        onChange?.(pinchRef.current.id, { scale: s }, false);
      }
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    svg.addEventListener("touchstart", onTouchStart, { passive: false });
    svg.addEventListener("touchmove", onTouchMove, { passive: false });
    svg.addEventListener("touchend", onTouchEnd);
    svg.addEventListener("touchcancel", onTouchEnd);

    return () => {
      svg.removeEventListener("touchstart", onTouchStart);
      svg.removeEventListener("touchmove", onTouchMove);
      svg.removeEventListener("touchend", onTouchEnd);
      svg.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [interactive, selectedId, bouquet.stems, onChange]);

  const selStem = bouquet.stems.find((s) => s.id === selectedId);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full select-none touch-none"
      style={{ borderRadius: 20 }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={handleStageClick}
    >
      <rect x={0} y={0} width={width} height={height} fill={bg} />

      {/* 1. Back of holder — rim opening */}
      {(() => {
        const isTop = bouquet.vase.preset === "top";
        const vs = bouquet.vase.scale ?? 1;
        const hx = width / 2;
        const hy = isTop ? height * 0.5 : height * 0.72;
        const hw = (isTop ? width * 0.5 : width * 0.36) * vs;
        return <HolderBack preset={bouquet.vase.preset} color={bouquet.vase.color} x={hx} y={hy} w={hw} />;
      })()}

      {/* 2. Flower images */}
      {stems.map((st) => {
        const v = varietyById(st.varietyId);
        const cx = st.x * width;
        const cy = st.y * height;
        const s = st.scale;
        const imgW = IMG_W * s;
        const imgH = IMG_H * s;
        const adj = st.adjustments;

        const filterId = `f-${st.id}`;

        return (
          <g key={st.id}>
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <feColorMatrix type="saturate" values={String(adj.saturate)} />
                <feComponentTransfer>
                  <feFuncR type="linear" slope={adj.brightness} />
                  <feFuncG type="linear" slope={adj.brightness} />
                  <feFuncB type="linear" slope={adj.brightness} />
                </feComponentTransfer>
                <feColorMatrix type="hueRotate" values={String(adj.hueRotate)} />
              </filter>
            </defs>
            <g
              transform={`translate(${cx} ${cy}) rotate(${st.rotation})`}
              onPointerDown={(e) => onStemDown(e, st)}
              style={{ cursor: interactive && !st.locked ? "grab" : "default", opacity: st.locked && interactive ? 0.7 : 1 }}
            >
              {/* Invisible hit area so pointer events register on the <g> */}
              <rect x={-imgW / 2} y={-imgH} width={imgW} height={imgH} fill="transparent" />
              <image
                href={v.imagePath(st.variant)}
                x={-imgW / 2}
                y={-imgH}
                width={imgW}
                height={imgH}
                preserveAspectRatio="xMidYMid meet"
                filter={`url(#${filterId})`}
                transform={[
                  st.flipX ? `scale(-1,1)` : "",
                  st.perspectiveSkewX !== 0 ? `skewX(${st.perspectiveSkewX})` : "",
                  st.perspectiveSkewY !== 0 ? `skewY(${st.perspectiveSkewY})` : "",
                  st.perspectiveScaleY && st.perspectiveScaleY !== 1 ? `scale(1,${st.perspectiveScaleY})` : "",
                ].filter(Boolean).join(" ") || undefined}
                style={{ pointerEvents: "none" }}
              />
            </g>
          </g>
        );
      })}

      {/* 3. Front of holder */}
      {(() => {
        const isTop = bouquet.vase.preset === "top";
        const vs = bouquet.vase.scale ?? 1;
        const hx = width / 2;
        const hy = isTop ? height * 0.5 : height * 0.72;
        const hw = (isTop ? width * 0.5 : width * 0.36) * vs;
        return <HolderFront preset={bouquet.vase.preset} color={bouquet.vase.color} x={hx} y={hy} w={hw} />;
      })()}

      {/* Envelope with message card */}
      {bouquet.message?.text && (() => {
        const envW = 200, envH = 55;
        const cardW = 260, cardH = 140;
        const cx = width / 2;
        const envY = height * 0.92;
        const msg = bouquet.message!;

        return (
          <g onClick={(e) => { e.stopPropagation(); setEnvelopeOpen(!envelopeOpen); }} style={{ cursor: "pointer" }}>
            {/* Card that slides up when open */}
            {envelopeOpen && (
              <g>
                <rect x={cx - cardW / 2} y={envY - cardH - 20} width={cardW} height={cardH} rx={10}
                  fill="rgba(255,248,240,0.1)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <rect x={cx - cardW / 2 + 6} y={envY - cardH - 14} width={cardW - 12} height={cardH - 12} rx={7}
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} strokeDasharray="4 3" />
                <text x={cx} y={envY - cardH + 20} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.7)" fontStyle="italic">
                  &ldquo;{msg.text!.length > 50 ? msg.text!.slice(0, 50) + "\u2026" : msg.text}&rdquo;
                </text>
                {msg.from && (
                  <text x={cx} y={envY - cardH + 44} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
                    — {msg.from}
                  </text>
                )}
                {msg.to && (
                  <text x={cx} y={envY - cardH + 62} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)">
                    for {msg.to}
                  </text>
                )}
              </g>
            )}

            {/* Envelope body */}
            <rect x={cx - envW / 2} y={envY - envH / 2} width={envW} height={envH} rx={8}
              fill="rgba(255,245,235,0.1)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

            {/* Envelope flap */}
            {!envelopeOpen ? (
              <path d={`M ${cx - envW / 2} ${envY - envH / 2} L ${cx} ${envY - envH / 2 - 28} L ${cx + envW / 2} ${envY - envH / 2}`}
                fill="rgba(255,245,235,0.08)" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            ) : (
              <path d={`M ${cx - envW / 2} ${envY - envH / 2} L ${cx} ${envY - envH / 2 + 18} L ${cx + envW / 2} ${envY - envH / 2}`}
                fill="rgba(255,245,235,0.06)" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            )}

            {/* Seal icon */}
            <text x={cx} y={envelopeOpen ? envY + 4 : envY - envH / 2 - 8} textAnchor="middle" fontSize="14" fill="rgba(255,200,200,0.5)">
              {envelopeOpen ? "\u2709" : "\u2665"}
            </text>

            {/* Label */}
            <text x={cx} y={envY + envH / 2 - 8} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.2)">
              {envelopeOpen ? "tap to close" : "tap to read"}
            </text>
          </g>
        );
      })()}

      {/* Selection overlay — rect with controls */}
      {interactive && selStem && (() => {
        const cx = selStem.x * width;
        const cy = selStem.y * height;
        const hw = (IMG_W * selStem.scale) / 2 + 6;
        const hh = IMG_H * selStem.scale + 6;
        const bx = -hw;
        const by = -hh;
        const bw = hw * 2;
        const bh = hh;
        const isLocked = selStem.locked;
        const accent = isLocked ? "#f59e0b" : "#8b7cff";
        const btnSize = 38;
        const btnY = by - btnSize - 6;
        const btnGap = 3;

        return (
          <g transform={`translate(${cx} ${cy}) rotate(${selStem.rotation})`}>
            {/* Bounding box */}
            <rect x={bx} y={by} width={bw} height={bh} fill="none"
              stroke={accent} strokeOpacity="0.5" strokeWidth={1.5} strokeDasharray="6 4" rx={4} />

            {/* Top toolbar */}
            <foreignObject x={bx - 20} y={btnY} width={bw + 40} height={btnSize + 2}>
              <div style={{ display: "flex", justifyContent: "center", gap: btnGap, height: "100%" }}>
                {!isLocked && (
                  <>
                    <button
                      onPointerDown={(e) => { e.stopPropagation(); onLayerDown?.(selStem.id); }}
                      style={{ width: btnSize, height: btnSize, borderRadius: 7, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.15)", color: "#a1a1aa", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Layer down"
                    >↓</button>
                    <button
                      onPointerDown={(e) => { e.stopPropagation(); onLayerUp?.(selStem.id); }}
                      style={{ width: btnSize, height: btnSize, borderRadius: 7, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.15)", color: "#a1a1aa", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Layer up"
                    >↑</button>
                  </>
                )}
                <button
                  onPointerDown={(e) => { e.stopPropagation(); onToggleLock?.(selStem.id); }}
                  style={{ width: btnSize, height: btnSize, borderRadius: 7, background: isLocked ? "rgba(245,158,11,0.2)" : "rgba(0,0,0,0.8)", border: `1px solid ${isLocked ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.15)"}`, color: isLocked ? "#f59e0b" : "#a1a1aa", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title={isLocked ? "Unlock" : "Lock"}
                >{isLocked ? "🔒" : "🔓"}</button>
                {!isLocked && (
                  <button
                    onPointerDown={(e) => { e.stopPropagation(); onRemove?.(selStem.id); }}
                    style={{ width: btnSize, height: btnSize, borderRadius: 7, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.15)", color: "#fb7185", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Delete"
                  >×</button>
                )}
              </div>
            </foreignObject>

            {/* Corner handles (scale) */}
            {!isLocked && (
              <>
                {/* Bottom-right scale handle */}
                <rect x={bx + bw - 12} y={by + bh - 12} width={24} height={24} fill="#0f111a" stroke="#ec4899" strokeWidth={2} rx={4}
                  style={{ cursor: "nwse-resize" }}
                  onPointerDown={(e) => onHandleDown(e, selStem, "scale")} />
                {/* Top-right rotate handle */}
                <circle cx={bx + bw + 14} cy={by - 14} r={14} fill="#0f111a" stroke={accent} strokeWidth={2}
                  style={{ cursor: "grab" }}
                  onPointerDown={(e) => onHandleDown(e, selStem, "rotate")} />
                <circle cx={bx + bw + 14} cy={by - 14} r={5} fill={accent} pointerEvents="none" />
              </>
            )}
          </g>
        );
      })()}

      {/* Lock indicators on non-selected locked stems */}
      {interactive && stems.filter(s => s.locked && s.id !== selectedId).map((st) => {
        const cx = st.x * width;
        const cy = st.y * height;
        return (
          <g key={`lock-${st.id}`}>
            <rect x={cx - 11} y={cy - IMG_H * st.scale - 16} width={22} height={16} rx={4} fill="rgba(0,0,0,0.6)" stroke="rgba(245,158,11,0.3)" strokeWidth={1} />
            <text x={cx} y={cy - IMG_H * st.scale - 5} textAnchor="middle" fontSize="9" fill="#f59e0b">🔒</text>
          </g>
        );
      })}
    </svg>
  );
}
