// The Living Library as the website's journal: one blog post per Library
// entry (herbs, crystals, candles, deities, tools, vessels) at
// /blog/<type>/<slug>/, an A–Z page per type at /blog/<type>/, and the
// journal's front page at /blog/. Everything is built from the Library's one
// data source, js/traditional-library.js, read through the same helpers the
// website and the app use (js/core/library.js, from app/src/lib/library), so
// editing the Library changes the posts on the next deploy. Nothing here is
// committed: scripts/cloudflare-build.mjs runs this into dist/.
//
// The hand-written posts (posts.json) lead the journal; the old hand-written
// pages that a Library post replaced redirect to it (worker/routing.js
// BLOG_REDIRECTS).
//
//   node scripts/build-library-blog.mjs <out-dir>
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

export const ORIGIN = "https://saltandsovereignty.com";
const SITE = "Salt & Sovereignty";
/** Posts with fewer words than this are left out (too thin to stand alone). */
export const MIN_WORDS = 80;

/** The journal's sections, in the order the journal shows them. */
export const BLOG_TYPES = [
  { type: "herb", dir: "herbs", label: "Herbs", singular: "herb" },
  { type: "crystal", dir: "crystals", label: "Crystals", singular: "crystal" },
  { type: "deity", dir: "deities", label: "Deities", singular: "deity" },
  { type: "candle", dir: "candles", label: "Candles", singular: "candle" },
  { type: "tool", dir: "tools", label: "Tools", singular: "tool" },
  { type: "vessel", dir: "vessels", label: "Vessels", singular: "vessel" },
];

const defaultRoot = fileURLToPath(new URL("..", import.meta.url));

/** The Library's entries and the shared helpers, loaded as the website loads them. */
export function loadLibrary(root = defaultRoot) {
  const context = { console, window: {} };
  vm.createContext(context);
  for (const file of ["js/traditional-library.js", "js/core/library.js", "js/core/research.js"]) {
    vm.runInContext(readFileSync(join(root, file), "utf8"), context, { filename: file });
  }
  const { library, research } = vm.runInContext("SaltCore", context);
  const data = vm.runInContext("TraditionalLibrary", context);
  return { library, research, entries: library.entriesFromData(data) };
}

// ---------------------------------------------------------------- text

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const slugify = (value) =>
  String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const words = (text) => String(text).split(/\s+/).filter(Boolean).length;

/** Cuts text to at most `max` characters at a word, with an ellipsis if cut. */
function clip(text, max) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1).replace(/[\s,;:.–—-]+\S*$/, "");
  return `${cut}…`;
}

const sentences = (text) => String(text).replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [];

/** Fields that hold the record's bookkeeping, not its text. */
const SKIP = new Set(["DisplayName", "Category", "tags"]);
/** Short fields shown as the post's correspondences, in this order. */
const TABLE_FIELDS = ["Pantheon", "Element", "Planet", "Chakra", "Purpose", "Uses", "Domains", "UsedFor", "TraditionallyUsedFor", "BestFor", "TraditionallyMadeFrom", "CommonMaterials", "SacredSymbols", "SacredAnimals", "SacredPlants", "Herbs", "Crystals", "CandleColors", "Offerings", "PairsWith", "BestWith", "Substitutions", "Cleansing", "TypicalBurnTime", "Traditions"];
/** Of those, the ones that name other Library entries. */
const LINK_FIELDS = new Set(["SacredPlants", "Herbs", "Crystals", "CandleColors", "Offerings", "PairsWith", "BestWith", "Substitutions"]);

const LABELS = {
  UsedFor: "Used for",
  TraditionallyUsedFor: "Traditionally used for",
  BestFor: "Best for",
  TraditionallyMadeFrom: "Traditionally made from",
  CommonMaterials: "Common materials",
  SacredSymbols: "Sacred symbols",
  SacredAnimals: "Sacred animals",
  SacredPlants: "Sacred plants",
  CandleColors: "Candle colours",
  PairsWith: "Pairs well with",
  BestWith: "Best with",
  TypicalBurnTime: "Typical burn time",
  TraditionalWarnings: "A word of caution",
};
const label = (key) => LABELS[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^(.)(.*)$/, (_, a, b) => a + b.toLowerCase());

