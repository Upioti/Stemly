"use client";
import React from "react";
import { useBouquet } from "@/lib/store";
import { varietyById, BACKGROUNDS, VASES } from "@/lib/presets/flowers";

const VASE_SWATCHES = ["#3a3a3c", "#8b7355", "#c9a87a", "#3a4a5c", "#1f2330", "#6b4423", "#9ca3af", "#2d1b3d", "#ddd2bf", "#5c3d2e"];

export function Inspector() {
  const {
    bouquet, selectedId, updateStem, removeStem, duplicateStem,
    bringForward, sendBackward, setVaseColor, setVasePreset, setVaseScale,
    setBackground, setVariant, toggleLock, togglePerspective,
  } = useBouquet();
  const stem = bouquet.stems.find((s) => s.id === selectedId);

  if (!stem) {
    return (
      <div className="space-y-6">
        {/* Holder */}
        <div>
          <div className="label mb-2">Holder</div>
          <div className="flex flex-wrap gap-1.5">
            {VASES.map((v) => (
              <button key={v.id} onClick={() => setVasePreset(v.id)}
                className="btn flex-1 text-[11px] !px-2 !py-1.5"
                style={bouquet.vase.preset === v.id ? { background: "var(--accent)", color: "#09090b", fontWeight: 600 } : undefined}>
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vase color */}
        <div>
          <div className="label mb-2">Holder color</div>
          <div className="flex flex-wrap gap-1.5">
            {VASE_SWATCHES.map((c) => (
              <button key={c} onClick={() => setVaseColor(c)}
                className={`swatch ${bouquet.vase.color.toLowerCase() === c.toLowerCase() ? "selected" : ""}`}
                style={{ background: c }} />
            ))}
            <label className="swatch flex items-center justify-center cursor-pointer overflow-hidden relative"
              style={{ background: "conic-gradient(from 0deg, #8b7355, #3a4a5c, #6b4423, #ddd2bf, #8b7355)" }}>
              <input type="color" value={bouquet.vase.color} onChange={(e) => setVaseColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Holder size */}
        <div>
          <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
            <span className="label">Holder size</span><span>{((bouquet.vase.scale ?? 1) * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.5} max={1.8} step={0.05} value={bouquet.vase.scale ?? 1}
            onChange={(e) => setVaseScale(parseFloat(e.target.value))} />
        </div>

        {/* Background */}
        <div>
          <div className="label mb-2">Background</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BACKGROUNDS).map(([id, c]) => (
              <button key={id} onClick={() => setBackground(id)}
                className="w-9 h-9 rounded-lg"
                style={{ background: c, boxShadow: bouquet.background === id ? "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)" : "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                title={id} />
            ))}
          </div>
        </div>

        {/* Perspective toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="label">Perspective shift</div>
            <div className="text-[10px] text-[var(--text-3)] mt-0.5">Adds subtle distortion per flower</div>
          </div>
          <button
            onClick={togglePerspective}
            className={`w-10 h-5 rounded-full transition-colors relative ${bouquet.perspectiveEnabled ? "bg-[var(--accent)]" : "bg-[var(--surface-hover)]"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${bouquet.perspectiveEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* Hint */}
        <div className="surface-hi p-3">
          <div className="text-[11px] text-[var(--text-2)] leading-relaxed">
            Click a flower on the canvas to edit it.<br/>
            Drag <span className="text-[var(--accent)]">●</span> to rotate, <span className="text-[var(--accent-2)]">■</span> to scale.
          </div>
        </div>
      </div>
    );
  }

  const v = varietyById(stem.varietyId);
  const upd = (patch: any) => updateStem(stem.id, patch);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{v.name}</div>
          <div className="text-[10px] text-[var(--text-3)] capitalize">{v.category}</div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => toggleLock(stem.id)}
            className="btn !px-2 !py-1 text-xs"
            style={stem.locked ? { background: "var(--accent)", color: "#09090b" } : undefined}>
            {stem.locked ? "🔒" : "🔓"}
          </button>
          <button onClick={() => duplicateStem(stem.id)} className="btn !px-2 !py-1 text-xs">Dup</button>
          <button onClick={() => removeStem(stem.id)} className="btn !px-2 !py-1 text-xs" style={{ color: "#fb7185" }}>Del</button>
        </div>
      </div>

      {stem.locked && (
        <div className="surface-hi p-2 text-[10px] text-[var(--text-3)] text-center">
          🔒 Locked — unlock to edit
        </div>
      )}

      {!stem.locked && (
        <>
          {/* Variant */}
          <div>
            <div className="label mb-2">Variant</div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((vn) => (
                <button
                  key={vn}
                  onClick={() => setVariant(stem.id, vn)}
                  className="btn flex-1 text-xs font-mono !p-1"
                  style={stem.variant === vn ? { background: "var(--accent)", color: "#09090b", fontWeight: 600 } : undefined}
                >
                  <img src={v.thumbPath(vn)} alt={`v${vn}`} className="w-full h-10 object-contain" draggable={false} />
                </button>
              ))}
            </div>
          </div>

          {/* Adjustments */}
          <div>
            <div className="label mb-2">Adjustments</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
                  <span>Saturation</span><span>{Math.round(stem.adjustments.saturate * 100)}%</span>
                </div>
                <input type="range" min={50} max={150} step={5} value={Math.round(stem.adjustments.saturate * 100)}
                  onChange={(e) => upd({ adjustments: { saturate: parseInt(e.target.value) / 100 } })} />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
                  <span>Brightness</span><span>{Math.round(stem.adjustments.brightness * 100)}%</span>
                </div>
                <input type="range" min={70} max={130} step={5} value={Math.round(stem.adjustments.brightness * 100)}
                  onChange={(e) => upd({ adjustments: { brightness: parseInt(e.target.value) / 100 } })} />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
                  <span>Hue shift</span><span>{Math.round(stem.adjustments.hueRotate)}°</span>
                </div>
                <input type="range" min={-30} max={30} step={2} value={stem.adjustments.hueRotate}
                  onChange={(e) => upd({ adjustments: { hueRotate: parseInt(e.target.value) } })} />
              </div>
            </div>
          </div>

          {/* Size & Rotation */}
          <div>
            <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
              <span>Size</span><span>{stem.scale.toFixed(2)}×</span>
            </div>
            <input type="range" min={0.3} max={2.5} step={0.05} value={stem.scale}
              onChange={(e) => upd({ scale: parseFloat(e.target.value) })} />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
              <span>Rotation</span><span>{Math.round(stem.rotation)}°</span>
            </div>
            <input type="range" min={-60} max={60} step={1} value={stem.rotation}
              onChange={(e) => upd({ rotation: parseFloat(e.target.value) })} />
          </div>

          {/* Perspective (per-flower) */}
          <div>
            <div className="label mb-2">Perspective</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
                  <span>Skew X</span><span>{stem.perspectiveSkewX.toFixed(1)}°</span>
                </div>
                <input type="range" min={-15} max={15} step={0.5} value={stem.perspectiveSkewX}
                  onChange={(e) => upd({ perspectiveSkewX: parseFloat(e.target.value) })} />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
                  <span>Skew Y</span><span>{stem.perspectiveSkewY.toFixed(1)}°</span>
                </div>
                <input type="range" min={-8} max={8} step={0.5} value={stem.perspectiveSkewY}
                  onChange={(e) => upd({ perspectiveSkewY: parseFloat(e.target.value) })} />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mb-1">
                  <span>Depth scale</span><span>{(stem.perspectiveScaleY ?? 1).toFixed(2)}×</span>
                </div>
                <input type="range" min={0.7} max={1.3} step={0.02} value={stem.perspectiveScaleY ?? 1}
                  onChange={(e) => upd({ perspectiveScaleY: parseFloat(e.target.value) })} />
              </div>
            </div>
          </div>

          {/* Flip */}
          <button onClick={() => upd({ flipX: !stem.flipX })}
            className="btn w-full text-xs"
            style={stem.flipX ? { background: "var(--surface-hover)" } : undefined}>
            ↔ Flip horizontal {stem.flipX ? "(on)" : ""}
          </button>

          {/* Layer */}
          <div className="flex gap-1.5">
            <button onClick={() => sendBackward(stem.id)} className="btn flex-1 text-xs">↓ Back</button>
            <button onClick={() => bringForward(stem.id)} className="btn flex-1 text-xs">↑ Front</button>
          </div>
        </>
      )}
    </div>
  );
}
