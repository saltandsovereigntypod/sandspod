/* The journal's front page (/blog/, built by scripts/build-library-blog.mjs):
   search the Living Library's posts and show one kind at a time. Without
   JavaScript the page is plain lists by kind, so the form stays hidden. */
(function () {
  "use strict";
  var form = document.querySelector("[data-lib-filter]");
  if (!form) return;
  var search = form.querySelector("[data-lib-search]");
  var kind = form.querySelector("[data-lib-type]");
  var empty = document.querySelector("[data-lib-empty]");
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
  form.hidden = false;

  function apply() {
    var words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var type = kind.value;
    var shown = 0;
    groups.forEach(function (group) {
      var visible = 0;
      if (type && group.getAttribute("data-group") !== type) {
        group.hidden = true;
        return;
      }
      Array.prototype.forEach.call(group.querySelectorAll("[data-search]"), function (card) {
        var text = card.getAttribute("data-search");
        var match = words.every(function (word) { return text.indexOf(word) >= 0; });
        card.hidden = !match;
        if (match) visible += 1;
      });
      group.hidden = visible === 0;
      shown += visible;
    });
    if (empty) empty.hidden = shown > 0;
  }

  search.addEventListener("input", apply);
  kind.addEventListener("change", apply);
  var params = new URLSearchParams(window.location.search);
  if (params.get("q")) search.value = params.get("q");
  if (params.get("type")) kind.value = params.get("type");
  if (search.value || kind.value) apply();
})();
