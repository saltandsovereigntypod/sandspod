/* =========================================================
   MY SANCTUARY PANEL
   Shared account / sanctuary home panel
   ========================================================= */

let mySanctuaryView = "welcome";

function showMySanctuaryNotice(message) {
  const panel = document.querySelector("[data-my-sanctuary-panel]");
  if (!panel) return;

  const notice = panel.querySelector("[data-my-sanctuary-notice]");
  if (!notice) return;

  notice.textContent = message;
  notice.hidden = false;

  window.clearTimeout(showMySanctuaryNotice.timeout);
  showMySanctuaryNotice.timeout = window.setTimeout(() => {
    notice.hidden = true;
  }, 2600);
}

function createMySanctuaryPanel() {
  if (document.querySelector("[data-my-sanctuary-panel]")) return;

  const panel = document.createElement("div");
  panel.className = "my-sanctuary-panel";
  panel.hidden = true;
  panel.setAttribute("data-my-sanctuary-panel", "");

  panel.innerHTML = `
    <div class="my-sanctuary-backdrop" data-my-sanctuary-close></div>

    <aside class="my-sanctuary-card" aria-label="My Sanctuary">
      <button class="my-sanctuary-close" type="button" data-my-sanctuary-close aria-label="Close">
        ×
      </button>

      <p class="eyebrow">The Sanctuary</p>

      <section class="my-sanctuary-view" data-sanctuary-view="welcome">
        <h2>Welcome Home</h2>

        <p class="my-sanctuary-intro">
          Your private home within Salt & Sovereignty. Build an altar, write in your Book of Shadows,
          keep rituals and notes, and return to your practice in a way that feels like yours.
        </p>

        <p class="my-sanctuary-soft-note">
          Continue as a guest, or sign in to keep your sanctuary across devices.
        </p>

        <div class="my-sanctuary-choice-actions">
          <button class="button button--primary" type="button" data-my-sanctuary-show-auth>
            Sign In
          </button>

          <button class="button button--ghost" type="button" data-my-sanctuary-guest>
            Continue as Guest
          </button>
        </div>
      </section>

      <section class="my-sanctuary-view" data-sanctuary-view="auth" hidden>
        <h2>Welcome Back</h2>

        <p class="my-sanctuary-intro">
          Open your sanctuary to save your altar, grimoire, rituals, notes, and magical practice across devices.
        </p>

        <p class="my-sanctuary-notice" data-my-sanctuary-notice hidden></p>

        <form class="altar-auth-form my-sanctuary-auth-form" data-my-sanctuary-auth-form>
          <label>
            Email
            <input type="email" name="email" autocomplete="email" />
          </label>

          <label>
            Password
            <input type="password" name="password" autocomplete="current-password" />
          </label>

          <div class="my-sanctuary-auth-actions">
            <button class="button button--primary" type="submit">
              Open Sanctuary
            </button>

            <button class="button" type="button" data-my-sanctuary-signup>
              Create Sanctuary
            </button>

            <button class="button button--ghost" type="button" data-my-sanctuary-back>
              ← Back
            </button>
          </div>
        </form>
      </section>

      <section class="my-sanctuary-view" data-sanctuary-view="dashboard" hidden>
        <h2 data-my-sanctuary-dashboard-title>Guest Sanctuary</h2>

        <p class="my-sanctuary-user" data-my-sanctuary-user>
          Guest mode
        </p>

        <p class="my-sanctuary-intro" data-my-sanctuary-dashboard-copy>
          You're exploring as a guest. You can still use the altar and Book of Shadows,
          but cloud syncing needs a Sanctuary account.
        </p>

        <nav class="my-sanctuary-links" aria-label="Sanctuary navigation">
          <a href="/altar/">
            <span>
              <strong>🕯 My Digital Altar</strong>
              <small>Build and tend your sacred space.</small>
            </span>
          </a>

          <a href="/grimoire/index.html">
            <span>
              <strong>📖 My Book of Shadows</strong>
              <small>Write rituals, dreams, notes, and correspondences.</small>
            </span>
          </a>

          <span>
            <strong>🌙 My Saved Rituals</strong>
            <small>Coming soon.</small>
          </span>

          <span>
            <strong>✨ Community Grimoire</strong>
            <small>Share your practice when you're ready. Coming soon.</small>
          </span>

          <span>
            <strong>⚙ My Settings</strong>
            <small>Manage your sanctuary. Coming soon.</small>
          </span>
        </nav>

        <div class="my-sanctuary-actions">
          <button class="button button--ghost" type="button" data-my-sanctuary-show-auth>
            Sign In
          </button>

          <button class="button button--ghost" type="button" data-my-sanctuary-signout hidden>
            Sign Out
          </button>
        </div>
      </section>
    </aside>
  `;

  document.body.appendChild(panel);
}

function setMySanctuaryView(view) {
  const panel = document.querySelector("[data-my-sanctuary-panel]");
  if (!panel) return;

  mySanctuaryView = view;

  panel.querySelectorAll("[data-sanctuary-view]").forEach((section) => {
    section.hidden = section.dataset.sanctuaryView !== view;
  });
}