/** Each long field's heading, written as the question a reader searches for. */
function heading(key, entry) {
  const n = entry.name;
  const headings = {
    TraditionalMeaning: entry.type === "deity" ? `What ${n} stands for` : `The meaning of ${n}`,
    HowToUse: `How to use ${n}`,
    PairingNotes: `What pairs well with ${n}`,
    SubstitutionNotes: `Substitutes for ${n}`,
    CleansingNotes: `How to cleanse ${n}`,
    AlternativeColors: "Alternative colours",
    SafetyAndRespect: "Safety and respect",
    TraditionNotes: `${n} in the traditions`,
    DevotionalApproach: `Working with ${n}`,
    OfferingNotes: `Offerings for ${n}`,
    AltarIdeas: `An altar for ${n}`,
    CulturalContext: "Cultural context",
    TraditionalUse: "Traditional use",
    BurnStyle: "How it burns",
    ChoosingACandle: "Choosing a candle",
    CandleColors: "Candle colours",
    CandleTiming: "Timing your candle work",
    DressingCandles: "Dressing candles",
    CarvingCandles: "Carving candles",
    ReadingCandleBurns: "Reading a candle's burn",
    CandleSafety: "Candle safety",
    BeginnerTip: "A tip for beginners",
  };
  return headings[key] || label(key);
}

const text = (value) => (Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "");

// ---------------------------------------------------------------- pictures

