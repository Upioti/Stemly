import React from "react";

type Props = { preset: string; color: string; x: number; y: number; w?: number };

const lighten = (hex: string, t = 0.2) => mix(hex, "#ffffff", t);
const darken = (hex: string, t = 0.2) => mix(hex, "#000000", t);
function mix(a: string, b: string, t: number) {
  const pa = parse(a), pb = parse(b);
  const r = Math.round(pa[0] * (1 - t) + pb[0] * t);
  const g = Math.round(pa[1] * (1 - t) + pb[1] * t);
  const bl = Math.round(pa[2] * (1 - t) + pb[2] * t);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function bodyPath(preset: string, x: number, y: number, w: number, h: number) {
  if (preset === "tall") {
    const neckW = w * 0.7;
    return `M ${x - neckW / 2} ${y} Q ${x - w / 2 - 10} ${y + h * 0.4} ${x - w / 2 + 8} ${y + h}
            Q ${x} ${y + h + 8} ${x + w / 2 - 8} ${y + h}
            Q ${x + w / 2 + 10} ${y + h * 0.4} ${x + neckW / 2} ${y} Z`;
  }
  if (preset === "jar") {
    return `M ${x - w / 2} ${y}
            L ${x - w / 2} ${y + h * 0.85}
            Q ${x - w / 2} ${y + h + 6} ${x - w / 2 + 16} ${y + h + 6}
            L ${x + w / 2 - 16} ${y + h + 6}
            Q ${x + w / 2} ${y + h + 6} ${x + w / 2} ${y + h * 0.85}
            L ${x + w / 2} ${y} Z`;
  }
  if (preset === "paper" || preset === "paper-tall") {
    const flare = preset === "paper-tall" ? 0.55 : 0.4;
    return `M ${x - w / 2} ${y} L ${x - w * flare} ${y + h} L ${x + w * flare} ${y + h} L ${x + w / 2} ${y} Z`;
  }
  // round — smoother belly curve
  return `M ${x - w / 2} ${y}
          Q ${x - w * 0.65} ${y + h * 0.3} ${x - w * 0.55} ${y + h * 0.6}
          Q ${x - w * 0.4} ${y + h + 4} ${x} ${y + h + 4}
          Q ${x + w * 0.4} ${y + h + 4} ${x + w * 0.55} ${y + h * 0.6}
          Q ${x + w * 0.65} ${y + h * 0.3} ${x + w / 2} ${y} Z`;
}

// ----- TOP VIEW ---------------------------------------------------------------
function TopViewFront({ color, x, y, w = 220 }: Props) {
  // Top view front is empty — paper stays in background so flowers are never hidden
  return null;
}

// Separate: full top view drawn only in Back (behind flowers)
function TopViewBack({ color, x, y, w = 220 }: Props) {
  const id = `tv-${color.replace("#", "")}`;
  const r = w * 0.52;
  const creaseCount = 14;
  const innerR = r * 0.18;
  const ruffleCount = 36;
  const ruffleDepth = r * 0.08;

  // Build ruffle path (wavy circle border)
  const rufflePoints: string[] = [];
  for (let i = 0; i <= ruffleCount; i++) {
    const a = (i * 360) / ruffleCount;
    const rad = (a * Math.PI) / 180;
    const midA = ((i + 0.5) * 360) / ruffleCount;
    const midRad = (midA * Math.PI) / 180;
    const outerR = r + ruffleDepth;
    const px = x + Math.cos(rad) * outerR;
    const py = y + Math.sin(rad) * outerR;
    const mx = x + Math.cos(midRad) * (r - ruffleDepth * 0.4);
    const my = y + Math.sin(midRad) * (r - ruffleDepth * 0.4);
    if (i === 0) {
      rufflePoints.push(`M ${px} ${py}`);
    } else {
      rufflePoints.push(`Q ${mx} ${my} ${px} ${py}`);
    }
  }
  const rufflePath = rufflePoints.join(" ") + " Z";

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.48" cy="0.45">
          <stop offset="0" stopColor={lighten(color, 0.18)} />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={darken(color, 0.25)} />
        </radialGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.4" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx={x} cy={y} rx={r + 14} ry={r + 14} fill={`url(#${id}-shadow)`} />

      {/* Ruffle border */}
      <path d={rufflePath} fill={darken(color, 0.15)} />
      <path d={rufflePath} fill="none" stroke={darken(color, 0.35)} strokeOpacity={0.25} strokeWidth={0.8} />

      {/* Inner paper circle */}
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-bg)`} />

      {/* Paper creases radiating from center */}
      {Array.from({ length: creaseCount }).map((_, i) => {
        const a = (i * 360) / creaseCount;
        const rad = (a * Math.PI) / 180;
        const x1 = x + Math.cos(rad) * innerR;
        const y1 = y + Math.sin(rad) * innerR;
        const x2 = x + Math.cos(rad) * (r - 3);
        const y2 = y + Math.sin(rad) * (r - 3);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={darken(color, 0.4)} strokeOpacity={0.25} strokeWidth={0.7} />
            <line x1={x1 + 0.8} y1={y1 + 0.8} x2={x2 + 0.8} y2={y2 + 0.8}
              stroke={lighten(color, 0.25)} strokeOpacity={0.08} strokeWidth={0.4} />
          </g>
        );
      })}

      {/* Inner fold circle */}
      <circle cx={x} cy={y} r={innerR} fill="none" stroke={darken(color, 0.3)} strokeOpacity={0.25} strokeWidth={0.8} />

      {/* Ruffle highlight accents on peaks */}
      {Array.from({ length: ruffleCount }).map((_, i) => {
        const a = (i * 360) / ruffleCount;
        const rad = (a * Math.PI) / 180;
        const px = x + Math.cos(rad) * (r + ruffleDepth * 0.6);
        const py = y + Math.sin(rad) * (r + ruffleDepth * 0.6);
        return (
          <circle key={i} cx={px} cy={py} r={ruffleDepth * 0.5}
            fill={lighten(color, 0.2)} opacity={0.1} />
        );
      })}

      {/* Center highlight */}
      <circle cx={x - r * 0.1} cy={y - r * 0.1} r={r * 0.12}
        fill={lighten(color, 0.35)} opacity={0.15} />
    </g>
  );
}

// ----- BACK: rim opening. Drawn BEFORE stems. --------------------------------
export function HolderBack({ preset, color, x, y, w = 220 }: Props) {
  if (preset === "top") return <TopViewBack preset={preset} color={color} x={x} y={y} w={w} />;

  const isPaper = preset === "paper" || preset === "paper-tall";
  const id = `hb-${preset}-${color.replace("#", "")}`;
  const ryRim = isPaper ? 6 : 12;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-rim`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.75" />
          <stop offset="1" stopColor={darken(color, 0.5)} stopOpacity="1" />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={w / 2 - 2} ry={ryRim} fill={`url(#${id}-rim)`} />
    </g>
  );
}

