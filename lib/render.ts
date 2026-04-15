import { Bouquet } from "./bouquet";
import { varietyById, BACKGROUNDS } from "./presets/flowers";

const IMG_W = 200;
const IMG_H = 300;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function mixColor(a: string, b: string, t: number): string {
  const pa = parseHex(a), pb = parseHex(b);
  const r = Math.round(pa[0] * (1 - t) + pb[0] * t);
  const g = Math.round(pa[1] * (1 - t) + pb[1] * t);
  const bl = Math.round(pa[2] * (1 - t) + pb[2] * t);
  return `rgb(${r},${g},${bl})`;
}

function lighten(hex: string, t = 0.2) { return mixColor(hex, "#ffffff", t); }
function darken(hex: string, t = 0.2) { return mixColor(hex, "#000000", t); }

function traceVasePath(
  ctx: CanvasRenderingContext2D,
  preset: string,
  x: number, y: number, w: number, h: number
) {
  ctx.beginPath();
  if (preset === "tall") {
    const neckW = w * 0.7;
    ctx.moveTo(x - neckW / 2, y);
    ctx.quadraticCurveTo(x - w / 2 - 10, y + h * 0.4, x - w / 2 + 8, y + h);
    ctx.quadraticCurveTo(x, y + h + 8, x + w / 2 - 8, y + h);
    ctx.quadraticCurveTo(x + w / 2 + 10, y + h * 0.4, x + neckW / 2, y);
  } else if (preset === "jar") {
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w / 2, y + h * 0.85);
    ctx.quadraticCurveTo(x - w / 2, y + h + 6, x - w / 2 + 16, y + h + 6);
    ctx.lineTo(x + w / 2 - 16, y + h + 6);
    ctx.quadraticCurveTo(x + w / 2, y + h + 6, x + w / 2, y + h * 0.85);
    ctx.lineTo(x + w / 2, y);
  } else if (preset === "paper" || preset === "paper-tall") {
    const flare = preset === "paper-tall" ? 0.55 : 0.4;
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w * flare, y + h);
    ctx.lineTo(x + w * flare, y + h);
    ctx.lineTo(x + w / 2, y);
  } else {
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x - w * 0.65, y + h * 0.3, x - w * 0.55, y + h * 0.6);
    ctx.quadraticCurveTo(x - w * 0.4, y + h + 4, x, y + h + 4);
    ctx.quadraticCurveTo(x + w * 0.4, y + h + 4, x + w * 0.55, y + h * 0.6);
    ctx.quadraticCurveTo(x + w * 0.65, y + h * 0.3, x + w / 2, y);
  }
  ctx.closePath();
}

