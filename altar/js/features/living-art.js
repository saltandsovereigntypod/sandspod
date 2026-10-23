/* =========================================================
   LIVING ART
   What an object's life leaves on it, drawn over its picture as the app
   draws it (app/src/components/altar/AltarStage.tsx, CandleMarks.tsx,
   StageEffects.tsx), from the app's own logic in js/core/altar.js:

   - a candle burns down: a free-standing one keeps its top (rim and wick)
     set down on a shorter body, a figure or two-colour candle burns away
     from the head, the wax in glass sinks;
   - words carved down the wax, melting away from the top as it burns;
   - its dressing (the oil and herb overlays) only on the wax that's left;
   - a warm pool of melted wax under a lit flame, drips running down, the
     tunnel or wide pool its burns have left, and its remnant when spent;
   - the living flame: its shape, its lean and its flicker each on its own
     clock, the tip swinging on its own, and now and then parting into
     tongues; a puff of smoke when it's put out;
   - incense with its ember, a curling stream and drifting smoke, and ash;
   - a charged object's breathing glow, an offering going over, a folded
     petition, and the moment a cleansing or charge plays.

   Reduce motion: everything still.
   ========================================================= */

(function initializeLivingArt(global) {
  "use strict";

  const app = () => global.AltarApp;
  const core = () => global.SaltCore?.altar || null;
  const SVGNS = "http://www.w3.org/2000/svg";
  const reduceQuery = global.matchMedia ? global.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const still = () => !!reduceQuery?.matches;
  const DISPLAY_FONT = "'Cormorant Garamond', Georgia, serif";

  // ── Colour (CandleMarks.tsx) ────────────────────────────────────────────
  const rgbOf = (hex) => {
    const h = String(hex || "").replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h.slice(0, 6), 16);
    return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [200, 190, 170];
  };
  const mix = (hex, to, t) => `rgb(${rgbOf(hex).map((v, i) => Math.round(v + (to[i] - v) * t)).join(",")})`;
  const lightness = (hex) => {
    const [r, g, b] = rgbOf(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  function incision(waxHex) {
    if (lightness(waxHex) < 0.32) return { groove: mix(waxHex, [235, 222, 200], 0.34), grooveOpacity: 0.85, edge: "rgb(0,0,0)", edgeOpacity: 0.55 };
    return { groove: mix(waxHex, [40, 16, 8], 0.55), grooveOpacity: 0.7, edge: mix(waxHex, [255, 253, 246], 0.6), edgeOpacity: 0.5 };
  }
  function dripLook(waxHex, lit) {
    const dark = lightness(waxHex) < 0.32;
    return {
      fill: mix(waxHex, dark ? [90, 84, 78] : [255, 250, 240], lit ? 0.14 : 0.08),
      edge: mix(waxHex, dark ? [0, 0, 0] : [40, 20, 10], 0.5),
      shine: mix(waxHex, [255, 255, 250], dark ? 0.4 : 0.7)
    };
  }
  const n2 = (v) => (Math.round(v * 100) / 100).toString();
  const xmlEsc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const HALF_WIDTH = { taper: 0.09, "chime-spell": 0.08, "beeswax-rolled": 0.1, birthday: 0.05, "seven-knob": 0.13, "double-action": 0.12, reversible: 0.12, pillar: 0.3, jar: 0.3, vigil: 0.3, novena: 0.3, figure: 0.22 };
  const FLECKS = [[-0.55, 0.12], [0.35, 0.2], [-0.2, 0.33], [0.6, 0.41], [-0.62, 0.52], [0.12, 0.6], [0.45, 0.7], [-0.35, 0.78], [0.2, 0.86], [-0.05, 0.47]];
  const DRIPS = [[-0.92, 0.55], [0.88, 0.8], [-0.45, 0.4], [0.55, 1], [0.1, 0.5], [-0.78, 0.9]];

  // ── Geometry ────────────────────────────────────────────────────────────
  /** Where a candle's picture, wax top and flame are in a box `width` × `height` (CandleMarks.tsx candleGeometry). */
  function candleGeometry(saved, width, height, now) {
    const A = core();
    const ratio = saved.imagePath ? app().ratioOf(saved.imagePath) : null;
    const base = A.flame.flameLayout(saved.imagePath, ratio);
    const burn = ratio ? A.wax.burnDown(saved, now) : null;
    if (!ratio || !burn || !(height > 0)) return { burn: null, pic: null, flame: base, dropPx: 0 };
    const box = A.flame.pictureBox(ratio, height / width);
    const pic = { left: box.left * width, top: box.top * height, width: box.width * width, height: box.height * height };
    const dropPx = burn.drop * pic.height;
    return { burn, pic, flame: A.flame.lowerFlame(base, (dropPx / height) * 100), dropPx };
  }
  const drawsBurnedDown = (geo) => !!geo.burn && !!geo.pic && (geo.burn.mode === "cap" || geo.burn.mode === "crop") && geo.dropPx > 0.25;

  // ── The marks (CandleMarks.tsx) ─────────────────────────────────────────
  function marksSvg(saved, width, height, now, uid, geo) {
    const A = core();
    const form = A.livingState.candleLifeForm(saved);
    if (A.wax.LOW_FORMS.has(form)) return "";
    const carvings = A.livingState.carvingsOf(saved).slice(0, 2);
    const dressings = A.livingState.dressingsOf(saved);
    const wax = A.wax.waxLook(saved, now);
    const lit = A.livingState.isLit(saved);
    const { burn, pic } = geo;
    if (!carvings.length && !dressings.length && wax.kind === "even" && !wax.melt && !(burn && burn.drop > 0)) return "";

    const flame = geo.flame;
    const cx = (flame.centerX / 100) * width;
    let half; let surface; let bottom; let carveTop;
    if (burn && pic) {
      half = burn.half * pic.width;
      surface = pic.top + burn.waxTop * pic.height;
      bottom = pic.top + burn.bottom * pic.height;
      carveTop = pic.top + ((burn.mode === "cap" ? burn.capEnd : burn.top) + 0.03) * pic.height;
    } else {
      half = (HALF_WIDTH[form] ?? 0.2) * width;
      surface = Math.max(2, ((flame.flameTop + flame.flameHeight) / 100) * height + 1);
      bottom = height * 0.93;
      carveTop = surface + (bottom - surface) * 0.06;
    }
    const body = Math.max(1, bottom - surface);
    const goneLine = burn && pic ? surface + (burn.mode === "cap" ? (burn.capEnd - burn.top) * pic.height : 0) : surface;
    const rim = Math.max(1.2, half * 0.2);
    const waxHex = A.colors.waxColor(String(saved.color || "white"));
    const cut = incision(waxHex);
    const drip = dripLook(waxHex, lit);
    const oil = dressings.some((d) => d.type === "oil");
    const herbs = dressings.filter((d) => d.type === "herb");
    const progress = A.wax.burnProgress(saved, now);
    const glass = burn?.mode === "glass" && pic ? burn : null;
    const flipped = saved.flipped === "true";
    const out = [];

    out.push(`<defs>
      <linearGradient id="sheen-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(255,236,180)" stop-opacity="0"/><stop offset="0.35" stop-color="rgb(255,236,180)" stop-opacity="0.3"/><stop offset="0.5" stop-color="rgb(255,250,230)" stop-opacity="0.42"/><stop offset="0.7" stop-color="rgb(255,236,180)" stop-opacity="0.14"/><stop offset="1" stop-color="rgb(255,236,180)" stop-opacity="0"/></linearGradient>
      <radialGradient id="pool-${uid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgb(255,250,215)" stop-opacity="1"/><stop offset="0.45" stop-color="rgb(255,214,130)" stop-opacity="0.85"/><stop offset="1" stop-color="rgb(255,170,70)" stop-opacity="0"/></radialGradient>
      <linearGradient id="glow-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(255,206,120)" stop-opacity="0.75"/><stop offset="0.5" stop-color="rgb(255,190,100)" stop-opacity="0.25"/><stop offset="1" stop-color="rgb(255,190,100)" stop-opacity="0"/></linearGradient>
      <linearGradient id="glass-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(40,34,30)" stop-opacity="0.82"/><stop offset="0.22" stop-color="rgb(70,64,58)" stop-opacity="0.7"/><stop offset="0.3" stop-color="rgb(220,220,214)" stop-opacity="0.55"/><stop offset="0.38" stop-color="rgb(70,64,58)" stop-opacity="0.7"/><stop offset="1" stop-color="rgb(40,34,30)" stop-opacity="0.82"/></linearGradient>
    </defs>`);

    const wick = (top) => `<line x1="${n2(cx)}" y1="${n2(top)}" x2="${n2(cx)}" y2="${n2(surface)}" stroke="rgb(30,20,14)" stroke-width="${n2(Math.max(0.8, half * 0.06))}" stroke-linecap="round"/>`;
    if (glass && glass.drop > 0) {
      out.push(`<rect x="${n2(cx - half)}" y="${n2(pic.top + glass.top * pic.height - rim)}" width="${n2(half * 2)}" height="${n2(glass.drop * pic.height + rim)}" fill="url(#glass-${uid})"/>`);
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(surface)}" rx="${n2(half)}" ry="${n2(rim)}" fill="${mix(waxHex, [255, 255, 255], 0.25)}"/>`);
      out.push(wick(surface - rim * 1.6));
    }
    if (burn?.mode === "crop" && burn.drop > 0) {
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(surface)}" rx="${n2(half)}" ry="${n2(rim)}" fill="${mix(waxHex, [255, 255, 255], 0.2)}"/>`);
      out.push(wick(surface - rim * 1.8));
    }
    if (oil) out.push(`<rect x="${n2(cx - half * 0.85)}" y="${n2(surface + body * 0.04)}" width="${n2(half * 0.9)}" height="${n2(body * 0.9)}" rx="${n2(half * 0.4)}" fill="url(#sheen-${uid})"/>`);
    if (herbs.length) {
      FLECKS.slice(0, Math.min(FLECKS.length, 4 + herbs.length * 2)).forEach(([fx, fy], i) => {
        const herb = herbs[i % herbs.length];
        out.push(`<ellipse cx="${n2(cx + fx * half * 0.8)}" cy="${n2(surface + fy * body)}" rx="${n2(Math.max(0.9, half * 0.09))}" ry="${n2(Math.max(0.6, half * 0.06))}" fill="${A.colors.ingredientColor(String(herb.herb || herb.label || ""))}" opacity="0.85"/>`);
      });
    }
    carvings.forEach((carving, column) => {
      const text = carving.text;
      const count = Math.max(1, [...text].length);
      const columns = carvings.length;
      const lane = (half * 2 * 0.86) / columns;
      const span = Math.max(1, bottom - carveTop - body * 0.05);
      const mark = A.livingState.carvingMark(carving);
      if (mark) {
        // A sigil: the mark itself, upright, cut into the wax and melting from the top (CandleMarks.tsx).
        const side = Math.min(lane * 0.92, span * 0.6, 64);
        if (side < 6) return;
        const sx = cx + (columns > 1 ? (column === 0 ? -0.5 : 0.5) * lane : 0);
        const smid = carveTop + span * 0.4;
        const sstart = smid - side / 2;
        const sremains = burn ? null : A.dressing.carvingRemaining(text, progress);
        const smelted = sremains ? sstart + sremains.meltLine * side : goneLine + side * 0.05;
        const sclip = Math.max(smelted, sstart - 2);
        if (sclip >= sstart + side) return;
        const k = side / 100;
        const stroke = Math.max(0.7, side * 0.035) / k;
        const ring = A.sigil.RING;
        const glyph = (dx, dy, color, opacity) =>
          `<g transform="translate(${n2(sx - side / 2 + dx)} ${n2(sstart + dy)}) scale(${n2(k * 1000) / 1000})">${
            mark.ring ? `<circle cx="${ring.cx}" cy="${ring.cy}" r="${ring.r}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${n2(stroke * 0.8)}"/>` : ""
          }<path d="${mark.d}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${n2(stroke)}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
        const sid = `carve-${uid}-${column}`;
        out.push(`<clipPath id="${sid}"><rect x="${n2(cx - half * 0.94)}" y="${n2(sclip)}" width="${n2(half * 1.88)}" height="${n2(Math.max(0, bottom - sclip))}"/></clipPath>`);
        out.push(`<g clip-path="url(#${sid})">${glyph(side * 0.012, side * 0.016, cut.edge, cut.edgeOpacity)}${glyph(0, 0, cut.groove, cut.grooveOpacity)}</g>`);
        return;
      }
      const size = Math.min(lane * 0.85, (span * 0.86) / (0.46 * count), 30);
      if (size < 3) return;
      const length = 0.46 * count * size;
      const x = cx + (columns > 1 ? (column === 0 ? -0.5 : 0.5) * lane : 0);
      const mid = carveTop + span * 0.48;
      const start = mid - length / 2;
      const remains = burn ? null : A.dressing.carvingRemaining(text, progress);
      const melted = remains ? start + remains.meltLine * length : goneLine + size * 0.15;
      const clipTop = Math.max(melted, start - size);
      if (clipTop >= start + length) return;
      const id = `carve-${uid}-${column}`;
      const glyph = `font-size="${n2(size)}" font-family="${DISPLAY_FONT}" font-weight="600" text-anchor="middle" letter-spacing="${n2(size * 0.02)}"`;
      out.push(`<clipPath id="${id}"><rect x="${n2(cx - half * 0.94)}" y="${n2(clipTop)}" width="${n2(half * 1.88)}" height="${n2(Math.max(0, bottom - clipTop))}"/></clipPath>`);
      out.push(`<g clip-path="url(#${id})"><g transform="translate(${n2(x)} ${n2(mid)}) rotate(90)${flipped ? " scale(1 -1)" : ""}">
        <text ${glyph} x="${n2(size * 0.03)}" y="${n2(size * 0.35)}" fill="${cut.edge}" fill-opacity="${cut.edgeOpacity}">${xmlEsc(text)}</text>
        <text ${glyph} x="0" y="${n2(size * 0.31)}" fill="${cut.groove}" fill-opacity="${cut.grooveOpacity}">${xmlEsc(text)}</text>
      </g></g>`);
    });
    if (wax.kind === "tunnel") {
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(surface + rim * 0.3)}" rx="${n2(half * 0.95)}" ry="${n2(rim)}" fill="${mix(waxHex, [255, 248, 236], 0.45)}" opacity="0.6"/>`);
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(surface + rim * 0.45)}" rx="${n2(half * (0.34 + 0.22 * wax.amount))}" ry="${n2(rim * (0.55 + 0.2 * wax.amount))}" fill="rgb(40,20,10)" opacity="${n2(0.55 + 0.3 * wax.amount)}"/>`);
    }
    if (wax.kind === "pool") {
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(surface + rim * 0.35)}" rx="${n2(half * 0.94)}" ry="${n2(rim * 0.95)}" fill="${mix(waxHex, [255, 250, 236], 0.55)}" opacity="${n2(0.5 + 0.3 * wax.amount)}" stroke="rgb(255,252,240)" stroke-opacity="0.65" stroke-width="${n2(Math.max(0.5, half * 0.04))}"/>`);
      out.push(`<ellipse cx="${n2(cx - half * 0.3)}" cy="${n2(surface + rim * 0.2)}" rx="${n2(half * 0.28)}" ry="${n2(rim * 0.3)}" fill="rgb(255,255,250)" opacity="0.55"/>`);
    }
    if (lit && wax.melt > 0) {
      out.push(`<rect x="${n2(cx - half)}" y="${n2(surface)}" width="${n2(half * 2)}" height="${n2(Math.min(body, Math.max(rim * 3, body * 0.16)))}" fill="url(#glow-${uid})" opacity="${n2((lightness(waxHex) < 0.32 ? 0.22 : 0.4) + 0.3 * wax.melt)}"/>`);
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(surface + rim * 0.35)}" rx="${n2(half * (0.45 + 0.5 * wax.melt))}" ry="${n2(rim * (0.55 + 0.45 * wax.melt))}" fill="url(#pool-${uid})" opacity="${n2(0.6 + 0.4 * wax.melt)}"/>`);
    }
    if (wax.drips > 0) {
      DRIPS.slice(0, wax.drips).forEach(([dx, len]) => {
        const x = cx + dx * half * 0.84;
        const l = Math.min(body * 0.7, body * (0.08 + 0.26 * len * Math.max(wax.amount, wax.melt * 0.7)));
        const w = Math.max(1.1, half * 0.17);
        const r = w * 0.62;
        const top = surface + rim * (0.3 + 0.3 * (1 - Math.abs(dx)));
        const end = top + l;
        const d = `M ${n2(x - w * 0.55)} ${n2(top)} C ${n2(x - w * 0.5)} ${n2(top + l * 0.4)} ${n2(x - w * 0.3)} ${n2(end - r * 1.6)} ${n2(x - r)} ${n2(end)} A ${n2(r)} ${n2(r)} 0 1 0 ${n2(x + r)} ${n2(end)} C ${n2(x + w * 0.3)} ${n2(end - r * 1.6)} ${n2(x + w * 0.5)} ${n2(top + l * 0.4)} ${n2(x + w * 0.55)} ${n2(top)} Z`;
        out.push(`<g><path d="${d}" fill="${drip.fill}" stroke="${drip.edge}" stroke-opacity="0.45" stroke-width="${n2(Math.max(0.3, w * 0.08))}"/>
          <path d="M ${n2(x - w * 0.18)} ${n2(top + w * 0.6)} L ${n2(x - w * 0.14)} ${n2(end - r * 0.4)}" stroke="${drip.shine}" stroke-opacity="0.35" stroke-width="${n2(Math.max(0.3, w * 0.14))}" stroke-linecap="round"/>
          <ellipse cx="${n2(x - r * 0.3)}" cy="${n2(end - r * 0.15)}" rx="${n2(r * 0.28)}" ry="${n2(r * 0.22)}" fill="${drip.shine}" opacity="0.4"/></g>`);
      });
    }
    if (wax.kind === "remnant" && wax.amount > 0) {
      out.push(`<ellipse cx="${n2(cx)}" cy="${n2(bottom - rim * 0.3)}" rx="${n2(Math.max(half * 2, width * 0.2))}" ry="${n2(Math.max(2, rim * 1.2, width * 0.05))}" fill="${mix(waxHex, [70, 66, 60], 0.25)}" opacity="0.88" stroke="${mix(waxHex, [20, 10, 5], 0.45)}" stroke-opacity="0.55" stroke-width="${n2(Math.max(0.5, width * 0.012))}"/>`);
      out.push(`<ellipse cx="${n2(cx + half * 0.6)}" cy="${n2(bottom - rim * 0.1)}" rx="${n2(Math.max(half * 0.7, width * 0.06))}" ry="${n2(Math.max(1, width * 0.025))}" fill="${mix(waxHex, [20, 10, 5], 0.3)}" opacity="0.5"/>`);
      out.push(`<ellipse cx="${n2(cx - half * 0.5)}" cy="${n2(bottom - rim * 0.55)}" rx="${n2(Math.max(half * 0.7, width * 0.07))}" ry="${n2(Math.max(0.8, width * 0.018))}" fill="rgb(255,250,236)" opacity="0.35"/>`);
    }
    return `<svg class="living-art__marks" xmlns="${SVGNS}" width="${n2(width)}" height="${n2(height)}" viewBox="0 0 ${n2(width)} ${n2(height)}" aria-hidden="true" focusable="false">${out.join("")}</svg>`;
  }

  // ── The picture, burned down (CandlePicture) ────────────────────────────
  function burnedPictureHtml(src, geo, spent) {
    const { burn, pic, dropPx } = geo;
    const image = (offset) => `<img src="${xmlEsc(src)}" alt="" draggable="false" style="position:absolute;left:0;top:${n2(-offset)}px;width:${n2(pic.width)}px;height:${n2(pic.height)}px;max-width:none">`;
    const clip = (top, height, offset) => `<div class="living-art__clip${spent ? " is-spent" : ""}" style="left:${n2(pic.left)}px;top:${n2(top)}px;width:${n2(pic.width)}px;height:${n2(Math.max(0, height))}px">${image(offset)}</div>`;
    if (burn.mode === "crop") return clip(pic.top + dropPx, pic.height - dropPx, dropPx);
    const capPx = burn.capEnd * pic.height;
    return clip(pic.top + capPx + dropPx, pic.height - capPx - dropPx, capPx + dropPx) + clip(pic.top + dropPx, capPx + 0.75, 0);
  }

  // ── The living flame (AltarStage.tsx Flame) ─────────────────────────────
  const FLAME_BODY = "M5 3.4 C6.6 6 9.2 8.6 9.2 11.8 C9.2 15.1 7.3 17.4 5 17.4 C2.7 17.4 0.8 15.1 0.8 11.8 C0.8 8.6 3.4 6 5 3.4 Z";
  const FLAME_TONGUE = "M5 0.3 C5.8 3 7.6 6.2 7.6 9.6 C7.6 12.4 6.4 14.4 5 14.4 C3.6 14.4 2.4 12.4 2.4 9.6 C2.4 6.2 4.2 3 5 0.3 Z";
  const FLAME_HEART = "M5 5.4 C5.9 7.8 7.2 9.9 7.2 12.2 C7.2 14.3 6.2 15.6 5 15.6 C3.8 15.6 2.8 14.3 2.8 12.2 C2.8 9.9 4.1 7.8 5 5.4 Z";
  const FOOT = [5, 17.4];
  let flameDefsDone = false;
  /** The flame's gradients, once on the page (shared by every flame). */
  function ensureFlameDefs() {
    if (flameDefsDone) return;
    flameDefsDone = true;
    const holder = document.createElement("div");
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    holder.innerHTML = `<svg xmlns="${SVGNS}" width="0" height="0"><defs>
      <linearGradient id="living-flame-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(255,150,50)" stop-opacity="0.25"/><stop offset="0.25" stop-color="rgb(255,190,80)" stop-opacity="0.85"/><stop offset="0.65" stop-color="rgb(255,226,140)" stop-opacity="0.97"/><stop offset="0.86" stop-color="rgb(255,200,110)" stop-opacity="0.9"/><stop offset="1" stop-color="rgb(90,120,255)" stop-opacity="0.55"/></linearGradient>
      <radialGradient id="living-flame-core" cx="50%" cy="66%" r="50%"><stop offset="0" stop-color="rgb(255,255,246)" stop-opacity="1"/><stop offset="0.6" stop-color="rgb(255,246,200)" stop-opacity="0.85"/><stop offset="1" stop-color="rgb(255,236,170)" stop-opacity="0"/></radialGradient>
      <radialGradient id="living-flame-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgb(255,252,230)" stop-opacity="0.38"/><stop offset="0.45" stop-color="rgb(255,220,130)" stop-opacity="0.3"/><stop offset="0.7" stop-color="rgb(255,180,70)" stop-opacity="0.15"/><stop offset="1" stop-color="rgb(255,180,70)" stop-opacity="0"/></radialGradient>
      <radialGradient id="living-smoke-low" cx="50%" cy="80%" r="38%"><stop offset="0" stop-color="rgb(210,210,200)" stop-opacity="0.55"/><stop offset="1" stop-color="rgb(210,210,200)" stop-opacity="0"/></radialGradient>
      <radialGradient id="living-smoke-mid" cx="45%" cy="45%" r="42%"><stop offset="0" stop-color="rgb(210,210,200)" stop-opacity="0.35"/><stop offset="1" stop-color="rgb(210,210,200)" stop-opacity="0"/></radialGradient>
      <radialGradient id="living-smoke-high" cx="58%" cy="18%" r="46%"><stop offset="0" stop-color="rgb(210,210,200)" stop-opacity="0.22"/><stop offset="1" stop-color="rgb(210,210,200)" stop-opacity="0"/></radialGradient>
      <linearGradient id="living-incense-stream" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(214,218,226)" stop-opacity="0.95"/><stop offset="0.6" stop-color="rgb(200,206,218)" stop-opacity="0.55"/><stop offset="1" stop-color="rgb(200,206,218)" stop-opacity="0"/></linearGradient>
      <radialGradient id="living-incense-wisp" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="rgb(208,212,222)" stop-opacity="0.9"/><stop offset="0.55" stop-color="rgb(170,176,190)" stop-opacity="0.45"/><stop offset="1" stop-color="rgb(170,176,190)" stop-opacity="0"/></radialGradient>
      <radialGradient id="living-charge" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="rgb(236,242,255)" stop-opacity="0.95"/><stop offset="0.4" stop-color="rgb(196,212,255)" stop-opacity="0.6"/><stop offset="0.75" stop-color="rgb(170,190,250)" stop-opacity="0.22"/><stop offset="1" stop-color="rgb(170,190,250)" stop-opacity="0"/></radialGradient>
    </defs></svg>`;
    document.body.appendChild(holder);
  }

  const between = (lo, hi) => lo + Math.random() * (hi - lo);
  const ease = {
    linear: (t) => t,
    sin: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
    quad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outQuad: (t) => 1 - (1 - t) * (1 - t)
  };

  /** One value moving toward a target over time (an Animated.timing). */
  function tween(value, to, duration, easing = ease.linear) {
    return { value, from: null, to, duration: Math.max(1, duration), easing, start: null };
  }

  /**
   * A chain: run `next()` again and again, each giving tweens to play
   * together and a rest after them. Three or more run a flame, each on its own clock.
   */
  function chain(next) {
    return { next, tweens: [], until: 0, rest: 0 };
  }

  function stepChain(c, values, now) {
    if (!c.tweens.length && now >= c.until) {
      const { tweens, rest = 0 } = c.next();
      c.tweens = tweens.map((t) => ({ ...t, start: now, from: values[t.value] }));
      c.rest = rest;
    }
    if (!c.tweens.length) return;
    let done = true;
    c.tweens.forEach((t) => {
      const p = Math.min(1, (now - t.start) / t.duration);
      values[t.value] = t.from + (t.to - t.from) * t.easing(p);
      if (p < 1) done = false;
    });
    if (done) {
      c.tweens = [];
      c.until = now + c.rest;
    }
  }

  function makeFlame(host) {
    ensureFlameDefs();
    const wrap = document.createElement("div");
    wrap.className = "living-flame";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `
      <div class="living-flame__halo"><svg viewBox="0 0 10 10" width="100%" height="100%" overflow="visible"><circle cx="5" cy="5" r="5" fill="url(#living-flame-halo)"/></svg></div>
      <div class="living-flame__fire"><svg viewBox="0 0 10 18" width="100%" height="100%" overflow="visible">
        <g data-tongue="-1" opacity="0"><path d="${FLAME_BODY}" fill="url(#living-flame-body)"/><path d="${FLAME_TONGUE}" fill="url(#living-flame-core)" opacity="0.7"/></g>
        <g data-tongue="1" opacity="0"><path d="${FLAME_BODY}" fill="url(#living-flame-body)"/><path d="${FLAME_TONGUE}" fill="url(#living-flame-core)" opacity="0.7"/></g>
        <g data-part="body"><path d="${FLAME_BODY}" fill="url(#living-flame-body)"/></g>
        <g data-part="tip"><path d="${FLAME_TONGUE}" fill="url(#living-flame-body)"/><path d="${FLAME_HEART}" fill="url(#living-flame-core)"/><ellipse cx="5" cy="15.3" rx="1.25" ry="1.7" fill="rgb(120,70,40)" opacity="0.35"/></g>
      </svg></div>`;
    host.appendChild(wrap);
    const values = { tall: 1, lean: 0, tremble: 1, glow: 1, tipLean: 0, tipTall: 1, skew: 0, split: 0 };
    const state = { fastUntil: 0, fastOn: false, leanTo: 0, tongues: [1] };
    const chains = [
      // Shape: drifts between tall-and-thin and short-and-fat, sometimes holding a while.
      chain(() => {
        const roll = Math.random();
        const to = roll < 0.3 ? between(1.2, 1.5) : roll < 0.55 ? between(0.6, 0.82) : between(0.88, 1.12);
        return { tweens: [tween("tall", to, between(250, 1400), ease.sin)], rest: Math.random() < 0.35 ? between(400, 2200) : 0 };
      }),
      // Lean: often swings to the other side, sometimes stands upright, sometimes held over.
      chain(() => {
        const from = state.leanTo;
        const roll = Math.random();
        const to = roll < 0.25 ? between(-2, 2) : (from > 0 ? -1 : 1) * between(4, 16) * (roll < 0.5 ? 1 : 0.6);
        state.leanTo = to;
        return { tweens: [tween("lean", to, between(300, 1500), ease.quad)], rest: Math.random() < 0.3 ? between(300, 1800) : 0 };
      }),
      // Flicker: spells of quick trembling, then slow; changes every second or few.
      chain(() => {
        const now = performance.now();
        if (now > state.fastUntil) {
          state.fastOn = Math.random() < 0.45;
          state.fastUntil = now + between(900, 4200);
        }
        const duration = state.fastOn ? between(40, 110) : between(280, 800);
        const depth = state.fastOn ? 0.14 : 0.06;
        return { tweens: [tween("tremble", between(1 - depth, 1 + depth), duration), tween("glow", state.fastOn ? between(0.72, 1) : between(0.9, 1), duration)] };
      }),
      // The tip and the sides: never quite the same shape twice.
      chain(() => {
        const duration = state.fastOn ? between(60, 160) : between(220, 760);
        return {
          tweens: [
            tween("tipLean", state.leanTo * between(0.1, 0.45) + between(-5, 5), duration, ease.sin),
            tween("tipTall", between(0.88, 1.18), duration, ease.sin),
            tween("skew", between(-9, 9), duration * 1.4, ease.sin)
          ]
        };
      }),
      // Rarely, it parts into two tongues (or one), for a few seconds, as a long wick's flame does.
      (() => {
        let phase = 0;
        return chain(() => {
          phase = (phase + 1) % 3;
          if (phase === 1) {
            const roll = Math.random();
            state.tongues = roll < 0.25 ? [-1, 1] : roll < 0.62 ? [-1] : [1];
            return { tweens: [], rest: between(20000, 70000) };
          }
          if (phase === 2) return { tweens: [tween("split", 1, between(250, 600), ease.outQuad)], rest: between(900, 4200) };
          return { tweens: [tween("split", 0, between(300, 800), ease.quad)] };
        });
      })()
    ];
    const parts = {
      halo: wrap.querySelector(".living-flame__halo"),
      fire: wrap.querySelector(".living-flame__fire"),
      body: wrap.querySelector('[data-part="body"]'),
      tip: wrap.querySelector('[data-part="tip"]'),
      tongues: [...wrap.querySelectorAll("[data-tongue]")]
    };
    return { wrap, values, state, chains, parts };
  }

  function placeFlame(flame, layout) {
    const { halo, fire } = flame.parts;
    fire.style.left = `${layout.centerX - 5}%`;
    fire.style.top = `${layout.flameTop}%`;
    fire.style.height = `${layout.flameHeight}%`;
    halo.style.left = `${layout.centerX - 4}%`;
    halo.style.top = `${layout.haloTop}%`;
    halo.style.height = `${layout.haloHeight}%`;
  }

  function drawFlame(flame) {
    const v = flame.values;
    const scaleY = v.tall * v.tremble;
    // Tall is thin and short is fat, as a flame keeps about the same body.
    const scaleX = v.tall <= 1 ? 1 + (1 - v.tall) / 0.4 * 0.3 : 1 - (v.tall - 1) / 0.5 * 0.28;
    const [fx, fy] = FOOT;
    const around = (inner) => `translate(${fx} ${fy}) ${inner} translate(${-fx} ${-fy})`;
    flame.parts.body.setAttribute("transform", around(`rotate(${n2(v.lean)}) skewX(${n2(v.skew)}) scale(${n2(scaleX)} ${n2(scaleY)})`));
    flame.parts.body.setAttribute("opacity", n2(v.glow));
    flame.parts.tip.setAttribute("transform", around(`rotate(${n2(v.lean + v.tipLean)}) scale(${n2(scaleX)} ${n2(scaleY * v.tipTall)})`));
    flame.parts.tip.setAttribute("opacity", n2(v.glow));
    flame.parts.tongues.forEach((g) => {
      const side = Number(g.dataset.tongue);
      const on = flame.state.tongues.includes(side);
      const s = v.split;
      if (!on || s < 0.01) {
        g.setAttribute("opacity", "0");
        return;
      }
      g.setAttribute("opacity", n2(s * v.glow));
      const sy = (0.3 + ((side < 0 ? 0.72 : 0.62) - 0.3) * s) * v.tremble;
      const sx = 0.4 + 0.22 * s;
      g.setAttribute("transform", `translate(${n2(side * 10 * 0.24 * s)} 0) ${around(`rotate(${n2(v.lean + side * 20 * s)}) scale(${n2(sx)} ${n2(sy)})`)}`);
    });
    const haloScale = 0.8 + ((v.tall - 0.6) / 0.9) * 0.35;
    flame.parts.halo.style.opacity = n2(v.glow);
    flame.parts.halo.style.transform = `scale(${n2(haloScale)})`;
  }

  // ── Smoke and incense ───────────────────────────────────────────────────
  const SMOKE_MS = 1400;
  function playSmoke(host, layout) {
    if (still()) return;
    ensureFlameDefs();
    const puff = document.createElement("div");
    puff.className = "living-smoke";
    puff.setAttribute("aria-hidden", "true");
    puff.style.left = `${layout.centerX - 5}%`;
    puff.style.top = `${layout.smokeTop}%`;
    puff.style.height = `${layout.smokeHeight}%`;
    puff.innerHTML = `<svg viewBox="0 0 10 22" width="100%" height="100%" preserveAspectRatio="none"><ellipse cx="5" cy="11" rx="5" ry="11" fill="url(#living-smoke-low)"/><ellipse cx="5" cy="11" rx="5" ry="11" fill="url(#living-smoke-mid)"/><ellipse cx="5" cy="11" rx="5" ry="11" fill="url(#living-smoke-high)"/></svg>`;
    host.appendChild(puff);
    const h = puff.offsetHeight || 20;
    const run = puff.animate?.([
      { opacity: 0, transform: "translate(0,0) scale(0.6)" },
      { opacity: 0.65, offset: 0.2 },
      { opacity: 0, transform: `translate(${n2(-h * 0.04)}px, ${n2(-h * 1.2)}px) scale(1.45)` }
    ], { duration: SMOKE_MS, easing: "ease-out", fill: "forwards" });
    const done = () => puff.remove();
    if (run) run.onfinish = done;
    else setTimeout(done, SMOKE_MS);
  }

  function incenseHtml(origin, width) {
    const wisp = Math.max(16, width * 0.85);
    const ember = Math.max(3.5, width * 0.08);
    const stream = Math.max(34, Math.min(110, width * 2.2));
    const line = (Math.max(1.4, Math.min(3.2, width * 0.06)) * 40) / stream;
    const at = `left:${n2(origin.x * 100)}%;top:${n2(origin.y * 100)}%`;
    const path = "M10 40 C 9 33, 12.5 29, 10.5 23 S 7 14, 10 8 S 13 2, 11 0";
    const wisps = [0, 1, 2, 3].map((i) => `<div class="living-incense__wisp living-incense__wisp--${i}" style="${at};width:${n2(wisp)}px;height:${n2(wisp * 1.4)}px;margin-left:${n2(-wisp / 2)}px;margin-top:${n2(-wisp * 1.3)}px;--wisp:${n2(wisp)}px"><svg viewBox="0 0 10 14" width="100%" height="100%"><ellipse cx="5" cy="8" rx="4" ry="6" fill="url(#living-incense-wisp)"/></svg></div>`).join("");
    return `<div class="living-incense" aria-hidden="true">
      <div class="living-incense__stream" style="${at};width:${n2(stream * 0.5)}px;height:${n2(stream)}px;margin-left:${n2(-stream * 0.25)}px;margin-top:${n2(-stream)}px;--sway:${n2(stream * 0.05)}px"><svg viewBox="0 0 20 40" width="100%" height="100%"><path d="${path}" stroke="rgba(70,74,84,0.35)" stroke-width="${n2(line * 1.7)}" fill="none" stroke-linecap="round"/><path d="${path}" stroke="url(#living-incense-stream)" stroke-width="${n2(line)}" fill="none" stroke-linecap="round"/></svg></div>
      ${wisps}
      <div class="living-incense__ember" style="${at};width:${n2(ember)}px;height:${n2(ember)}px;margin-left:${n2(-ember / 2)}px;margin-top:${n2(-ember / 2)}px"></div>
    </div>`;
  }

  const GLINTS = [[0.12, 0.18, 1], [0.86, 0.32, 0.8], [0.22, 0.62, 0.65], [0.8, 0.74, 0.9]];
  function chargeHtml(strength) {
    if (!(strength > 0.02)) return "";
    const glints = strength > 0.35 ? GLINTS.slice(0, strength > 0.7 ? 4 : 2) : [];
    return `<div class="living-charge" aria-hidden="true" style="--charge:${n2(strength)}"><svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><ellipse cx="50" cy="55" rx="50" ry="48" fill="url(#living-charge)" opacity="${n2(strength)}"/></svg></div>${glints.map(([x, y, size], i) => `<div class="living-glint living-glint--${i % 2}" aria-hidden="true" style="left:${x * 100}%;top:${y * 100}%;width:${16 * size}%"><svg viewBox="0 0 10 10" width="100%" height="100%"><path d="M5 0 L5.9 4.1 L10 5 L5.9 5.9 L5 10 L4.1 5.9 L0 5 L4.1 4.1 Z" fill="rgb(240,246,255)"/><circle cx="5" cy="5" r="1.3" fill="#fff"/></svg></div>`).join("")}`;
  }

  // ── Offerings going over and incense burning down (lib/altar/offeringArt) ─
  /** The liquid sinking in a vessel, its tide line and stain, and fallen petals (AltarStage.tsx OfferingMarks). */
  function offeringSvg(art, width, height, uid) {
    const { liquid, tide, stain, petals } = art;
    if (!liquid && !tide && !stain && !petals.length) return "";
    const ell = (e, attrs) => `<ellipse cx="${n2(e.cx)}" cy="${n2(e.cy)}" rx="${n2(e.rx)}" ry="${n2(e.ry)}" ${attrs}/>`;
    const defs = [
      liquid ? `<radialGradient id="liquid-${uid}" cx="50%" cy="45%" r="58%"><stop offset="0" stop-color="${liquid.color}" stop-opacity="${liquid.opacity}"/><stop offset="1" stop-color="${liquid.deep}" stop-opacity="${liquid.opacity}"/></radialGradient>` : "",
      stain ? `<radialGradient id="stain-${uid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${stain.color}" stop-opacity="${n2(stain.opacity * 0.5)}"/><stop offset="0.8" stop-color="${stain.color}" stop-opacity="${stain.opacity}"/><stop offset="1" stop-color="${stain.color}" stop-opacity="0"/></radialGradient>` : ""
    ].join("");
    const parts = [
      stain ? ell(stain, `fill="url(#stain-${uid})"`) : "",
      tide ? ell(tide, `fill="none" stroke="${tide.color}" stroke-opacity="${tide.opacity}" stroke-width="${tide.stroke}"`) : "",
      liquid ? ell(liquid, `fill="url(#liquid-${uid})"`) : "",
      liquid && liquid.sheen > 0 ? ell({ cx: liquid.cx - liquid.rx * 0.28, cy: liquid.cy - liquid.ry * 0.35, rx: liquid.rx * 0.32, ry: liquid.ry * 0.22 }, `fill="rgb(255,250,236)" fill-opacity="${n2(liquid.sheen * Math.min(1, liquid.opacity + 0.2))}"`) : "",
      ...petals.map((p) => ell(p, `fill="${p.color}" fill-opacity="0.88" stroke="rgb(60,40,30)" stroke-opacity="0.25" stroke-width="0.5" transform="rotate(${p.rotate} ${n2(p.cx)} ${n2(p.cy)})"`))
    ].join("");
    return `<svg class="living-art__marks" width="${n2(width)}" height="${n2(height)}" viewBox="0 0 ${n2(width)} ${n2(height)}" aria-hidden="true"><defs>${defs}</defs>${parts}</svg>`;
  }

  /** A stick burned shorter from its tip (AltarStage.tsx StickPicture). */
  function stickPictureHtml(src, stick, ash) {
    const { pic, cutPx } = stick;
    return `<div class="living-art__clip${ash ? " is-spent" : ""}" style="left:${n2(pic.left)}px;top:${n2(pic.top + cutPx)}px;width:${n2(pic.width)}px;height:${n2(Math.max(0, pic.height - cutPx))}px"><img src="${xmlEsc(src)}" alt="" draggable="false" style="position:absolute;left:0;top:${n2(-cutPx)}px;width:${n2(pic.width)}px;height:${n2(pic.height)}px;max-width:none"></div>`;
  }

  /** Its grey tip and the ash fallen at its foot (AltarStage.tsx StickAsh). */
  function stickAshSvg(stick, width, height, lit) {
    const { tip, pile } = stick;
    const cap = Math.max(1, tip.width * 0.9);
    const capEl = stick.cutPx > 0.25 ? `<ellipse cx="${n2(tip.x)}" cy="${n2(tip.y + cap * 0.3)}" rx="${n2(tip.width / 2)}" ry="${n2(cap * 0.7)}" fill="${lit ? "rgb(176,170,160)" : "rgb(150,146,138)"}" fill-opacity="0.92" transform="rotate(${-tip.slant} ${n2(tip.x)} ${n2(tip.y)})"/>` : "";
    const pileEl = pile ? `<ellipse cx="${n2(pile.cx)}" cy="${n2(pile.cy)}" rx="${n2(pile.rx)}" ry="${n2(pile.ry)}" fill="rgb(156,151,142)" fill-opacity="0.7"/>` : "";
    return capEl || pileEl ? `<svg class="living-art__marks" width="${n2(width)}" height="${n2(height)}" viewBox="0 0 ${n2(width)} ${n2(height)}" aria-hidden="true">${capEl}${pileEl}</svg>` : "";
  }

  const PETITION_SVG = `<svg class="living-petition" viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><path d="M5 9 L33 6 L35 31 L7 34 Z" fill="rgb(236,224,192)" stroke="rgba(90,70,40,0.55)" stroke-width="0.8"/><path d="M6 21.5 L34 18.5" stroke="rgba(90,70,40,0.35)" stroke-width="0.7"/><path d="M10 13 L28 11 M10 16 L25 14.3 M10 25 L29 23 M10 28 L22 26.8" stroke="rgba(110,60,40,0.5)" stroke-width="0.6" stroke-linecap="round"/></svg>`;

  // ── Per object ──────────────────────────────────────────────────────────
  const records = new WeakMap();
  const flames = new Set();

  function layerOf(object, name, before = null) {
    let el = object.querySelector(`:scope > [data-living-art="${name}"]`);
    if (!el) {
      el = document.createElement("div");
      el.dataset.livingArt = name;
      el.className = `living-art living-art--${name}`;
      el.setAttribute("aria-hidden", "true");
      if (before) object.insertBefore(el, before);
      else object.appendChild(el);
    }
    return el;
  }

  function clearArt(object) {
    object.querySelectorAll(":scope > [data-living-art]").forEach((el) => el.remove());
    object.classList.remove("has-living-flame", "is-burned-down", "is-aging");
    const img = app()?.mainImage(object);
    if (img) img.style.removeProperty("filter"), img.style.removeProperty("opacity"), img.style.removeProperty("transform");
    object.querySelectorAll(".candle-herb-overlay, .candle-oil-overlay").forEach((o) => o.style.removeProperty("clip-path"));
  }

  function render(object, now = Date.now()) {
    const A = core();
    const bridge = app();
    if (!A || !bridge || !object?.isConnected) return;
    let record = records.get(object);
    if (!record) {
      // A copy (duplicate) carries the original's drawings: start clean.
      clearArt(object);
      record = { flame: null, lit: object.dataset.lit === "true", key: "" };
      records.set(object, record);
    }
    const saved = bridge.toSaved(object);
    const width = object.offsetWidth;
    const height = object.offsetHeight;
    if (!(width > 0 && height > 0)) return;
    const isCandle = A.livingState.isCandle(saved);
    const lit = isCandle && A.livingState.isLit(saved);
    const minute = Math.floor(now / 60000) * 60000;
    const uid = String(saved.altarObjectId || Math.random().toString(36).slice(2)).replace(/[^a-z0-9-]/gi, "");
    const img = bridge.mainImage(object);

    // Offerings going over, and charges (the app's offeringArt and ChargeAura).
    const ratio = saved.imagePath ? bridge.ratioOf(saved.imagePath) : null;
    const art = A.offeringArt.offeringArt(saved, width, height, minute, ratio);
    const charge = saved.altarObjectId ? A.charge.chargeOf(saved, minute) : null;
    const incense = A.incense.isIncense(saved) ? A.incense.incenseLife(saved, now) : null;
    // A stick of incense burns shorter from its tip and drops its ash at its foot.
    const stick = incense ? A.offeringArt.incenseStickArt(saved, width, height, now) : null;
    const stickCut = !!img && !!stick && stick.cutPx > 0.25;
    const geo = isCandle ? candleGeometry(saved, width, height, now) : null;
    const burned = !!geo && !!img && drawsBurnedDown(geo);
    const spent = isCandle && !lit && A.livingState.candleLife(saved, now).spent;

    const key = JSON.stringify([saved.livingState, saved.lit, saved.flipped, saved.color, saved.imagePath, width, height, minute, lit ? Math.floor(now / 15000) : 0, art, stick?.cutPx, charge?.strength && Math.round(charge.strength * 50), incense?.lit, incense?.ash]);
    if (key !== record.key) {
      record.key = key;

      // Under the picture: a charge's glow.
      const under = layerOf(object, "under");
      ensureFlameDefs();
      under.innerHTML = charge && charge.strength > 0 ? chargeHtml(charge.strength) : "";

      // An offering going over: browning and duller, a flower bowing its head.
      if (img) {
        object.classList.toggle("is-aging", !!art?.tint);
        if (art?.tint) img.style.filter = A.offeringArt.tintFilter(art.tint);
        else img.style.removeProperty("filter");
        img.style.removeProperty("opacity");
        if (art?.bend) {
          img.style.transformOrigin = "50% 100%";
          img.style.transform = `rotate(${n2(art.bend.rotate)}deg) scale(${n2(art.bend.scaleX)}, ${n2(art.bend.scaleY)})`;
        } else img.style.removeProperty("transform");
      }
      // Liquid sinking in its vessel, the ring it leaves, petals fallen.
      layerOf(object, "offering").innerHTML = art ? offeringSvg(art, width, height, uid) : "";

      // A folded petition with no picture of its own.
      if (!img && A.petitions.isPetitionPaper(saved)) {
        const paper = layerOf(object, "paper");
        if (!paper.innerHTML) paper.innerHTML = PETITION_SVG;
        object.classList.add("is-petition-paper");
      }

      // The candle, burned down, with its marks.
      const burnedLayer = layerOf(object, "burned");
      burnedLayer.innerHTML = burned ? burnedPictureHtml(img.getAttribute("src"), geo, spent) : stickCut ? stickPictureHtml(img.getAttribute("src"), stick, !!incense?.ash) : "";
      object.classList.toggle("is-burned-down", burned || stickCut);
      const marks = layerOf(object, "marks");
      marks.innerHTML = isCandle && img && geo ? marksSvg(saved, width, height, now, uid, geo) : "";

      // The dressing lies only on the wax that's there.
      const overlays = object.querySelectorAll(".candle-herb-overlay, .candle-oil-overlay");
      const burn = geo?.burn;
      const pic = geo?.pic;
      overlays.forEach((overlay) => {
        if (!burn || !pic || burn.mode === "glass" || burn.mode === "none") {
          overlay.style.removeProperty("clip-path");
          return;
        }
        const half = burn.half * pic.width * 1.04;
        const cx = (geo.flame.centerX / 100) * width;
        const top = pic.top + burn.waxTop * pic.height;
        const bottom = pic.top + burn.bottom * pic.height;
        const box = { left: overlay.offsetLeft, top: overlay.offsetTop, width: overlay.offsetWidth, height: overlay.offsetHeight };
        const t = Math.max(0, top - box.top);
        const l = Math.max(0, cx - half - box.left);
        const r = Math.max(0, box.left + box.width - (cx + half));
        const b = Math.max(0, box.top + box.height - bottom);
        overlay.style.clipPath = `inset(${n2(t)}px ${n2(r)}px ${n2(b)}px ${n2(l)}px)`;
      });

      // Incense: its ember and smoke, or its ash.
      const fx = layerOf(object, "fx");
      const stickAsh = stick ? stickAshSvg(stick, width, height, !!incense?.lit) : "";
      fx.innerHTML = incense?.lit
        ? stickAsh + incenseHtml(stick?.origin ?? A.incense.smokeOrigin(saved), width)
        : incense?.ash
          ? `${stick ? stickAsh : `<div class="living-ash"></div>`}<span class="living-label">Ash</span>`
          : stickAsh;
      object.classList.toggle("is-incense-ash", !!incense?.ash);
      object.classList.toggle("is-incense-lit", !!incense?.lit);

      // The light on the altar sits lower as the candle burns down.
      if (geo) object.dataset.lightDrop = n2(height ? geo.dropPx / height : 0);
      else delete object.dataset.lightDrop;
    }

    // The flame, on its wick.
    const flameLayer = layerOf(object, "flame");
    if (isCandle && geo) {
      object.classList.add("has-living-flame");
      if (lit && !record.flame) {
        record.flame = makeFlame(flameLayer);
        flames.add(record.flame);
        drawFlame(record.flame);
        startLoop();
      }
      if (!lit && record.flame) {
        flames.delete(record.flame);
        record.flame.wrap.remove();
        record.flame = null;
      }
      if (record.flame) placeFlame(record.flame, geo.flame);
      if (record.lit && !lit) playSmoke(flameLayer, geo.flame);
    }
    record.lit = lit;
  }

  function renderAll(now = Date.now()) {
    if (!core() || !app()) return;
    app().objects().forEach((object) => render(object, now));
    // Flames whose candles left the stage.
    flames.forEach((flame) => {
      if (!flame.wrap.isConnected) flames.delete(flame);
    });
  }

  // ── One clock for every flame ───────────────────────────────────────────
  let frame = 0;
  function tick(time) {
    frame = 0;
    if (document.hidden || !flames.size) return;
    flames.forEach((flame) => {
      if (!flame.wrap.isConnected) {
        flames.delete(flame);
        return;
      }
      if (still()) {
        Object.assign(flame.values, { tall: 1, lean: 0, tremble: 1, glow: 1, tipLean: 0, tipTall: 1, skew: 0, split: 0 });
      } else flame.chains.forEach((c) => stepChain(c, flame.values, time));
      drawFlame(flame);
    });
    if (flames.size && !still()) frame = requestAnimationFrame(tick);
  }
  function startLoop() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
    if (!document.hidden) startLoop();
  });
  reduceQuery?.addEventListener?.("change", () => {
    renderAll();
    startLoop();
  });

  // ── The moment a cleansing or charge plays (StageEffects.tsx Moment) ────
  function playMoment(object, kind) {
    const stage = document.querySelector("[data-altar-stage]");
    if (!stage || !object) return;
    const s = stage.getBoundingClientRect();
    const r = object.getBoundingClientRect();
    const rect = { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
    const ms = core()?.charge?.MOMENT_MS || 2600;
    const layer = document.createElement("div");
    layer.className = `living-moment living-moment--${kind}${still() ? " is-still" : ""}`;
    layer.setAttribute("aria-hidden", "true");
    layer.style.setProperty("--ms", `${ms}ms`);
    const cx = rect.left + rect.width / 2;
    const base = rect.top + rect.height * 0.92;
    const size = Math.max(rect.width, rect.height * 0.6);
    if (kind === "moon" || kind === "sun") {
      const tone = kind === "moon" ? "206,222,255" : "255,214,140";
      const w = Math.max(rect.width * 3, 90);
      const h = Math.max(rect.height * 1.8, 90);
      layer.innerHTML = `<div class="living-moment__wash" style="left:${n2(cx - w / 2)}px;top:${n2(rect.top - h * 0.25)}px;width:${n2(w)}px;height:${n2(h)}px;--drop:${n2(-rect.height * 0.35)}px"><svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="shaft-${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(${tone})" stop-opacity="0"/><stop offset="0.5" stop-color="rgb(${tone})" stop-opacity="0.35"/><stop offset="1" stop-color="rgb(${tone})" stop-opacity="0"/></linearGradient><radialGradient id="wash-${kind}" cx="50%" cy="52%" r="50%"><stop offset="0" stop-color="rgb(${tone})" stop-opacity="0.9"/><stop offset="0.5" stop-color="rgb(${tone})" stop-opacity="0.45"/><stop offset="1" stop-color="rgb(${tone})" stop-opacity="0"/></radialGradient></defs><ellipse cx="50" cy="52" rx="49" ry="47" fill="url(#wash-${kind})"/><path d="M40 0 L60 0 L57 72 L43 72 Z" fill="url(#shaft-${kind})"/></svg></div>`;
    } else if (kind === "sound") {
      layer.innerHTML = [0, 1, 2].map((i) => `<div class="living-moment__ring" style="left:${n2(cx - size / 2)}px;top:${n2(rect.top + rect.height / 2 - size / 2)}px;width:${n2(size)}px;height:${n2(size)}px;--i:${i}"></div>`).join("");
    } else if (kind === "salt") {
      const count = 24;
      const rx = Math.max(rect.width * 0.85, 18);
      const ry = rx * 0.3;
      const grain = Math.max(3, rect.width * 0.07);
      layer.innerHTML = Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.PI / 2;
        return `<div class="living-moment__grain" style="left:${n2(cx + Math.cos(a) * rx - grain / 2)}px;top:${n2(base + Math.sin(a) * ry - grain / 2)}px;width:${n2(grain)}px;height:${n2(grain)}px;--appear:${n2(i / count)}"></div>`;
      }).join("");
    } else {
      const wisp = Math.max(28, rect.width * 1.1);
      layer.innerHTML = [0, 1, 2].map((i) => `<div class="living-moment__wisp" style="left:${n2(cx - wisp / 2)}px;top:${n2(base - wisp)}px;width:${n2(wisp)}px;height:${n2(wisp * 1.3)}px;--side:${i === 1 ? 1 : -1};--w:${n2(rect.width)}px;--h:${n2(rect.height * (0.8 + i * 0.15))}px;--i:${i}"><svg viewBox="0 0 10 13" width="100%" height="100%"><ellipse cx="5" cy="7" rx="4.5" ry="6" fill="url(#living-incense-wisp)"/></svg></div>`).join("");
    }
    ensureFlameDefs();
    stage.appendChild(layer);
    setTimeout(() => layer.remove(), ms + 300);
  }

  // ── When to draw ────────────────────────────────────────────────────────
  let queued = 0;
  function schedule() {
    if (queued) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      renderAll();
    });
  }
  function watch() {
    const stage = document.querySelector("[data-altar-stage]");
    if (!stage) return;
    new MutationObserver((mutations) => {
      if (mutations.some((m) => m.type === "attributes" || [...m.addedNodes].some((n) => n.nodeType === 1 && (n.classList?.contains("altar-object") || n.querySelector?.(".altar-object"))))) schedule();
    }).observe(stage, { childList: true, subtree: false, attributes: true, attributeFilter: ["data-lit", "data-living-state", "data-flipped", "data-color"], attributeOldValue: false });
    // Attribute changes on objects (children of the stage).
    new MutationObserver(schedule).observe(stage, { subtree: true, attributes: true, attributeFilter: ["data-lit", "data-living-state", "data-flipped", "src"] });
    stage.addEventListener("load", schedule, true);
    ["app-altar:changed", "living-object-state:changed"].forEach((name) => document.addEventListener(name, schedule));
    // Candles burn down and melt, offerings age, charges fade: look again now and then.
    setInterval(() => {
      if (!document.hidden) renderAll();
    }, 15000);
    renderAll();
  }
  if (typeof document === "undefined") { /* tests */ }
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch, { once: true });
  else watch();

  global.LivingArt = { render, renderAll, playMoment, candleGeometry, marksSvg, drawsBurnedDown, burnedPictureHtml, offeringSvg, stickPictureHtml, stickAshSvg };
  if (typeof module !== "undefined" && module.exports) module.exports = global.LivingArt;
})(typeof window !== "undefined" ? window : globalThis);