/** A WebP's width and height, read from its header. */
export function webpSize(file) {
  const b = readFileSync(file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (kind === "VP8L") return { width: 1 + (((b[22] & 0x3f) << 8) | b[21]), height: 1 + (((b[24] & 0xf) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
  return null;
}

// Which form of an object best shows the entry, most preferred first.
const PREFERRED = ["loose", "sprig", "bundle", "dried", "leaves", "flowers", "tumbled", "point", "cluster", "statue", "white", ""];
const STYLE_FOLDERS = { lovers: "figure-couple" };
/** Entries whose picture lives under another name. */
const PICTURE_ALIASES = { "herb:bay": "herbs/bay-leaf", "tool:cauldron": "vessels/cauldron", "tool:cord": "tools/red-cord", "candle:_guide": "candles/taper" };

/** The entry's painting (the altar's own pictures in assets/altar/objects), or null. */
function painting(root, entry) {
  const base = join(root, "assets/altar/objects");
  const key = entry.id.split(":")[2];
  const dashed = key.replace(/^styles\./, "").replace(/_/g, "-");
  const alias = PICTURE_ALIASES[`${entry.type}:${key}`];
  const folders = alias ? [alias] : {
    herb: [`herbs/${dashed}`, `plants/${dashed}`],
    crystal: [`crystals/${dashed}`],
    deity: [`tools/deities/${key}`, `tools/deities/${dashed}`],
    candle: key.startsWith("styles.") ? [`candles/${STYLE_FOLDERS[dashed] || dashed}`] : ["candles"],
    tool: [`tools/${dashed}`],
    vessel: [`vessels/${dashed}`],
  }[entry.type] || [];
  for (const folder of folders) {
    const dir = join(base, folder);
    if (!existsSync(dir)) continue;
    let files = readdirSync(dir).filter((f) => f.endsWith(".webp") && !f.endsWith(".thumb.webp"));
    if (entry.type === "candle" && !alias && !key.startsWith("styles.")) files = files.filter((f) => f === `${dashed}-candle.webp`);
    if (!files.length) continue;
    const rank = (f) => {
      const stem = f.replace(/\.webp$/, "");
      const i = PREFERRED.findIndex((p) => (p ? stem.endsWith(`-${p}`) || stem.startsWith(`${p}-`) : true));
      return i < 0 ? PREFERRED.length : i;
    };
    files.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    const file = files[0];
    const rel = `assets/altar/objects/${folder}/${file}`;
    const stem = file.replace(/\.webp$/, "");
    const thumb = existsSync(join(dir, `${stem}.thumb.webp`)) ? `assets/altar/objects/${folder}/${stem}.thumb.webp` : rel;
    const png = readdirSync(dir).find((f) => f.toLowerCase() === `${stem}.png`);
    const size = webpSize(join(dir, file));
    const thumbSize = webpSize(join(root, thumb));
    // "rosemary-sprig" → "Rosemary sprig"; "red-taper" → "red taper".
    const form = stem.replace(new RegExp(`^${dashed}-?`), "").replace(/-/g, " ").trim();
    const what = alias ? stem.replace(/-/g, " ") : entry.type === "candle" && key.startsWith("styles.") ? `${form.split(" ")[0]} ${entry.name.toLowerCase()}` : `${entry.name}${form && !/^candle$/.test(form) ? ` ${form}` : ""}`;
    return {
      src: `/${rel}`,
      thumb: `/${thumb}`,
      og: `/${png ? `assets/altar/objects/${folder}/${png}` : rel}`,
      width: size?.width,
      height: size?.height,
      thumbWidth: thumbSize?.width,
      thumbHeight: thumbSize?.height,
      alt: `${what.charAt(0).toUpperCase()}${what.slice(1)}, a painted illustration from the Salt & Sovereignty Living Library`,
    };
  }
  return null;
}

// ---------------------------------------------------------------- the posts

/** Goddess, God or Deity, as the entry's own text speaks of them. */
function deityKind(record) {
  const prose = `${text(record.Overview)} ${text(record.TraditionalMeaning)}`;
  if (/\bgoddess\b/i.test(prose)) return "Goddess";
  if (/\bgod\b/i.test(prose)) return "God";
  const all = Object.values(record).map(text).join(" ");
  const she = (all.match(/\b(she|her|hers|herself)\b/gi) || []).length;
  const he = (all.match(/\b(he|him|his|himself)\b/gi) || []).length;
  if (she >= 3 && she > he * 2) return "Goddess";
  if (he >= 3 && he > she * 2) return "God";
  return "Deity";
}

function titleFor(entry) {
  const r = entry.traditional;
  const n = entry.name;
  const key = entry.id.split(":")[2];
  const list = (value, count) => text(value).split(",").map((s) => s.trim()).filter(Boolean).slice(0, count);
  switch (entry.type) {
    case "herb":
      return `${n}: Magical Properties, Correspondences & Uses`;
    case "crystal":
      return `${n}: Crystal Meaning, Magical Properties & Uses`;
    case "deity": {
      // "Magic, witchcraft, crossroads" → "of magic & witchcraft"; a domain that is already a pair stands alone.
      const domains = list(r.Domains, 2).map((d) => d.toLowerCase());
      const pair = domains.length > 1 && !/\band\b/.test(domains.join(" ")) ? domains.join(" & ") : domains[0];
      const of = pair ? ` of ${pair}` : "";
      return `${n}: ${deityKind(r)}${of}, Offerings, Symbols & Worship`;
    }
    case "candle":
      if (key === "_guide") return "Candle Magic: Choosing, Dressing, Carving & Reading Candles";
      if (key.startsWith("styles.")) return `${n}: Uses in Candle Magic, Burn Time & Tips`;
      return `${n}: Meaning, Correspondences & Candle Magic Uses`;
    case "tool":
      return `${n}: Meaning, Uses & Traditions in Witchcraft`;
    case "vessel":
      return `${n}: Magical Uses, Materials & Traditions`;
    default:
      return n;
  }
}

/** ~150 characters for the search result: what the entry is, then what it is for. */
function describe(entry) {
  const r = entry.traditional;
  const lead = text(r.TraditionalMeaning) || text(r.Purpose) || text(r.Overview);
  const uses = text(r.Uses || r.Domains || r.UsedFor);
  let out = `${entry.name}: ${(sentences(lead)[0] || lead).trim()}`;
  const more = [...sentences(text(r.Overview)), ...sentences(text(r.HowToUse))].map((s) => s.trim());
  if (uses) more.unshift(`Associated with ${uses.toLowerCase().replace(/\.$/, "")}.`);
  for (const s of more) {
    if (out.includes(s)) continue;
    if (out.length + s.length + 1 <= 158) out += ` ${s}`;
  }
  if (out.length < 110) out += " Meaning, uses and traditions from the Living Library.";
  return clip(out, 158);
}

function entryName(entry) {
  if (entry.id.endsWith(":_guide")) return "Candle Magic Guide";
  return entry.name;
}

/** Rich text (the Library's paragraphs, or the edited HTML of a later version) as HTML. */
function prose(library, value, linker) {
  const blocks = library.richTextBlocks(String(value));
  let html = "";
  let list = null;
  for (const block of blocks) {
    const inner = block.runs
      .map((run) => {
        let t = esc(run.text);
        if (run.bold) t = `<strong>${t}</strong>`;
        if (run.italic) t = `<em>${t}</em>`;
        return t;
      })
      .join("");
    const want = block.kind === "bullet" ? "ul" : block.kind === "number" ? "ol" : null;
    if (list && list !== want) {
      html += `</${list}>`;
      list = null;
    }
    if (want) {
      if (!list) html += `<${want}>`;
      list = want;
      html += `<li>${inner}</li>`;
    } else if (block.kind === "quote") html += `<blockquote><p>${inner}</p></blockquote>`;
    else html += `<p>${linker ? linker(inner) : inner}</p>`;
  }
  if (list) html += `</${list}>`;
  return html;
}

/**
 * Every post the Library makes: { entry, type, url, title, description, … }.
 * `skipped` lists the entries too thin to post.
 */
export function libraryPosts(lib) {
  const { library, entries } = lib;
  const posts = [];
  const skipped = [];
  for (const section of BLOG_TYPES) {
    const used = new Set();
    for (const entry of entries.filter((e) => e.type === section.type && e.traditional)) {
      const record = entry.traditional;
      const count = Object.entries(record)
        .filter(([key]) => !SKIP.has(key))
        .reduce((sum, [, value]) => sum + words(text(value)), 0);
      const name = entryName(entry);
      if (count < MIN_WORDS) {
        skipped.push({ id: entry.id, name, words: count });
        continue;
      }
      let slug = slugify(name);
      if (used.has(slug)) slug = slugify(`${name} ${entry.id.split(":")[2]}`);
      used.add(slug);
      posts.push({ entry, name, section, slug, path: `/blog/${section.dir}/${slug}/`, words: count });
    }
  }
  return { posts, skipped };
}

function pageHead({ title, description, canonical, image, type = "article", extraCss = [], jsonLd, preload }) {
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${ORIGIN}${canonical}" />
    <meta name="theme-color" content="#102118" />
    <meta property="og:site_name" content="${SITE}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${ORIGIN}${canonical}" />
    <meta property="og:locale" content="en_GB" />
${image ? `    <meta property="og:image" content="${ORIGIN}${esc(image.og)}" />\n    <meta property="og:image:alt" content="${esc(image.alt)}" />\n` : ""}    <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
${image ? `    <meta name="twitter:image" content="${ORIGIN}${esc(image.og)}" />\n` : ""}    <link rel="apple-touch-icon" href="/assets/icons/icon-192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" rel="stylesheet" />
${preload ? `    <link rel="preload" as="image" href="${esc(preload)}" fetchpriority="high" />\n` : ""}    <link rel="stylesheet" href="/css/styles.css" />
    <link rel="stylesheet" href="/css/blog.css" />
    <link rel="stylesheet" href="/css/library-blog.css" />
${extraCss.map((href) => `    <link rel="stylesheet" href="${href}" />\n`).join("")}    <link rel="stylesheet" href="/css/site-nav.css" />
${(jsonLd || []).map((data) => `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>\n`).join("")}  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <script src="/js/site-nav.js"></script>
`;
}

const pageFoot = `    <footer class="footer">
      <p>&copy; ${new Date().getUTCFullYear()} ${SITE}. All rights reserved.</p>
      <div>
        <a href="/blog/">Journal</a>
        <a href="/grimoire/library">Living Library</a>
        <a href="/#contact">Contact</a>
        <a href="/privacy.html">Privacy</a>
      </div>
    </footer>
  </body>
</html>
`;

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${ORIGIN}${path}` })),
  };
}

