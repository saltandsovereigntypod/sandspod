(function initializeWelcomeDiscovery(global) {
  const DAILY_REFLECTION_KEY = "saltAndSovereigntyDailyThresholdReflection";
  const DESTINATION_KEY = "saltAndSovereigntySanctuaryDestination";
  // Bumped when a guide changes, so everyone sees the new one once. The
  // welcome mirrors the app's tour (app/src/lib/welcomeTour.ts TOUR_SEEN_KEY "welcome.tour.v2").
  const GUIDE_VERSION = "1.3.0";
  const GUIDE_VERSIONS = { altar: GUIDE_VERSION, grimoire: GUIDE_VERSION, welcome: "2" };
  const GUIDE_KEYS = {
    altar: "saltAndSovereigntyAltarGuideVersion",
    grimoire: "saltAndSovereigntyGrimoireGuideVersion",
    welcome: "saltAndSovereigntyWelcomeTourVersion"
  };

  const REFLECTIONS = [
    { id: "arrive", text: "You are welcome to arrive exactly as you are." },
    { id: "performance", text: "What might soften if you did not have to perform here?" },
    { id: "reclaim", text: "What part of yourself is ready to be welcomed home?" },
    { id: "rest", text: "Rest can be a way of returning to your own wisdom." },
    { id: "sovereignty", text: "What choice would feel most like your own today?" },
    { id: "tenderness", text: "Where might tenderness be more useful than pressure?" },
    { id: "truth", text: "What truth can you hold gently, without needing to act on it yet?" },
    { id: "boundaries", text: "What boundary would help you remain present with yourself?" },
    { id: "listening", text: "You do not have to force an answer. You may simply listen inward." },
    { id: "lay-down", text: "What would you like to lay down before you enter?" }
  ];

  const GUIDES = {
    // The welcome: one page for each main part of the Sanctuary, as the app's
    // welcome tour (app/src/lib/welcomeTour.ts TOUR_PAGES, in the same order),
    // in the website's words. Shown once on Today, and again from How to.
    welcome: {
      label: "Welcome to the Sanctuary",
      finish: "Begin",
      steps: [
        ["Each day begins on Today", "Tonight’s moon and its sign, the holidays from the calendars you keep, and what is yours to do today. Click the moon or a holiday to read what it means and how to keep it. Turn to Sky & Lore at the top for the sky, what the day is good for and its correspondences."],
        ["Your altar, piece by piece", "On the Altar, open the Cabinet’s drawers for candles, herbs, crystals, tools, deities, vessels, natural finds and offerings. Click anything you place to learn its correspondences. In My Altars, your own altars are under Personal and the ones you tend with your covens under Coven."],
        ["An altar that keeps time", "Candles and incense burn in real time, offerings freshen and fade, and pots for your real houseplants ask for water. Before a festival you keep, the Seasonal drawer brings its things to the top."],
        ["Workings at the altar", "Build a spell jar or a sachet, fold a petition under a candle, or keep a spell over days. “Set tonight’s altar” on Today starts one for you."],
        ["Rituals by the moon", "In Practice → Rituals, begin a premade ritual or spell, or plan your own for the right night and run it step by step. Journal it afterwards, and on the day you chose it asks: did it work?"],
        ["Cards, runes and sigils", "Practice → Rituals → Divination draws tarot, runes, ogham, Lenormand, Kipper or a deck of your own in a spread laid out in its shape, and you can come back to the reading later. The sigil maker turns an intent into one mark, and both are open to every practice."],
        ["Your Grimoire", "Practice → Grimoire keeps your pages, with the Living Library as a section of it: herbs, crystals, deities and candle colours with their traditional lore. Your dreams live there too, with pages for the holidays and moons."],
        ["Your practice, your path", "Craft tools gathers tools for green, kitchen, hedge, cosmic, crystal, sea and folk craft. Dedication journeys, patron deities and the Closed & living traditions guide help you walk a path with care."],
        ["Calendars and reminders", "Keep the holidays of the calendars you follow, count your days by the moon, and show old calendars such as the Athenian or the Roman. Reminders turn the moon, your plans, the holidays you choose, tending and ritual planning into calendar events."],
        ["Practise with a coven", "Find or found a coven under Coven. Tend its altars together, talk in its messages, hold rites as a circle, and walk its initiation and training."],
        ["Yours on every screen", "Sign in and your altars, Grimoire, rituals and settings stay in step with the Salt & Sovereignty app. As a guest, everything stays in this browser."],
        ["Every step, when you need it", "More → How to explains each of these with the real buttons, and has a search. You can watch this welcome again from there."]
      ]
    },
    altar: {
      label: "The Altar",
      steps: [
        ["A space for your practice", "The Altar is a flexible place to arrange meaningful objects, explore correspondences, and hold personal ritual work. Nothing here is required."],
        ["Choose what belongs", "Open the Cabinet’s drawers for candles, herbs, crystals, tools, deities, vessels, natural finds, potted plants and offerings. Before a festival you keep, the Seasonal drawer brings its things to the top. My Apothecary holds what you’ve made."],
        ["Work with objects", "Select an object to move, resize, rotate, layer, lock, duplicate, or remove it when those actions apply. The bottom toolbar shows the most useful actions; See More holds the rest."],
        ["An altar that keeps time", "Candles and incense burn down in real time, offerings freshen and fade, and potted plants ask for water. Select something to light, dress, carve, cleanse, charge or tend it. The Companion explains it through Current State, Traditional Information, My Practice, Relationships, and History & Activity."],
        ["Workings", "Build a spell jar or a sachet, fold a petition under a candle, keep a spell over days, scry, or fill a gratitude bowl. “Set tonight’s altar” on Today lays out a starter for the day’s planet, moon or holiday."],
        ["Begin a ritual", "Start freely or use a Ritual Template. A completed Ritual Session becomes a journal entry connected to your Book of Shadows and Living Library, and on the day you choose it asks: did it work?"],
        ["Return to your work", "Save keeps this altar among your own; Library opens the others. Guest work stays in this browser and may be lost if its data is cleared. Signed in, your altars are the same in the app. Your coven’s altars open here too, from Coven → Altars."]
      ]
    },
    grimoire: {
      label: "Book of Shadows",
      steps: [
        ["A living record", "The Book of Shadows holds your pages, ritual journals and dreams beside the Living Library: the herbs, crystals, deities, tools and practices, each with its traditional lore."],
        ["Independent knowledge layers", "My Practice, Traditional Information, and Community Grimoire are separate layers on the same entity. Hiding a layer changes what you see, not the identity of the entity or your saved notes."],
        ["When Traditional is hidden", "Traditional entities and pages stay out of view, while My Practice and enabled Community content can remain visible. The internal Traditional Library can still help link a new My Practice entry."],
        ["Create My Practice", "Choose a category, search for a canonical Traditional entry, and add your own layer to that entity. If no match belongs, create a completely custom entity instead."],
        ["Keep building connections", "Every entity page can add or edit My Practice. Relationships connect related entries, while Rituals, Templates, Spells, and Apothecary records remain available in their existing sections."],
        ["Dreams, cards and runes", "Your dreams have their own shelf, with a dictionary of symbols. Tarot, rune and ogham pages read like a book, and readings you draw in Practice → Rituals come back to them. A completed Ritual Session can become a page of its own."],
        ["Read in your own language", "Mundane Mode offers less overtly magical wording. Guest work remains in this browser; signed in, your Book, Library, rituals and practice are the same in the Salt & Sovereignty app."]
      ]
    }
  };

  /** Storage that may refuse (private windows, blocked site data): reads come back empty, writes are dropped. */
  function safeStorage(storage) {
    return {
      getItem(key) {
        try {
          return storage?.getItem(key) ?? null;
        } catch {
          return null;
        }
      },
      setItem(key, value) {
        try {
          storage?.setItem(key, value);
        } catch {
          // Nothing to keep it in; the guide may show again next time.
        }
      },
      removeItem(key) {
        try {
          storage?.removeItem(key);
        } catch {
          // As above.
        }
      }
    };
  }

  function pageStorage() {
    try {
      return safeStorage(global.localStorage);
    } catch {
      return safeStorage(null);
    }
  }

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function readStoredJson(storage, key) {
    try {
      return JSON.parse(storage.getItem(key)) || null;
    } catch {
      return null;
    }
  }

  function selectDailyReflection(storage, date = new Date(), random = Math.random, reflections = REFLECTIONS) {
    const localDate = getLocalDateKey(date);
    const stored = readStoredJson(storage, DAILY_REFLECTION_KEY);
    const existing = reflections.find((reflection) => reflection.id === stored?.currentId);
    if (stored?.date === localDate && existing) return existing;

    const previousId = existing?.id || stored?.previousId || null;
    const candidates = reflections.length > 1
      ? reflections.filter((reflection) => reflection.id !== previousId)
      : reflections;
    const safeRandom = Math.min(Math.max(Number(random()) || 0, 0), 0.999999);
    const selected = candidates[Math.floor(safeRandom * candidates.length)] || reflections[0];

    storage.setItem(DAILY_REFLECTION_KEY, JSON.stringify({
      date: localDate,
      currentId: selected.id,
      previousId
    }));
    return selected;
  }

  function normalizeDestination(destination) {
    const value = String(destination || "");
    if (/^(?:\.\/|\/)?altar\/?(?:index\.html)?$/.test(value)) return "/altar/";
    if (/^(?:\.\/|\/)?grimoire\/?(?:index\.html)?$/.test(value)) return "/grimoire/";
    return null;
  }

  function rememberDestination(storage, destination) {
    const normalized = normalizeDestination(destination);
    if (normalized) storage.setItem(DESTINATION_KEY, normalized);
    return normalized;
  }

  function consumeDestination(storage) {
    const destination = normalizeDestination(storage.getItem(DESTINATION_KEY));
    storage.removeItem(DESTINATION_KEY);
    return destination;
  }

  function isGuideComplete(storage, kind) {
    return Boolean(GUIDE_KEYS[kind]) && safeStorage(storage).getItem(GUIDE_KEYS[kind]) === GUIDE_VERSIONS[kind];
  }

  function completeGuide(storage, kind) {
    if (!GUIDE_KEYS[kind]) return false;
    safeStorage(storage).setItem(GUIDE_KEYS[kind], GUIDE_VERSIONS[kind]);
    return true;
  }

  /** Whether the welcome should open by itself: the first visit to Today, or ?welcome=1 (How to's "Watch the welcome again"). */
  function shouldOpenWelcome(storage, search = "") {
    if (new URLSearchParams(search).get("welcome") === "1") return true;
    return !isGuideComplete(storage, "welcome");
  }

  function renderDailyThresholdReflection() {
    const target = document.querySelector("[data-threshold-question]");
    if (!target) return;
    target.textContent = selectDailyReflection(pageStorage()).text;
  }

  let activeGuide = null;

  function openGuide(kind, { manual = false, opener = document.activeElement } = {}) {
    const guide = GUIDES[kind];
    if (!guide || activeGuide || (!manual && isGuideComplete(pageStorage(), kind))) return false;

    let stepIndex = 0;
    const modal = document.createElement("div");
    modal.className = "tool-guide-modal";
    modal.dataset.toolGuideModal = kind;
    modal.innerHTML = `
      <button class="tool-guide-backdrop" type="button" data-guide-close aria-label="Close guide"></button>
      <section class="tool-guide-card" role="dialog" aria-modal="true" aria-labelledby="tool-guide-title" tabindex="-1">
        <button class="tool-guide-close" type="button" data-guide-close>Close</button>
        <p class="eyebrow">${kind === "welcome" ? guide.label : `How This Works · ${guide.label}`}</p>
        <p class="tool-guide-progress" data-guide-progress></p>
        <h2 id="tool-guide-title" data-guide-title></h2>
        <p data-guide-copy></p>
        <div class="tool-guide-actions">
          <button class="button button--ghost" type="button" data-guide-skip>Skip</button>
          <span class="tool-guide-spacer"></span>
          <button class="button" type="button" data-guide-back>Back</button>
          <button class="button button--primary" type="button" data-guide-next>Next</button>
        </div>
      </section>`;

    const card = modal.querySelector(".tool-guide-card");
    const progress = modal.querySelector("[data-guide-progress]");
    const title = modal.querySelector("[data-guide-title]");
    const copy = modal.querySelector("[data-guide-copy]");
    const back = modal.querySelector("[data-guide-back]");
    const next = modal.querySelector("[data-guide-next]");

    function renderStep() {
      const [heading, body] = guide.steps[stepIndex];
      progress.textContent = `${stepIndex + 1} of ${guide.steps.length}`;
      title.textContent = heading;
      copy.textContent = body;
      back.disabled = stepIndex === 0;
      next.textContent = stepIndex === guide.steps.length - 1 ? guide.finish || "Finish" : "Next";
    }

    function closeGuide() {
      if (!activeGuide) return;
      completeGuide(pageStorage(), kind);
      document.removeEventListener("keydown", handleKeydown);
      modal.remove();
      document.body.classList.remove("tool-guide-open");
      activeGuide = null;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeGuide();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...card.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-guide-close], [data-guide-skip]")) return closeGuide();
      if (event.target.closest("[data-guide-back]") && stepIndex > 0) {
        stepIndex -= 1;
        renderStep();
      }
      if (event.target.closest("[data-guide-next]")) {
        if (stepIndex === guide.steps.length - 1) return closeGuide();
        stepIndex += 1;
        renderStep();
      }
    });

    activeGuide = { kind, modal };
    document.body.appendChild(modal);
    document.body.classList.add("tool-guide-open");
    document.addEventListener("keydown", handleKeydown);
    renderStep();
    card.focus();
    return true;
  }

  function initializeGuides() {
    const kind = document.body.classList.contains("grimoire-page-shell")
      ? "grimoire"
      : document.body.classList.contains("altar-page")
        ? "altar"
        : document.querySelector("[data-welcome-tour]")
          ? "welcome"
          : null;
    if (!kind) return;

    document.addEventListener("click", (event) => {
      const button = event.target.closest(`[data-tool-guide="${kind}"]`);
      if (button) openGuide(kind, { manual: true, opener: button });
    });

    // The welcome opens by itself the first time someone reaches Today.
    if (kind === "welcome" && shouldOpenWelcome(pageStorage(), global.location?.search || "")) {
      const forced = new URLSearchParams(global.location.search).get("welcome") === "1";
      if (forced) {
        const url = new URL(global.location.href);
        url.searchParams.delete("welcome");
        global.history?.replaceState?.(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }
      global.setTimeout(() => openGuide("welcome", { manual: forced }), 400);
    }
  }

  const api = {
    DAILY_REFLECTION_KEY,
    DESTINATION_KEY,
    GUIDE_VERSION,
    GUIDE_VERSIONS,
    GUIDE_KEYS,
    GUIDES,
    REFLECTIONS,
    getLocalDateKey,
    selectDailyReflection,
    normalizeDestination,
    rememberDestination,
    consumeDestination,
    isGuideComplete,
    completeGuide,
    shouldOpenWelcome,
    safeStorage,
    renderDailyThresholdReflection,
    openGuide
  };

  global.WelcomeDiscovery = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof document !== "undefined") {
    const start = () => {
      renderDailyThresholdReflection();
      initializeGuides();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
