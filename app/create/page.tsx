"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useBouquet } from "@/lib/store";
import { BouquetStage } from "@/components/BouquetStage";
import { FlowerLibrary } from "@/components/FlowerLibrary";
import { Inspector } from "@/components/Inspector";
import { LayerPanel } from "@/components/LayerPanel";
import { DovelyLink } from "@/components/DovelyLink";
import { dovelyReturnWithBouquet, readDovelyReturn } from "@/lib/dovely";

export default function CreatePage() {
  const {
    bouquet, selectedId, select, updateStem, undo, redo, setMessage,
    removeStem, copySelected, paste, duplicateStem, bringForward, sendBackward, toggleLock,
  } = useBouquet();
  const [sending, setSending] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  // dovely integration: /create?return=https://dovely.mat.pics/... sends the bouquet back to a letter.
  const [returnTo, setReturnTo] = useState<string | null>(null);
  useEffect(() => setReturnTo(readDovelyReturn()), []);
  const [copied, setCopied] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"none" | "flowers" | "inspector">("none");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.key === "Backspace" || e.key === "Delete") {
      if (selectedId) { removeStem(selectedId); e.preventDefault(); }
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "c") { copySelected(); e.preventDefault(); return; }
      else if (e.key === "v") { paste(); e.preventDefault(); return; }
      else if (e.key === "d") { if (selectedId) { duplicateStem(selectedId); } e.preventDefault(); return; }
      else if (e.key === "z") { if (e.shiftKey) { redo(); } else { undo(); } e.preventDefault(); return; }
      else if (e.key === "y") { redo(); e.preventDefault(); return; }
    }
    if (e.key === "Escape") { select(null); }
  }, [selectedId, removeStem, copySelected, paste, duplicateStem, undo, redo, select]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderPng = async (): Promise<Blob> => {
    const { renderBouquetToPng } = await import("@/lib/render");
    return renderBouquetToPng(bouquet);
  };

  const send = async () => {
    setSending(true);
    try {
      const blob = await renderPng();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(blob);
      });
      const res = await fetch("/api/bouquet", {
        method: "POST",
        body: JSON.stringify({ ...bouquet, image: base64 }),
      });
      const { id } = await res.json();
      if (returnTo && res.ok && typeof id === "string") {
        window.location.assign(dovelyReturnWithBouquet(returnTo, id));
        return;
      }
      setSharedId(typeof id === "string" ? id : null);
      setShareUrl(`https://stemly.mat.pics/b/${id}`);
    } finally { setSending(false); }
  };

  const savePng = async () => {
    const { renderBouquetToPng } = await import("@/lib/render");
    const blob = await renderBouquetToPng(bouquet, 1200, { includeRecipient: true });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bouquet.png";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const shareWhatsApp = () => {
    if (!shareUrl) return;
    const text = encodeURIComponent(`I made you a bouquet! 💐\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[var(--bg)]" style={{ touchAction: "none", overscrollBehavior: "none" }}>
      {/* Fullscreen canvas — constrained to square aspect */}
      <div className="absolute inset-0 flex items-center justify-center" onClick={() => { if (mobilePanel !== "none") setMobilePanel("none"); }}>
        <div className="w-full h-full max-w-[100vh] max-h-[100vw] md:max-w-none md:max-h-none aspect-square md:aspect-auto md:w-full md:h-full">
          <BouquetStage
            bouquet={bouquet}
            selectedId={selectedId}
            onSelect={select}
            onChange={(id, patch, c) => updateStem(id, patch, c !== false)}
            onLayerUp={bringForward}
            onLayerDown={sendBackward}
            onRemove={removeStem}
            onToggleLock={toggleLock}
            width={1200}
            height={1200}
          />
        </div>
      </div>

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />

      {/* Top — logo only */}
      <header className="absolute top-3 left-3 pointer-events-none z-20">
        <a href="/" className="glass px-4 py-2 flex items-center gap-2 text-[13px] font-semibold pointer-events-auto hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <span className="text-base">✿</span><span>stemly</span>
        </a>
      </header>

      {/* Left panel — flower library (desktop) */}
      <aside className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 w-[220px] max-h-[80vh] glass p-4 overflow-auto pointer-events-auto z-10">
        <div className="label mb-3">Flowers</div>
        <FlowerLibrary />
      </aside>

      {/* Right side — inspector + layers (desktop) */}
      <div className="hidden md:flex absolute right-3 top-14 bottom-3 w-[270px] flex-col gap-2 pointer-events-none z-10">
        <aside className="glass p-5 overflow-auto pointer-events-auto flex-shrink-0" style={{ maxHeight: bouquet.stems.length > 0 ? "55vh" : "80vh" }}>
          <Inspector />
        </aside>
        {bouquet.stems.length > 0 && (
          <aside className="glass p-3 overflow-auto pointer-events-auto flex-1 min-h-0">
            <div className="flex items-center justify-between mb-2">
              <div className="label">Layers · {bouquet.stems.length}</div>
            </div>
            <LayerPanel />
          </aside>
        )}
      </div>

      {/* Mobile toggle buttons */}
      <div className="md:hidden absolute top-3 right-3 flex gap-1.5 z-20 pointer-events-auto">
        <button onClick={() => setMobilePanel(mobilePanel === "flowers" ? "none" : "flowers")}
          className="glass px-3 py-2 text-[12px] font-medium flex items-center gap-1.5"
          style={mobilePanel === "flowers" ? { background: "var(--accent)", color: "#09090b" } : undefined}>
          🌸 <span>Add</span>
        </button>
        <button onClick={() => setMobilePanel(mobilePanel === "inspector" ? "none" : "inspector")}
          className="glass px-3 py-2 text-[12px] font-medium flex items-center gap-1.5"
          style={mobilePanel === "inspector" ? { background: "var(--accent)", color: "#09090b" } : undefined}>
          ⚙ <span>Edit</span>
        </button>
      </div>

      {/* Mobile slide-up panel */}
      {mobilePanel !== "none" && (
        <div className="md:hidden absolute inset-x-0 bottom-0 z-30 pointer-events-auto" style={{ touchAction: "pan-y" }}>
          <div className="glass rounded-b-none max-h-[65vh] overflow-auto p-4 pb-6" style={{ touchAction: "pan-y" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="label">{mobilePanel === "flowers" ? "Flowers" : "Inspector"}</div>
              <button onClick={() => setMobilePanel("none")} className="text-[var(--text-3)] hover:text-[var(--text)] text-sm">✕</button>
            </div>
            {mobilePanel === "flowers" && <FlowerLibrary />}
            {mobilePanel === "inspector" && (
              <div className="space-y-4">
                <Inspector />
                {bouquet.stems.length > 0 && (
                  <div>
                    <div className="label mb-2">Layers · {bouquet.stems.length}</div>
                    <LayerPanel />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-20 w-full px-3 max-w-md pb-[max(0.75rem,env(safe-area-inset-bottom))]" style={{ touchAction: "manipulation" }}>
        {/* Card editor — expands above the toolbar */}
        {showMsg && (
          <div className="glass p-4 w-full space-y-2.5 pointer-events-auto" style={{ touchAction: "manipulation" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold">Card message</div>
              <button onClick={() => setShowMsg(false)} className="text-[10px] text-[var(--text-3)] hover:text-[var(--text)]">✕</button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="label mb-1" style={{ fontSize: 9 }}>From</div>
                <input className="input !py-1.5 !text-[11px]" placeholder="Your name"
                  value={bouquet.message?.from ?? ""}
                  onChange={(e) => setMessage({ ...bouquet.message, from: e.target.value })} />
              </div>
              <div className="flex-1">
                <div className="label mb-1" style={{ fontSize: 9 }}>To</div>
                <input className="input !py-1.5 !text-[11px]" placeholder="Their name"
                  value={bouquet.message?.to ?? ""}
                  onChange={(e) => setMessage({ ...bouquet.message, to: e.target.value })} />
              </div>
            </div>
            <div>
              <div className="label mb-1" style={{ fontSize: 9 }}>Message</div>
              <textarea className="input resize-none !py-1.5 !text-[11px]" rows={2} placeholder="A few words…"
                value={bouquet.message?.text ?? ""}
                onChange={(e) => setMessage({ ...bouquet.message, text: e.target.value })} />
            </div>
          </div>
        )}
        <div className="glass px-1.5 py-1.5 flex items-center gap-0.5 sm:gap-1 pointer-events-auto justify-center">
          <button onClick={undo} className="btn btn-ghost !px-2 !py-1.5 text-sm" title="Undo (⌘Z)">↶</button>
          <button onClick={redo} className="btn btn-ghost !px-2 !py-1.5 text-sm" title="Redo (⌘⇧Z)">↷</button>
          <div className="w-px h-5 bg-[var(--line)] mx-0.5 hidden sm:block" />
          <button onClick={() => setShowMsg(!showMsg)} className="btn btn-ghost text-[11px] sm:text-[12px] !px-2 sm:!px-3"
            style={showMsg ? { background: "var(--surface-hover)" } : undefined}>
            {bouquet.message?.text ? "✓ Card" : "Card"}
          </button>
          <button onClick={send} disabled={sending || bouquet.stems.length === 0} className="btn btn-primary text-[11px] sm:text-[12px] !px-3 sm:!px-4">
            {sending ? "…" : returnTo ? "Add to letter ✉" : "Send →"}
          </button>
        </div>
      </div>

      {/* Share modal */}
      {shareUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-[60] overflow-auto" style={{ touchAction: "pan-y" }} onClick={() => setShareUrl(null)}>
          <div className="glass p-6 sm:p-8 max-w-md w-full space-y-4 sm:space-y-5 my-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="text-2xl font-semibold tracking-tight">Your bouquet is ready ✿</div>
              <p className="text-[13px] text-[var(--text-2)] mt-1">Share this link with whoever it&apos;s for.</p>
            </div>
            <input readOnly value={shareUrl} className="input font-mono text-[12px]" onFocus={(e) => e.currentTarget.select()} />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="btn btn-primary flex-1">
                  {copied ? "✓ Copied" : "Copy link"}
                </button>
                <a href={shareUrl} target="_blank" rel="noreferrer" className="btn flex-1">Open</a>
              </div>
              <div className="flex gap-2">
                <button onClick={savePng} className="btn flex-1">
                  📷 Save as PNG
                </button>
                <button onClick={shareWhatsApp} className="btn flex-1" style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}>
                  💬 WhatsApp
                </button>
              </div>
              {sharedId && <DovelyLink bouquetId={sharedId} />}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