function breadcrumbNav(items) {
  return `<nav class="lib-crumbs" aria-label="Breadcrumb"><ol>${items
    .map(([name, path], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${path}">${esc(name)}</a></li>`))
    .join("")}</ol></nav>`;
}

function renderPost(lib, post, ctx) {
  const { library, research } = lib;
  const { entry, section, name } = post;
  const r = entry.traditional;
  const key = entry.id.split(":")[2];
  const image = post.image;
  const linkTo = (target, label = target.name) => {
    const other = ctx.byId.get(target.id);
    return other ? `<a href="${other.path}">${esc(label)}</a>` : esc(label);
  };

  // The correspondences, each named entry linked to its own post.
  const rows = [];
  for (const field of TABLE_FIELDS) {
    const value = text(r[field]);
    if (!value || value.length > 220) continue;
    let cell = esc(value);
    if (LINK_FIELDS.has(field)) {
      cell = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const target = ctx.resolve(item, entry);
          return target ? linkTo(target, item) : esc(item);
        })
        .join(", ");
    }
    rows.push(`<tr><th scope="row">${esc(label(field))}</th><td>${cell}</td></tr>`);
  }

  // The long fields, in the Library's order, each under its own heading.
  const longKeys = Object.keys(r).filter((k) => !SKIP.has(k) && !TABLE_FIELDS.includes(k) && text(r[k]));
  // Short fields that aren't correspondences go to the table too.
  const opening = text(r.TraditionalMeaning).length < 260 ? text(r.TraditionalMeaning) : "";
  const tail = longKeys.filter((k) => k !== "Overview" && k !== "TraditionalWarnings" && !(k === "TraditionalMeaning" && opening) && text(r[k]).length < 90 && !/\.\s/.test(text(r[k])));
  for (const k of tail) rows.push(`<tr><th scope="row">${esc(label(k))}</th><td>${esc(text(r[k]))}</td></tr>`);
  const sections = [];
  const overview = text(r.Overview);
  for (const k of longKeys) {
    if (k === "Overview" || k === "TraditionalWarnings" || tail.includes(k) || (k === "TraditionalMeaning" && opening)) continue;
    if (k === "SafetyAndRespect" && text(r.TraditionalWarnings)) {
      sections.push(`<h2 id="${slugify(heading(k, entry))}">${esc(heading(k, entry))}</h2>${prose(library, text(r.TraditionalWarnings))}${prose(library, text(r[k]))}`);
      continue;
    }
    if (k === "TraditionNotes") {
      const notes = text(r[k])
        .split(/\n{2,}/)
        .map((para) => {
          const m = para.match(/^([^:\n]{2,40}):\s*([\s\S]+)$/);
          return m ? `<p><strong>${esc(m[1])}:</strong> ${esc(m[2].trim())}</p>` : prose(library, para);
        })
        .join("");
      sections.push(`<h2 id="${slugify(heading(k, entry))}">${esc(heading(k, entry))}</h2>${notes}`);
      continue;
    }
    sections.push(`<h2 id="${slugify(heading(k, entry))}">${esc(heading(k, entry))}</h2>${prose(library, text(r[k]))}`);
  }
  if (!longKeys.includes("SafetyAndRespect") && text(r.TraditionalWarnings)) sections.push(`<h2 id="a-word-of-caution">A word of caution</h2>${prose(library, text(r.TraditionalWarnings))}`);

  // Connected entries: the Library's own connections, what names this entry, and what shares its planet or element.
  const groups = [];
  for (const group of library.connectionGroups(entry, ctx.entries, [])) {
    const items = group.entries.filter((e) => ctx.byId.has(e.id));
    if (items.length) groups.push([group.label, items]);
  }
  const namedBy = (ctx.namedBy.get(entry.id) || []).filter((e) => ctx.byId.has(e.id));
  for (const s of BLOG_TYPES) {
    const items = namedBy.filter((e) => e.type === s.type);
    if (items.length) groups.push([s.type === "deity" ? "Deities honoured with it" : `${s.label} that name ${name}`, items]);
  }
  for (const field of ["Planet", "Element"]) {
    const value = text(r[field]).split(/[,/]/)[0]?.trim();
    if (!value) continue;
    const same = ctx.posts.filter((p) => p !== post && text(p.entry.traditional[field]).split(/[,/]/).map((s) => s.trim()).includes(value));
    // A spread across types, a few of each, so the links stay useful.
    const picked = [];
    for (const s of BLOG_TYPES) picked.push(...same.filter((p) => p.section === s).slice(0, s.type === entry.type ? 4 : 2));
    if (picked.length) groups.push([`More ${value} correspondences`, picked.slice(0, 10).map((p) => p.entry)]);
  }
  const connected = groups
    .map(([title, items]) => `<div class="lib-connected__group"><h3>${esc(title)}</h3><ul>${items.map((e) => `<li>${linkTo(e)} <span>${esc(ctx.byId.get(e.id).section.singular)}</span></li>`).join("")}</ul></div>`)
    .join("");

  const appHref = `/grimoire/library/${entry.id}`;
  const mail = research.researchNoteUrl(name, `Living Library ${post.section.singular}`);
  const crumbs = [["Home", "/"], ["Journal", "/blog/"], [section.label, `/blog/${section.dir}/`], [name, post.path]];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: clip(post.title, 110),
      name: post.title,
      description: post.description,
      ...(image ? { image: [`${ORIGIN}${image.og}`] } : {}),
      datePublished: ctx.date,
      dateModified: ctx.date,
      inLanguage: "en-GB",
      wordCount: post.words,
      articleSection: section.label,
      keywords: (entry.tags || []).join(", "),
      author: { "@type": "Organization", name: SITE, url: `${ORIGIN}/` },
      publisher: { "@type": "Organization", name: SITE, url: `${ORIGIN}/`, logo: { "@type": "ImageObject", url: `${ORIGIN}/assets/icons/icon-512.png` } },
      mainEntityOfPage: `${ORIGIN}${post.path}`,
      about: { "@type": "Thing", name },
    },
    breadcrumbLd(crumbs),
  ];

  const isDeity = entry.type === "deity";
  return `${pageHead({ title: post.fullTitle, description: post.description, canonical: post.path, image, jsonLd, preload: image?.src })}    <main class="section blog-post-page lib-post" id="main">
      <div class="grimoire-shell">
        <aside class="grimoire-sidebar">
          <a class="grimoire-home-link" href="/blog/${section.dir}/">← All ${esc(section.label.toLowerCase())}</a>
          <h2>${esc(name)}</h2>
