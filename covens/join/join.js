/*
 * An invitation to a coven (/covens/join/?code=CODE, or ?invitation=ID for
 * one sent by name), as the app's coven/join/[code] and coven/invitation/[id]
 * screens have it. Anyone can see which coven an invite link is for
 * (coven_invite_preview), then:
 *   - Open in the app (saltandsovereignty://coven/join/CODE), or get the app;
 *   - Accept on the website: sign in, make your community profile, read and
 *     sign the coven's agreements, then Accept, which opens the coven.
 * An invitation counts as the coven's approval, so there's no application.
 * Signing in happens on the Sanctuary's home page; this page remembers the
 * invitation (coven.invite.pending) and the Covens page offers it again.
 * Codes, links and words come from the app (SaltCore.covens.invites).
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose, href } = UI;
  const { header } = global.GuidesUI;
  const I = global.SaltCore?.covens?.invites;
  const PENDING_KEY = "coven.invite.pending";

  const params = new URLSearchParams(global.location.search);
  const invitationId = /^[0-9a-f-]{36}$/i.test(params.get("invitation") || "") ? params.get("invitation") : null;
  const code = invitationId ? null : I?.parseInviteCode(params.get("code") || "") || null;
  const here = `/covens/join/?${invitationId ? `invitation=${encodeURIComponent(invitationId)}` : `code=${encodeURIComponent(code || "")}`}`;

  let context = null;
  let preview = null; // { valid, reason, coven } for a link
  let invitation = null; // the row, with its coven, for one sent by name
  let inviter = null;
  let accepting = params.get("accept") === "1";

  const remember = () => {
    try {
      global.localStorage.setItem(PENDING_KEY, here);
    } catch {
      // Storage can be blocked; come back to the link instead.
    }
  };
  const forget = () => {
    try {
      global.localStorage.removeItem(PENDING_KEY);
    } catch {
      // Nothing to forget.
    }
  };

  const top = () => header({ title: "You’re invited", eyebrow: "Covens", back: "/covens/", backLabel: "All covens" });
  const covenOf = () => (invitation ? invitation.covens : preview?.coven) || null;

  function card() {
    const c = covenOf();
    if (!c) return "";
    const line = invitation ? I.invitationLine(inviter, invitation.message) : I.previewLine(c);
    return `<article class="sp-card cv-invite-card">
        <h2>${esc(c.name)}</h2>
        ${c.tagline ? `<p class="sp-muted">${esc(c.tagline)}</p>` : ""}
        <p class="sp-caption">${esc(line)}</p>
        <p class="sp-caption">An invitation lets you join without applying.</p>
      </article>`;
  }

  function getTheApp(withAccept = true) {
    const app = invitationId ? `saltandsovereignty://coven/invitation/${encodeURIComponent(invitationId)}` : I.appInviteLink(code);
    return `<section class="sp-section">
        <div class="sp-actions">
          <a class="button button--primary" href="${esc(app)}">Open in the app</a>
          ${withAccept ? `<button class="button button--ghost" type="button" data-accept-here>Accept on the website</button>` : ""}
        </div>
        <p class="sp-caption">Don’t have the app? Get Salt &amp; Sovereignty from the <a href="${esc(I.APP_STORE_URL)}" rel="noopener">App Store</a> or <a href="${esc(I.PLAY_STORE_URL)}" rel="noopener">Google Play</a>, then open this link again.</p>
      </section>`;
  }

  /** The accept steps: sign in, profile, agreements, Accept. */
  async function acceptHtml(holder) {
    if (!context.user) {
      remember();
      holder.innerHTML = `${UI.signInCard("accept this invitation")}<p class="sp-caption">Once you’re signed in, come back to this link, or open Covens: your invitation waits there.</p>`;
      return;
    }
    if (context.banned) {
      holder.innerHTML = UI.bannedCard();
      return;
    }
    if (!context.profile) {
      holder.innerHTML = `<div data-profile></div>`;
      UI.profileForm(holder.querySelector("[data-profile]"), context, {
        intro: "Before you join a coven, choose the name its members will see and confirm you are 18 or older.",
        onSaved: () => acceptHtml(holder)
      });
      return;
    }
    const slug = covenOf()?.slug;
    const coven = slug ? await D.coven(slug).catch(() => null) : null;
    if (!coven) {
      holder.innerHTML = `<p class="sp-notice">This coven isn’t open right now.</p>`;
      return;
    }
    const state = { context, coven };
    await UI.loadAccess(state);
    const covenUrl = href(`/covens/coven/?c=${encodeURIComponent(coven.slug)}`);
    if (state.membership?.status === "active") {
      forget();
      holder.innerHTML = `<div class="sp-card"><p>You’re already in this coven.</p><div class="sp-actions"><a class="button button--primary" href="${esc(covenUrl)}">Open the coven</a></div></div>`;
      return;
    }
    const unsigned = state.unsigned;
    holder.innerHTML = `<form class="sp-section" data-accept-form>
        ${unsigned.length ? `<p>The coven asks every member to sign ${unsigned.length === 1 ? "its agreement" : "its agreements"} first.</p>` : ""}
        ${unsigned
          .map((d) => `<div class="sp-card">
              <h3>${esc(d.title)}</h3>
              ${d.body.trim() ? `<div class="cv-doc">${prose(d.body)}</div>` : `<p class="sp-empty">The coven hasn’t written this agreement yet.</p>`}
              <label class="cv-check"><input type="checkbox" name="agree-${esc(d.id)}" required /> <span>I have read and agree to “${esc(d.title)}”.</span></label>
            </div>`)
          .join("")}
        ${unsigned.length ? `<div class="sp-field"><label for="cv-sign-name">Sign with your name</label><input id="cv-sign-name" name="signed_name" required minlength="2" maxlength="80" value="${esc(context.profile.display_name || "")}" /></div>` : ""}
        <div class="sp-actions">
          <button class="button button--primary" type="submit">${unsigned.length ? "Sign and accept" : "Accept"}</button>
          ${invitation?.status === "pending" ? `<button class="button button--ghost" type="button" data-decline>Decline</button>` : ""}
        </div>
        <p class="cv-status" role="status" aria-live="polite" data-status></p>
      </form>`;
    const form = holder.querySelector("[data-accept-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = form.elements.signed_name?.value.trim() || "";
      const done = await UI.busy(form, form.querySelector("[data-status]"), async () => {
        for (const d of unsigned) await D.sign(d.id, name);
        try {
          if (invitation) await D.respondToInvitation(invitation.id, true);
          else await D.acceptInviteLink(code);
        } catch (error) {
          if (I.needsAgreements(error)) throw new Error("The coven’s agreements changed. Read them again and sign.");
          throw new Error(I.inviteError(error));
        }
        return true;
      });
      if (done) {
        forget();
        global.location.assign(covenUrl);
      } else if (unsigned.length) {
        // Look again, in case an agreement changed meanwhile.
        setTimeout(() => acceptHtml(holder), 1500);
      }
    });
    form.querySelector("[data-decline]")?.addEventListener("click", async (event) => {
      const declined = await UI.busy(event.currentTarget, form.querySelector("[data-status]"), () => D.respondToInvitation(invitation.id, false).then(() => true));
      if (declined) {
        forget();
        global.location.assign(href("/covens/"));
      }
    });
  }

  function paint(problem) {
    root.innerHTML = `${top()}
      ${card()}
      ${problem ? `<p class="sp-notice">${esc(problem)}</p><div class="sp-actions"><a class="button button--ghost" href="${esc(href("/covens/"))}">Find a coven</a></div>` : `${getTheApp()}<div data-accept${accepting ? "" : " hidden"}></div>`}`;
    const holder = root.querySelector("[data-accept]");
    if (holder && accepting) void acceptHtml(holder);
    root.querySelector("[data-accept-here]")?.addEventListener("click", () => {
      accepting = true;
      holder.hidden = false;
      void acceptHtml(holder);
      holder.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  }

  async function start() {
    if (!I) {
      root.innerHTML = `${top()}<p class="sp-notice">This page couldn’t load. Please refresh it.</p>`;
      return;
    }
    context = await UI.boot();
    if (invitationId) {
      if (!context.user) {
        // Who it was for isn't known until you sign in.
        remember();
        root.innerHTML = `${top()}${UI.signInCard("see your invitation")}${getTheApp(false)}`;
        return;
      }
      invitation = await D.invitation(invitationId).catch(() => null);
      if (!invitation || invitation.user_id !== context.user.id || !invitation.covens) return paint("This invitation wasn’t found. It may have been for another account.");
      if (invitation.invited_by) {
        await UI.loadNames(context, [invitation.invited_by]);
        inviter = UI.nameOf(context, invitation.invited_by);
      }
      if (invitation.status === "declined") return paint("You declined this invitation.");
      if (invitation.status === "revoked") return paint("This invitation was taken back.");
      if (invitation.status === "pending" && !I.invitationOpen(invitation)) return paint("This invitation has expired. Ask the coven for a new one.");
      return paint(null);
    }
    if (!code) return paint(I.reasonWords("not_found"));
    try {
      preview = await D.previewInvite(code);
    } catch (error) {
      return paint(I.inviteError(error));
    }
    paint(preview?.valid ? null : I.reasonWords(preview?.reason || "not_found"));
  }

  start().catch((error) => {
    console.error(error);
    root.innerHTML = `${top()}<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
  });
})(window);
