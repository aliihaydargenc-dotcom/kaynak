"use strict";

const categories = {
  event: "ETKİNLİK",
  hotel: "OTEL / FİYAT",
  internal: "KOD TABANI"
};
const confidences = {
  "official-docs-and-rea": "Resmî belge + REA",
  "official-help": "Resmî yardım",
  "official-product-docs": "Resmî belge",
  "official-api-docs": "Resmî API",
  "own-source-code": "Kendi kaynak kodu"
};
const cards = document.getElementById("cards");
const search = document.getElementById("source-search");
const resultCount = document.getElementById("result-count");
const empty = document.getElementById("empty");
let sources = [];
let category = "all";

function el(name, className, textValue) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (textValue !== undefined) node.textContent = textValue;
  return node;
}
function card(source) {
  const article = el("article", "card");
  const top = el("div", "card-top");
  top.append(el("span", "category-badge " + source.category, categories[source.category]));
  top.append(el("span", "card-confidence", confidences[source.confidence] || "Belirsiz"));
  article.append(top);
  article.append(el("h3", "card-title", source.title));
  article.append(el("p", "card-summary", source.summary));
  const tags = el("div", "tags");
  source.features.slice(0, 4).forEach(label => tags.append(el("span", "tag", label)));
  article.append(tags);
  const footer = el("div", "card-footer");
  footer.append(el("span", "tech", source.technologies.join(" / ")));
  const a = el("a", "link", "Kaynağı aç ↗");
  a.href = source.links[0];
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", source.title + " için kaynak bağlantısını aç");
  footer.append(a);
  article.append(footer);
  return article;
}
function render() {
  const query = search.value.trim().toLocaleLowerCase("tr");
  const filtered = sources.filter(source =>
    (category === "all" || source.category === category) &&
    [source.title, source.summary, ...source.features, ...source.technologies]
      .join(" ").toLocaleLowerCase("tr").includes(query)
  );
  cards.replaceChildren(...filtered.map(card));
  resultCount.textContent = filtered.length + " kaynak gösteriliyor";
  empty.hidden = filtered.length !== 0;
}
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    category = button.dataset.category;
    document.querySelectorAll(".filter").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});
search.addEventListener("input", render);

fetch("../data/sources.json", { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("Kaynak kataloğu yüklenemedi: " + response.status);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error("Katalog yapısı geçersiz");
    sources = data;
    document.getElementById("source-count").textContent = sources.length;
    document.getElementById("event-count").textContent =
      sources.filter(item => item.category === "event" || item.category === "internal").length;
    document.getElementById("hotel-count").textContent =
      sources.filter(item => item.category === "hotel").length;
    render();
  })
  .catch(error => {
    resultCount.textContent = error.message;
    empty.hidden = false;
    empty.querySelector("strong").textContent = "Kaynaklar şu anda görüntülenemiyor.";
    empty.querySelector("p").textContent = "Sorun devam ediyorsa site yöneticisine başvurun.";
  });
