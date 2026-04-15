import Link from "next/link";
import { BouquetStage } from "@/components/BouquetStage";
import { VARIETIES } from "@/lib/presets/flowers";
import type { Bouquet, Stem } from "@/lib/bouquet";

function randomDemo(): Bouquet {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  // Pick 5-8 random varieties, avoid duplicates
  const count = 5 + Math.floor(Math.random() * 4);
  const pool = [...VARIETIES].sort(() => Math.random() - 0.5);
  const chosen = pool.slice(0, count);

  // Layout positions — spread across a nice arc above the vase
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = 0.22 + t * 0.56;
    const y = 0.81 + Math.sin(t * Math.PI) * -0.04 + rand(-0.02, 0.02);
    positions.push({ x, y });
  }
  // shuffle positions so layers look natural
  positions.sort(() => Math.random() - 0.5);

  const stems: Stem[] = chosen.map((v, i) => ({
    id: `r${i}`,
    varietyId: v.id,
    variant: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
    x: positions[i].x,
    y: positions[i].y,
    scale: rand(0.7, 1.15),
    rotation: rand(-20, 20),
    z: i,
    locked: false,
    adjustments: {
      saturate: rand(0.85, 1.15),
      brightness: rand(0.9, 1.1),
      hueRotate: rand(-10, 10),
    },
    perspectiveSkewX: rand(-4, 4),
    perspectiveSkewY: rand(-2, 2),
    perspectiveScaleY: rand(0.93, 1.07),
    flipX: Math.random() > 0.5,
  }));

  const vases = ["round", "tall", "jar", "paper"];
  const colors = ["#3a3a3c", "#8b7355", "#c9a87a", "#5c3d2e", "#3a4a5c", "#ddd2bf"];

  return {
    vase: { preset: pick(vases), color: pick(colors), scale: rand(2.2, 2.7) },
    background: pick(["midnight", "zinc", "slate", "neutral", "stone"]),
    perspectiveEnabled: true,
    stems,
  };
}

export const dynamic = "force-dynamic";

export default function Home() {
  const demoBouquet = randomDemo();

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[180px] opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(167,139,250,0.3), transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[400px] rounded-full blur-[140px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(244,114,182,0.25), transparent 70%)" }} />
      </div>

      <nav className="flex items-center justify-between px-6 lg:px-8 py-5 max-w-6xl mx-auto">
        <div className="font-semibold tracking-tight text-[15px] flex items-center gap-2">
          <span className="text-lg">✿</span><span>stemly</span>
        </div>
        <div className="flex items-center gap-1">
          <a href="#how" className="btn btn-ghost text-[13px]">How it works</a>
          <Link href="/create" className="btn btn-primary text-[13px]">Open Studio</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-10 sm:pt-16 pb-16 sm:pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-[11px] text-[var(--text-2)] mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            45+ flowers · 7 categories · artistic images
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[0.95]">
            Send someone<br/>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">a bouquet</span>
            <span className="text-[var(--text-3)]">.</span>
          </h1>
          <p className="text-[var(--text-2)] text-[15px] leading-relaxed mt-7 max-w-md">
            Design digital bouquets with artistic flower images. Roses, lilies, orchids, tulips, peonies — arrange them in a vase or paper wrap and send a link.
          </p>
          <div className="mt-9 flex items-center gap-3">
            <Link href="/create" className="btn btn-primary px-6 py-2.5 text-[14px]">Start designing →</Link>
            <a href="#how" className="btn px-5 py-2.5 text-[14px]">Learn more</a>
          </div>
          <div className="mt-16 flex items-center gap-10 text-[12px] text-[var(--text-3)]">
            <div><span className="text-[var(--text)] text-xl font-semibold block">130+</span>flowers</div>
            <div className="w-px h-8 bg-[var(--line)]" />
            <div><span className="text-[var(--text)] text-xl font-semibold block">7</span>categories</div>
            <div className="w-px h-8 bg-[var(--line)]" />
            <div><span className="text-[var(--text)] text-xl font-semibold block">0</span>accounts</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)" }} />
          <div className="relative aspect-square rounded-2xl overflow-hidden gradient-border">
            <BouquetStage bouquet={demoBouquet} interactive={false} />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass text-[11px] text-[var(--text-3)] whitespace-nowrap backdrop-blur-xl">
            ✿ randomized · refreshes each visit
          </div>
        </div>
      </section>

      <section id="how" className="max-w-5xl mx-auto px-6 lg:px-8 pb-32">
        <div className="text-center mb-12">
          <div className="label mb-3">How it works</div>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-[-0.03em]">From empty vase to inbox.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "01", t: "Pick flowers", d: "Browse roses, lilies, orchids, tulips, peonies, fillers, and greens. Each has 3 image variants." },
            { n: "02", t: "Make it yours", d: "Adjust color, brightness, and saturation. Flip, rotate, scale, and layer. Lock what you like." },
            { n: "03", t: "Share a link", d: "Add a card, hit send. They open the link and smile. No accounts needed." },
          ].map((s) => (
            <div key={s.n} className="surface p-7 hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <div className="text-[11px] font-mono text-[var(--accent)] mb-4">{s.n}</div>
              <div className="text-[17px] font-semibold mb-2">{s.t}</div>
              <div className="text-[13px] text-[var(--text-2)] leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 lg:px-8 pb-32 text-center">
        <h3 className="text-3xl lg:text-4xl font-semibold tracking-[-0.03em]">Ready when you are.</h3>
        <p className="text-[var(--text-2)] mt-4 mb-8 text-[15px]">Open the studio. Build a bouquet. Send it.</p>
        <Link href="/create" className="btn btn-primary px-7 py-3 text-[14px]">Open the studio →</Link>
      </section>

      <footer className="border-t border-[var(--line)] py-8 text-center text-[11px] text-[var(--text-3)] space-y-1.5">
        <div>✿ stemly · made for moments worth saving</div>
        <div className="flex items-center justify-center gap-3">
          <a href="https://mat.pics" target="_blank" rel="noreferrer" className="hover:text-[var(--text-2)] transition-colors">mat.pics</a>
          <span>·</span>
          <a href="https://instagram.com/woolrch" target="_blank" rel="noreferrer" className="hover:text-[var(--text-2)] transition-colors">@woolrch</a>
        </div>
      </footer>
    </main>
  );
}
