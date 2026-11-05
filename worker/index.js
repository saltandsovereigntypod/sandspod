// The website's Worker: the brand's static pages from dist/ (env.ASSETS) and
// the Expo web app, fetched from EAS Hosting (env.APP_ORIGIN) and passed
// through as if it lived here. worker/routing.js decides which answers.
import { decideRoute } from "./routing.js";

const HOP_BY_HOP = ["host", "connection", "keep-alive", "proxy-connection", "transfer-encoding", "upgrade", "te", "trailer", "cf-connecting-ip", "cf-ray", "cf-visitor", "cf-ipcountry", "x-forwarded-proto", "x-real-ip"];

async function fromApp(request, env, url) {
  const appOrigin = new URL(env.APP_ORIGIN);
  const target = new URL(`${url.pathname}${url.search}`, appOrigin);
  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP) headers.delete(name);
  headers.set("x-forwarded-host", url.host);
  const init = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
  const upstream = await fetch(target, init);

  const response = new Response(upstream.body, upstream);
  // A redirect from the app stays on this domain.
  const location = response.headers.get("location");
  if (location) {
    const moved = new URL(location, appOrigin);
    if (moved.origin === appOrigin.origin) response.headers.set("location", `${moved.pathname}${moved.search}${moved.hash}`);
  }
  if (upstream.ok && isImmutable(url.pathname)) {
    // Built scripts, styles and pictures carry their content hash in the name.
    response.headers.set("cache-control", "public, max-age=31536000, immutable");
  } else if (upstream.ok && url.pathname.startsWith("/assets/")) {
    response.headers.set("cache-control", "public, max-age=86400");
  } else if ((response.headers.get("content-type") || "").includes("text/html") || url.pathname === "/sw.js") {
    // Pages (and the offline worker) are checked every time, so a release shows straight away.
    response.headers.set("cache-control", "no-cache");
  }
  response.headers.set("x-content-type-options", "nosniff");
  return response;
}

// Content-hashed files never change; everything else from the app is kept a short while.
const HASHED = /\.[0-9a-f]{20,}\.[a-z0-9]+$/i;
function isImmutable(pathname) {
  return pathname.startsWith("/_expo/static/") || (pathname.startsWith("/assets/") && HASHED.test(pathname));
}
// How long Cloudflare's edge keeps an app answer, so EAS Hosting (free tier, rate
// limited) is asked once per edge instead of once per visitor and picture.
function edgeSeconds(url, response) {
  if (!response.ok || response.headers.has("set-cookie")) return 0;
  if (isImmutable(url.pathname)) return 31536000;
  if (url.pathname.startsWith("/assets/")) return 86400;
  if (url.pathname === "/sw.js") return 60;
  return 300; // pages: the same app shell, refreshed every few minutes after a release
}

async function fromAppCached(request, env, url, ctx) {
  if (request.method !== "GET" || typeof caches === "undefined" || !ctx) return fromApp(request, env, url);
  const cache = caches.default;
  const key = new Request(url.toString(), { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;
  const response = await fromApp(request, env, url);
  const seconds = edgeSeconds(url, response);
  if (seconds > 0 && !response.headers.get("location")) {
    const stored = response.clone();
    const copy = new Response(stored.body, stored);
    copy.headers.set("cache-control", `public, max-age=${seconds}`);
    ctx.waitUntil(cache.put(key, copy));
  }
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const route = decideRoute(url.pathname, url.search);
    if (route.action === "redirect") return Response.redirect(new URL(route.location, url).toString(), 301);
    if (route.action === "static") return env.ASSETS.fetch(request);
    if (route.action === "static-or-app" && (request.method === "GET" || request.method === "HEAD")) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    return fromAppCached(request, env, url, ctx);
  },
};
