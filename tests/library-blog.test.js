// The Living Library as the journal (scripts/build-library-blog.mjs): the
// generator is run into a temporary folder and every page it writes is
// checked as scripts/validate-static.js checks the committed pages, plus the
// SEO basics (one H1, unique titles and descriptions, canonical, JSON-LD) and
// that no internal link among them is broken.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
let built;
async function build() {
  if (built) return built;
  const { buildLibraryBlog, BLOG_TYPES, ORIGIN, MIN_WORDS } = await import("../scripts/build-library-blog.mjs");
  const routing = await import("../worker/routing.js");
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "library-blog-"));
  const result = buildLibraryBlog({ root, out, date: "2026-11-01" });
  const pages = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html") pages.set(`/${path.relative(out, path.dirname(full)).split(path.sep).join("/")}/`, fs.readFileSync(full, "utf8"));
    }
  };
  walk(out);
  built = { out, result, pages, BLOG_TYPES, ORIGIN, MIN_WORDS, routing };
  return built;
}

test.after(() => built && fs.rmSync(built.out, { recursive: true, force: true }));

test("every Library entry with enough to say becomes a post at /blog/<type>/<slug>/", async () => {
  const { result, pages, BLOG_TYPES, MIN_WORDS } = await build();
  for (const section of BLOG_TYPES) {
    const posts = result.posts.filter((p) => p.section === section);
    assert.ok(posts.length > 0, `no ${section.label} posts`);
    assert.ok(pages.has(`/blog/${section.dir}/`), `no /blog/${section.dir}/ index`);
  }
  assert.ok(pages.has("/blog/"));
  for (const post of result.posts) {
    assert.match(post.path, /^\/blog\/[a-z]+\/[a-z0-9-]+\/$/);
    assert.ok(pages.has(post.path), post.path);
    assert.ok(post.words >= MIN_WORDS);
  }
  for (const skipped of result.skipped) assert.ok(skipped.words < MIN_WORDS);
  assert.ok(result.skipped.length < result.posts.length / 10, "most entries are long enough to post");
  assert.equal(pages.size, result.posts.length + result.indexes.length);
  for (const [want, type] of [["/blog/herbs/rosemary/", "herb"], ["/blog/deities/hekate/", "deity"], ["/blog/crystals/amethyst/", "crystal"]]) {
    assert.equal(result.posts.find((p) => p.path === want)?.entry.type, type, want);
  }
});

