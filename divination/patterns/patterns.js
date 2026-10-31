/*
 * Divination → Your patterns (/divination/patterns/): what your own draw log
 * says over time, as the app's Craft → Divination → Your patterns shows it
 * (app/src/app/(tabs)/rituals/divination/patterns.tsx). The same readings
 * (craft_entries, `hedge.readings`, via SaltCraft) and the same logic
 * (js/core/patterns.js, built from app/src/lib/divination/patterns.ts).
 * Nothing is stored or sent; it's all read from the log.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.patterns;
  const B = global.SaltBars;
  const root = kit?.root();
  if (!kit || !core || !B || !root) return;

  const { patterns: P, readings: R } = core;
  const esc = kit.esc;
  const params = new URLSearchParams(global.location.search);
  let range = P.isRange(params.get("range")) ? params.get("range") : "all";
  let all = [];
  let loaded = false;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const card = (c, deck) => (c.ref ? P.cardWebPath({ ref: c.ref, deck: deck ?? c.deck ?? null }) : null);
  const titleOf = (balance) =>
    balance.kind === "tarot" ? "Suits and elements" : balance.kind === "runes" ? "The three aettir" : balance.kind === "ogham" ? "The four aicmí" : "Lenormand’s playing suits";

  function view() {
    const now = new Date();
    const list = P.readingsInRange(all, range, now);
    const p = P.divinationPatterns(list, now);
    const lines = P.patternLines(p);
    const head = [
      kit.back("/divination/", "Divination"),
      kit.head({ eyebrow: "Divination", title: "Your patterns", lede: "What your own readings say over time: the cards that come most, where they lean, and the ones you haven’t met yet. Only you see this." }),
      kit.chips(
        P.RANGES.map((r) => kit.chip({ label: r.label, act: "range", value: r.id, pressed: range === r.id })),
        "How far back"
      )
    ];
    if (!loaded) return [...head, kit.muted("Opening…")].join("");
    if (p.readings < P.MIN_READINGS) {
      return [
        ...head,
        kit.card(
          kit.p(
            all.length < P.MIN_READINGS
              ? "Draw or log a few readings and your patterns will gather here: the cards that keep coming, the suits and elements they lean to, the moons you draw under, and the cards you haven’t met yet."
              : "Not enough readings in this time to show patterns. Try a longer time."
          ) + kit.list([kit.row({ url: "/divination/draw/?spread=daily", title: "Draw a card for the day" })])
        ),
        keepGoing()
      ].join("");
    }
    const out = [...head];
    if (lines.length) out.push(kit.card(lines.map((l) => kit.p(l)).join(""), { gold: true }));
    out.push(
      kit.section(
        "Drawn most",
        kit.card(
          B.bars(
            p.top.map((c) => ({
              label: c.name,
              count: c.count,
              url: card(c),
              detail: kit.join([c.title, c.reversed ? `${c.reversed} reversed` : null, c.readings < c.count ? `in ${plural(c.readings, "reading", "readings")}` : null]) || null
            })),
            ["time", "times"]
          ) + kit.muted("Choose a card for its page, in the deck you drew it with most.")
        )
      )
    );
    if (p.byMethod.length > 1) out.push(kit.section("How you read", kit.card(B.bars(p.byMethod.map((m) => ({ label: m.label, count: m.count })), ["reading", "readings"]))));
    if (p.tarotDecks.length)
      out.push(
        kit.section(
          "Your tarot decks",
          kit.card(
            B.bars(p.tarotDecks.map((d) => ({ label: d.label, count: d.count })), ["reading", "readings"]) +
              kit.muted("Each card’s page reads in the deck it was drawn with: Waite’s for the Rider–Waite–Smith, the Marseille’s and the Sola Busca’s own.") +
              kit.list([kit.row({ url: "/divination/decks/", title: "Your decks and their meanings" })])
          )
        )
      );
    for (const b of p.balances) {
      out.push(
        kit.section(
          titleOf(b),
          kit.card(
            B.bars(b.bars.map((bar) => ({ label: bar.label, note: bar.note, count: bar.count })), ["draw", "draws"]) + (b.line ? kit.p(b.line) : "") + (b.kind === "tarot" ? kit.muted(P.ELEMENTS_NOTE) : "")
          )
        )
      );
    }
    if (p.reversals) {
      out.push(
        kit.section(
          "Reversals",
          kit.card(
            B.meter(p.reversals.share, `${p.reversals.reversed} of ${plural(p.reversals.reversible, "tarot or oracle card", "tarot and oracle cards")} came reversed (${Math.round(p.reversals.share * 100)}%)`) +
              kit.muted("Only draws with reversals turned on, and readings logged by hand that say “reversed”, can show here. Settings for the draw are on the draw page.")
          )
        )
      );
    }
    if (p.themes.length) {
      out.push(
        kit.section(
          "Around your questions",
          kit.muted("The cards that came more than once for a kind of question, by the words in it, or what you drew for.") +
            p.themes
              .map((t) =>
                kit.card(
                  kit.p(`${t.label} · ${plural(t.readings, "reading", "readings")}`) +
                    (t.cards.length
                      ? `<div class="sp-chips">${t.cards.map((c) => (c.ref ? `<a class="sp-chip" href="${esc(card(c))}" aria-label="${esc(`${c.name}, ${c.count} times. Opens its page`)}">${esc(`${c.name} · ${c.count}`)}</a>` : kit.chip({ label: `${c.name} · ${c.count}` }))).join("")}</div>`
                      : kit.muted("No card has come twice for these yet."))
                )
              )
              .join("")
        )
      );
    }
    out.push(
      kit.section(
        "By the moon",
        kit.card(
          B.bars(
            p.byPhase.map((r) => ({ label: r.phase, count: r.readings, moon: B.PHASE_LIGHT[r.phase], detail: r.top ? `Most often: ${r.top}` : null })),
            ["reading", "readings"]
          ) + kit.list([kit.row({ url: "/today/holy/?ref=moon-full", title: "The moon’s phases and what they’re for" })])
        )
      )
    );
    out.push(
      kit.section(
        "By the day and its planet",
        kit.card(
          B.bars(p.byDay.map((r) => ({ label: r.day, note: r.planet, count: r.readings, detail: r.top ? `Most often: ${r.top}` : null })), ["reading", "readings"]) +
            kit.list([kit.row({ url: "/practice/cosmic/timing/", title: "Timing by planet and moon" })])
        )
      )
    );
    const s = p.streaks;
    out.push(
      kit.section(
        "Streaks",
        kit.card(
          kit.p(s.current ? `${plural(s.current, "day", "days")} running, now.` : "No streak running just now.") +
            kit.p(`Longest: ${plural(s.longest, "day", "days")}${s.longestEnd ? `, to ${kit.fullDate(s.longestEnd) ?? s.longestEnd}` : ""}. ${plural(s.days, "day", "days")} with a reading in all.`) +
            (s.card && s.card.ref ? kit.list([kit.row({ url: card(s.card), title: `${s.card.name} came ${s.card.run} readings in a row`, detail: "Its page" })]) : "") +
            kit.muted("A streak is for noticing, not for keeping up. A day without a draw is a day too.")
        )
      )
    );
    if (p.notMet.length) {
      out.push(
        kit.section(
          "Cards you haven’t met yet",
          p.notMet
            .map((m) =>
              kit.card(
                B.meter(m.met / m.total, `${m.label}: ${m.met} of ${m.total} met`) +
                  (m.missing.length
                    ? kit.details(
                        `${m.missing.length} still to meet`,
                        `<div class="sp-chips">${m.missing.map((c) => `<a class="sp-chip" href="${esc(card(c))}" aria-label="${esc(`${c.name}. Opens its page`)}">${esc(c.name)}</a>`).join("")}</div>`
                      )
                    : kit.p("You’ve met every one.")) +
                  kit.list([kit.row({ url: P.LEARN[m.kind].web, title: P.LEARN[m.kind].label }), kit.row({ url: `/help/#${P.LEARN[m.kind].help}`, title: "How to" })])
              )
            )
            .join("")
        )
      );
    }
    const linked = p.all.filter((c) => c.ref);
    const own = p.all.filter((c) => !c.ref);
    out.push(
      kit.section(
        "Every card counted",
        kit.details(
          plural(p.all.length, "card, rune or stave", "cards, runes and staves"),
          kit.list(linked.map((c) => kit.row({ url: card(c), title: P.cardCountLine(c) }))) + (own.length ? kit.muted(`From your own decks: ${own.map(P.cardCountLine).join("; ")}.`) : "")
        )
      )
    );
    out.push(keepGoing());
    return out.join("");
  }

  function keepGoing() {
    return kit.section(
      "Keep going",
      kit.list([
        kit.row({ url: "/divination/draw/", title: "Draw cards, runes or ogham" }),
        kit.row({ url: "/grimoire/", title: "Card meanings", detail: "Tarot, runes, ogham, Lenormand and Kipper, in your Grimoire under Traditional Information" }),
        kit.row({ url: "/grimoire/year/", title: "Your year in review", detail: "The cards in it, beside your rituals, moons and dreams" }),
        kit.row({ url: "/help/#divination-patterns", title: "How to: your patterns" })
      ])
    );
  }

  const draw = () => kit.render(root, view());

  kit.delegate(root, {
    range(el) {
      if (!P.isRange(el.dataset.value)) return;
      range = el.dataset.value;
      draw();
    }
  });

  kit.start(async () => {
    const list = await kit.entries(R.READINGS);
    all = list.map((e) => ({ ...e, data: R.normalizeReading(e.data) }));
    loaded = true;
    draw();
  });
})(window);
