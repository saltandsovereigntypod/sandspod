/*
 * Mentorship on the website, as the app's coven/mentorship screens have it.
 * /covens/mentorship/ is the hub: your pairings, your mentorship profile and
 * the directory (the open directory and members of your covens, filtered by
 * tradition and topics). ?id=… is one pairing: saying yes or no, its private
 * conversation, shared goals and a reading list linked into the Sanctuary,
 * check-ins, and ending it. ?coven=<slug> is a coven's own: its members who
 * mentor or are looking, and, for those who run its programs or see its
 * progress, the pairings that exist there (never their words) and pairing
 * two members. Adults only: nothing shows until you have a community profile
 * (18+) and a mentorship profile that confirms 18+ and the boundaries. The
 * rules are the app's (SaltCore.together.mentorship); the database decides.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const { header } = global.GuidesUI;
  const T = global.SaltCore.together;
  const M = T.mentorship;
  const params = new URLSearchParams(global.location.search);
  const pairId = /^[0-9a-f-]{36}$/i.test(params.get("id") || "") ? params.get("id") : null;
  const covenSlug = params.get("coven") || null;

  let context = null;
  let listing = null;
  const db = () => global.db;
  const rpc = async (name, args) => {
    const { data, error } = await db().rpc(name, args);
    if (error) throw new Error(error.message);
    return data;
  };
  const rows = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  };
  const ring = (body) => db().functions.invoke("coven-notify", { body }).catch(() => {});
  const notify = (m, event) => (m?.id ? ring({ mentorship_id: m.id, event }) : null);
  const nameOf = (id) => UI.nameOf(context, id);
  const status = (message) => {
    const el = root.querySelector("[data-mt-status]");
    if (el) el.textContent = message || "";
  };
  async function attempt(work) {
    status("");
    try {
      return await work();
    } catch (error) {
      status(error?.message || "Something went wrong. Please try again.");
      return null;
    }
  }
  const statusLine = `<p class="cv-status" role="status" aria-live="polite" data-mt-status></p>`;
  const boundaries = () => M.BOUNDARIES.map((l) => `<p class="sp-caption">${esc(l)}</p>`).join("");
  const chips = (name, options, chosen) =>
    `<div class="tg-chips" role="group" aria-label="${esc(name)}">${options.map((o) => `<button type="button" class="tg-chip" data-chip="${esc(name)}" data-v="${esc(o.id)}" aria-pressed="${chosen.includes(o.id)}">${esc(o.label)}</button>`).join("")}</div>`;
  const standing = () => M.myStanding({ signedIn: !!context.user, profile: context.profile, banned: context.banned, listing });

  function gate() {
    const s = standing();
    if (s === "ok" || s === "setup") return "";
    if (s === "sign-in") return `<div class="sp-card"><p>${esc(M.STANDING_WORDS["sign-in"])}</p><a class="button button--primary" href="/?sanctuary=auth">Sign in</a></div>`;
    if (s === "profile") return `<p class="sp-notice">${esc(M.STANDING_WORDS.profile)}</p><div data-mt-profile></div>`;
    return `<p class="sp-notice">${esc(M.STANDING_WORDS.banned)}</p>`;
  }

  // ─── The mentorship profile ─────────────────────────────────────────────

  function listingForm(existing) {
    const l = M.cleanListing(existing || { in_covens: true });
    const check = (name, label, on) => `<label class="cv-check"><input type="checkbox" name="${name}" ${on ? "checked" : ""} /> <span>${esc(label)}</span></label>`;
    return `<form class="sp-card" data-mt-listing>
        ${check("offers", "I offer to mentor", l.offers)}
        ${check("seeks", "I’m looking for a mentor", l.seeks)}
        <p class="sp-caption">Traditions (none chosen means any)</p>${chips("traditions", M.MENTOR_TRADITIONS, l.traditions)}
        <p class="sp-caption">Topics</p>${chips("topics", M.MENTOR_TOPICS, l.topics)}
        <div class="sp-field"><label for="mt-about">A little about you and what you hope for (optional)</label><textarea id="mt-about" name="about" maxlength="${M.ABOUT_MAX}">${esc(l.about || "")}</textarea></div>
        ${check("in_directory", "Show me in the open directory", l.in_directory)}
        ${check("in_covens", "Show me to members of my covens", l.in_covens)}
        ${
          existing
            ? ""
            : `<h3>Boundaries</h3>${boundaries()}<label class="cv-check"><input type="checkbox" name="adult" required /> <span>I am 18 or older</span></label>
               <label class="cv-check"><input type="checkbox" name="agreed" required /> <span>I have read and agree to the boundaries</span></label>`
        }
        <div class="sp-actions"><button class="button button--primary" type="submit">${existing ? "Save" : "Set up my mentorship profile"}</button>${existing ? `<button class="button button--ghost" type="button" data-mt-remove-listing>Take my mentorship profile down</button>` : ""}</div>
      </form>`;
  }

  function wireListing(onSaved) {
    const form = root.querySelector("[data-mt-listing]");
    if (!form) return;
    form.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-chip]");
      if (chip) chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const f = form.elements;
      if (!listing && (!f.adult?.checked || !f.agreed?.checked)) return status("Mentorship is for adults who agree to the boundaries.");
      const picked = (name) => [...form.querySelectorAll(`[data-chip="${name}"][aria-pressed="true"]`)].map((b) => b.dataset.v);
      const clean = M.cleanListing({ offers: f.offers.checked, seeks: f.seeks.checked, traditions: picked("traditions"), topics: picked("topics"), about: f.about.value, in_directory: f.in_directory.checked, in_covens: f.in_covens.checked });
      const me = context.user.id;
      const now = new Date().toISOString();
      const saved = await attempt(() =>
        listing
          ? rows(db().from("mentor_listings").update(clean).eq("user_id", me).select().single())
          : rows(db().from("mentor_listings").insert({ ...clean, user_id: me, adult_confirmed_at: now, boundaries_agreed_at: now }).select().single())
      );
      if (saved) {
        listing = saved;
        status("Saved.");
        onSaved();
      }
    });
    form.querySelector("[data-mt-remove-listing]")?.addEventListener("click", async () => {
      if (!(await UI.confirmAction("Take your mentorship profile down?", "You won’t show in the directory, and the directory won’t show to you, until you set it up again.", "Take it down"))) return;
      if (await attempt(() => rows(db().from("mentor_listings").delete().eq("user_id", context.user.id)))) {
        listing = null;
        onSaved();
      }
    });
  }

  function listingCard(l, want, covenId) {
    const as = want === "mentor" ? "mentee" : "mentor";
    return `<article class="sp-card" data-listing="${esc(l.user_id)}">
        <h3>${esc(nameOf(l.user_id))}</h3>
        <p class="sp-caption">${esc(M.listingLine(l))}</p>
        ${l.topics.length ? `<p class="sp-caption">${esc(l.topics.map(M.topicLabel).join(" · "))}</p>` : ""}
        ${l.about ? `<p>${esc(l.about)}</p>` : ""}
        ${
          M.canAsk(l, as)
            ? `<details><summary>${as === "mentee" ? "Ask them to mentor you" : "Offer to mentor them"}</summary>
                <form data-ask="${esc(l.user_id)}" data-as="${as}" data-coven="${esc(covenId || "")}"><div class="sp-field"><label for="mt-note-${esc(l.user_id)}">A short note (optional)</label><textarea id="mt-note-${esc(l.user_id)}" name="note" maxlength="${M.NOTE_MAX}"></textarea></div>
                <div class="sp-actions"><button class="button button--primary" type="submit">Ask</button></div></form></details>`
            : ""
        }
        <p><button type="button" class="tg-link" data-report-person="${esc(l.user_id)}">Report</button></p>
      </article>`;
  }

  function wireAsk(reload) {
    root.querySelectorAll("[data-ask]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const m = await attempt(() => rpc("ask_mentorship", { p_other: form.dataset.ask, p_as: form.dataset.as, p_coven: form.dataset.coven || null, p_note: form.elements.note.value.trim() || null }));
        if (!m) return;
        notify(m, "asked");
        status("Asked. You’ll hear when they answer.");
        reload();
      })
    );
    root.querySelectorAll("[data-report-person]").forEach((b) => b.addEventListener("click", () => UI.report({ target_type: "member", target_user_id: b.dataset.reportPerson, label: nameOf(b.dataset.reportPerson) })));
  }

  // ─── The hub ────────────────────────────────────────────────────────────

  const filter = { want: "mentor", tradition: null, topics: [], query: "" };
  let hubWired = false;
  let drawDirectory = null;

  async function hub() {
    const s = standing();
    let pairings = [];
    let listings = [];
    if (s === "ok") {
      [pairings, listings] = await Promise.all([
        rows(db().from("mentorships").select("*").order("created_at", { ascending: false }).limit(200)).catch(() => []),
        rows(db().from("mentor_listings").select("*").order("updated_at", { ascending: false }).limit(500)).catch(() => []),
      ]);
      await UI.loadNames(context, [...pairings.flatMap((m) => [m.mentor_id, m.mentee_id]), ...listings.map((l) => l.user_id)]);
    }
    const draw = () => {
      const shown = M.filterDirectory(listings, filter, context.user?.id, context.blocks || [], (id) => (context.names.get(id)?.display_name || ""));
      root.querySelector("[data-mt-directory]").innerHTML = shown.length ? shown.map((l) => listingCard(l, filter.want, null)).join("") : `<p class="sp-caption">No one matches just now. Try fewer topics, or come back later.</p>`;
      wireAsk(hub);
    };
    root.innerHTML = `${header({ title: "Mentorship", eyebrow: "Covens", back: "/covens/", backLabel: "Covens" })}
      <p>An experienced witch who shares what they know, and someone learning who asks: a pairing with its own private conversation, shared goals and reading, and check-ins. Adults only, on both sides.</p>
      ${gate()}
      ${s === "setup" ? `<section class="sp-section"><h2 class="sp-label">Your mentorship profile</h2><p class="sp-caption">${esc(M.STANDING_WORDS.setup)}</p>${listingForm(null)}</section>` : ""}
      ${
        s === "ok"
          ? `${
              pairings.length
                ? `<section class="sp-section"><h2 class="sp-label">Your pairings</h2><ul class="sp-list">${M.sortPairings(pairings, context.user.id)
                    .map((m) => `<li><a href="/covens/mentorship/?id=${esc(m.id)}">${esc(M.pairingLine(m, context.user.id, nameOf))}</a></li>`)
                    .join("")}</ul></section>`
                : ""
            }
            <section class="sp-section"><h2 class="sp-label">Directory</h2>
              <div class="tg-chips" role="radiogroup" aria-label="Looking for">${[["mentor", "Find a mentor"], ["mentee", "Find someone to mentor"]].map(([v, l]) => `<button type="button" class="tg-chip" data-want="${v}" aria-pressed="${filter.want === v}">${l}</button>`).join("")}</div>
              <p class="sp-caption">Tradition</p>${chips("tradition", M.MENTOR_TRADITIONS, filter.tradition ? [filter.tradition] : [])}
              <p class="sp-caption">Topics</p>${chips("topic", M.MENTOR_TOPICS, filter.topics)}
              <div class="sp-field"><label for="mt-search">Search</label><input id="mt-search" data-mt-search value="${esc(filter.query)}" /></div>
              <div data-mt-directory></div></section>
            <details class="sp-details"><summary>Your mentorship profile</summary>${listingForm(listing)}</details>
            <section class="sp-section"><h2 class="sp-label">Boundaries</h2>${boundaries()}</section>`
          : ""
      }
      ${statusLine}`;
    const holder = root.querySelector("[data-mt-profile]");
    if (holder) UI.profileForm(holder, context, { onSaved: () => hub() });
    wireListing(hub);
    if (s !== "ok") return;
    drawDirectory = draw;
    draw();
    root.querySelector("[data-mt-search]").addEventListener("input", (event) => {
      filter.query = event.target.value;
      draw();
    });
    if (hubWired) return;
    hubWired = true;
    root.addEventListener("click", (event) => {
      if (!root.querySelector("[data-mt-directory]")) return;
      const want = event.target.closest("[data-want]");
      const chip = event.target.closest('[data-chip="tradition"], [data-chip="topic"]');
      if (want) {
        filter.want = want.dataset.want;
        root.querySelectorAll("[data-want]").forEach((b) => b.setAttribute("aria-pressed", String(b === want)));
        drawDirectory?.();
      } else if (chip) {
        const v = chip.dataset.v;
        if (chip.dataset.chip === "tradition") {
          filter.tradition = filter.tradition === v ? null : v;
          root.querySelectorAll('[data-chip="tradition"]').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === filter.tradition)));
        } else {
          filter.topics = filter.topics.includes(v) ? filter.topics.filter((t) => t !== v) : [...filter.topics, v];
          chip.setAttribute("aria-pressed", String(filter.topics.includes(v)));
        }
        drawDirectory?.();
      }
    });
  }

  // ─── One pairing ────────────────────────────────────────────────────────

  async function pairing() {
    const me = context.user?.id;
    if (!me) return hub();
    const m = await rows(db().from("mentorships").select("*").eq("id", pairId).maybeSingle()).catch(() => null);
    if (!m) {
      root.innerHTML = `${header({ title: "Mentorship", eyebrow: "Covens", back: "/covens/mentorship/", backLabel: "Mentorship" })}<p class="sp-notice">That mentorship wasn’t found.</p>`;
      return;
    }
    const [messages, items, checkins, coven] = await Promise.all([
      rows(db().from("mentorship_messages").select("*").eq("mentorship_id", m.id).order("created_at", { ascending: true }).limit(500)).catch(() => []),
      rows(db().from("mentorship_items").select("*").eq("mentorship_id", m.id)).catch(() => []),
      rows(db().from("mentorship_checkins").select("*").eq("mentorship_id", m.id).order("created_at", { ascending: false }).limit(50)).catch(() => []),
      m.coven_id ? rows(db().from("covens").select("name,slug").eq("id", m.coven_id).maybeSingle()).catch(() => null) : null,
    ]);
    await UI.loadNames(context, [m.mentor_id, m.mentee_id]);
    const stage = M.stageOf(m, me);
    const other = M.otherOf(m, me);
    const role = M.roleOf(m, me);
    const active = stage === "active";
    const blocks = new Set(context.blocks || []);
    const covenLink = coven ? { slug: coven.slug, siteHref: (tab) => `/covens/coven/?c=${encodeURIComponent(coven.slug)}&tab=${tab}` } : null;
    const itemList = (kind, title) => {
      const list = M.itemsOf(items, kind);
      return `<section class="sp-section"><h2 class="sp-label">${esc(title)}</h2>
        ${list.length ? "" : `<p class="sp-caption">${kind === "goal" ? "Nothing set yet. What would you like to work towards?" : "Nothing yet. Add a journey, a Library entry, a course or a page to read together."}</p>`}
        ${list
          .map((it) => {
            const to = M.itemHref(it.link, false, covenLink);
            return `<div class="tg-item"><label class="cv-check"><input type="checkbox" data-tick="${esc(it.id)}" ${it.done_at ? "checked" : ""} ${active ? "" : "disabled"} /> <span>${esc(it.title)}</span></label>
              ${it.detail ? `<p class="sp-caption">${esc(it.detail)}</p>` : ""}
              ${to && it.link ? `<a href="${esc(to)}">Open: ${esc(T.courseLinkLabel(it.link))}</a> ` : ""}${active ? `<button type="button" class="tg-link" data-remove-item="${esc(it.id)}">Remove</button>` : ""}</div>`;
          })
          .join("")}
        ${
          active
            ? `<details><summary>${kind === "goal" ? "Add a goal" : "Add to the reading list"}</summary><form data-add-item="${kind}">
                <div class="sp-field"><label for="mt-title-${kind}">${kind === "goal" ? "The goal" : "What to read or study"}</label><input id="mt-title-${kind}" name="title" maxlength="200" /></div>
                <div class="sp-field"><label for="mt-detail-${kind}">More about it (optional)</label><textarea id="mt-detail-${kind}" name="detail" maxlength="1000"></textarea></div>
                <div class="sp-field"><label for="mt-link-${kind}">Link it to (optional): search journeys and pages</label><input id="mt-link-${kind}" data-link-search="${kind}" autocomplete="off" /></div>
                <div class="tg-chips" data-link-choices="${kind}"></div>
                <div class="sp-actions"><button class="button button--primary" type="submit">Add</button></div></form></details>`
            : ""
        }</section>`;
    };

    root.innerHTML = `${header({ title: "Mentorship", eyebrow: "Covens", back: "/covens/mentorship/", backLabel: "Mentorship" })}
      <h2>${esc(M.pairingLine(m, me, nameOf))}</h2>
      ${coven ? `<p class="sp-caption">Through <a href="/covens/coven/?c=${esc(encodeURIComponent(coven.slug))}">${esc(coven.name)}</a>. Its leaders can see that this pairing exists, never what is said in it.</p>` : ""}
      ${m.note ? `<article class="sp-card"><p class="sp-caption">${m.paired_by && m.paired_by !== me ? "The coven’s note" : "The note with the ask"}</p><p>${esc(m.note)}</p></article>` : ""}
      ${
        stage === "waiting-me"
          ? `<article class="sp-card"><p>${esc(role === "mentor" ? `Would you like to mentor ${nameOf(other)}?` : `Would you like ${nameOf(other)} as your mentor?`)} It begins only when you both say yes.</p>${boundaries()}
              <div class="sp-actions"><button class="button button--primary" type="button" data-answer="yes">Yes</button><button class="button button--ghost" type="button" data-answer="no">No, thank you</button></div></article>`
          : ""
      }
      ${stage === "waiting-them" ? `<p class="sp-notice">Waiting for ${esc(nameOf(other))} to say yes.</p>` : ""}
      ${stage === "ended" || stage === "declined" ? `<p class="sp-notice">This mentorship is over. What you shared stays here for you both to read.</p>` : ""}
      ${
        active || stage === "ended"
          ? `${active && M.checkinDue(m, checkins) ? `<p class="sp-notice">It has been a while. A check-in keeps you both in step.</p>` : ""}
            ${itemList("goal", "Goals")}
            ${itemList("reading", "Reading and study")}
            <section class="sp-section"><h2 class="sp-label">Check-ins</h2>
              ${checkins.map((c) => `<article class="sp-card"><p class="sp-caption">${esc(nameOf(c.user_id))} · ${esc(new Date(c.created_at).toLocaleDateString())}</p><p>${prose(c.body)}</p></article>`).join("")}
              ${active ? `<form data-checkin><div class="sp-field"><label for="mt-checkin">How it’s going: what you’ve tried, what you’d like next</label><textarea id="mt-checkin" name="body" maxlength="${M.CHECKIN_MAX}"></textarea></div><div class="sp-actions"><button class="button button--ghost" type="submit">Check in</button></div></form>` : ""}</section>
            <section class="sp-section"><h2 class="sp-label">Conversation</h2><p class="sp-caption">Only the two of you read this.</p>
              <div class="tg-chat">${messages
                .filter((x) => !blocks.has(x.user_id))
                .map((x) => `<div class="tg-message${x.user_id === me ? " is-mine" : ""}"><strong>${esc(x.user_id === me ? "You" : nameOf(x.user_id))}</strong>${esc(x.body)}${x.user_id !== me ? `<div><button type="button" class="tg-link" data-report-message="${esc(x.id)}">Report</button></div>` : ""}</div>`)
                .join("")}</div>
              ${active ? `<form data-say><div class="sp-field"><label for="mt-say">Write to them</label><textarea id="mt-say" name="body" maxlength="${M.MESSAGE_MAX}"></textarea></div><div class="sp-actions"><button class="button button--primary" type="submit">Send</button></div></form>` : ""}</section>`
          : ""
      }
      <section class="sp-section"><h2 class="sp-label">Safety</h2>${boundaries()}
        <div class="sp-actions">${m.status === "proposed" || active ? `<button class="button button--ghost" type="button" data-end>${active ? "End the mentorship" : "Withdraw"}</button>` : ""}
          <button class="button button--ghost" type="button" data-report-pair>Report ${esc(nameOf(other))}</button>
          ${blocks.has(other) ? "" : `<button class="button button--ghost" type="button" data-block>Block ${esc(nameOf(other))}</button>`}</div></section>
      ${statusLine}`;

    const again = () => pairing();
    root.querySelectorAll("[data-answer]").forEach((b) =>
      b.addEventListener("click", async () => {
        const row = await attempt(() => rpc("answer_mentorship", { p_mentorship: m.id, p_yes: b.dataset.answer === "yes" }));
        if (row?.status === "active") notify(row, "accepted");
        else if (row?.status === "declined") notify(row, "declined");
        if (row) again();
      })
    );
    root.querySelector("[data-end]")?.addEventListener("click", async () => {
      if (!(await UI.confirmAction(active ? "End this mentorship?" : "Withdraw?", "Either of you can end a mentorship at any time. Its conversation, goals and check-ins stay readable to you both.", active ? "End it" : "Withdraw"))) return;
      const row = await attempt(() => rpc("end_mentorship", { p_mentorship: m.id }));
      if (row) {
        notify(row, "ended");
        again();
      }
    });
    root.querySelector("[data-report-pair]")?.addEventListener("click", () => UI.report({ target_type: "mentorship", target_id: m.id, label: nameOf(other) }));
    root.querySelectorAll("[data-report-message]").forEach((b) => b.addEventListener("click", () => UI.report({ target_type: "mentorship_message", target_id: b.dataset.reportMessage, label: "this message" })));
    root.querySelector("[data-block]")?.addEventListener("click", async () => {
      if (!(await UI.confirmAction(`Block ${nameOf(other)}?`, "Blocking ends the mentorship, and you won’t see their messages anywhere.", "Block"))) return;
      if ((await attempt(() => D.block(me, other))) !== null) {
        context.blocks = await D.myBlocks(me).catch(() => context.blocks);
        again();
      }
    });
    root.querySelectorAll("[data-tick]").forEach((box) =>
      box.addEventListener("change", () => attempt(() => rows(db().from("mentorship_items").update({ done_at: box.checked ? new Date().toISOString() : null }).eq("id", box.dataset.tick).select().single())))
    );
    root.querySelectorAll("[data-remove-item]").forEach((b) => b.addEventListener("click", async () => (await attempt(() => rows(db().from("mentorship_items").delete().eq("id", b.dataset.removeItem)))) !== null && again()));
    const picked = {};
    root.querySelectorAll("[data-link-search]").forEach((input) => {
      const kind = input.dataset.linkSearch;
      const holder = root.querySelector(`[data-link-choices="${kind}"]`);
      const draw = () => {
        const choices = M.linkChoices(input.value, T.JOURNEY_CATALOG, !!coven, 6);
        holder.innerHTML = choices.map((c, i) => `<button type="button" class="tg-chip" data-pick="${i}" aria-pressed="${picked[kind]?.kind === c.kind && picked[kind]?.id === c.id}">${esc(T.courseLinkLabel(c))}</button>`).join("");
        holder.querySelectorAll("[data-pick]").forEach((b) =>
          b.addEventListener("click", () => {
            const c = choices[Number(b.dataset.pick)];
            picked[kind] = picked[kind]?.kind === c.kind && picked[kind]?.id === c.id ? null : c;
            draw();
          })
        );
      };
      input.addEventListener("input", draw);
      draw();
    });
    root.querySelectorAll("[data-add-item]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const kind = form.dataset.addItem;
        const link = M.cleanLink(picked[kind]);
        const title = form.elements.title.value.trim() || (link ? T.courseLinkLabel(link) : "");
        if (!title) return status("Give it a name, or choose a link.");
        if (await attempt(() => rows(db().from("mentorship_items").insert({ mentorship_id: m.id, created_by: me, kind, title, detail: form.elements.detail.value.trim() || null, link }).select().single()))) again();
      })
    );
    root.querySelector("[data-checkin]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = event.target.elements.body.value.trim();
      if (!body) return;
      const row = await attempt(() => rows(db().from("mentorship_checkins").insert({ mentorship_id: m.id, user_id: me, body }).select().single()));
      if (row) {
        ring({ mentorship_checkin_id: row.id });
        again();
      }
    });
    root.querySelector("[data-say]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = event.target.elements.body.value.trim();
      if (!body) return;
      const row = await attempt(() => rows(db().from("mentorship_messages").insert({ mentorship_id: m.id, user_id: me, body }).select().single()));
      if (row) {
        ring({ mentorship_message_id: row.id });
        again();
      }
    });
  }

  let following = null;
  function followPairing() {
    if (following || !pairId || !context.user) return;
    let timer = null;
    const soon = () => {
      // Not while someone is typing: the next change brings it in.
      if (global.document.activeElement?.matches?.("textarea, input")) return;
      global.clearTimeout(timer);
      timer = global.setTimeout(() => pairing().catch(() => {}), 300);
    };
    following = db().channel(`mentorship:${pairId}`);
    following.on("postgres_changes", { event: "*", schema: "public", table: "mentorship_messages", filter: `mentorship_id=eq.${pairId}` }, soon);
    following.on("postgres_changes", { event: "*", schema: "public", table: "mentorships", filter: `id=eq.${pairId}` }, soon);
    following.subscribe();
  }

  // ─── A coven's own ──────────────────────────────────────────────────────

  async function covenPage() {
    const coven = await D.coven(covenSlug).catch(() => null);
    const top = header({ title: "Mentorship", eyebrow: coven?.name || "Covens", back: coven ? `/covens/coven/?c=${encodeURIComponent(coven.slug)}&tab=members` : "/covens/", backLabel: coven ? coven.name : "Covens" });
    if (!coven || !context.user) {
      root.innerHTML = `${top}${coven ? gate() : `<p class="sp-notice">That coven wasn’t found.</p>`}`;
      return;
    }
    const state = await UI.loadAccess({ context, coven });
    const members = ((await D.members(coven.id).catch(() => [])) || []).filter((x) => x.status === "active");
    await UI.loadNames(context, members.map((x) => x.user_id));
    const ids = new Set(members.map((x) => x.user_id));
    const s = standing();
    const listings = s === "ok" ? (await rows(db().from("mentor_listings").select("*").limit(500)).catch(() => [])).filter((l) => ids.has(l.user_id)) : [];
    const leads = state.perms.programs || state.perms.progress;
    const pairs = leads ? await rpc("coven_mentorship_pairs", { p_coven: coven.id }).catch(() => []) : [];
    await UI.loadNames(context, pairs.flatMap((p) => [p.mentor_id, p.mentee_id]));
    let want = "mentor";
    const opts = members.map((x) => `<option value="${esc(x.user_id)}">${esc(nameOf(x.user_id))}</option>`).join("");
    root.innerHTML = `${top}
      <p>Members who mentor, and members looking for a mentor. A pairing has its own private conversation; the coven’s leaders see only that it exists. Adults only, on both sides.</p>
      ${s === "ok" ? "" : s === "setup" ? `<p class="sp-notice">${esc(M.STANDING_WORDS.setup)}</p><p><a class="button button--primary" href="/covens/mentorship/">Open Mentorship</a></p>` : gate()}
      ${
        s === "ok"
          ? `<section class="sp-section"><h2 class="sp-label">In this coven</h2>
              <div class="tg-chips" role="radiogroup" aria-label="Show">${[["mentor", "Mentors here"], ["mentee", "Looking for a mentor"]].map(([v, l]) => `<button type="button" class="tg-chip" data-want="${v}" aria-pressed="${v === want}">${l}</button>`).join("")}</div>
              <div data-mt-here></div><p><a href="/covens/mentorship/">Your pairings and the open directory</a></p></section>`
          : ""
      }
      ${
        leads
          ? `<section class="sp-section"><h2 class="sp-label">Pairings in the coven</h2><p class="sp-caption">You see that a pairing exists, never its conversation, goals or check-ins. Either of the pair can end it at any time.</p>
              ${pairs.length ? pairs.map((p) => `<article class="sp-card"><p>${esc(nameOf(p.mentor_id))} mentoring ${esc(nameOf(p.mentee_id))}</p><p class="sp-caption">${p.status === "active" ? `Since ${esc(new Date(p.started_at || p.created_at).toLocaleDateString())}` : "Waiting for both to say yes"}</p></article>`).join("") : `<p class="sp-caption">None yet.</p>`}
              ${
                state.perms.programs && state.standing?.ok
                  ? `<form class="sp-card" data-pair><h3>Pair two members</h3><p class="sp-caption">Both need a mentorship profile (adults only). They’re each asked, and it begins only if both say yes.</p>
                      <div class="sp-field"><label for="mt-mentor">Mentor</label><select id="mt-mentor" name="mentor" required><option value="">Choose</option>${opts}</select></div>
                      <div class="sp-field"><label for="mt-mentee">Mentee</label><select id="mt-mentee" name="mentee" required><option value="">Choose</option>${opts}</select></div>
                      <div class="sp-field"><label for="mt-pair-note">A note to them both (optional)</label><textarea id="mt-pair-note" name="note" maxlength="${M.NOTE_MAX}"></textarea></div>
                      <div class="sp-actions"><button class="button button--primary" type="submit">Suggest the pairing</button></div></form>`
                  : ""
              }
              <p><a href="/covens/coven/?c=${esc(encodeURIComponent(coven.slug))}&tab=record">Members’ record (training mentors)</a></p></section>`
          : ""
      }
      ${statusLine}`;
    const holder = root.querySelector("[data-mt-profile]");
    if (holder) UI.profileForm(holder, context, { onSaved: () => covenPage() });
    const draw = () => {
      const el = root.querySelector("[data-mt-here]");
      if (!el) return;
      const shown = M.filterDirectory(listings, { want, tradition: null, topics: [] }, context.user.id, context.blocks || [], (id) => context.names.get(id)?.display_name || "");
      el.innerHTML = shown.length ? shown.map((l) => listingCard(l, want, coven.id)).join("") : `<p class="sp-caption">No one here is listed for that just now.</p>`;
      wireAsk(covenPage);
    };
    draw();
    root.querySelectorAll("[data-want]").forEach((b) =>
      b.addEventListener("click", () => {
        want = b.dataset.want;
        root.querySelectorAll("[data-want]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        draw();
      })
    );
    root.querySelector("[data-pair]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const f = event.target.elements;
      if (f.mentor.value === f.mentee.value) return status("Choose two different people.");
      const m = await attempt(() => rpc("pair_mentorship", { p_coven: coven.id, p_mentor: f.mentor.value, p_mentee: f.mentee.value, p_note: f.note.value.trim() || null }));
      if (m) {
        notify(m, "paired");
        await covenPage();
        status("Suggested. They’ll each be asked.");
      }
    });
  }

  async function start() {
    context = await UI.boot();
    if (context.user) listing = await rows(db().from("mentor_listings").select("*").eq("user_id", context.user.id).maybeSingle()).catch(() => null);
    if (pairId) {
      await pairing();
      followPairing();
    } else if (covenSlug) await covenPage();
    else await hub();
  }

  start().catch((error) => {
    root.innerHTML = `<h1>Mentorship</h1><p class="sp-notice">${esc(error?.message || "This page couldn’t open. Please refresh.")}</p>`;
  });
})(window);