test("each page loads the shared menu and has one H1, a title, a description and a canonical address", async () => {
  const { pages, ORIGIN } = await build();
  const titles = new Map();
  const descriptions = new Map();
  for (const [page, html] of pages) {
    assert.match(html, /<script src="\/js\/site-nav\.js"><\/script>/, page);
    assert.match(html, /href="\/css\/site-nav\.css"/, page);
    assert.doesNotMatch(html, /class="[^"]*\bsite-header\b/, page);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: one H1`);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && title.endsWith("| Salt &amp; Sovereignty"), `${page}: title`);
    assert.ok(description && description.length >= 70 && description.length <= 160, `${page}: description (${description?.length})`);
    assert.ok(!titles.has(title), `${page}: same title as ${titles.get(title)}`);
    assert.ok(!descriptions.has(description), `${page}: same description as ${descriptions.get(description)}`);
    titles.set(title, page);
    descriptions.set(description, page);
    assert.match(html, new RegExp(`<link rel="canonical" href="${ORIGIN}${page}" />`), page);
    assert.match(html, new RegExp(`<meta property="og:url" content="${ORIGIN}${page}" />`), page);
    for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(block[1]);
  }
});

test("posts carry the painting, structured data, the research note and a way into the app", async () => {
  const { result, pages, routing } = await build();
  const { isAppRoute } = routing;
  for (const post of result.posts) {
    const html = pages.get(post.path);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    assert.deepEqual(ld.map((d) => d["@type"]), ["Article", "BreadcrumbList"], post.path);
    assert.match(html, /Send a correction or note about/, post.path);
    assert.match(html, /href="mailto:[^"]+"/, post.path);
    const app = html.match(/href="(\/grimoire\/library\/[^"]+)">Open in the app/)?.[1];
    assert.ok(app && isAppRoute(app), `${post.path}: app link ${app}`);
    if (post.image) {
      assert.match(html, /<meta property="og:image" content="https:\/\/saltandsovereignty\.com\/assets\//, post.path);
      const img = html.match(/<figure class="lib-figure"><img src="([^"]+)" alt="([^"]+)"/);
      assert.ok(img && img[2].length > 20, `${post.path}: painting with alt text`);
      assert.ok(fs.existsSync(path.join(root, img[1])), img[1]);
    }
  }
  assert.ok(result.posts.filter((p) => p.image).length > result.posts.length / 2, "most posts have a painting");
  // The Library's own words, closed-tradition notes included.
  const hekate = pages.get("/blog/deities/hekate/");
  assert.match(hekate, /<h1>Hekate: Goddess of [^<]+, Offerings, Symbols &amp; Worship<\/h1>/);
  assert.match(pages.get("/blog/herbs/rosemary/"), /<h1>Rosemary: Magical Properties, Correspondences &amp; Uses<\/h1>/);
});

test("no internal link among the generated pages is broken", async () => {
  const { pages, routing } = await build();
  const tracked = new Set(execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean));
  const { isAppRoute } = routing;
  for (const [page, html] of pages) {
    for (const [, ref] of html.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)) {
      if (ref === "/" || isAppRoute(ref) || ref === "/blog/") continue;
      if (ref.startsWith("/blog/") && ref.endsWith("/")) assert.ok(pages.has(ref), `${page}: broken link ${ref}`);
      else assert.ok(tracked.has(ref.slice(1)) || ref === "/more/research", `${page}: missing ${ref}`);
    }
  }
});

test("index pages lazy-load their pictures and the journal leads with the hand-written posts", async () => {
  const { out, result, pages } = await build();
  for (const page of result.indexes) {
    const imgs = [...pages.get(page).matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    for (const img of imgs) assert.match(img, /loading="lazy"/, page);
  }
  const blog = pages.get("/blog/");
  const handWritten = JSON.parse(fs.readFileSync(path.join(root, "posts.json"), "utf8"));
  for (const post of handWritten) {
    assert.ok(fs.existsSync(path.join(root, post.url)), post.url);
    assert.ok(blog.includes(`href="/${post.url}"`), post.url);
  }
  const listed = JSON.parse(fs.readFileSync(path.join(out, "posts.json"), "utf8"));
  assert.equal(listed.length, handWritten.length + result.posts.length);
  assert.deepEqual(listed.slice(0, handWritten.length).map((p) => p.url).sort(), handWritten.map((p) => p.url).sort());
  assert.ok(listed.slice(handWritten.length).every((p) => p.library && p.url.startsWith("blog/")));
  execFileSync(process.execPath, ["--check", path.join(root, "js/library-blog.js")]);
});

test("the home page's journal links every section and the whole journal", async () => {
  const { result, BLOG_TYPES } = await build();
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const section = home.slice(home.indexOf('id="blog"'), home.indexOf("</section>", home.indexOf('id="blog"')));
  for (const type of BLOG_TYPES) if (result.posts.some((p) => p.section === type)) assert.ok(section.includes(`href="/blog/${type.dir}/"`), type.dir);
  assert.ok(section.includes('href="/blog/"'));
});

test("old hand-written posts a Library post replaced are gone and redirect to it", async () => {
  const { pages, routing } = await build();
  for (const [from, to] of Object.entries(routing.BLOG_REDIRECTS)) {
    assert.ok(pages.has(to), `${from} → ${to}, which isn't built`);
    assert.ok(!fs.existsSync(path.join(root, `${from.slice(1)}.html`)), `${from}.html should be deleted`);
    for (const variant of [`${from}.html`, from, `${from}/`]) {
      assert.deepEqual(routing.decideRoute(variant, ""), { action: "redirect", location: to }, variant);
    }
  }
  assert.deepEqual(routing.decideRoute("/blog/herbs/rosemary-history.html", "?ref=x"), { action: "redirect", location: "/blog/herbs/rosemary/?ref=x" });
});
