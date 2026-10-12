const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const AltarFlame = require(path.join(__dirname, "../js/altar-flame.js"));
const AltarArtwork = require(path.join(__dirname, "../js/altar-artwork.js"));

test("vigil candles and people's own pictures keep the fixed flame", () => {
  assert.equal(AltarFlame.flameLayout("../assets/altar/objects/candles/red-candle.png", 3, AltarArtwork.candleWicks), null);
  assert.equal(AltarFlame.flameLayout("https://example.com/my-candle.png", 1.2, AltarArtwork.candleWicks), null);
});

test("a vigil-shaped wick gives exactly the CSS's fixed flame", () => {
  const layout = AltarFlame.flameLayout("candles/v/red-v.png", 1536 / 500, { v: [0.5, 0.0534] });
  assert.deepEqual(layout, {
    "--flame-x": "50.00%", "--flame-top": "-5.00%", "--flame-h": "18.00%",
    "--halo-top": "-3.00%", "--halo-h": "10.00%", "--smoke-top": "-10.00%", "--smoke-h": "22.00%"
  });
});

test("every painted candle form has a wick, and a tea light's flame sits down in its cup", () => {
  for (const form of ["tea-light", "chime", "taper", "pillar"]) assert.ok(AltarArtwork.candleWicks[form], form);
  const layout = AltarFlame.flameLayout("../assets/altar/objects/candles/tea-light/red-tea-light.png", 1, AltarArtwork.candleWicks);
  const foot = parseFloat(layout["--flame-top"]) + parseFloat(layout["--flame-h"]);
  assert.ok(foot > 40, `flame foot at ${foot}% of the box`);
});
