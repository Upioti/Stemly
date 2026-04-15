"use client";
import { create } from "zustand";
import { nanoid } from "nanoid";
import { Bouquet, Stem, emptyBouquet, defaultAdjustments } from "./bouquet";
import { varietyById } from "./presets/flowers";

type State = {
  bouquet: Bouquet;
  selectedId: string | null;
  past: Bouquet[];
  future: Bouquet[];
  clipboard: Stem | null;
};

type Actions = {
  load: (b: Bouquet) => void;
  select: (id: string | null) => void;
  addStem: (varietyId: string, variant?: number) => void;
  updateStem: (id: string, patch: Partial<Stem>, commit?: boolean) => void;
  removeStem: (id: string) => void;
  duplicateStem: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  reorderStem: (id: string, newIndex: number) => void;
  toggleLock: (id: string) => void;
  setVariant: (id: string, variant: number) => void;
  setVaseColor: (color: string) => void;
  setVasePreset: (preset: string) => void;
  setVaseScale: (scale: number) => void;
  setBackground: (bg: string) => void;
  setMessage: (m: Bouquet["message"]) => void;
  togglePerspective: () => void;
  copySelected: () => void;
  paste: () => void;
  undo: () => void;
  redo: () => void;
  commit: () => void;
};

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

// Generate subtle random perspective values
function randomPerspective() {
  return {
    perspectiveSkewX: (Math.random() - 0.5) * 10,
    perspectiveSkewY: (Math.random() - 0.5) * 4,
    perspectiveScaleY: 0.92 + Math.random() * 0.16,
    flipX: Math.random() > 0.5,
  };
}

// Generate subtle random color adjustments so each stem looks unique
function randomAdjustments(): ReturnType<typeof defaultAdjustments> {
  return {
    saturate: 0.85 + Math.random() * 0.3,
    brightness: 0.9 + Math.random() * 0.2,
    hueRotate: (Math.random() - 0.5) * 20,
  };
}

