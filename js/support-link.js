/*
 * A quiet line at the foot of heavier pages (journeys, rites, ancestors,
 * dreams) pointing to Support: the app's components/SupportLink.tsx.
 *
 *   <div data-support-link></div>
 *   <script src="/js/support-link.js"></script>
 *
 * Optional: data-support-link-label="…" for other words. It needs no other
 * script and sends nothing anywhere.
 */
(function (global) {
  const SUPPORT_HREF = "/more/support/";
  const DEFAULT_LABEL = "If this stirs up something heavy, support is here.";
  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function mount(element) {
    if (!element || element.dataset.supportLinkReady) return;
    element.dataset.supportLinkReady = "true";
    element.classList.add("support-link");
    const label = element.dataset.supportLinkLabel || DEFAULT_LABEL;
    element.innerHTML = `<a href="${SUPPORT_HREF}" style="color:var(--muted,#cabf9d);font-size:.85rem;min-height:44px;display:inline-flex;align-items:center;text-align:center;text-underline-offset:3px">${esc(label)}<span class="sr-only"> Opens crisis and support lines.</span></a>`;
    if (!element.style.display) Object.assign(element.style, { display: "flex", justifyContent: "center", padding: "8px" });
  }

  const mountAll = (doc = global.document) => doc.querySelectorAll("[data-support-link]").forEach(mount);

  global.SaltSupportLink = { SUPPORT_HREF, DEFAULT_LABEL, mount, mountAll };
  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", () => mountAll());
  else mountAll();
})(window);
