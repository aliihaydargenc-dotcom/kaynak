import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("research catalog has unique IDs and credible citations", () => {
  const items = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url)));
  assert.ok(items.length >= 3);
  assert.equal(new Set(items.map(item => item.id)).size, items.length);
  for (const item of items) {
    assert.ok(Array.isArray(item.links) && item.links.every(link => new URL(link).protocol === "https:"));
    assert.ok(item.title && item.summary && item.confidence);
  }
});

test("HTML routes match the generated static folder structure", () => {
  const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
  assert.match(html, /\.\/styles\.css/);
  assert.match(html, /\.\/app\.js/);
  assert.match(html, /\.\.\/research\/implementation-roadmap\.md/);
});
