/* =========================================================
   AUTHENTICATION
   Shared sanctuary login for altar and grimoire
   ========================================================= */

let currentUser = null;
let saltAuthResolved = false;
window.getCurrentSaltUser = () => currentUser;
// Presentation only. TODO: replace with RLS-protected membership/roles or
// server-authoritative custom claims; database authorization remains decisive.
const SALT_COMMUNITY_MODERATOR_IDS = new Set(window.SaltEnvironment.moderatorIds);
window.isSaltCommunityModerator = (user = currentUser) => Boolean(user && SALT_COMMUNITY_MODERATOR_IDS.has(user.id));
window.getSaltCommunityModeratorState = () => ({ resolved: saltAuthResolved, user: currentUser, canModerate: saltAuthResolved && window.isSaltCommunityModerator(currentUser) });
function announceModeratorState() {
  window.dispatchEvent(new CustomEvent("saltModeratorStateReady", { detail: window.getSaltCommunityModeratorState() }));
}
// Let later-loaded Sanctuary consumers observe that the shared helper exists,
// even when Supabase has not resolved the user yet.
queueMicrotask(announceModeratorState);

const authForms = document.querySelectorAll("[data-auth-form]");
const authStatuses = document.querySelectorAll("[data-auth-status]");
const signOutButtons = document.querySelectorAll('[data-auth-action="signout"]');

function setAuthStatus(message) {
  authStatuses.forEach((status) => {
    status.textContent = message;
  });
}

function safeAuthMessage(error, context = "account") {
  return window.SaltAccountData?.authMessage?.(error, context) || "That request could not be completed. Please try again.";
}

function announceAuthSuccess(message) {
  document.dispatchEvent(
    new CustomEvent("saltAuthSuccess", {
      detail: { message }
    })
  );

}

function updateAuthUI(user) {
  const isSignedIn = Boolean(user);

  signOutButtons.forEach((button) => {
    button.hidden = !isSignedIn;
  });

  setAuthStatus(
    isSignedIn
      ? `Signed in as ${user.email}`
      : "Continue as a guest, or sign in to save across devices."
  );

  document.body.classList.toggle("is-signed-in", isSignedIn);
}

async function getCurrentUser() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    currentUser = null;
    saltAuthResolved = true;
    updateAuthUI(null);
    announceModeratorState();
    return null;
  }

  currentUser = data.user;
  saltAuthResolved = true;
  updateAuthUI(currentUser);
  announceModeratorState();
  return currentUser;
}

async function signUpWithEmail(email, password) {
  window.SaltAccountData?.preserveGuestSnapshotBeforeAuth?.(localStorage);
  const { data, error } = await db.auth.signUp({
    email,
    password
  });

  if (error) throw error;

  currentUser = data.user;
  saltAuthResolved = true;
  updateAuthUI(currentUser);
  announceModeratorState();
  return data.user;
}

async function signInWithEmail(email, password) {
  window.SaltAccountData?.preserveGuestSnapshotBeforeAuth?.(localStorage);
  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  currentUser = data.user;
  saltAuthResolved = true;
  updateAuthUI(currentUser);
  announceModeratorState();
  return data.user;
}

async function signInWithGoogle() {
  window.SaltAccountData?.preserveGuestSnapshotBeforeAuth?.(localStorage);
  const { error } = await db.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.SaltEnvironment.oauthReturnUrl("/")
    }
  });

  if (error) throw error;
}

async function signOutUser() {
  const { error } = await db.auth.signOut();

  if (error) throw error;

  currentUser = null;
  saltAuthResolved = true;
  updateAuthUI(null);
  announceModeratorState();
  window.SaltSyncStatus?.setUser(null);

  document.dispatchEvent(
    new CustomEvent("saltAuthSignedOut", {
      detail: { message: "Signed out." }
    })
  );
  // A clean navigation tears down user-scoped feature caches and listeners so
  // late cloud responses cannot reveal the previous account in guest mode.
  window.setTimeout(() => {
    window.location.assign(window.SaltEnvironment.resolvePath("/"));
  }, 0);
}

const SIGN_IN_HINT = "Already have an account? Sign in the way you did before, then add other ways to sign in from More → Settings → Account & Data.";

