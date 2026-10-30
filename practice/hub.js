/*
 * The Craft home (/practice/): Practice's third section, as the app's
 * rituals/craft/index.tsx. The practice tools that aren't rituals, grouped:
 * Body & moon (Cycle & Moon), The sky (astrology), Divination & sigils, then
 * the Craft tools by path, the ones chosen in My practice (the `my_practice`
 * setting, shared with the app) first. The practices can be chosen here too.
 * Every tool keeps its old address (/rituals/cycle/, /divination/, /sigil/,
 * /practice/<path>/); js/site-nav.js lights Craft on all of them.
 * Dedication journeys stay on the Rituals home; Craft points to them.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  if (!kit || !core) return;
  const { PRACTICES, myPractices, practicesValue } = core.premade;
  const { CRAFT_TOOLS } = core.practices;

  /** The hub's two lists, yours first. Pure. */
  function hubLists(settings) {
    const mine = myPractices(settings);
    return { mine, chosen: PRACTICES.filter((p) => mine.includes(p.id)), others: PRACTICES.filter((p) => !mine.includes(p.id)) };
  }

  const root = kit.root();
  let state = { settings: {}, user: null, saving: false, message: "" };

  const practiceRow = (p) => kit.row({ url: kit.href.practice(p.id), title: p.name, detail: CRAFT_TOOLS[p.id].map((t) => t.title).join(" · ") });

  function view() {
    const { mine, chosen, others } = hubLists(state.settings);
    const chooser = PRACTICES.map((p) =>
      kit.toggle({ id: `practice-${p.id}`, label: p.name, detail: p.about, checked: mine.includes(p.id), change: "choose" })
    ).join("");
    const paths = chosen.length
      ? `${kit.caption("Your crafts")}${kit.list(chosen.map(practiceRow), "Your crafts")}${kit.caption("Other practices")}${kit.list(others.map(practiceRow), "Other practices")}`
      : `${kit.muted("Choose your crafts below (or in the app under Settings → Your crafts) to put their tools first. Every practice’s tools are open to you either way.")}${kit.list(
          others.map(practiceRow),
          "Practices"
        )}`;
    return [
      kit.head({
        eyebrow: "Tools for your practice",
        title: "Craft",
        lede: "The tools that aren’t rituals: your body and the moon, the sky, the cards, and a page of tools for each kind of craft."
      }),
      kit.section(
        "Body & moon",
        kit.list([kit.row({ url: "/rituals/cycle/", title: "Cycle & Moon", detail: "Your cycle beside the moon, or the moon alone · private and encrypted" })]),
        { id: "body" }
      ),
      kit.section(
        "The sky",
        kit.list([
          kit.row({ url: "/practice/cosmic/chart/", title: "Astrology", detail: "Your birth chart, today’s transits and planetary hours · private and encrypted" }),
          kit.row({ url: "/practice/cosmic/hours/", title: "Planetary hours", detail: "The planet ruling this hour and day, and what each is good for" }),
          kit.row({ url: "/practice/cosmic/timing/", title: "Find a good time", detail: "The spell timing advisor: the best times ahead for a working, and why" }),
          kit.row({ url: "/practice/cosmic/learn/", title: "Learn astrology", detail: "Every planet, sign, house and aspect explained · simply or in depth" })
        ]),
        { id: "sky" }
      ),
      kit.section(
        "Divination & sigils",
        kit.list([
          kit.row({ url: "/divination/", title: "Divination", detail: "Draw cards, runes or ogham · your readings, decks and card meanings" }),
          kit.row({ url: "/divination/draw/", title: "Draw cards, runes or ogham", detail: "A card for the day, the Celtic Cross and many more spreads, or one of your own" }),
          kit.row({ url: "/sigil/", title: "Sigil maker", detail: "An intent made into one mark, from its letters or a planetary square" })
        ]),
        { id: "divination" }
      ),
      kit.section("Craft tools by path", paths, { id: "paths" }),
      kit.details(
        "Choose your crafts",
        `${kit.caption("Choose as many as fit. The Workings library puts workings for your crafts first, and your path (the traditions you keep) adds its own.")}<fieldset class="sp-section" style="border:0;padding:0;margin:0"><legend class="pr-visually-hidden">How you practise</legend>${chooser}</fieldset>${kit.notice(
          state.message,
          { live: true }
        )}${kit.caption(state.user ? "Saved with your account, so the app sees it too." : "Saved in this browser. Sign in to keep it with your account and the app.")}`,
        { id: "choose", open: !mine.length }
      ),
      kit.section(
        "Elsewhere in Practice",
        kit.list([
          kit.row({ url: "/rituals/journeys/", title: "Dedication journeys", detail: "On Rituals · study, practice and a rite of self-dedication to a path or a god" }),
          kit.row({ url: kit.href.premadeList(null), title: "Workings library", detail: "On Rituals · premade rituals and spells for every practice, yours first" }),
          kit.row({ url: "/grimoire/dreams/", title: "Your dreams", detail: "In your Grimoire · your dream journal and a dictionary of symbols" })
        ]),
        { id: "elsewhere" }
      )
    ].join("");
  }

  const draw = () => kit.render(root, view());

  kit.delegate(root, {
    async choose() {
      if (state.saving) return;
      const ids = PRACTICES.map((p) => p.id).filter((id) => root.querySelector(`#practice-${id}`)?.checked);
      state.saving = true;
      try {
        state.settings = await global.SaltSettings.patch({ my_practice: practicesValue(ids) });
        state.message = ids.length ? "Saved. Your practice comes first." : "Saved.";
      } catch (error) {
        console.error(error);
        state.message = "That couldn’t be saved. Please try again.";
      } finally {
        state.saving = false;
        draw();
      }
    }
  });

  kit.start(async (user) => {
    state.user = user;
    state.settings = await kit.settings();
    draw();
  });

  global.PracticeHub = { hubLists };
})(window);