export const useBouquet = create<State & Actions>((set, get) => ({
  bouquet: emptyBouquet(),
  selectedId: null,
  past: [],
  future: [],
  clipboard: null,

  load: (b) => set({ bouquet: b, past: [], future: [], selectedId: null }),
  select: (id) => set({ selectedId: id }),

  commit: () => set((s) => ({ past: [...s.past.slice(-30), clone(s.bouquet)], future: [] })),

  addStem: (varietyId, variant) => {
    get().commit();
    const v = varietyById(varietyId);
    const chosenVariant = variant ?? (Math.floor(Math.random() * 3) + 1);
    const stem: Stem = {
      id: nanoid(6),
      varietyId: v.id,
      variant: chosenVariant,
      x: 0.45 + Math.random() * 0.1,
      y: 0.45 + Math.random() * 0.1,
      scale: 1,
      rotation: (Math.random() - 0.5) * 14,
      z: get().bouquet.stems.length,
      locked: false,
      adjustments: randomAdjustments(),
      ...randomPerspective(),
    };
    set((s) => ({ bouquet: { ...s.bouquet, stems: [...s.bouquet.stems, stem] }, selectedId: stem.id }));
  },

  updateStem: (id, patch, commit = true) => {
    const st = get().bouquet.stems.find((s) => s.id === id);
    if (st?.locked) return;
    if (commit) get().commit();
    set((s) => ({
      bouquet: {
        ...s.bouquet,
        stems: s.bouquet.stems.map((st) =>
          st.id === id
            ? { ...st, ...patch, adjustments: { ...st.adjustments, ...(patch.adjustments ?? {}) } }
            : st
        ),
      },
    }));
  },

  removeStem: (id) => {
    get().commit();
    set((s) => ({
      bouquet: { ...s.bouquet, stems: s.bouquet.stems.filter((st) => st.id !== id) },
      selectedId: null,
    }));
  },

  duplicateStem: (id) => {
    get().commit();
    set((s) => {
      const src = s.bouquet.stems.find((st) => st.id === id);
      if (!src) return s;
      const copy: Stem = {
        ...src,
        id: nanoid(6),
        x: Math.min(0.95, src.x + 0.05),
        z: s.bouquet.stems.length,
        locked: false,
        adjustments: randomAdjustments(),
        ...randomPerspective(),
      };
      return { bouquet: { ...s.bouquet, stems: [...s.bouquet.stems, copy] }, selectedId: copy.id };
    });
  },

  bringForward: (id) => {
    get().commit();
    set((s) => {
      const stems = [...s.bouquet.stems].sort((a, b) => a.z - b.z);
      const i = stems.findIndex((st) => st.id === id);
      if (i < 0 || i === stems.length - 1) return s;
      [stems[i].z, stems[i + 1].z] = [stems[i + 1].z, stems[i].z];
      return { bouquet: { ...s.bouquet, stems } };
    });
  },

  sendBackward: (id) => {
    get().commit();
    set((s) => {
      const stems = [...s.bouquet.stems].sort((a, b) => a.z - b.z);
      const i = stems.findIndex((st) => st.id === id);
      if (i <= 0) return s;
      [stems[i].z, stems[i - 1].z] = [stems[i - 1].z, stems[i].z];
      return { bouquet: { ...s.bouquet, stems } };
    });
  },

  reorderStem: (id, newIndex) => {
    get().commit();
    set((s) => {
      const sorted = [...s.bouquet.stems].sort((a, b) => b.z - a.z);
      const oldIndex = sorted.findIndex(st => st.id === id);
      if (oldIndex < 0 || oldIndex === newIndex) return s;
      const [moved] = sorted.splice(oldIndex, 1);
      sorted.splice(newIndex, 0, moved);
      const maxZ = sorted.length - 1;
      sorted.forEach((st, i) => { st.z = maxZ - i; });
      return { bouquet: { ...s.bouquet, stems: sorted } };
    });
  },

  toggleLock: (id) => {
    get().commit();
    set((s) => ({
      bouquet: {
        ...s.bouquet,
        stems: s.bouquet.stems.map((st) => st.id === id ? { ...st, locked: !st.locked } : st),
      },
    }));
  },

  setVariant: (id, variant) => {
    const st = get().bouquet.stems.find((s) => s.id === id);
    if (st?.locked) return;
    get().commit();
    set((s) => ({
      bouquet: {
        ...s.bouquet,
        stems: s.bouquet.stems.map((st) => st.id === id ? { ...st, variant } : st),
      },
    }));
  },

  setVaseColor: (color) => { get().commit(); set((s) => ({ bouquet: { ...s.bouquet, vase: { ...s.bouquet.vase, color } } })); },
  setVasePreset: (preset) => { get().commit(); set((s) => ({ bouquet: { ...s.bouquet, vase: { ...s.bouquet.vase, preset } } })); },
  setVaseScale: (scale) => { get().commit(); set((s) => ({ bouquet: { ...s.bouquet, vase: { ...s.bouquet.vase, scale } } })); },
  setBackground: (bg) => { get().commit(); set((s) => ({ bouquet: { ...s.bouquet, background: bg } })); },
  togglePerspective: () => { get().commit(); set((s) => ({ bouquet: { ...s.bouquet, perspectiveEnabled: !s.bouquet.perspectiveEnabled } })); },
  setMessage: (m) => set((s) => ({ bouquet: { ...s.bouquet, message: m } })),

  copySelected: () => {
    const { selectedId, bouquet } = get();
    const stem = bouquet.stems.find((s) => s.id === selectedId);
    if (stem) set({ clipboard: clone(stem) });
  },

  paste: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    get().commit();
    const copy: Stem = {
      ...clone(clipboard),
      id: nanoid(6),
      x: Math.min(0.95, clipboard.x + 0.03),
      y: Math.min(0.85, clipboard.y + 0.03),
      z: get().bouquet.stems.length,
      locked: false,
    };
    set((s) => ({ bouquet: { ...s.bouquet, stems: [...s.bouquet.stems, copy] }, selectedId: copy.id }));
  },

  undo: () => set((s) => {
    if (!s.past.length) return s;
    const prev = s.past[s.past.length - 1];
    return { bouquet: prev, past: s.past.slice(0, -1), future: [clone(s.bouquet), ...s.future] };
  }),
  redo: () => set((s) => {
    if (!s.future.length) return s;
    const next = s.future[0];
    return { bouquet: next, past: [...s.past, clone(s.bouquet)], future: s.future.slice(1) };
  }),
}));
