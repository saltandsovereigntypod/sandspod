const altarStage = document.querySelector("[data-altar-stage]");
const altarTools = document.querySelectorAll("[data-object]");
const emptyMessage = document.querySelector("[data-empty-message]");

function updateEmptyMessage() {
  if (!altarStage || !emptyMessage) return;

  const objects = altarStage.querySelectorAll(".altar-object");
  emptyMessage.hidden = objects.length > 0;
}

function placeObject(symbol, label) {
  if (!altarStage) return;

  const object = document.createElement("button");
  object.type = "button";
  object.className = "altar-object";
  object.textContent = symbol;
  object.setAttribute("aria-label", `Remove ${label}`);

  const existingObjects = altarStage.querySelectorAll(".altar-object").length;
  const row = Math.floor(existingObjects / 5);
  const column = existingObjects % 5;

  object.style.left = `${18 + column * 14}%`;
  object.style.top = `${54 + row * 12}%`;

  object.addEventListener("click", () => {
    object.remove();
    updateEmptyMessage();
  });

  altarStage.appendChild(object);
  updateEmptyMessage();
}

altarTools.forEach((tool) => {
  tool.addEventListener("click", () => {
    const symbol = tool.dataset.object;
    const label = tool.dataset.label || "object";

    placeObject(symbol, label);
  });
});

updateEmptyMessage();
