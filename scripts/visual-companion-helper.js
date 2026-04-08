function postEvent(evt) {
  return fetch("/__events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(evt),
    keepalive: true,
  }).catch(() => {});
}

function selectedChoices() {
  return Array.from(document.querySelectorAll("[data-choice].selected")).map(
    (el) => el.getAttribute("data-choice"),
  );
}

window.toggleSelect = function toggleSelect(el) {
  if (!(el instanceof Element)) return;
  const parent = el.closest(".options");
  const multi = parent?.hasAttribute("data-multiselect");
  if (!multi) {
    for (const n of document.querySelectorAll("[data-choice].selected")) {
      n.classList.remove("selected");
    }
  }
  el.classList.toggle("selected");

  const choice = el.getAttribute("data-choice");
  const text = (el.textContent ?? "").trim().slice(0, 240);
  postEvent({
    type: "click",
    choice,
    text,
    selected: selectedChoices(),
    timestamp: Math.floor(Date.now() / 1000),
  });
};
