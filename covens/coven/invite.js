/*
 * A coven's Invite tab, as the app's Invite people screen has it
 * (app/src/app/(tabs)/coven/c/[slug]/invite.tsx): share an invite link (how
 * long it lasts, how many it lets in), invite someone by name, the links
 * still working and the invitations waiting (each can be revoked), and for
 * those who lead the coven, whether members may invite too. Shown to those
 * who may invite (and site moderators); Manage links here.
 * Codes, links and words come from the app (SaltCore.covens.invites).
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc } = UI;
  const I = () => global.SaltCore?.covens?.invites;
  const statusLine = (attr = "data-status") => `<p class="cv-status" role="status" aria-live="polite" ${attr}></p>`;

  const CovenInvite = {
    async mount(pane, state, { refresh }) {
      const inv = I();
      if (!inv) {
        pane.innerHTML = `<p class="sp-notice">This part of the coven couldn’t load. Please refresh the page.</p>`;
        return;
      }
      const { coven, perms, context } = state;
      const me = context.user?.id;
      const oversees = perms.manage || perms.review || perms.site;
      const leads = perms.manage || perms.site;
      let expiry = "7";
      let uses = "unlimited";
      let made = null;
      let chosen = null;
      let searchTimer = null;

      pane.innerHTML = `<p class="sp-caption">Opening…</p>`;
      const settings = await D.inviteSettings(coven.id);
      if (!settings) {
        pane.innerHTML = `<p class="sp-notice">Invitations aren’t ready yet. Please try again later.</p>`;
        return;
      }
      const may = settings.may_invite;
      let links = [];
      let waiting = [];
      async function load() {
        const [l, w] = await Promise.all([D.inviteLinks(coven.id).catch(() => []), D.covenInvitations(coven.id).catch(() => [])]);
        links = l || [];
        waiting = (w || []).filter((i) => inv.invitationOpen(i));
        await UI.loadNames(context, [...waiting.map((i) => i.user_id), ...waiting.map((i) => i.invited_by), ...links.map((x) => x.created_by)]);
      }
      if (may || perms.site) await load();

      const canRevoke = (by) => oversees || by === me;
      const chips = (name, options, value) =>
        `<div class="sp-chips" role="group" aria-label="${esc(name)}">${options.map((o) => `<button type="button" class="sp-chip" data-${name === "How long it lasts" ? "expiry" : "uses"}="${esc(o.value)}" aria-pressed="${o.value === value}">${esc(o.label)}</button>`).join("")}</div>`;

      function madeHtml() {
        if (!made) return "";
        const link = inv.inviteLink(made.code);
        return `<div class="sp-card cv-invite-made">
            <p class="sp-label">Your link</p>
            <p><a href="${esc(link)}" data-made-link>${esc(link)}</a></p>
            <p class="sp-caption">${esc(inv.linkSummary(made))}</p>
            <div class="sp-actions"><button class="button button--primary button--small" type="button" data-share="${esc(made.code)}">Share</button><button class="button button--ghost button--small" type="button" data-copy="${esc(made.code)}">Copy link</button></div>
          </div>`;
      }

      function linksHtml() {
        const working = inv.activeLinks(links);
        if (!working.length) return `<p class="sp-caption">No links working now.</p>`;
        return working
          .map((l) => `<div class="sp-card" data-link="${esc(l.id)}">
              <h3>${esc(l.note || l.code)}</h3>
              <p class="sp-caption">${esc(inv.linkSummary(l))}${l.created_by ? ` · made by ${esc(l.created_by === me ? "you" : UI.nameOf(context, l.created_by))}` : ""}</p>
              <div class="sp-actions">${may ? `<button class="button button--ghost button--small" type="button" data-copy="${esc(l.code)}">Copy link</button>` : ""}${canRevoke(l.created_by) ? `<button class="button button--ghost button--small" type="button" data-revoke-link="${esc(l.id)}">Revoke</button>` : ""}</div>
            </div>`)
          .join("");
      }

      function waitingHtml() {
        if (!waiting.length) return `<p class="sp-caption">${oversees ? "No invitations waiting." : "No invitations you sent are waiting."}</p>`;
        return waiting
          .map((i) => `<div class="sp-card">
              <h3>${esc(UI.nameOf(context, i.user_id))}</h3>
              <p class="sp-caption">Sent ${esc(inv.shortDate(i.created_at))}${i.invited_by ? ` by ${esc(i.invited_by === me ? "you" : UI.nameOf(context, i.invited_by))}` : ""}</p>
              ${i.message ? `<p>“${esc(i.message)}”</p>` : ""}
              ${canRevoke(i.invited_by) ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-revoke-invitation="${esc(i.id)}">Revoke</button></div>` : ""}
            </div>`)
          .join("");
      }

      function chosenHtml() {
        if (!chosen) return "";
        return `<form class="sp-card" data-send>
            <h3>${esc(chosen.display_name)}</h3>
            <div class="sp-field"><label for="cv-invite-message">A message (optional)</label>
              <textarea id="cv-invite-message" name="message" maxlength="${inv.MESSAGE_MAX}" placeholder="Why you’d like them in the circle"></textarea></div>
            <div class="sp-actions"><button class="button button--primary" type="submit">Send invitation</button><button class="button button--ghost" type="button" data-unchoose>Choose someone else</button></div>
            ${statusLine()}
          </form>`;
      }

      function draw() {
        pane.innerHTML = `${
          !may && !perms.site
            ? `<div class="sp-card"><p>${coven.status !== "active" ? "This coven isn’t open right now, so no one can be invited." : "Those who lead or review the coven invite people. Its leaders can let members invite too."}</p></div>`
            : `${
                may
                  ? `<section class="sp-section"><h2>Share an invite link</h2>
                <p class="sp-caption">Anyone with the link can join without applying, once they’ve signed the coven’s agreements. It works even though the coven isn’t listed.</p>
                <p class="sp-label">How long it lasts</p>${chips("How long it lasts", inv.EXPIRY_CHOICES, expiry)}
                <p class="sp-label">How many people can use it</p>${chips("How many people can use it", inv.USES_CHOICES, uses)}
                <div class="sp-field"><label for="cv-invite-note">A note for yourself (optional)</label><input id="cv-invite-note" name="note" maxlength="${inv.NOTE_MAX}" placeholder="Who it’s for" /></div>
                <div class="sp-actions"><button class="button button--primary" type="button" data-make>Make a link</button></div>
                ${statusLine("data-make-status")}
                <div data-made>${madeHtml()}</div>
              </section>
              <section class="sp-section"><h2>Invite someone in the app</h2>
                <div class="sp-field"><label for="cv-invite-search">Search by name</label><input id="cv-invite-search" type="search" autocomplete="off" placeholder="The name they use in covens" /></div>
                <div data-found></div>
                <div data-chosen>${chosenHtml()}</div>
              </section>`
                  : ""
              }
              <section class="sp-section"><h2>Invite links</h2><div data-links>${linksHtml()}</div></section>
              <section class="sp-section"><h2>Invitations waiting</h2><div data-waiting>${waitingHtml()}</div></section>`
        }
          ${
            leads
              ? `<section class="sp-section"><h2>Who may invite</h2>
              <label class="cv-check"><input type="checkbox" data-members-invite ${settings.members_can_invite ? "checked" : ""} /> <span>Members may invite people<br /><span class="sp-caption">Any member in good standing, as well as those who lead or review</span></span></label>
              ${statusLine("data-setting-status")}</section>`
              : ""
          }
          ${statusLine("data-page-status")}`;
      }

      const pageStatus = () => pane.querySelector("[data-page-status]");
      async function redrawLists() {
        await load();
        const l = pane.querySelector("[data-links]");
        const w = pane.querySelector("[data-waiting]");
        if (l) l.innerHTML = linksHtml();
        if (w) w.innerHTML = waitingHtml();
      }

      async function share(code) {
        const link = inv.inviteLink(code);
        const text = inv.shareMessage(coven.name, link);
        try {
          if (global.navigator.share) return await global.navigator.share({ text, url: link });
        } catch {
          return undefined;
        }
        return copy(code);
      }
      async function copy(code) {
        try {
          await global.navigator.clipboard.writeText(inv.inviteLink(code));
          UI.setStatus(pageStatus(), "Link copied.");
        } catch {
          UI.setStatus(pageStatus(), "The link couldn’t be copied here. Select it and copy it yourself.", true);
        }
      }

      function search(query) {
        clearTimeout(searchTimer);
        const found = pane.querySelector("[data-found]");
        if (!inv.searchReady(query)) {
          found.innerHTML = "";
          return;
        }
        searchTimer = setTimeout(async () => {
          let rows = [];
          try {
            rows = await D.searchInvitable(coven.id, query);
          } catch (error) {
            found.innerHTML = `<p class="sp-notice">${esc(inv.inviteError(error))}</p>`;
            return;
          }
          found.innerHTML = rows.length
            ? `<div class="sp-list">${rows.map((p) => `<button type="button" class="sp-row" data-choose="${esc(p.user_id)}" data-name="${esc(p.display_name)}"><span class="sp-row__text"><span class="sp-row__title">${esc(p.display_name)}</span></span><span class="sp-row__detail">Invite</span></button>`).join("")}</div>`
            : `<p class="sp-caption">No one by that name can be invited. They need a coven profile, and can’t already be here or waiting on an invitation.</p>`;
        }, 300);
      }

      pane.addEventListener("click", async (event) => {
        const t = event.target;
        const ex = t.closest("[data-expiry]");
        if (ex) {
          expiry = ex.dataset.expiry;
          pane.querySelectorAll("[data-expiry]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.expiry === expiry)));
          return;
        }
        const us = t.closest("[data-uses]");
        if (us) {
          uses = us.dataset.uses;
          pane.querySelectorAll("[data-uses]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.uses === uses)));
          return;
        }
        const makeButton = t.closest("[data-make]");
        if (makeButton) {
          const options = inv.linkOptions(expiry, uses);
          const note = pane.querySelector("#cv-invite-note");
          const link = await UI.busy(makeButton, pane.querySelector("[data-make-status]"), () => D.createInviteLink(coven.id, options.days, options.uses, note.value));
          if (link) {
            made = link;
            note.value = "";
            pane.querySelector("[data-made]").innerHTML = madeHtml();
            await redrawLists();
          }
          return;
        }
        const shareButton = t.closest("[data-share]");
        if (shareButton) return share(shareButton.dataset.share);
        const copyButton = t.closest("[data-copy]");
        if (copyButton) return copy(copyButton.dataset.copy);
        const choose = t.closest("[data-choose]");
        if (choose) {
          chosen = { user_id: choose.dataset.choose, display_name: choose.dataset.name };
          pane.querySelector("[data-found]").innerHTML = "";
          pane.querySelector("[data-chosen]").innerHTML = chosenHtml();
          pane.querySelector("#cv-invite-message")?.focus();
          return;
        }
        if (t.closest("[data-unchoose]")) {
          chosen = null;
          pane.querySelector("[data-chosen]").innerHTML = "";
          pane.querySelector("#cv-invite-search")?.focus();
          return;
        }
        const revokeLink = t.closest("[data-revoke-link]");
        if (revokeLink) {
          if (!(await UI.confirmAction("Revoke this link?", "No one else can join with it. Those who already joined stay.", "Revoke"))) return;
          if (await UI.busy(revokeLink, pageStatus(), () => D.revokeInviteLink(revokeLink.dataset.revokeLink).then(() => true), { done: "Link revoked." })) {
            if (made?.id === revokeLink.dataset.revokeLink) {
              made = null;
              pane.querySelector("[data-made]").innerHTML = "";
            }
            await redrawLists();
          }
          return;
        }
        const revokeInvitation = t.closest("[data-revoke-invitation]");
        if (revokeInvitation) {
          const row = waiting.find((i) => i.id === revokeInvitation.dataset.revokeInvitation);
          if (!(await UI.confirmAction(`Take back ${UI.nameOf(context, row?.user_id)}’s invitation?`, "It leaves their list of invitations.", "Revoke"))) return;
          if (await UI.busy(revokeInvitation, pageStatus(), () => D.revokeInvitation(revokeInvitation.dataset.revokeInvitation).then(() => true), { done: "Invitation taken back." })) await redrawLists();
        }
      });
      pane.addEventListener("input", (event) => {
        if (event.target.id === "cv-invite-search") search(event.target.value);
      });
      pane.addEventListener("submit", async (event) => {
        const form = event.target.closest("[data-send]");
        if (!form || !chosen) return;
        event.preventDefault();
        const who = chosen;
        const sent = await UI.busy(form, form.querySelector("[data-status]"), () => D.inviteToCoven(coven.id, who.user_id, form.elements.message.value));
        if (sent) {
          chosen = null;
          pane.querySelector("[data-chosen]").innerHTML = "";
          const searchBox = pane.querySelector("#cv-invite-search");
          if (searchBox) searchBox.value = "";
          UI.setStatus(pageStatus(), `Invitation sent to ${who.display_name}.`);
          await redrawLists();
        }
      });
      pane.addEventListener("change", async (event) => {
        const box = event.target.closest("[data-members-invite]");
        if (!box) return;
        const on = box.checked;
        const ok = await UI.busy(box, pane.querySelector("[data-setting-status]"), () => D.setMembersCanInvite(coven.id, on).then(() => true), { done: on ? "Members may now invite people." : "Only those who lead or review invite people now." });
        if (!ok) box.checked = !on;
        else refresh("invite");
      });

      draw();
    }
  };

  global.CovenInvite = CovenInvite;
})(window);