${rows.length ? `          <div class="sidebar-section"><h3>At a glance</h3><table class="lib-glance">${rows.join("")}</table></div>\n` : ""}          <div class="sidebar-section">
            <h3>In the app</h3>
            <p>Keep ${esc(name)} in your own Grimoire, add your notes and see everything it connects to.</p>
            <a class="button lib-app-button" href="${esc(appHref)}">Open in the app</a>
          </div>
        </aside>

        <article class="blog-post grimoire-page">
          ${breadcrumbNav(crumbs)}
          <header class="grimoire-header">
            <p class="entry-type">${esc(entry.category || section.label)}</p>
            <h1>${esc(post.title)}</h1>
            <p class="entry-date">From the Living Library · updated <time datetime="${ctx.date}">${ctx.dateLabel}</time></p>
            <div class="grimoire-divider" aria-hidden="true">✦ ☽ ✦ ☾ ✦</div>
          </header>
${image ? `          <figure class="lib-figure"><img src="${esc(image.src)}" alt="${esc(image.alt)}"${image.width ? ` width="${image.width}" height="${image.height}"` : ""} fetchpriority="high" decoding="async" /></figure>\n` : ""}${opening ? `          <blockquote class="opening-quote"><p>${esc(opening)}</p></blockquote>\n` : ""}          ${overview ? prose(library, overview) : ""}
          ${sections.join("\n          ")}
