// saltandsovereignty.com is the brand's static pages plus the Expo web app:
// worker/routing.js decides which answers each address, and where the old
// website copies of the app's pages now lead.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = () => import("../worker/routing.js");

test("the brand's own pages stay static", async () => {
  const { decideRoute } = await load();
  for (const p of ["/", "/index.html", "/blog/herbs/sage-history.html", "/blog/website-launch.html", "/submit/", "/help/", "/privacy.html", "/submission-terms.html", "/delete-account.html", "/admin/submissions/", "/css/styles.css", "/js/site-nav.js", "/covens/guidelines/", "/covens/covens.css"]) {
    assert.deepEqual(decideRoute(p, ""), { action: "static" }, p);
  }
});

test("the app's screens, its built files and unknown paths go to the app", async () => {
  const { decideRoute } = await load();
  for (const p of ["/today", "/today/", "/altar", "/grimoire/library", "/grimoire/library/traditional:herb:rosemary", "/rituals/craft/cosmic/chart", "/coven", "/coven/c/moon/book/abc", "/more/settings/notifications", "/more/research/", "/sign-in", "/auth-callback", "/_expo/static/js/web/index-abc.js", "/more/covens/a/b"]) {
    assert.deepEqual(decideRoute(p, "?x=1"), { action: "app" }, p);
  }
  // Static first, then the app: pictures, icons, the app's offline worker and manifest.
  for (const p of ["/assets/headshot.png", "/assets/assets/altar/x.0123.webp", "/favicon.ico", "/sw.js", "/manifest.json", "/sitemap.xml", "/no-such-page"]) {
    assert.deepEqual(decideRoute(p, ""), { action: "static-or-app" }, p);
  }
});

test("old website app pages redirect to the same screen in the app", async () => {
  const { decideRoute } = await load();
  const cases = [
    ["/covens/", "", "/coven"],
    ["/covens/coven/", "?c=moon-circle&tab=book", "/coven/c/moon-circle?tab=book"],
    ["/covens/join/", "?code=AB12", "/coven/join/AB12"],
    ["/covens/join/", "?invitation=xyz", "/coven/invitation/xyz"],
    ["/covens/new/", "", "/coven/new"],
    ["/practice/", "", "/rituals/craft"],
    ["/practice/cosmic/chart/", "?tab=transits", "/rituals/craft/cosmic/chart?tab=transits"],
    ["/practice/green/garden/index.html", "", "/rituals/craft/green/garden"],
    ["/practice/hedge/ancestors/person/", "?id=p1", "/rituals/craft/hedge/ancestors/p1"],
    ["/practice/kitchen/pantry/item/", "?key=salt", "/rituals/craft/kitchen/pantry/salt"],
    ["/practice/no/such/page/", "", "/rituals/craft"],
    ["/library/", "", "/grimoire/library"],
    ["/library/entry/", "?entity=traditional%3Aherb%3Arosemary", "/grimoire/library/traditional%3Aherb%3Arosemary"],
    ["/library/closed/", "", "/grimoire/library/closed"],
    ["/divination/", "", "/rituals/divination"],
    ["/divination/draw/", "", "/rituals/divination/draw"],
    ["/divination/reading/", "?id=r1", "/rituals/divination/r1"],
    ["/sigil/", "", "/rituals/sigil"],
    ["/reminders/", "", "/more/settings/notifications"],
    ["/account/", "", "/more/account"],
    ["/account/reset-password/", "?code=c1", "/auth-callback?code=c1"],
    ["/today/holy/", "?ref=wheel-samhain", "/today/holy/wheel-samhain"],
    ["/today/holy/", "", "/today"],
    ["/grimoire/community-grimoire.html", "", "/more/community"],
    ["/grimoire/dreams/dream/", "?id=d1", "/grimoire/dreams/d1"],
    ["/grimoire/journals/journal/", "?j=moon", "/grimoire/journals/moon"],
    ["/rituals/plan/", "?id=p9", "/rituals/plan/p9"],
    ["/rituals/cycle/", "?view=settings", "/rituals/cycle/settings"],
    ["/today/today-logic.js", "", "/today"],
  ];
  for (const [p, search, location] of cases) {
    assert.deepEqual(decideRoute(p, search), { action: "redirect", location }, `${p}${search}`);
  }
  // Pages at the same address in the app are passed straight through.
  for (const p of ["/today/calendar/", "/rituals/planner/", "/rituals/cycle/", "/grimoire/year/", "/altar/", "/more/support/"]) {
    assert.deepEqual(decideRoute(p, ""), { action: "app" }, p);
  }
});

