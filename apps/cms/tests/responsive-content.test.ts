import assert from "node:assert/strict";
import test from "node:test";
import { Children, createElement, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductDetailPage } from "../src/components/products/ProductDetailPage";
import { ProductHero } from "../src/components/products/ProductHero";
import type { ProductViewModel } from "../src/lib/cms/view-models";

const product: ProductViewModel = {
  id: 1,
  slug: "test-product",
  name: "Test product",
  type: "Surfactant",
  summary: "Test description",
  functionalities: ["Anti Drift"],
  functionalitySlugs: ["anti-drift"],
  formulations: [],
  formulationSlugs: [],
  labels: [],
  labelSlugs: [],
  manufacturingSite: "Malaysia",
  casNumber: "Not specified",
};

function renderDetailContent(value: ProductViewModel) {
  // Test the actual application-profile element without rendering Next's router-dependent chrome.
  const main = Children.toArray(ProductDetailPage({ product: value }).props.children)
    .find((child) => isValidElement(child) && child.type === "main");
  assert.ok(isValidElement<{ children: ReactNode }>(main));
  const article = Children.toArray(main.props.children)[0];
  assert.ok(isValidElement<{ children: ReactNode }>(article));
  const sections = Children.toArray(article.props.children)
    .filter((child) => isValidElement(child) && child.type === "section");
  return sections.map((section) => renderToStaticMarkup(section)).join("");
}

test("empty product attributes retain their panels with accessible em-dash placeholders", () => {
  const html = renderDetailContent(product);
  assert.match(html, /<h2>Functionalities<\/h2>/);
  assert.match(html, /<h2>Formulation Type<\/h2>/);
  assert.match(html, /<h2>Regulatory\/Labels<\/h2>/);
  assert.equal((html.match(/<span aria-hidden="true">—<\/span>/g) ?? []).length, 2);
  assert.equal((html.match(/<span class="visually-hidden">Not specified<\/span>/g) ?? []).length, 2);
  const emptyHtml = renderDetailContent({ ...product, functionalities: [], functionalitySlugs: [] });
  assert.match(emptyHtml, /class="product-spec-panel"/);
  assert.equal((emptyHtml.match(/<span aria-hidden="true">—<\/span>/g) ?? []).length, 3);
  assert.equal((emptyHtml.match(/<span class="visually-hidden">Not specified<\/span>/g) ?? []).length, 3);
});

test("populated product attributes remain visible", () => {
  const html = renderDetailContent({ ...product, formulations: ["Oil Dispersion (OD)"], labels: ["REACH"] });
  assert.match(html, /<h2>Formulation Type<\/h2>/);
  assert.match(html, /Oil Dispersion \(OD\)/);
  assert.match(html, /<h2>Regulatory\/Labels<\/h2>/);
  assert.match(html, /REACH/);
  assert.doesNotMatch(html, /<span aria-hidden="true">—<\/span>/);
});

test("slash-separated hero titles preserve text with a safe line-break opportunity", () => {
  const html = renderToStaticMarkup(createElement(ProductHero, { title: "Regulatory/Labels" }));
  assert.match(html, /<h1>Regulatory\/<wbr\/>Labels<\/h1>/);
});
