// The website's Worker: the brand's static pages and the Expo web app, both
// from dist/ (env.ASSETS). The app is a single-page app: every app address is
// answered with its page (dist/_app/index.html, from webapp/), which loads the
// built scripts under /_expo/ and draws the screen for that address.
// worker/routing.js decides which answers.
import { decideRoute } from "./routing.js";

/** The app's page, checked every time so a release shows straight away. */
async function appShell(request, env, url) {
  const shell = await env.ASSETS.fetch(new Request(new URL("/_app/", url), { method: request.method === "HEAD" ? "HEAD" : "GET" }));
  const response = new Response(shell.body, shell);
  response.headers.set("cache-control", "no-cache");
  response.headers.set("x-content-type-options", "nosniff");
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = decideRoute(url.pathname, url.search);
    if (route.action === "redirect") return Response.redirect(new URL(route.location, url).toString(), 301);
    if (route.action === "static") return env.ASSETS.fetch(request);
    if (route.action === "static-or-app") {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    return appShell(request, env, url);
  },
};
