/*
 * "Ways to sign in" in More → Settings → Account & Data: every sign-in that
 * opens this one account (Apple, Google, email and password), with ways to
 * add one and to remove any but the last. The app has the same in
 * More → Account; the rules and wording are the app's
 * app/src/lib/settings/signInMethods.ts, and a test keeps them in step.
 *
 * Linking uses Supabase's manual identity linking, which the project owner
 * switches on in the dashboard (Authentication → Sign In / Providers →
 * "Allow manual linking"). Until then Supabase answers manual_linking_disabled.
 *
 * Load after js/supabase-config.js and before js/auth.js: Apple and Google
 * hand back here through the address bar, which is read before Supabase
 * tidies it away.
 */
(function initializeSignInMethods(global) {
  "use strict";

  const SUPPORT_EMAIL = "ashley.p@saltandsovereignty.com";
  const SIGN_IN_PROVIDERS = ["apple", "google", "email"];
  const PASSWORD_FLAG = "password_sign_in";
  const PENDING_KEY = "saltAndSovereigntyLinkingProvider";
  const NAMES = { apple: "Apple", google: "Google", email: "Email and password" };
  const ACCOUNT_NAMES = { apple: "Apple ID", google: "Google account", email: "email address" };

  function providerName(provider) {
    const value = String(provider || "");
    return NAMES[value] ?? (value ? value.charAt(0).toUpperCase() + value.slice(1) : "Sign-in");
  }
  function accountName(provider) {
    return ACCOUNT_NAMES[String(provider || "")] ?? `${providerName(provider)} account`;
  }
  function identityEmail(identity) {
    const fromData = identity?.identity_data?.email;
    if (typeof fromData === "string" && fromData) return fromData;
    return typeof identity?.email === "string" ? identity.email : "";
  }
  const rank = (provider) => { const index = SIGN_IN_PROVIDERS.indexOf(provider); return index === -1 ? SIGN_IN_PROVIDERS.length : index; };
  function hasPasswordFlag(user) { return user?.user_metadata?.[PASSWORD_FLAG] === true; }

  function signInRows(identities, user) {
    const list = [...(identities || [])].filter((identity) => identity && identity.provider);
    list.sort((a, b) => rank(a.provider) - rank(b.provider));
    const rows = list.map((identity, index) => ({
      key: identity.identity_id || identity.id || `${identity.provider}-${index}`,
      provider: String(identity.provider),
      label: providerName(identity.provider),
      detail: identityEmail(identity) || (identity.provider === "email" ? user?.email || "" : ""),
      identity,
      removable: list.length > 1
    }));
    if (hasPasswordFlag(user) && !list.some((identity) => identity.provider === "email")) {
      rows.push({ key: "password", provider: "email", label: providerName("email"), detail: user?.email || "", identity: null, removable: false });
    }
    return rows;
  }

  function canRemove(identities, identity) {
    const list = identities || [];
    if (!identity || list.length < 2) return false;
    const id = identity.identity_id || identity.id;
    return list.some((item) => (item.identity_id || item.id) === id && item.provider === identity.provider);
  }

  function waysToAdd(rows, offer) {
    const have = new Set(rows.map((row) => row.provider));
    return SIGN_IN_PROVIDERS.filter((provider) => offer[provider] && !have.has(provider));
  }

  function decode(text) {
    try { return decodeURIComponent(text.replace(/\+/g, " ")); } catch { return text; }
  }
  function linkReturn(url) {
    const params = {};
    const value = String(url || "");
    const hashAt = value.indexOf("#");
    const beforeHash = hashAt === -1 ? value : value.slice(0, hashAt);
    const queryAt = beforeHash.indexOf("?");
    const parts = [queryAt === -1 ? "" : beforeHash.slice(queryAt + 1), hashAt === -1 ? "" : value.slice(hashAt + 1)];
    for (const part of parts) {
      for (const pair of part.split("&")) {
        if (!pair) continue;
        const equals = pair.indexOf("=");
        const name = decode(equals === -1 ? pair : pair.slice(0, equals));
        if (name && !(name in params)) params[name] = decode(equals === -1 ? "" : pair.slice(equals + 1));
      }
    }
    const result = {};
    if (params.code) result.code = params.code;
    if (params.error) result.error = params.error;
    if (params.error_code) result.errorCode = params.error_code;
    if (params.error_description) result.errorDescription = params.error_description;
    return result;
  }

  function parts(error) {
    const value = error && typeof error === "object" ? error : { message: error };
    const code = String(value.code || value.error_code || value.errorCode || "").toLowerCase();
    const message = String(value.message || value.error_description || value.errorDescription || "").toLowerCase();
    return { code, message };
  }
  function isLinkingDisabled(error) {
    const { code, message } = parts(error);
    return code === "manual_linking_disabled" || /manual linking is disabled/.test(message);
  }

  function linkErrorMessage(error, provider, supportEmail = SUPPORT_EMAIL) {
    const { code, message } = parts(error);
    const name = providerName(provider);
    if (isLinkingDisabled(error))
      return `Adding another way to sign in isn’t switched on yet. Nothing has changed with your account. Please try again soon, or write to ${supportEmail}.`;
    if (code === "identity_already_exists" || /already linked|already (?:been )?(?:registered|exists)|already in use/.test(message)) {
      // Supabase says "Identity is already linked" when it's this account's own,
      // and "... to another user" when it belongs to someone else's.
      if (/already linked\.?$/.test(message.trim()) && !/another|other user/.test(message)) return `${name} is already one of your ways to sign in.`;
      return `That ${accountName(provider)} already has its own Salt & Sovereignty account. Sign in with it and delete that account from Account settings first, or write to ${supportEmail} and we’ll help bring the two together.`;
    }
    if (code === "provider_disabled" || /provider is not enabled|unsupported provider|not enabled/.test(message))
      return `Signing in with ${name} isn’t available right now. Please try again later.`;
    if (code === "reauthentication_needed" || /reauthenticat/.test(message))
      return "For your safety, please sign out and back in, then add this straight away.";
    if (/password.*(?:short|least)|weak.?password/.test(code + " " + message)) return "Use at least 8 characters for your password.";
    if (/session|jwt|signed out|not authenticated/.test(message)) return "Your session has ended. Please sign in again.";
    if (/network|fetch|offline/.test(message)) return "The cloud could not be reached. Check your connection and try again.";
    if (/rate|too many/.test(code + " " + message)) return "Please wait a little while before trying again.";
    return `${name} couldn’t be added just now. Nothing has changed; please try again.`;
  }

  function unlinkErrorMessage(error, provider, supportEmail = SUPPORT_EMAIL) {
    const { code, message } = parts(error);
    const name = providerName(provider);
    if (isLinkingDisabled(error))
      return `Removing a way to sign in isn’t switched on yet. ${name} still works. Please try again soon, or write to ${supportEmail}.`;
    if (code === "single_identity_not_deletable" || /at least 2 identities|only (?:one|identity)/.test(message))
      return "This is your only way to sign in, so it has to stay. Add another way first.";
    if (code === "email_conflict_identity_not_deletable")
      return `${name} has to stay for now: taking it off would move your account onto an email address another account already uses. Write to ${supportEmail} and we’ll help.`;
    if (code === "identity_not_found" || /identity.*not.*(?:found|exist)/.test(message))
      return `${name} was already removed from your account.`;
    if (/session|jwt|signed out|not authenticated/.test(message)) return "Your session has ended. Please sign in again.";
    if (/network|fetch|offline/.test(message)) return "The cloud could not be reached. Check your connection and try again.";
    return `${name} couldn’t be removed just now. Nothing has changed; please try again.`;
  }

  const linkedMessage = (provider) => `${providerName(provider)} is now one of your ways to sign in.`;
  const unlinkedMessage = (provider) => `${providerName(provider)} has been removed. Your other ways to sign in still open this account.`;
  const passwordAddedMessage = (email) => `You can now sign in with ${email || "your email address"} and this password, in the app and on the website.`;

  // ---------------------------------------------------------------- the page

  const session = (() => { try { return global.sessionStorage; } catch { return null; } })();
  // Coming back from Apple or Google after "Add …": which one, and what it said.
  const pending = session?.getItem?.(PENDING_KEY) || null;
  const returned = pending && global.location ? linkReturn(global.location.href) : {};
  let returnNote = null;
  if (pending) {
    session.removeItem(PENDING_KEY);
    returnNote = returned.error || returned.errorCode
      ? linkErrorMessage({ code: returned.errorCode, message: returned.errorDescription || returned.error }, pending)
      : { check: pending };
  }

  const safe = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const db = () => global.db;

  async function loadIdentities() {
    const { data, error } = await db().auth.getUserIdentities();
    if (error) throw error;
    return data.identities;
  }

  async function addWay(provider) {
    session?.setItem?.(PENDING_KEY, provider);
    const { error } = await db().auth.linkIdentity({ provider, options: { redirectTo: global.SaltEnvironment.oauthReturnUrl("/") } });
    if (error) { session?.removeItem?.(PENDING_KEY); throw error; }
  }

  async function removeWay(identity) {
    const { error } = await db().auth.unlinkIdentity(identity);
    if (error) throw error;
    try { await db().auth.refreshSession(); } catch {}
  }

  async function addPassword(password) {
    const { error } = await db().auth.updateUser({ password, data: { [PASSWORD_FLAG]: true } });
    if (error) throw error;
  }

  /** Puts "Ways to Sign In" into the Account & Data controls, after the account summary. */
  function mount(container, user) {
    if (!container || !user || container.querySelector("[data-sign-in-methods]")) return;
    const section = document.createElement("section");
    section.className = "account-sign-in-methods";
    section.dataset.signInMethods = "";
    section.setAttribute("aria-labelledby", "sign-in-methods-title");
    const summary = container.querySelector(".account-summary-card");
    if (summary) summary.after(section); else container.prepend(section);
    // These fields aren't Sanctuary settings: keep "Unsaved changes" quiet.
    section.addEventListener("input", (event) => event.stopPropagation());
    section.addEventListener("change", (event) => event.stopPropagation());

    let identities = user.identities || [];
    let confirming = null;
    let addingPassword = false;
    let busy = false;
    let status = typeof returnNote === "string" ? returnNote : "";

    function render() {
      const rows = signInRows(identities, user);
      const toAdd = waysToAdd(rows, { apple: true, google: true, email: Boolean(user.email) });
      section.innerHTML = `
        <h3 id="sign-in-methods-title">Ways to Sign In</h3>
        <p>Each of these opens this same account, on the website and in the app. Add another so you can always find your way back in.</p>
        <ul class="sign-in-methods-list">${rows.map((row) => {
          const removable = row.identity && row.removable && canRemove(identities, row.identity);
          const actions = !removable ? "" : confirming === row.key
            ? `<span>Remove ${safe(row.label)}?</span> <button class="button button--ghost button--small" type="button" data-keep-sign-in>Keep It</button> <button class="button button--small" type="button" data-confirm-remove="${safe(row.key)}">Yes, Remove</button>`
            : `<button class="button button--ghost button--small" type="button" data-remove-sign-in="${safe(row.key)}" aria-label="Remove ${safe(row.label)}">Remove</button>`;
          return `<li><span><strong>${safe(row.label)}</strong>${row.detail ? `<br><small>${safe(row.detail)}</small>` : ""}</span>${actions ? `<span class="sign-in-methods-actions">${actions}</span>` : ""}</li>`;
        }).join("")}</ul>
        ${rows.length === 1 ? "<p><small>This is your only way to sign in, so it can’t be removed until you add another.</small></p>" : ""}
        <p role="status" aria-live="polite" data-sign-in-methods-status>${safe(status)}</p>
        <div class="sign-in-methods-actions">
          ${toAdd.includes("apple") ? '<button class="button button--ghost button--small" type="button" data-add-sign-in="apple">Add Apple</button>' : ""}
          ${toAdd.includes("google") ? '<button class="button button--ghost button--small" type="button" data-add-sign-in="google">Add Google</button>' : ""}
          ${toAdd.includes("email") && !addingPassword ? '<button class="button button--ghost button--small" type="button" data-add-password>Add Email and Password</button>' : ""}
        </div>
        ${toAdd.includes("email") && addingPassword ? `
          <div class="sign-in-methods-password">
            <p>Choose a password to use with <strong>${safe(user.email)}</strong>. You’ll still be able to sign in the way you do now.</p>
            <label>Password<input type="password" data-new-password minlength="${global.SaltAccountData?.MIN_PASSWORD_LENGTH || 8}" autocomplete="new-password"></label>
            <label>Confirm password<input type="password" data-new-password-confirmation autocomplete="new-password"></label>
            <div class="sign-in-methods-actions"><button class="button button--ghost button--small" type="button" data-cancel-password>Cancel</button> <button class="button button--primary button--small" type="button" data-save-password>Add Password</button></div>
          </div>` : ""}
      `;
      section.querySelectorAll("button").forEach((button) => { button.disabled = busy; });
    }

    async function refresh() {
      try { identities = await loadIdentities(); } catch {}
      return identities;
    }
    function say(message) { status = message; render(); }

    section.addEventListener("click", async (event) => {
      const add = event.target.closest("[data-add-sign-in]");
      const remove = event.target.closest("[data-remove-sign-in]");
      const confirm = event.target.closest("[data-confirm-remove]");
      if (event.target.closest("[data-keep-sign-in]")) { confirming = null; render(); }
      if (remove) { confirming = remove.dataset.removeSignIn; render(); }
      if (event.target.closest("[data-add-password]")) { addingPassword = true; status = ""; render(); section.querySelector("[data-new-password]")?.focus(); }
      if (event.target.closest("[data-cancel-password]")) { addingPassword = false; render(); }
      if (add) {
        const provider = add.dataset.addSignIn;
        busy = true; say(`Opening ${providerName(provider)}…`);
        try { await addWay(provider); } catch (error) { busy = false; say(linkErrorMessage(error, provider)); }
      }
      if (confirm) {
        const row = signInRows(identities, user).find((item) => item.key === confirm.dataset.confirmRemove);
        if (!row?.identity) return;
        busy = true; say(`Removing ${row.label}…`);
        try { await removeWay(row.identity); await refresh(); confirming = null; busy = false; say(unlinkedMessage(row.provider)); }
        catch (error) { confirming = null; busy = false; say(unlinkErrorMessage(error, row.provider)); }
      }
      if (event.target.closest("[data-save-password]")) {
        const password = section.querySelector("[data-new-password]")?.value || "";
        const confirmation = section.querySelector("[data-new-password-confirmation]")?.value || "";
        const validation = global.SaltAccountData.validatePasswordPair(password, confirmation);
        if (!validation.valid) { say(validation.message); return; }
        busy = true; say("Adding your password…");
        try { await addPassword(password); user = { ...user, user_metadata: { ...(user.user_metadata || {}), [PASSWORD_FLAG]: true } }; addingPassword = false; busy = false; say(passwordAddedMessage(user.email)); }
        catch (error) { busy = false; say(linkErrorMessage(error, "email")); }
      }
    });

    render();
    refresh().then(() => {
      if (returnNote && typeof returnNote === "object") {
        const provider = returnNote.check;
        returnNote = null;
        status = identities.some((identity) => identity.provider === provider) ? linkedMessage(provider) : "";
      }
      render();
    });
  }

  /** After coming back from "Add …", reopen Account & Data so the person sees how it went. */
  function reopenAccount() {
    if (!pending) return;
    let tries = 0;
    const timer = global.setInterval?.(() => {
      tries += 1;
      if (typeof global.openMySanctuaryPanel === "function" && global.getCurrentSaltUser?.()) {
        global.clearInterval(timer);
        global.openMySanctuaryPanel("settings");
        global.setTimeout(() => global.document?.querySelector('[data-settings-category="account"]')?.click(), 50);
      } else if (tries > 40) global.clearInterval(timer);
    }, 150);
  }
  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", reopenAccount);
    else reopenAccount();
  }

  const api = {
    SUPPORT_EMAIL, SIGN_IN_PROVIDERS, PASSWORD_FLAG, PENDING_KEY,
    providerName, accountName, identityEmail, hasPasswordFlag, signInRows, canRemove, waysToAdd, linkReturn,
    isLinkingDisabled, linkErrorMessage, unlinkErrorMessage, linkedMessage, unlinkedMessage, passwordAddedMessage,
    mount
  };
  global.SaltSignInMethods = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