${connected ? `          <section class="lib-connected" aria-labelledby="connected-heading"><h2 id="connected-heading">Connected in the Library</h2>${connected}</section>\n` : ""}          <section class="lib-research" aria-label="${esc(research.RESEARCH_NOTE_TITLE)}">
            <p>${esc(research.RESEARCH_LINE)}</p>
            <p><a href="${esc(mail)}">Send a correction or note about ${esc(name)}</a> · <a href="${research.RESEARCH_NOTE_HREF}">${esc(research.RESEARCH_NOTE_TITLE)}</a>${isDeity ? ` · <a href="/grimoire/library/closed">Closed and living traditions</a>` : ""}</p>
          </section>
          <p class="lib-post__actions"><a class="button" href="${esc(appHref)}">Open ${esc(name)} in the app</a> <a class="text-link" href="/blog/${section.dir}/">More ${esc(section.label.toLowerCase())}</a></p>
          <a class="grimoire-home-link" href="/blog/">← Back to the Journal</a>
        </article>
      </div>
    </main>
${pageFoot}`;
}

function card(post, { lazy = true } = {}) {
  const img = post.image;
  return `<li class="lib-card" data-type="${post.section.type}" data-search="${esc(`${post.name} ${post.section.label} ${(post.entry.tags || []).join(" ")}`.toLowerCase())}"><a href="${post.path}">${
    img ? `<img src="${esc(img.thumb)}" alt=""${img.thumbWidth ? ` width="${img.thumbWidth}" height="${img.thumbHeight}"` : ""}${lazy ? ' loading="lazy"' : ""} decoding="async" />` : '<span class="lib-card__mark" aria-hidden="true">✦</span>'
  }<span class="lib-card__text"><strong>${esc(post.name)}</strong><span>${esc(clip(post.blurb, 90))}</span></span></a></li>`;
}

function renderTypeIndex(section, posts, ctx) {
  const path = `/blog/${section.dir}/`;
  const title = `${section.label} A–Z: The Living Library | ${SITE}`;
  const description = clip(`Every ${section.singular} in the Salt & Sovereignty Living Library, A to Z: ${posts.slice(0, 6).map((p) => p.name).join(", ")} and ${posts.length - 6 > 0 ? `${posts.length - 6} more` : "more"}, with meanings, correspondences and uses.`, 158);
  const crumbs = [["Home", "/"], ["Journal", "/blog/"], [section.label, path]];
  const letters = new Map();
  for (const post of posts) {
    const letter = post.name.normalize("NFKD").charAt(0).toUpperCase();
    if (!letters.has(letter)) letters.set(letter, []);
    letters.get(letter).push(post);
  }
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url: `${ORIGIN}${path}`, inLanguage: "en-GB", mainEntity: { "@type": "ItemList", numberOfItems: posts.length, itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${ORIGIN}${p.path}`, name: p.name })) } },
    breadcrumbLd(crumbs),
  ];
  return `${pageHead({ title, description, canonical: path, type: "website", jsonLd })}    <main class="section lib-index" id="main">
      <div class="lib-index__inner">
        ${breadcrumbNav(crumbs)}
        <header class="section-intro lib-index__intro">
          <p class="eyebrow">The Living Library</p>
          <h1>${esc(section.label)} A–Z</h1>
          <p>${posts.length} ${esc(section.label.toLowerCase())} from the Living Library, each with its meaning, correspondences, uses and place in the traditions.</p>
        </header>
        <nav class="lib-types" aria-label="Journal sections">${ctx.typeLinks(section.type)}</nav>
        <nav class="lib-letters" aria-label="Jump to a letter">${[...letters.keys()].map((l) => `<a href="#letter-${slugify(l) || "other"}">${esc(l)}</a>`).join("")}</nav>
${[...letters]
  .map(([letter, items]) => `        <section class="lib-letter" id="letter-${slugify(letter) || "other"}" aria-labelledby="h-letter-${slugify(letter) || "other"}"><h2 id="h-letter-${slugify(letter) || "other"}">${esc(letter)}</h2><ul class="lib-cards">${items.map((p) => card(p)).join("")}</ul></section>`)
  .join("\n")}
        <p class="lib-index__back"><a class="text-link" href="/blog/">← The whole Journal</a></p>
      </div>
    </main>
${pageFoot}`;
}