function drawTopView(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number, y: number, w: number
) {
  const r = w * 0.52;
  const innerR = r * 0.18;
  const ruffleCount = 36;
  const ruffleDepth = r * 0.08;

  ctx.save();

  // Drop shadow
  const shadowGrad = ctx.createRadialGradient(x, y, 0, x, y, r + 14);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(x, y, r + 14, 0, Math.PI * 2);
  ctx.fill();

  // Ruffle border path
  ctx.beginPath();
  for (let i = 0; i <= ruffleCount; i++) {
    const a = (i * 2 * Math.PI) / ruffleCount;
    const midA = ((i + 0.5) * 2 * Math.PI) / ruffleCount;
    const outerR = r + ruffleDepth;
    const px = x + Math.cos(a) * outerR;
    const py = y + Math.sin(a) * outerR;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      const mx = x + Math.cos(midA) * (r - ruffleDepth * 0.4);
      const my = y + Math.sin(midA) * (r - ruffleDepth * 0.4);
      ctx.quadraticCurveTo(mx, my, px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = darken(color, 0.15);
  ctx.fill();
  ctx.strokeStyle = darken(color, 0.35);
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Inner paper circle with gradient
  const bgGrad = ctx.createRadialGradient(x - r * 0.04, y - r * 0.1, 0, x, y, r);
  bgGrad.addColorStop(0, lighten(color, 0.18));
  bgGrad.addColorStop(0.5, color);
  bgGrad.addColorStop(1, darken(color, 0.25));
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Paper creases
  const creaseCount = 14;
  for (let i = 0; i < creaseCount; i++) {
    const a = (i * 2 * Math.PI) / creaseCount;
    const x1 = x + Math.cos(a) * innerR;
    const y1 = y + Math.sin(a) * innerR;
    const x2 = x + Math.cos(a) * (r - 3);
    const y2 = y + Math.sin(a) * (r - 3);
    ctx.strokeStyle = darken(color, 0.4);
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Inner fold circle
  ctx.strokeStyle = darken(color, 0.3);
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Center highlight
  ctx.fillStyle = lighten(color, 0.35);
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(x - r * 0.1, y - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawVase(
  ctx: CanvasRenderingContext2D,
  preset: string,
  color: string,
  x: number, y: number, w: number
) {
  if (preset === "top") return;

  const isPaper = preset === "paper" || preset === "paper-tall";
  const h = isPaper ? w * 1.15 : w * 1.0;
  const dp = darken(color, 0.35);
  const lp = lighten(color, 0.15);

  ctx.save();

  // Contact shadow
  const shadowGrad = ctx.createRadialGradient(x, y + h + (isPaper ? 6 : 12), 0, x, y + h + (isPaper ? 6 : 12), w * 0.55);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.6)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + h + (isPaper ? 6 : 12), w * 0.55, isPaper ? 14 : 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body — horizontal gradient (left-dark, center-light, right-dark)
  traceVasePath(ctx, preset, x, y, w, h);
  const bodyGrad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  bodyGrad.addColorStop(0, dp);
  bodyGrad.addColorStop(0.15, darken(color, 0.18));
  bodyGrad.addColorStop(0.45, lp);
  bodyGrad.addColorStop(0.55, lp);
  bodyGrad.addColorStop(0.85, darken(color, 0.15));
  bodyGrad.addColorStop(1, dp);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Vertical depth overlay (dark top/bottom, transparent middle)
  traceVasePath(ctx, preset, x, y, w, h);
  const vGrad = ctx.createLinearGradient(0, y, 0, y + h);
  vGrad.addColorStop(0, "rgba(0,0,0,0.25)");
  vGrad.addColorStop(0.25, "rgba(0,0,0,0)");
  vGrad.addColorStop(0.85, "rgba(0,0,0,0.1)");
  vGrad.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vGrad;
  ctx.fill();

  // Specular highlights
  if (!isPaper) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = lighten(color, 0.45);
    ctx.beginPath();
    ctx.ellipse(x - w * 0.17, y + h * 0.32, w * 0.035, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.1;
    ctx.fillStyle = lighten(color, 0.3);
    ctx.beginPath();
    ctx.ellipse(x + w * 0.22, y + h * 0.38, w * 0.02, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Paper creases
  if (isPaper) {
    const flareX = preset === "paper-tall" ? 12 : 6;
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y + 4); ctx.lineTo(x - flareX, y + h - 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.moveTo(x, y + 4); ctx.lineTo(x + flareX, y + h - 2);
    ctx.stroke();
    const flare = preset === "paper-tall" ? 0.55 : 0.4;
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 1, y); ctx.lineTo(x - w * flare + 1, y + h);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 1, y); ctx.lineTo(x + w * flare - 1, y + h);
    ctx.stroke();
  }

  // Rim lip
  if (!isPaper) {
    ctx.strokeStyle = lighten(color, 0.35);
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 2, y);
    ctx.quadraticCurveTo(x, y + 7, x + w / 2 - 2, y);
    ctx.stroke();

    ctx.strokeStyle = darken(color, 0.2);
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 3, y + 1);
    ctx.quadraticCurveTo(x, y + 3, x + w / 2 - 3, y + 1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export async function renderBouquetToPng(bouquet: Bouquet, size = 1200, { includeRecipient = false }: { includeRecipient?: boolean } = {}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bg = BACKGROUNDS[bouquet.background] ?? BACKGROUNDS.midnight;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Vase coordinates
  const isTop = bouquet.vase.preset === "top";
  const vs = bouquet.vase.scale ?? 1;
  const hx = size / 2;
  const hy = isTop ? size * 0.5 : size * 0.72;
  const hw = (isTop ? size * 0.5 : size * 0.36) * vs;

  // Back rim / top view
  if (isTop) {
    drawTopView(ctx, bouquet.vase.color, hx, hy, hw);
  } else {
    const isPaper = bouquet.vase.preset === "paper" || bouquet.vase.preset === "paper-tall";
    const ryRim = isPaper ? 6 : 12;
    const rimGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hw / 2);
    rimGrad.addColorStop(0, "rgba(0,0,0,0.9)");
    rimGrad.addColorStop(0.6, "rgba(0,0,0,0.75)");
    rimGrad.addColorStop(1, darken(bouquet.vase.color, 0.5));
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(hx, hy, hw / 2 - 2, ryRim, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Preload all flower images
  const sorted = [...bouquet.stems].sort((a, b) => a.z - b.z);
  const images = await Promise.all(
    sorted.map((st) => {
      const v = varietyById(st.varietyId);
      return loadImage(v.imagePath(st.variant));
    })
  );

  // Draw flowers — positions and sizes match SVG viewBox (size x size) exactly
  for (let i = 0; i < sorted.length; i++) {
    const st = sorted[i];
    const img = images[i];
    const cx = st.x * size;
    const cy = st.y * size;
    const s = st.scale;
    const imgW = IMG_W * s;
    const imgH = IMG_H * s;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((st.rotation * Math.PI) / 180);
    if (st.flipX) ctx.scale(-1, 1);
    if (st.perspectiveSkewX) {
      ctx.transform(1, 0, Math.tan((st.perspectiveSkewX * Math.PI) / 180), 1, 0, 0);
    }
    if (st.perspectiveScaleY && st.perspectiveScaleY !== 1) {
      ctx.transform(1, 0, 0, st.perspectiveScaleY, 0, 0);
    }
    ctx.filter = `saturate(${st.adjustments.saturate}) brightness(${st.adjustments.brightness}) hue-rotate(${st.adjustments.hueRotate}deg)`;
    ctx.drawImage(img, -imgW / 2, -imgH, imgW, imgH);
    ctx.filter = "none";
    ctx.restore();
  }

  // Vase front
  if (!isTop) {
    drawVase(ctx, bouquet.vase.preset, bouquet.vase.color, hx, hy, hw);
  }

  // "For {recipient}" at top (only for downloads)
  const msg = bouquet.message;
  if (includeRecipient && msg?.to) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = `${Math.round(size / 70)}px sans-serif`;
    ctx.fillText(`For ${msg.to}`, size / 2, size * 0.05);
  }

  // Message text at bottom
  if (msg?.text) {
    const cy = size * 0.94;
    ctx.textAlign = "center";

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `italic ${Math.round(size / 60)}px 'Georgia', serif`;
    const txt = msg.text.length > 60 ? msg.text.slice(0, 60) + "\u2026" : msg.text;
    ctx.fillText(`\u201C${txt}\u201D`, size / 2, cy);

    if (msg.from) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = `${Math.round(size / 80)}px sans-serif`;
      ctx.fillText(`\u2014 ${msg.from}`, size / 2, cy + size * 0.02);
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}
