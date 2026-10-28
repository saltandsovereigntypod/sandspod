const test = require("node:test");
const assert = require("node:assert/strict");
const Catalog = require("../js/sanctuary-asset-catalog.js");
const FormModel = require("../js/object-form-model.js");
const fs = require("node:fs");

test("lightweight catalogue exposes unique backgrounds outside Altar", () => {
  const backgrounds = Catalog.getBackgrounds();
  assert.deepEqual(backgrounds.map((item) => item.name), ["Forest Altar", "Deity Shelf Altar"]);
  assert.equal(new Set(backgrounds.map((item) => item.id)).size, backgrounds.length);
  assert.ok(backgrounds.every((item) => item.thumbnailPath.startsWith("/assets/")));
});

test("altar backgrounds show as their WebP twins while saved altars keep the .png path", () => {
  assert.equal(Catalog.displayPath("/assets/altar/backgrounds/forest-scene.png"), "/assets/altar/backgrounds/forest-scene.webp");
  assert.equal(Catalog.displayPath("../assets/altar/backgrounds/ocean.png"), "../assets/altar/backgrounds/ocean.webp");
  assert.equal(Catalog.displayPath("https://example.supabase.co/storage/v1/object/public/x/my-room.png"), "https://example.supabase.co/storage/v1/object/public/x/my-room.png");
  assert.equal(Catalog.displayPath(""), "");
  assert.ok(Catalog.getBackgrounds().every((item) => item.assetPath.endsWith(".png") && item.thumbnailPath.endsWith(".webp")));
  const folder = "assets/altar/backgrounds";
  for (const png of fs.readdirSync(folder).filter((name) => name.endsWith(".png"))) {
    const name = png.replace(/\.png$/, "");
    assert.ok(fs.existsSync(`${folder}/${name}.webp`), `${name}.webp`);
    assert.ok(fs.existsSync(`${folder}/thumbs/${name}.webp`), `thumbs/${name}.webp`);
  }
});

test("the core bundles share the Traditional Library rather than each carrying a copy", () => {
  for (const name of ["altar", "guides", "practice-a", "practice-b", "rituals", "tend", "today"]) {
    const code = fs.readFileSync(`js/core/${name}.js`, "utf8");
    assert.doesNotMatch(code, /DisplayName:"Basil"/, name);
    assert.match(code, /Load \/js\/traditional-library\.js before this script\./, name);
  }
});

test("catalogue loads on every Sanctuary-capable page without Altar initialization", () => {
  for (const path of ["index.html", "altar/index.html", "grimoire/index.html", "grimoire/community-grimoire.html", "submit/index.html"]) {
    const html = fs.readFileSync(path, "utf8");
    assert.match(html, /sanctuary-asset-catalog\.js/);
  }
  assert.doesNotMatch(fs.readFileSync("js/sanctuary-asset-catalog.js", "utf8"), /querySelector|createElement|cabinetItems/);
});

test("catalogue describes candle, herb, and crystal forms without false images", () => {
  assert.deepEqual(Catalog.getForms("candle").map((item) => item.id), ["chime-spell", "taper", "tea-light", "pillar", "vigil"]);
  assert.ok(Catalog.getForms("herb").some((item) => item.id === "bundle"));
  assert.ok(Catalog.getForms("crystal").some((item) => item.id === "tumbled"));
  assert.equal(Catalog.getForms("candle").find((item) => item.id === "taper").supportedAsset, true);
  assert.equal(Catalog.getForms("herb").find((item) => item.id === "bundle").supportedAsset, false);
});

test("forms and instances preserve one canonical entity identity", () => {
  const library = { resolveCanonicalEntityId: (id) => id === "legacy-rosemary" ? "rosemary" : id };
  const form = FormModel.createForm({ id: "garden-bundle", category: "herb", label: "Rosemary from My Garden", entityId: "legacy-rosemary", aliases: ["garden rosemary"] }, library);
  const instance = FormModel.createInstance({ instanceId: "placed-1", customName: "Ancestor Bundle" }, form, library);
  assert.equal(form.canonicalEntityId, "rosemary");
  assert.equal(instance.canonicalEntityId, "rosemary");
  assert.equal(instance.formId, "garden-bundle");
  assert.equal(instance.formSnapshot.label, "Rosemary from My Garden");
});