function renderBlogIndex(posts, handWritten, ctx) {
  const path = "/blog/";
  const title = `The Journal: Witchcraft, Herbs, Crystals & Deities | ${SITE}`;
  const description = `Essays, spells and the whole Living Library: ${posts.length} entries on herbs, crystals, deities, candles, tools and vessels, with meanings, correspondences and uses.`;
  const crumbs = [["Home", "/"], ["Journal", path]];
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Blog", name: `${SITE} Journal`, description, url: `${ORIGIN}${path}`, inLanguage: "en-GB", publisher: { "@type": "Organization", name: SITE, url: `${ORIGIN}/` } },
    breadcrumbLd(crumbs),
  ];
  const featured = handWritten
    .map(
      (p) => `<li class="blog-preview-card"><p class="blog-category">${esc(p.category)}</p><h3><a class="blog-card-link" href="/${esc(p.url)}">${esc(p.title)}</a></h3><p class="blog-date"><time datetime="${esc(p.date)}">${esc(longDate(p.date))}</time></p><p>${esc(p.summary)}</p></li>`,
    )
    .join("");
  const groups = BLOG_TYPES.map((s) => {
    const items = posts.filter((p) => p.section === s);
    if (!items.length) return "";
    return `        <section class="lib-group" data-group="${s.type}" aria-labelledby="group-${s.dir}"><h2 id="group-${s.dir}"><a href="/blog/${s.dir}/">${esc(s.label)}</a> <span>${items.length}</span></h2><ul class="lib-cards">${items.map((p) => card(p)).join("")}</ul></section>`;
  }).join("\n");
  return `${pageHead({ title, description, canonical: path, type: "website", jsonLd })}    <main class="section lib-index" id="main">
      <div class="lib-index__inner">
        ${breadcrumbNav(crumbs)}
        <header class="section-intro lib-index__intro">
          <p class="eyebrow">Blog</p>
          <h1>The Journal</h1>
          <p>Reflections, rituals and spellwork, and every entry in the Living Library: herbs, crystals, deities, candles, tools and vessels.</p>
        </header>
${featured ? `        <section aria-labelledby="featured-heading"><h2 id="featured-heading" class="lib-subhead">Journal entries</h2><ul class="blog-grid lib-featured">${featured}</ul></section>\n` : ""}        <section class="lib-browse" aria-labelledby="library-heading">
          <h2 id="library-heading" class="lib-subhead">From the Living Library</h2>
          <nav class="lib-types" aria-label="Journal sections">${ctx.typeLinks(null)}</nav>
          <form class="blog-tools lib-filter" role="search" data-lib-filter hidden onsubmit="return false">
            <input type="search" placeholder="Search the Library…" aria-label="Search the Living Library posts" data-lib-search />
            <select aria-label="Show one kind of entry" data-lib-type>
              <option value="">Everything</option>
${BLOG_TYPES.map((s) => `              <option value="${s.type}">${esc(s.label)}</option>`).join("\n")}
            </select>
          </form>
          <p class="blog-empty-message" data-lib-empty hidden>Nothing matches. Try another word or kind.</p>
${groups}
        </section>
      </div>
    </main>
    <script src="/js/library-blog.js" defer></script>
${pageFoot}`;
}