function updateMySanctuaryPanel() {
  const panel = document.querySelector("[data-my-sanctuary-panel]");
  if (!panel) return;

  const userLine = panel.querySelector("[data-my-sanctuary-user]");
  const dashboardTitle = panel.querySelector("[data-my-sanctuary-dashboard-title]");
  const dashboardCopy = panel.querySelector("[data-my-sanctuary-dashboard-copy]");
  const signInButton = panel.querySelector('[data-my-sanctuary-show-auth]');
  const signOutButton = panel.querySelector("[data-my-sanctuary-signout]");

  const isSignedIn = Boolean(currentUser);

  if (userLine) {
    userLine.textContent = isSignedIn
      ? `Signed in as ${currentUser.email}`
      : "Guest mode";
  }

  if (dashboardTitle) {
    dashboardTitle.textContent = isSignedIn ? "Welcome Back" : "Guest Sanctuary";
  }

  if (dashboardCopy) {
    dashboardCopy.textContent = isSignedIn
      ? "Your sanctuary is open. Your altar, grimoire, rituals, notes, and saved practice can follow you across your devices."
      : "You're exploring as a guest. You can still use the altar and Book of Shadows, but cloud syncing needs a Sanctuary account.";
  }

  if (signInButton) {
    signInButton.hidden = isSignedIn;
  }

  if (signOutButton) {
    signOutButton.hidden = !isSignedIn;
  }

  if (isSignedIn && mySanctuaryView !== "auth") {
    setMySanctuaryView("dashboard");
  }
}

function openMySanctuaryPanel() {
  createMySanctuaryPanel();
  updateMySanctuaryPanel();

  const panel = document.querySelector("[data-my-sanctuary-panel]");
  if (!panel) return;

  if (currentUser) {
    setMySanctuaryView("dashboard");
  } else {
    setMySanctuaryView("welcome");
  }

  panel.hidden = false;

  requestAnimationFrame(() => {
    panel.classList.add("is-visible");
  });
}

function closeMySanctuaryPanel() {
  const panel = document.querySelector("[data-my-sanctuary-panel]");
  if (!panel) return;

  panel.classList.remove("is-visible");

  window.setTimeout(() => {
    panel.hidden = true;
  }, 250);
}

document.addEventListener("submit", async (event) => {
  const authForm = event.target.closest("[data-my-sanctuary-auth-form]");
  if (!authForm) return;

  event.preventDefault();

  const formData = new FormData(authForm);
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    showMySanctuaryNotice("Enter an email and password first.");
    return;
  }

  showMySanctuaryNotice("Opening your sanctuary...");

  try {
    await signInWithEmail(email, password);
    authForm.reset();
    updateMySanctuaryPanel();
    setMySanctuaryView("dashboard");
    showMySanctuaryNotice("Your sanctuary is open.");
  } catch (error) {
    showMySanctuaryNotice(error.message);
  }
});

document.addEventListener("click", async (event) => {
  const openButton = event.target.closest("[data-my-sanctuary-open]");
  const closeButton = event.target.closest("[data-my-sanctuary-close]");
  const showAuthButton = event.target.closest("[data-my-sanctuary-show-auth]");
  const guestButton = event.target.closest("[data-my-sanctuary-guest]");
  const backButton = event.target.closest("[data-my-sanctuary-back]");
  const signUpButton = event.target.closest("[data-my-sanctuary-signup]");
  const signOutButton = event.target.closest("[data-my-sanctuary-signout]");

  if (openButton) {
    openMySanctuaryPanel();
  }

  if (closeButton) {
    closeMySanctuaryPanel();
  }

  if (showAuthButton) {
    setMySanctuaryView("auth");
  }

  if (guestButton) {
    setMySanctuaryView("dashboard");
  }

  if (backButton) {
    setMySanctuaryView("welcome");
  }

  if (signUpButton) {
    const panel = document.querySelector("[data-my-sanctuary-panel]");
    const authForm = panel?.querySelector("[data-my-sanctuary-auth-form]");
    if (!authForm) return;

    const formData = new FormData(authForm);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      showMySanctuaryNotice("Enter an email and password first.");
      return;
    }

    showMySanctuaryNotice("Creating your sanctuary...");

    try {
      await signUpWithEmail(email, password);
      authForm.reset();
      updateMySanctuaryPanel();
      setMySanctuaryView("dashboard");
      showMySanctuaryNotice("Your sanctuary has been created.");
    } catch (error) {
      showMySanctuaryNotice(error.message);
    }
  }

  if (signOutButton) {
    try {
      await signOutUser();
      updateMySanctuaryPanel();
      setMySanctuaryView("welcome");
      showMySanctuaryNotice("Signed out.");
    } catch (error) {
      showMySanctuaryNotice(error.message);
    }
  }
});

document.addEventListener("saltAuthChanged", updateMySanctuaryPanel);
document.addEventListener("saltAuthSuccess", updateMySanctuaryPanel);

createMySanctuaryPanel();
updateMySanctuaryPanel();
