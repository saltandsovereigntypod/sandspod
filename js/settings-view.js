(function initializeLivingSettingsView(global) {
  // The same seven groups as the app's Settings: You · Your practice · Screens ·
  // Notifications & reminders · Accessibility · Covens & privacy · Account & data.
  const GROUPS = [
    ["You", ["identity", "location"]],
    ["Your practice", ["practice", "deities", "calendar"]],
    ["Screens", ["today", "book", "library", "divination", "altar"]],
    ["Notifications & reminders", ["notifications"]],
    ["Accessibility", ["accessibility"]],
    ["Covens & privacy", ["covens"]],
    ["Account & data", ["account"]],
  ];
  // Every panel, and the older families of form fields (appearance, companion,
  // objects), which now sit together in the Altar panel.
  const CATEGORIES = [...GROUPS.flatMap(([, list]) => list), "appearance", "companion", "objects"];
  const PANEL_OF = { appearance: "altar", companion: "altar", objects: "altar" };
  const panelOf = (category) => PANEL_OF[category] || category;
  // My practice and Calendar & holidays (and My path under Living Library) are the app's;
  // js/settings-more.js fills them, with the app's logic from js/core/guides.js.
  const MORE_SCRIPTS = ["/js/core/guides.js", "/js/settings-more.js"];
  let moreLoading = null;
  function loadMore(doc = document) {
    if (global.SettingsMore && global.SaltCore?.guides) return Promise.resolve(true);
    // js/core/guides.js reads the Traditional Library (js/traditional-library.js), so that comes first.
    if (!moreLoading) moreLoading = MORE_SCRIPTS.reduce((chain, src) => chain.then(() => new Promise((resolve, reject) => { if ((src.includes("guides") && global.SaltCore?.guides) || (src.includes("settings-more") && global.SettingsMore)) return resolve(); const script = doc.createElement("script"); script.src = src; script.onload = resolve; script.onerror = reject; doc.head.append(script); })), global.SaltScripts?.traditionalLibrary() || Promise.resolve()).then(() => true).catch(() => { moreLoading = null; return false; });
    return moreLoading;
  }
  const categoryForName = (name = "") => name.startsWith("library_") ? "library" : name.startsWith("companion_") ? "companion" : name.startsWith("living_state_") ? "objects" : ["preferred_name", "pronouns", "magical_name", "sanctuary_greeting_name"].includes(name) ? "identity" : ["default_altar_background"].includes(name) ? "appearance" : name === "tarot_deck" ? "divination" : "book";
  function backgroundOptions(items = [], saved = "") {
    const names = [...new Set(items.map((item) => item?.name || item?.background).filter(Boolean))];
    if (saved && !names.includes(saved)) names.unshift(saved);
    return names;
  }
  function categoryDefaults(settings, category, defaults) {
    const next = { ...settings };
    Object.keys(defaults).filter((key) => categoryForName(key) === category).forEach((key) => { next[key] = defaults[key]; });
    return next;
  }
  function isStale(token, current, dirty) { return token !== current || dirty; }
  function populateBackgroundSelect(select, saved = "") {
    if (!select) return;
    const selected = select.value || saved;
    const definitions = global.SanctuaryAssetCatalog?.getBackgrounds?.() || global.AltarBackgrounds?.getAll?.() || [];
    select.innerHTML = '<option value="">No default</option>' + backgroundOptions(definitions, selected).map((name) => `<option value="${name.replaceAll('"', '&quot;')}">${name}</option>`).join("");
    select.value = selected;
    let picker = select.parentElement.querySelector("[data-background-picker]");
    if (!picker) { picker = document.createElement("div"); picker.className = "sanctuary-background-picker"; picker.dataset.backgroundPicker = ""; picker.setAttribute("role", "radiogroup"); picker.setAttribute("aria-label", "Default Altar background"); select.after(picker); select.classList.add("sr-only"); }
    const choices = [{ name: "", thumbnailPath: "", label: "No default" }, ...definitions.map((item) => ({ name: item.name, thumbnailPath: item.thumbnailPath || item.thumbnail || item.assetPath || item.background, label: item.name }))];
    if (selected && !choices.some((item) => item.name === selected)) choices.push({ name: selected, thumbnailPath: "", label: `${selected} (currently unavailable)` });
    picker.innerHTML = choices.map((item) => `<label class="sanctuary-background-option"><input type="radio" name="background_picker" value="${item.name.replaceAll('"', '&quot;')}" ${item.name === selected ? "checked" : ""}>${item.thumbnailPath ? `<img src="${item.thumbnailPath}" alt="">` : '<span class="sanctuary-background-placeholder" aria-hidden="true">✦</span>'}<span>${item.label}</span></label>`).join("");
    picker.querySelectorAll('input[name="background_picker"]').forEach((radio) => radio.addEventListener("change", () => { select.value = radio.value; select.dispatchEvent(new Event("input", { bubbles: true })); }));
  }
  const LABELS = { identity: "Identity", location: "Location & hemisphere", practice: "Your crafts", deities: "My deities", calendar: "Calendars & holidays", today: "Today", book: "Grimoire", library: "Living Library", divination: "Divination", altar: "Altar", notifications: "Notifications & reminders", accessibility: "Accessibility", covens: "Covens & privacy", account: "Account & data" };
  // Links from elsewhere (and the app's old names for these panels) open the right one: /?sanctuary=settings&settings=today.
  const ALIASES = { appearance: "altar", companion: "altar", objects: "altar", reminders: "notifications" };
  function panelFor(name) {
    const key = ALIASES[name] || name;
    return GROUPS.some(([, list]) => list.includes(key)) ? key : null;
  }
  function select(form, category) {
    const key = panelFor(category);
    if (!form || !key) return;
    form.querySelectorAll("[data-settings-category]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.settingsCategory === key)));
    form.querySelectorAll(":scope > .settings-category").forEach((node) => { node.hidden = node.dataset.settingsPanel !== key; });
  }
  function render(panel) {
    const form = panel?.querySelector("[data-my-settings-form]");
    const asked = typeof location !== "undefined" ? new URLSearchParams(location.search).get("settings") : null;
    if (form?.dataset.categorized) return select(form, asked);
    if (!form) return;
    form.dataset.categorized = "true";
    const defaults = global.getDefaultMySettings();
    const saved = global.getLocalMySettings();
    const magical = form.querySelector('[name="magical_name"]')?.closest("label");
    magical?.insertAdjacentHTML("afterend", '<label>Greeting name<select name="sanctuary_greeting_name"><option value="preferred">Use preferred name</option><option value="magical">Use magical name</option><option value="none">Use no name</option></select></label>');
    const background = form.querySelector('[name="default_altar_background"]');
    populateBackgroundSelect(background, saved.default_altar_background);
    const nav = document.createElement("nav"); nav.className = "settings-category-nav"; nav.setAttribute("aria-label", "Settings categories");
    const labels = LABELS;
    GROUPS.forEach(([group, list]) => {
      nav.insertAdjacentHTML("beforeend", `<span class="settings-category-group">${group}</span>`);
      list.forEach((category) => nav.insertAdjacentHTML("beforeend", `<button class="button button--small button--pill" type="button" data-settings-category="${category}" aria-pressed="${category === "identity"}">${labels[category]}</button>`));
    });
    form.prepend(nav);
    const panels = GROUPS.flatMap(([, list]) => list);
    const buckets = Object.fromEntries(panels.map((category) => { const fieldset = document.createElement("fieldset"); fieldset.className = "settings-category"; fieldset.dataset.settingsPanel = category; fieldset.hidden = category !== "identity"; fieldset.innerHTML = `<legend>${labels[category]}</legend>`; form.insertBefore(fieldset, form.querySelector('button[type="submit"]')); return [category, fieldset]; }));
    [...form.querySelectorAll(":scope > label, :scope > fieldset:not(.settings-category)")].forEach((node) => { const name = node.querySelector("[name]")?.name || ""; buckets[panelOf(categoryForName(name))]?.append(node); });
    // The Altar panel: the default background, then the About sheet (the Companion and Living State panels).
    buckets.altar.querySelectorAll(":scope > fieldset > legend").forEach((legend) => {
      if (/companion/i.test(legend.textContent)) legend.textContent = "About sheet: from the Living Library";
      if (/living state/i.test(legend.textContent)) legend.textContent = "About sheet: its living state";
    });
    buckets.deities.insertAdjacentHTML("beforeend", '<p class="my-sanctuary-intro">Your patron, the gods you’ve dedicated to, and those you’re getting to know.</p><p><a class="button button--ghost" href="/more/settings/deities/">Open My deities</a></p>');
    buckets.notifications.insertAdjacentHTML("beforeend", '<p class="my-sanctuary-intro">The moon, your rituals, holidays, tending, planning, your covens, quiet hours and your calendar. The same choices as in the app, where they ring.</p><p><a class="button button--ghost" href="/reminders/">Open Notifications &amp; reminders</a></p>');
    buckets.accessibility.insertAdjacentHTML("beforeend", '<p class="my-sanctuary-intro">Text size, spacing, contrast, motion, a reading ruler and focus mode.</p><p><button class="button button--ghost" type="button" data-site-accessibility>Open Accessibility Options</button></p>');
    const user = global.getCurrentSaltUser?.() || null;
    buckets.account.innerHTML += `<div class="my-sanctuary-actions" data-account-auth-actions>${user ? '<button type="button" class="button button--ghost" data-my-sanctuary-signout>Sign Out</button>' : '<button type="button" class="button button--ghost" data-my-sanctuary-show-auth>Sign In or Create Account</button>'}</div>`;
    ["practice", "calendar", "today", "location", "covens"].forEach((key) => buckets[key].insertAdjacentHTML("beforeend", '<p class="my-sanctuary-intro" data-settings-more-loading>Opening…</p>'));
    loadMore().then((ok) => { form.querySelectorAll("[data-settings-more-loading]").forEach((node) => { if (ok) node.remove(); else node.textContent = "These settings couldn’t load just now. Please check your connection and open Settings again."; }); if (ok) return global.SettingsMore.mount({ practice: buckets.practice, calendar: buckets.calendar, library: buckets.library, today: buckets.today, location: buckets.location, divination: buckets.divination, covens: buckets.covens }); return null; }).catch((error) => console.error(error));
    global.SaltAccountDataUI?.mount?.(buckets.account, user);
    global.SanctuaryBackupUI?.mount?.(buckets.account, user);
    form.querySelectorAll("[name]").forEach((input) => { const value = saved[input.name]; if (input.type === "checkbox") input.checked = Boolean(value); else if (value != null) input.value = value; });
    const save = form.querySelector('button[type="submit"]'); save.textContent = "Save Changes"; save.disabled = true;
    const status = document.createElement("p"); status.className = "settings-save-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); status.textContent = "All changes saved."; form.append(status);
    form.addEventListener("input", () => { form.dataset.dirty = "true"; save.disabled = false; status.textContent = "Unsaved changes."; });
    nav.addEventListener("click", (event) => { const button = event.target.closest("[data-settings-category]"); if (!button) return; select(form, button.dataset.settingsCategory); buckets[button.dataset.settingsCategory].querySelector("legend")?.focus?.(); });
    form.querySelector('[name="companion_copy_grimoire_settings"]')?.addEventListener("change", (event) => { event.target.closest("fieldset")?.classList.toggle("is-copying", event.target.checked); });
    window.addEventListener("altarBackgroundsReady", () => populateBackgroundSelect(background, background?.value || saved.default_altar_background));
    if (asked && panelFor(asked)) {
      select(form, asked);
      buckets[panelFor(asked)]?.scrollIntoView?.({ block: "start" });
    }
    window.addEventListener("saltSettingsSaveState", (event) => { if (event.detail?.ok) { form.dataset.dirty = "false"; save.disabled = true; status.textContent = "Settings saved."; window.setTimeout(() => { if (form.dataset.dirty !== "true") status.textContent = "All changes saved."; }, 1800); } else { form.dataset.dirty = "true"; save.disabled = false; status.textContent = "Settings could not be saved."; } });
  }
  const api = { GROUPS, CATEGORIES, LABELS, panelFor, panelOf, MORE_SCRIPTS, loadMore, categoryForName, backgroundOptions, categoryDefaults, isStale, populateBackgroundSelect, render };
  global.LivingSettingsView = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