function longDate(iso) {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** When the Library last changed (its last commit), or today. */
function libraryDate(root) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", "js/traditional-library.js"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

/**
 * Writes the journal into `out` (dist/): the posts, the index pages and
 * posts.json (the home page's list: the hand-written posts, then the Library's).
 * Returns what it wrote, for the sitemap and the tests.
 */
export function buildLibraryBlog({ root = defaultRoot, out, date = libraryDate(root) } = {}) {
  const lib = loadLibrary(root);
  const { posts, skipped } = libraryPosts(lib);
  const byId = new Map(posts.map((p) => [p.entry.id, p]));

  // Which entries name which (a deity's herbs, a herb's pairings…), for links both ways.
  const namedBy = new Map();
  const resolve = (item, from) => {
    const clean = item.replace(/\(.*?\)/g, "").trim();
    const found = lib.library.findByName(lib.entries, clean);
    return found && found.id !== from.id ? found : null;
  };
  for (const post of posts) {
    const r = post.entry.traditional;
    for (const field of LINK_FIELDS) {
      for (const item of text(r[field]).split(",")) {
        const target = item.trim() && resolve(item.trim(), post.entry);
        if (!target || target.type === post.entry.type) continue;
        const list = namedBy.get(target.id) || [];
        if (!list.includes(post.entry)) list.push(post.entry);
        namedBy.set(target.id, list);
      }
    }
  }

  for (const post of posts) {
    post.title = titleFor({ ...post.entry, name: post.name });
    post.fullTitle = `${post.title} | ${SITE}`;
    post.description = describe({ ...post.entry, name: post.name });
    post.blurb = text(post.entry.traditional.TraditionalMeaning) || text(post.entry.traditional.Purpose) || sentences(text(post.entry.traditional.Overview))[0] || "";
    post.image = painting(root, post.entry);
  }
  const counts = Object.fromEntries(BLOG_TYPES.map((s) => [s.type, posts.filter((p) => p.section === s).length]));
  const typeLinks = (current) =>
    BLOG_TYPES.filter((s) => counts[s.type])
      .map((s) => (s.type === current ? `<a href="/blog/${s.dir}/" aria-current="page">${esc(s.label)}</a>` : `<a href="/blog/${s.dir}/">${esc(s.label)}</a>`))
      .join("");
  const ctx = { entries: lib.entries, posts, byId, namedBy, resolve, date, dateLabel: longDate(date), typeLinks };

  const write = (path, html) => {
    const file = join(out, path, "index.html");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  };
  for (const post of posts) write(post.path, renderPost(lib, post, ctx));
  const indexes = [];
  for (const section of BLOG_TYPES) {
    const items = posts.filter((p) => p.section === section);
    if (!items.length) continue;
    write(`/blog/${section.dir}/`, renderTypeIndex(section, items, ctx));
    indexes.push(`/blog/${section.dir}/`);
  }
  const handWritten = JSON.parse(readFileSync(join(root, "posts.json"), "utf8")).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  write("/blog/", renderBlogIndex(posts, handWritten, ctx));
  indexes.unshift("/blog/");

  const listed = [
    ...handWritten,
    ...posts.map((p) => ({ title: p.title, category: p.section.label, date, summary: p.description, url: p.path.slice(1), library: true })),
  ];
  writeFileSync(join(out, "posts.json"), `${JSON.stringify(listed)}\n`);

  return { posts, skipped, indexes, date, handWritten };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = process.argv[2];
  if (!out) {
    console.error("Usage: node scripts/build-library-blog.mjs <out-dir>");
    process.exit(2);
  }
  const { posts, skipped } = buildLibraryBlog({ out });
  console.log(`Library journal: ${posts.length} posts, ${skipped.length} skipped as too short`);
}
