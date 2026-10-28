/*
 * Craft tools (/practice/): a page of tools for each of the ten kinds of
 * practice, the ones chosen in My practice (the `my_practice` setting,
 * shared with the app) first. The practices can be chosen here too.
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
    return [
      kit.head({ eyebrow: "Tools for your craft", title: "Craft tools" }),
      chosen.length
        ? kit.section("Your crafts", kit.list(chosen.map(practiceRow)), { id: "yours" })
        : kit.muted("Choose your crafts below (or in the app under Settings → Your crafts) to put their tools first. Every practice’s tools are open to you either way."),
      kit.section(chosen.length ? "Other practices" : "Practices", kit.list(others.map(practiceRow)), { id: "others" }),
      kit.list([
        kit.row({ url: kit.href.premadeList(null), title: "Workings library", detail: "Premade rituals and spells for every practice, yours first" })
      ]),
      kit.details(
        "Choose your crafts",
        `${kit.caption("Choose as many as fit. The Workings library puts workings for your crafts first, and your path (the traditions you keep) adds its own.")}<fieldset class="sp-section" style="border:0;padding:0;margin:0"><legend class="pr-visually-hidden">How you practise</legend>${chooser}</fieldset>${kit.notice(
          state.message,
          { live: true }
        )}${kit.caption(state.user ? "Saved with your account, so the app sees it too." : "Saved in this browser. Sign in to keep it with your account and the app.")}`,
        { id: "choose", open: !mine.length }
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
