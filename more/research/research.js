/*
 * A note on our research (the app's More → A note on our research): the
 * owner's note on how everything here was researched, and a way to send a
 * note. The words are the app's own, via js/core/research.js and
 * js/research-note.js.
 */
(function (global) {
  const root = global.document.querySelector("[data-page-root]");
  const N = global.ResearchNote;
  const { header, unavailable } = global.GuidesUI;
  if (!N?.ready) return unavailable(root, "The note");
  root.innerHTML = `${header({ title: "A note on our research", eyebrow: "From Salt & Sovereignty", back: "/?sanctuary=more", backLabel: "Back to More" })}
    ${N.noteHtml()}`;
})(window);