authForms.forEach((authForm) => {
  if (!authForm.querySelector("[data-sign-in-hint]")) {
    const hint = document.createElement("p");
    hint.className = "sanctuary-sign-in-hint";
    hint.dataset.signInHint = "";
    hint.textContent = SIGN_IN_HINT;
    const status = authForm.querySelector("[data-auth-status]");
    if (status) status.before(hint);
    else authForm.append(hint);
  }
  if (!authForm.querySelector("[data-forgot-password]")) {
    const actions = authForm.querySelector(".sanctuary-auth-actions, .altar-auth-actions") || authForm;
    actions.insertAdjacentHTML("beforeend", '<button class="button button--ghost button--small" type="button" data-forgot-password>Forgot your password?</button>');
  }
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(authForm);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setAuthStatus("Enter an email and password first.");
      return;
    }

    setAuthStatus("Opening your sanctuary...");

    try {
      await signInWithEmail(email, password);
      authForm.reset();
      setAuthStatus("Your sanctuary is open.");
      announceAuthSuccess("Your sanctuary is open.");
    } catch (error) {
      console.warn("Sign-in failed.", { code: error.code || "auth_error" });
      setAuthStatus(safeAuthMessage(error));
    }
  });
});

document.addEventListener("click", async (event) => {
  const signUpButton = event.target.closest('[data-auth-action="signup"]');
  const signOutButton = event.target.closest('[data-auth-action="signout"]');

  if (signUpButton) {
    const authForm = signUpButton.closest("form");
    if (!authForm) return;

    const formData = new FormData(authForm);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setAuthStatus("Enter an email and password first.");
      return;
    }

    setAuthStatus("Creating your sanctuary...");

    try {
      await signUpWithEmail(email, password);
      authForm.reset();
      setAuthStatus("Your sanctuary has been created.");
      announceAuthSuccess("Your sanctuary has been created.");
    } catch (error) {
      console.warn("Sign-up failed.", { code: error.code || "auth_error" });
      setAuthStatus(safeAuthMessage(error));
    }
  }

  if (signOutButton) {
    try {
      await signOutUser();
      setAuthStatus("Signed out.");
    } catch (error) {
      console.warn("Sign-out failed.", { code: error.code || "auth_error" });
      setAuthStatus(safeAuthMessage(error));
    }
  }

  const forgotButton = event.target.closest("[data-forgot-password]");
  if (forgotButton) {
    const form = forgotButton.closest("form");
    const email = form?.querySelector('[name="email"]')?.value || "";
    if (!email) { setAuthStatus("Enter your email address first."); return; }
    forgotButton.disabled = true;
    setAuthStatus("Sending a recovery link…");
    try { setAuthStatus(await window.SaltAccountData.requestRecovery(email)); }
    catch (error) { setAuthStatus(error.message); }
    finally { forgotButton.disabled = false; }
  }
});

db.auth.onAuthStateChange((event, session) => {
  if (session?.user) window.SaltAccountData?.preserveGuestSnapshotBeforeAuth?.(localStorage);
  currentUser = session?.user || null;
  saltAuthResolved = true;
  updateAuthUI(currentUser);
  window.SaltSyncStatus?.setUser(currentUser);

  document.dispatchEvent(
    new CustomEvent("saltAuthChanged", {
      detail: {
        event,
        user: currentUser
      }
    })
  );
  announceModeratorState();
});

// Pages register their saltAuthReady listeners in scripts that load after this
// one. When sign-in resolves before such a script has arrived (a slow network,
// many scripts), the event has already gone and the page never learns who is
// signed in (the Grimoire then showed an empty book). A listener added after
// the event fired is called with it straight away instead.
let saltAuthReadyDetail = null;
const saltAddDocumentListener = document.addEventListener.bind(document);
document.addEventListener = function addEventListener(type, listener, options) {
  saltAddDocumentListener(type, listener, options);
  if (type !== "saltAuthReady" || !saltAuthReadyDetail || !listener) return;
  const detail = saltAuthReadyDetail;
  queueMicrotask(() => {
    const event = new CustomEvent("saltAuthReady", { detail });
    if (typeof listener === "function") listener.call(document, event);
    else listener.handleEvent?.(event);
  });
};

getCurrentUser().then((user) => {
  saltAuthResolved = true;
  saltAuthReadyDetail = { user };
  document.dispatchEvent(
    new CustomEvent("saltAuthReady", {
      detail: { user }
    })
  );
  announceModeratorState();
});
