export type StemAdjustments = {
  saturate: number;    // 0.5 to 1.5, default 1
  brightness: number;  // 0.7 to 1.3, default 1
  hueRotate: number;   // -30 to 30 degrees, default 0
};

export type Stem = {
  id: string;
  varietyId: string;   // references FlowerVariety.id
  variant: number;     // 1, 2, or 3
  x: number;           // 0..1 normalized
  y: number;           // 0..1 normalized
  scale: number;
  rotation: number;
  z: number;
  locked: boolean;
  adjustments: StemAdjustments;
  perspectiveSkewX: number;  // -15 to 15 degrees
  perspectiveSkewY: number;  // -8 to 8 degrees
  perspectiveScaleY: number; // 0.8 to 1.2 — vertical squash/stretch for depth
  flipX: boolean;
};

export type Bouquet = {
  id?: string;
  vase: { preset: string; color: string; scale: number };
  background: string;
  stems: Stem[];
  message?: { from?: string; to?: string; text?: string };
  createdAt?: number;
  perspectiveEnabled?: boolean;  // global toggle for perspective distortion
};

export const defaultAdjustments = (): StemAdjustments => ({
  saturate: 1,
  brightness: 1,
  hueRotate: 0,
});

export const emptyBouquet = (): Bouquet => ({
  vase: { preset: "round", color: "#3a3a3c", scale: 1 },
  background: "midnight",
  stems: [],
  message: {},
  perspectiveEnabled: false,
});
