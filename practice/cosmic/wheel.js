/*
 * The chart wheel and the planetary-hour wheel as SVG, as the app draws them
 * (app/src/components/astro/ChartWheel.tsx and HourWheel.tsx). Every planet,
 * sign, house number and aspect line is a focusable button
 * ([data-wheel-point], [data-wheel-sign], [data-wheel-house],
 * [data-wheel-aspect]) that the page answers.
 */
(function (global) {
  "use strict";

  const RAD = Math.PI / 180;
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const TINT = { fire: "rgba(214,120,72,0.16)", earth: "rgba(136,150,96,0.16)", air: "rgba(170,190,210,0.12)", water: "rgba(90,140,180,0.16)" };
  const ASPECT = { soft: "#7fb0c9", hard: "#d9826a", blend: "#e2c36d", minor: "rgba(230,220,194,0.5)" };
  const POINTS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron", "North Node", "South Node", "Lilith", "Part of Fortune"];
  const f = (n) => Math.round(n * 10) / 10;

  function spread(lons, gap) {
    const order = lons.map((lon, i) => ({ lon, i })).sort((a, b) => a.lon - b.lon);
    const placed = order.map((o) => o.lon);
    for (let pass = 0; pass < 40; pass++) {
      let moved = false;
      for (let k = 0; k < placed.length; k++) {
        const next = (k + 1) % placed.length;
        let d = placed[next] - placed[k];
        if (next === 0) d += 360;
        if (placed.length > 1 && d < gap) {
          placed[k] -= (gap - d) / 2;
          placed[next] += (gap - d) / 2;
          moved = true;
        }
      }
      if (!moved) break;
    }
    const out = [];
    order.forEach((o, k) => (out[o.i] = placed[k]));
    return out;
  }

  /** The chart wheel. `outer`: positions for a second ring (transits, another chart); `aspects`: lines to draw instead of the chart's own. */
  function chart(A, c, { size = 420, outer = null, aspects = null, noAspects = false, outerLabel = "Outer" } = {}) {
    const S = A.signs;
    const cx = size / 2;
    const rOuter = cx - 2;
    const rSigns = rOuter - size * 0.085;
    const rRing = outer ? rSigns - size * 0.075 : rSigns;
    const rHouses = rRing - size * 0.055;
    const rPlanets = rHouses - size * 0.045;
    const rAspects = rHouses - size * 0.135;
    const rHouseNum = rAspects + size * 0.024;
    const asc = c.houses ? c.houses.ascendant : c.solarCusps ? c.solarCusps[0] : 0;
    const cusps = c.houses ? c.houses.cusps : c.solarCusps;
    const at = (lon, r) => {
      const t = (180 + (lon - asc)) * RAD;
      return { x: cx + r * Math.cos(t), y: cx - r * Math.sin(t) };
    };
    const arc = (from, to, r1, r2) => {
      const a = at(from, r1), b = at(to, r1), d = at(to, r2), e = at(from, r2);
      return `M${f(a.x)},${f(a.y)} A${f(r1)},${f(r1)} 0 0 0 ${f(b.x)},${f(b.y)} L${f(d.x)},${f(d.y)} A${f(r2)},${f(r2)} 0 0 1 ${f(e.x)},${f(e.y)} Z`;
    };
    const g = Math.max(13, size * 0.042);
    const natal = c.positions.filter((p) => POINTS.includes(p.point));
    const ns = spread(natal.map((p) => p.longitude), 7.5);
    const os = outer ? spread(outer.map((p) => p.longitude), 7.5) : [];
    const lonOf = (point, ring) => ((ring === "outer" ? outer : c.positions) || []).find((p) => p.point === point)?.longitude ?? null;
    const lines = noAspects ? [] : (aspects || c.aspects).filter((a) => A.aspects.aspectDef(a.aspect).major || a.orb < 1.5);
    const parts = [];
    parts.push(`<circle cx="${cx}" cy="${cx}" r="${f(rOuter)}" fill="#142219" stroke="rgba(226,195,109,0.28)"/>`);
    S.SIGNS.forEach((sign, i) => {
      const p = at(i * 30 + 15, (rOuter + rSigns) / 2);
      parts.push(
        `<g class="wheel-btn" role="button" tabindex="0" data-wheel-sign="${sign}" aria-label="${sign}"><path d="${arc(i * 30, i * 30 + 30, rOuter, rSigns)}" fill="${TINT[S.elementOf(sign)]}" stroke="rgba(226,195,109,0.28)"/><text x="${f(p.x)}" y="${f(p.y + g * 0.35)}" font-size="${f(g)}" fill="#e2c36d" text-anchor="middle">${S.SIGN_GLYPH[sign]}</text></g>`
      );
    });
    for (let i = 0; i < 36; i++) {
      const a = at(i * 10, rSigns), b = at(i * 10, rSigns - 4);
      parts.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="rgba(226,195,109,0.28)"/>`);
    }
    if (outer) parts.push(`<circle cx="${cx}" cy="${cx}" r="${f(rRing)}" fill="none" stroke="rgba(244,236,216,0.12)"/>`);
    parts.push(`<circle cx="${cx}" cy="${cx}" r="${f(rHouses)}" fill="#0c1510" stroke="rgba(226,195,109,0.28)"/>`);
    parts.push(`<circle cx="${cx}" cy="${cx}" r="${f(rAspects)}" fill="none" stroke="rgba(244,236,216,0.12)"/>`);
    (cusps || []).forEach((cusp, i) => {
      const angle = c.houses && i % 3 === 0;
      const a = at(cusp, angle ? rRing : rHouses), b = at(cusp, rAspects);
      parts.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${angle ? "#e2c36d" : "rgba(226,195,109,0.28)"}" stroke-width="${angle ? 1.5 : 0.75}"${c.houses ? "" : ' stroke-dasharray="3,3"'}/>`);
      const next = cusps[(i + 1) % 12];
      const mid = cusp + ((((next - cusp) % 360) + 360) % 360) / 2;
      const p = at(mid, rHouseNum);
      parts.push(`<g class="wheel-btn" role="button" tabindex="0" data-wheel-house="${i + 1}" aria-label="House ${i + 1}"><circle cx="${f(p.x)}" cy="${f(p.y)}" r="12" fill="transparent"/><text x="${f(p.x)}" y="${f(p.y + 4)}" font-size="${f(g * 0.62)}" fill="#cabf9d" text-anchor="middle">${i + 1}</text></g>`);
    });
    lines.forEach((a, i) => {
      const la = outer ? lonOf(a.a, "outer") ?? lonOf(a.a, "natal") : lonOf(a.a, "natal");
      const lb = lonOf(a.b, "natal");
      if (la === null || lb === null) return;
      const p = at(la, rAspects), q = at(lb, rAspects);
      const def = A.aspects.aspectDef(a.aspect);
      parts.push(
        `<g class="wheel-btn" role="button" tabindex="0" data-wheel-aspect="${i}" aria-label="${esc(`${a.a} ${a.aspect} ${a.b}`)}"><line x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" stroke="transparent" stroke-width="12"/><line x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" stroke="${ASPECT[def.tone]}" stroke-width="${def.major ? 1.2 : 0.8}" stroke-opacity="${f(Math.max(0.35, 1 - a.orb / 8))}"${def.major ? "" : ' stroke-dasharray="4,3"'}/></g>`
      );
    });
    natal.forEach((p, i) => {
      const gp = at(ns[i], rPlanets), t1 = at(p.longitude, rHouses), t2 = at(p.longitude, rHouses - 5);
      parts.push(
        `<g class="wheel-btn" role="button" tabindex="0" data-wheel-point="${esc(p.point)}" aria-label="${esc(`${p.point}, ${p.degree} degrees ${p.sign}${p.house ? `, house ${p.house}` : ""}${p.retrograde ? ", retrograde" : ""}`)}"><line x1="${f(t1.x)}" y1="${f(t1.y)}" x2="${f(t2.x)}" y2="${f(t2.y)}" stroke="#f4ecd8"/><circle cx="${f(gp.x)}" cy="${f(gp.y)}" r="${f(g * 0.75)}" fill="transparent"/><text x="${f(gp.x)}" y="${f(gp.y + g * 0.35)}" font-size="${f(g)}" fill="#f4ecd8" text-anchor="middle">${S.POINT_GLYPH[p.point]}</text>${p.retrograde ? `<text x="${f(gp.x + g * 0.6)}" y="${f(gp.y + g * 0.75)}" font-size="${f(g * 0.45)}" fill="#cabf9d">℞</text>` : ""}</g>`
      );
    });
    (outer || []).forEach((p, i) => {
      const gp = at(os[i], (rSigns + rRing) / 2);
      parts.push(`<g class="wheel-btn" role="button" tabindex="0" data-wheel-outer="${esc(p.point)}" aria-label="${esc(`${outerLabel} ${p.point}, ${p.degree} degrees ${p.sign}`)}"><circle cx="${f(gp.x)}" cy="${f(gp.y)}" r="${f(g * 0.7)}" fill="transparent"/><text x="${f(gp.x)}" y="${f(gp.y + g * 0.32)}" font-size="${f(g * 0.9)}" fill="#9fc6da" text-anchor="middle">${S.POINT_GLYPH[p.point]}</text></g>`);
    });
    if (!c.houses) parts.push(`<text x="${cx}" y="${cx + 4}" font-size="11" fill="#cabf9d" text-anchor="middle">${c.solarCusps ? "Solar chart" : "No birth time: no houses"}</text>`);
    return `<svg class="astro-wheel" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="group" aria-label="Chart wheel">${parts.join("")}</svg>`;
  }

  /** The planetary day as a wheel of its 24 hours; [data-wheel-hour] buttons. */
  function hours(A, list, now, { size = 320 } = {}) {
    const cx = size / 2, r1 = cx - 2, r2 = cx * 0.62;
    const start = list[0].start.getTime();
    const total = list[list.length - 1].end.getTime() - start;
    const ang = (t) => Math.PI - ((t - start) / total) * Math.PI * 2;
    const pt = (a, r) => ({ x: cx + r * Math.cos(a), y: cx - r * Math.sin(a) });
    const cur = list.find((h) => now >= h.start && now < h.end);
    const parts = list.map((h, i) => {
      const a0 = ang(h.start.getTime()), a1 = ang(h.end.getTime());
      const p = pt(a0, r1), q = pt(a1, r1), s = pt(a1, r2), t = pt(a0, r2);
      const large = a0 - a1 > Math.PI ? 1 : 0;
      const m = pt((a0 + a1) / 2, (r1 + r2) / 2);
      const on = h === cur;
      return `<g class="wheel-btn" role="button" tabindex="0" data-wheel-hour="${i}" aria-label="${esc(`${on ? "Now. " : ""}${h.planet} hour, ${A.calendar.timeOfDay(h.start)} to ${A.calendar.timeOfDay(h.end)}${h.night ? ", night" : ""}`)}"><path d="M${f(p.x)},${f(p.y)} A${f(r1)},${f(r1)} 0 ${large} 1 ${f(q.x)},${f(q.y)} L${f(s.x)},${f(s.y)} A${f(r2)},${f(r2)} 0 ${large} 0 ${f(t.x)},${f(t.y)} Z" fill="${on ? "#e2c36d" : h.night ? "#070a08" : "#1c2e22"}" stroke="rgba(226,195,109,0.28)"/><text x="${f(m.x)}" y="${f(m.y + 5)}" font-size="14" fill="${on ? "#102118" : h.night ? "#cabf9d" : "#f4ecd8"}" text-anchor="middle">${A.signs.POINT_GLYPH[h.planet]}</text></g>`;
    });
    let centre = `<text x="${cx}" y="${cx + 4}" font-size="12" fill="#cabf9d" text-anchor="middle">Sunrise to sunrise</text>`;
    if (cur) {
      const mins = Math.max(0, Math.round((cur.end - now) / 60000));
      centre = `<text x="${cx}" y="${cx - 14}" font-size="11" fill="#cabf9d" text-anchor="middle" letter-spacing="1.5">NOW</text><text x="${cx}" y="${cx + 10}" font-size="24" fill="#e2c36d" text-anchor="middle">${A.signs.POINT_GLYPH[cur.planet]} ${cur.planet}</text><text x="${cx}" y="${cx + 30}" font-size="12" fill="#cabf9d" text-anchor="middle">${mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`} left</text>`;
    }
    return `<svg class="astro-wheel" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="group" aria-label="Today's planetary hours">${parts.join("")}${centre}</svg>`;
  }

  global.SaltAstroWheel = { chart, hours };
})(typeof window !== "undefined" ? window : globalThis);