test("every old website app page has somewhere to go in the app", async () => {
  const { decideRoute, isAppRoute, REPLACED_SECTIONS, KEPT_IN_REPLACED } = await load();
  const pages = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(rel);
      else if (entry.name.endsWith(".html")) pages.push(`/${rel}`.replace(/index\.html$/, ""));
    }
  };
  REPLACED_SECTIONS.forEach(walk);
  assert.ok(pages.length > 100);
  for (const page of pages) {
    if (KEPT_IN_REPLACED.some((kept) => page.startsWith(`/${kept}`))) continue;
    const route = decideRoute(page, "");
    if (route.action === "app") continue;
    assert.equal(route.action, "redirect", page);
    assert.ok(isAppRoute(route.location.split("?")[0]), `${page} → ${route.location}`);
  }
});

test("the Worker's list of app routes matches app/src/app", async () => {
  const { appRoutesModule } = await import("../scripts/build-app-routes.mjs");
  assert.equal(fs.readFileSync(path.join(root, "worker/app-routes.js"), "utf8"), appRoutesModule(), "run node scripts/build-app-routes.mjs");
});

test("the Worker proxies app requests and redirects old ones", async () => {
  const { default: worker } = await import("../worker/index.js");
  const calls = [];
  const realFetch = global.fetch;
  global.fetch = async (url, init) => {
    calls.push([String(url), init]);
    const html = String(url).includes("/_expo/") ? "js" : "<html>";
    return new Response(html, { status: 200, headers: { "content-type": String(url).includes("/_expo/") ? "application/javascript" : "text/html" } });
  };
  const env = {
    APP_ORIGIN: "https://saltandsovereignty.expo.app",
    ASSETS: { fetch: async (request) => new Response(new URL(request.url).pathname === "/assets/headshot.png" ? "png" : "nope", { status: new URL(request.url).pathname === "/assets/headshot.png" ? 200 : 404 }) },
  };
  try {
    const page = await worker.fetch(new Request("https://saltandsovereignty.com/today?x=1", { headers: { host: "saltandsovereignty.com" } }), env);
    assert.equal(calls[0][0], "https://saltandsovereignty.expo.app/today?x=1");
    assert.equal(calls[0][1].headers.get("host"), null);
    assert.equal(page.headers.get("cache-control"), "no-cache");
    const script = await worker.fetch(new Request("https://saltandsovereignty.com/_expo/static/js/web/index-abc.js"), env);
    assert.match(script.headers.get("cache-control"), /immutable/);
    const old = await worker.fetch(new Request("https://saltandsovereignty.com/covens/coven/?c=moon"), env);
    assert.equal(old.status, 301);
    assert.equal(old.headers.get("location"), "https://saltandsovereignty.com/coven/c/moon");
    const picture = await worker.fetch(new Request("https://saltandsovereignty.com/assets/headshot.png"), env);
    assert.equal(await picture.text(), "png");
    calls.length = 0;
    await worker.fetch(new Request("https://saltandsovereignty.com/assets/assets/x.0123.png"), env);
    assert.equal(calls[0][0], "https://saltandsovereignty.expo.app/assets/assets/x.0123.png");
  } finally {
    global.fetch = realFetch;
  }
});