// ----- FRONT: body face. Drawn AFTER stems. ----------------------------------
export function HolderFront({ preset, color, x, y, w = 220 }: Props) {
  if (preset === "top") return <TopViewFront preset={preset} color={color} x={x} y={y} w={w} />;

  const isPaper = preset === "paper" || preset === "paper-tall";
  const h = isPaper ? w * 1.15 : w * 1.0;
  const id = `hf-${preset}-${color.replace("#", "")}`;
  const d = bodyPath(preset, x, y, w, h);
  const lp = lighten(color, 0.15);
  const dp = darken(color, 0.35);

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={dp} />
          <stop offset="0.15" stopColor={darken(color, 0.18)} />
          <stop offset="0.45" stopColor={lp} />
          <stop offset="0.55" stopColor={lp} />
          <stop offset="0.85" stopColor={darken(color, 0.15)} />
          <stop offset="1" stopColor={dp} />
        </linearGradient>
        <linearGradient id={`${id}-vfall`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.25" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.85" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contact shadow */}
      <ellipse cx={x} cy={y + h + (isPaper ? 6 : 12)} rx={w * 0.55} ry={isPaper ? 14 : 18} fill={`url(#${id}-shadow)`} />

      {/* Body */}
      <path d={d} fill={`url(#${id}-body)`} />
      <path d={d} fill={`url(#${id}-vfall)`} />

      {/* Specular highlights */}
      {!isPaper && (
        <>
          <ellipse cx={x - w * 0.17} cy={y + h * 0.32} rx={w * 0.035} ry={h * 0.25}
            fill={lighten(color, 0.45)} opacity="0.2" />
          <ellipse cx={x + w * 0.22} cy={y + h * 0.38} rx={w * 0.02} ry={h * 0.18}
            fill={lighten(color, 0.3)} opacity="0.1" />
        </>
      )}

      {/* Paper creases */}
      {isPaper && (
        <>
          <line x1={x} y1={y + 4} x2={x - (preset === "paper-tall" ? 12 : 6)} y2={y + h - 2}
            stroke="#000" strokeOpacity="0.3" strokeWidth="0.8" />
          <line x1={x} y1={y + 4} x2={x + (preset === "paper-tall" ? 12 : 6)} y2={y + h - 2}
            stroke="#fff" strokeOpacity="0.05" strokeWidth="0.8" />
          <line x1={x - w / 2 + 1} y1={y} x2={x - w * (preset === "paper-tall" ? 0.55 : 0.4) + 1} y2={y + h}
            stroke="#fff" strokeOpacity="0.07" strokeWidth="1" />
          <line x1={x + w / 2 - 1} y1={y} x2={x + w * (preset === "paper-tall" ? 0.55 : 0.4) - 1} y2={y + h}
            stroke="#000" strokeOpacity="0.15" strokeWidth="0.6" />
        </>
      )}

      {/* Rim lip */}
      {!isPaper && (
        <>
          <path d={`M ${x - w / 2 + 2} ${y} Q ${x} ${y + 7} ${x + w / 2 - 2} ${y}`}
            stroke={lighten(color, 0.35)} strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
          <path d={`M ${x - w / 2 + 3} ${y + 1} Q ${x} ${y + 3} ${x + w / 2 - 3} ${y + 1}`}
            stroke={darken(color, 0.2)} strokeOpacity="0.3" strokeWidth="0.6" fill="none" />
        </>
      )}
    </g>
  );
}

export function Vase(props: Props) {
  return (
    <>
      <HolderBack {...props} />
      <HolderFront {...props} />
    </>
  );
}
