/*
 * Covens: pieces every coven page shares. Starting a page (who is signed in,
 * their community profile, whether they moderate the site), the community
 * profile form with its 18+ confirmation, the report dialog and small helpers.
 *
 * Needs: js/salt-store.js (SaltPage), covens/coven-logic.js, covens/coven-data.js.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const doc = global.document;
  const esc = (text) => global.SaltPage.esc(text);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;

  /** Line breaks kept, everything escaped. */
  const prose = (text) => esc(text).replace(/\n/g, "<br />");

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message || "";
    el.classList.toggle("is-error", Boolean(isError));
  }

  /** Disable a form (or button) while `work` runs; show its result in `statusEl`. */
  async function busy(target, statusEl, work, { done } = {}) {
    const controls = target.matches?.("form") ? [...target.elements] : [target];
    controls.forEach((c) => (c.disabled = true));
    setStatus(statusEl, "Working…");
    try {
      const result = await work();
      setStatus(statusEl, done || "");
      return result;
    } catch (error) {
      console.error(error);
      setStatus(statusEl, L.errorMessage(error), true);
      return undefined;
    } finally {
      controls.forEach((c) => (c.disabled = false));
    }
  }

  /** Who is here: the user, their community profile, and site roles. */
  async function boot() {
    const user = await global.SaltPage.ready();
    const context = { user, profile: null, roles: [], siteModerator: false, admin: false, banned: false, blocks: [], names: new Map() };
    if (!user) return context;
    const [profile, roles, ban, blocks] = await Promise.all([
      D.myProfile(user.id).catch(() => null),
      D.mySiteRoles(user.id).catch(() => []),
      D.myBan(user.id).catch(() => null),
      D.myBlocks(user.id).catch(() => [])
    ]);
    Object.assign(context, {
      profile,
      roles,
      admin: roles.includes("admin"),
      siteModerator: roles.includes("admin") || roles.includes("moderator"),
      banned: Boolean(ban),
      blocks
    });
    if (profile) context.names.set(user.id, profile);
    return context;
  }

  /** Make sure we know the display names for these people. */
  async function loadNames(context, userIds) {
    const missing = [...new Set(userIds)].filter((id) => id && !context.names.has(id));
    if (!missing.length) return;
    for (let i = 0; i < missing.length; i += 100) {
      const rows = await D.profiles(missing.slice(i, i + 100)).catch(() => []);
      rows.forEach((p) => context.names.set(p.user_id, p));
    }
    missing.forEach((id) => context.names.has(id) || context.names.set(id, { user_id: id, display_name: "A witch" }));
  }

  /**
   * What you may do in a coven, into `state` (which holds context and coven):
   * its positions, pages, your membership, signatures and powers, then perms,
   * the agreements you haven't signed and whether you're in good standing.
   * The coven's page and the chat window over a coven altar both use this.
   */
  async function loadAccess(state) {
    const { context, coven } = state;
    const userId = context.user?.id;
    const [ranks, documents, membership, signatures] = await Promise.all([
      D.ranks(coven.id),
      D.documents(coven.id),
      D.membership(coven.id, userId).catch(() => null),
      D.mySignatures(coven.id, userId).catch(() => [])
    ]);
    Object.assign(state, { ranks: ranks || [], documents: L.orderDocuments(documents || []), membership, signatures: signatures || [] });
    const insider = membership?.status === "active" || context.siteModerator;
    state.grants = insider ? await D.grants(coven.id).catch(() => []) : [];
    state.perms = L.permissions({ coven, membership, ranks: state.ranks, userId, siteModerator: context.siteModerator, grants: state.grants });
    state.unsigned = userId ? L.unsignedAgreements(state.documents, state.signatures, userId) : state.documents.filter((d) => d.requires_signature);
    state.standing = L.standing(state.perms, state.unsigned, context.banned);
    return state;
  }

  const nameOf = (context, userId) => context.names.get(userId)?.display_name || "A witch";

  function signInCard(what) {
    return `<div class="sp-card"><p>Sign in to ${esc(what)}. Your Sanctuary account works on the website and in the app.</p>
      <div class="sp-actions"><a class="button button--primary" href="${esc(href("/?sanctuary=auth"))}">Sign in or create an account</a></div></div>`;
  }

  function bannedCard() {
    return `<div class="cv-banner"><p>Your account can’t take part in covens. If you think this is a mistake, please <a href="${esc(href("/#contact"))}">contact Salt &amp; Sovereignty</a>.</p></div>`;
  }

  /**
   * The community profile: the name other witches see, plus the 18+ and
   * guidelines confirmations (only asked the first time).
   */
  function profileForm(container, context, { intro, onSaved } = {}) {
    const p = context.profile;
    container.innerHTML = `<form class="sp-card" data-cv-profile>
        <h2>${p ? "Your community profile" : "Join the coven community"}</h2>
        <p class="sp-caption">${esc(intro || "Covens are for adults. Choose the name other witches will see; it doesn’t have to be your legal name.")}</p>
        <div class="sp-field"><label for="cv-display-name">Name shown in covens</label>
          <input id="cv-display-name" name="display_name" required minlength="2" maxlength="40" autocomplete="nickname" value="${esc(p?.display_name || "")}" /></div>
        <div class="sp-field"><label for="cv-pronouns">Pronouns (optional)</label>
          <input id="cv-pronouns" name="pronouns" maxlength="40" value="${esc(p?.pronouns || "")}" /></div>
        <div class="sp-field"><label for="cv-bio">A little about your path (optional)</label>
          <textarea id="cv-bio" name="bio" maxlength="500">${esc(p?.bio || "")}</textarea></div>
        ${p ? "" : `<label class="cv-check"><input type="checkbox" name="adult" required /> <span>I confirm I am 18 or older.</span></label>
        <label class="cv-check"><input type="checkbox" name="guidelines" required /> <span>I have read and will follow the <a href="${esc(href("/covens/guidelines/"))}" target="_blank" rel="noopener">coven community guidelines</a>.</span></label>`}
        <div class="sp-actions"><button class="button button--primary" type="submit">${p ? "Save profile" : "Create my profile"}</button></div>
        <p class="cv-status" role="status" aria-live="polite" data-cv-status></p>
      </form>`;
    const form = container.querySelector("form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const saved = await busy(form, form.querySelector("[data-cv-status]"), () =>
        D.saveProfile(context.user.id, { display_name: String(data.get("display_name")).trim(), pronouns: String(data.get("pronouns") || "").trim(), bio: String(data.get("bio") || "").trim() }, context.profile),
        { done: "Saved." }
      );
      if (saved) {
        context.profile = saved;
        context.names.set(saved.user_id, saved);
        onSaved?.(saved);
      }
    });
  }

  let reportDialog = null;

  /** Report a coven, a message, a member…: { target_type, target_id, coven_id, target_user_id, label }. */
  function report(target) {
    if (!reportDialog) {
      reportDialog = doc.createElement("dialog");
      reportDialog.className = "cv-dialog";
      reportDialog.setAttribute("aria-labelledby", "cv-report-title");
      doc.body.appendChild(reportDialog);
    }
    reportDialog.innerHTML = `<form method="dialog">
        <h2 id="cv-report-title">Report ${esc(target.label || "this")}</h2>
        <p class="sp-caption">Reports go to the Salt &amp; Sovereignty moderators, not to the coven’s leaders. The person you report isn’t told who reported them.</p>
        <div class="sp-field"><label for="cv-report-reason">What’s wrong?</label>
          <select id="cv-report-reason" name="reason" required>${L.REPORT_REASONS.map((r) => `<option value="${r.value}">${esc(r.label)}</option>`).join("")}</select></div>
        <div class="sp-field"><label for="cv-report-details">Anything the moderators should know (optional)</label>
          <textarea id="cv-report-details" name="details" maxlength="2000"></textarea></div>
        <p class="sp-caption" data-cv-crisis hidden>If someone is in danger right now, please contact local emergency services. <a href="${esc(href("/more/support/"))}">Support lines</a> are listed in the Sanctuary.</p>
        <div class="sp-actions"><button class="button button--primary" type="submit" value="send">Send report</button><button class="button button--ghost" type="button" data-cv-cancel>Cancel</button></div>
        <p class="cv-status" role="status" aria-live="polite" data-cv-status></p>
      </form>`;
    const form = reportDialog.querySelector("form");
    const reason = form.elements.reason;
    const crisis = form.querySelector("[data-cv-crisis]");
    reason.addEventListener("change", () => (crisis.hidden = !["self_harm", "minor"].includes(reason.value)));
    form.querySelector("[data-cv-cancel]").addEventListener("click", () => reportDialog.close());
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const sent = await busy(form, form.querySelector("[data-cv-status]"), () =>
        D.report({
          target_type: target.target_type,
          target_id: target.target_id || null,
          coven_id: target.coven_id || null,
          target_user_id: target.target_user_id || null,
          reason: reason.value,
          details: String(form.elements.details.value || "").trim() || null
        }).then(() => true)
      );
      if (sent) {
        form.innerHTML = `<h2>Thank you</h2><p>The moderators will look at this. You can also block someone so you no longer see their messages.</p><div class="sp-actions"><button class="button button--primary" type="button" data-cv-cancel>Close</button></div>`;
        form.querySelector("[data-cv-cancel]").addEventListener("click", () => reportDialog.close());
      }
    });
    reportDialog.showModal();
  }

  /** Ask a yes/no question in a dialog; resolves true or false. */
  function confirmAction(title, body, yes = "Yes") {
    return new Promise((resolve) => {
      const dialog = doc.createElement("dialog");
      dialog.className = "cv-dialog";
      dialog.innerHTML = `<form method="dialog"><h2>${esc(title)}</h2>${body ? `<p>${esc(body)}</p>` : ""}
        <div class="sp-actions"><button class="button button--primary" value="yes">${esc(yes)}</button><button class="button button--ghost" value="no">Cancel</button></div></form>`;
      doc.body.appendChild(dialog);
      dialog.addEventListener("close", () => {
        resolve(dialog.returnValue === "yes");
        dialog.remove();
      });
      dialog.showModal();
    });
  }

  /** Ask for a few optional words in a dialog; resolves with the text, or null if cancelled. */
  function askText(title, label, yes = "Done") {
    return new Promise((resolve) => {
      const dialog = doc.createElement("dialog");
      dialog.className = "cv-dialog";
      dialog.innerHTML = `<form method="dialog"><h2>${esc(title)}</h2>
        <div class="sp-field"><label for="cv-ask-text">${esc(label)}</label><textarea id="cv-ask-text" name="text" maxlength="1000"></textarea></div>
        <div class="sp-actions"><button class="button button--primary" value="yes">${esc(yes)}</button><button class="button button--ghost" value="no">Cancel</button></div></form>`;
      doc.body.appendChild(dialog);
      dialog.addEventListener("close", () => {
        resolve(dialog.returnValue === "yes" ? dialog.querySelector("textarea").value.trim() : null);
        dialog.remove();
      });
      dialog.showModal();
    });
  }

  /**
   * The app's altar logic (js/core/altar.js, SaltCore.altar), loaded once when
   * a coven page first needs it: the coven's altars, a ritual step's candle, a
   * petition's altar. It's large, so pages that never touch an altar skip it.
   */
  let altarCoreLoading = null;
  function altarCore() {
    if (global.SaltCore?.altar?.covenAltar) return Promise.resolve(global.SaltCore.altar);
    if (!altarCoreLoading) {
      altarCoreLoading = new Promise((resolve, reject) => {
        const script = doc.createElement("script");
        script.src = href("/js/core/altar.js");
        script.async = true;
        script.onload = () => (global.SaltCore?.altar ? resolve(global.SaltCore.altar) : reject(new Error("The altar’s tools didn’t load. Please refresh the page.")));
        script.onerror = () => {
          altarCoreLoading = null;
          reject(new Error("The altar’s tools didn’t load. Check your connection and try again."));
        };
        doc.head.appendChild(script);
      });
    }
    return altarCoreLoading;
  }

  global.CovenUI = { esc, prose, href, setStatus, busy, boot, loadAccess, loadNames, nameOf, signInCard, bannedCard, profileForm, report, confirmAction, askText, altarCore };
})(window);
