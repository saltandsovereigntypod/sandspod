/*
 * Found a coven (/covens/new/): the coven's name, address, ways and how
 * witches join. The database sets up its first ranks (Seeker to the
 * founder's own title), its creed, rules and requirements pages and a
 * starter member agreement, which the founder then makes their own.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, href } = UI;
  const { header } = global.GuidesUI;

  const top = () => header({ title: "Found a coven", eyebrow: "Covens", back: "/covens/", backLabel: "Back to covens" });

  function form(context) {
    root.innerHTML = `${top()}
      <p>You’ll lead this coven as its founder. Once it’s founded you can write its creed, rules, requirements and agreements, rename its positions and add questions for people who apply.</p>
      <form class="sp-card" data-found>
        <div class="sp-field"><label for="cv-name">Coven name</label>
          <input id="cv-name" name="name" required minlength="3" maxlength="80" placeholder="The Thistle &amp; Moon Circle" /></div>
        <div class="sp-field"><label for="cv-slug">Web address</label>
          <input id="cv-slug" name="slug" required minlength="3" maxlength="60" pattern="[a-z0-9]+(-[a-z0-9]+)*" autocapitalize="none" spellcheck="false" />
          <span class="sp-caption" data-slug-preview></span></div>
        <div class="sp-field"><label for="cv-tagline">One line about the coven</label>
          <input id="cv-tagline" name="tagline" maxlength="160" placeholder="A hedge-witch circle for the new and full moons" /></div>
        <div class="sp-field"><label for="cv-description">Who you are and how you practise</label>
          <textarea id="cv-description" name="description" maxlength="5000" rows="6"></textarea></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="cv-tradition">Tradition or path (optional)</label>
            <input id="cv-tradition" name="tradition" maxlength="80" placeholder="Eclectic, Hellenic, Green…" /></div>
          <div class="sp-field"><label for="cv-rhythm">When you gather (optional)</label>
            <input id="cv-rhythm" name="meeting_rhythm" maxlength="160" placeholder="New and full moons, 8pm Eastern" /></div>
        </div>
        <div class="sp-field"><label for="cv-tags">Tags, separated by commas (optional)</label>
          <input id="cv-tags" name="tags" placeholder="beginners welcome, moon work, LGBTQ+ affirming" /></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="cv-joining">How witches join</label>
            <select id="cv-joining" name="joining">
              <option value="application">By application (you review each one)</option>
              <option value="open">Open: anyone who signs the agreements</option>
              <option value="closed">Not taking members yet</option>
            </select></div>
          <div class="sp-field"><label for="cv-visibility">Directory</label>
            <select id="cv-visibility" name="visibility">
              <option value="listed">Listed in the coven directory</option>
              <option value="unlisted">Unlisted: only people with the link</option>
            </select></div>
        </div>
        <div class="sp-field"><label for="cv-founder-rank">Your title as leader</label>
          <input id="cv-founder-rank" name="founder_rank" maxlength="60" value="High Priestess" /></div>
        <label class="cv-check"><input type="checkbox" name="guidelines" required /> <span>I’ll lead this coven by the <a href="${esc(href("/covens/guidelines/"))}" target="_blank" rel="noopener">community guidelines</a>, and I understand the Salt &amp; Sovereignty moderators can see and act on every coven.</span></label>
        <div class="sp-actions"><button class="button button--primary" type="submit">✦ Found the coven</button></div>
        <p class="cv-status" role="status" aria-live="polite" data-status></p>
      </form>`;

    const f = root.querySelector("[data-found]");
    const slug = f.elements.slug;
    const preview = f.querySelector("[data-slug-preview]");
    let slugEdited = false;
    const showPreview = () => (preview.textContent = slug.value ? `saltandsovereignty.com/covens/coven/?c=${slug.value}` : "");
    f.elements.name.addEventListener("input", () => {
      if (!slugEdited) slug.value = L.slugify(f.elements.name.value);
      showPreview();
    });
    slug.addEventListener("input", () => {
      slugEdited = true;
      slug.value = slug.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      showPreview();
    });

    f.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(f));
      const draft = { ...data, slug: L.slugify(data.slug), tags: L.parseTags(data.tags) };
      const errors = L.validateCoven(draft);
      const status = f.querySelector("[data-status]");
      if (errors.length) return UI.setStatus(status, errors.join(" "), true);
      const created = await UI.busy(f, status, () => D.createCoven(draft));
      if (created?.slug) global.location.assign(href(`/covens/coven/?c=${encodeURIComponent(created.slug)}&tab=manage`));
    });
  }

  UI.boot().then((context) => {
    if (!context.user) {
      root.innerHTML = `${top()}${UI.signInCard("found a coven")}`;
      return;
    }
    if (context.banned) {
      root.innerHTML = `${top()}${UI.bannedCard()}`;
      return;
    }
    if (!context.profile) {
      root.innerHTML = `${top()}<div data-profile></div>`;
      UI.profileForm(root.querySelector("[data-profile]"), context, { intro: "Before you found a coven, choose the name other witches will see and confirm you are 18 or older.", onSaved: () => form(context) });
      return;
    }
    form(context);
  });
})(window);
