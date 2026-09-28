import test from "node:test";
import assert from "node:assert/strict";
import type {
  ProductCategoryGroups,
  ProductViewModel,
} from "../src/lib/cms/view-models";
import {
  calculateFacetCounts,
  createEmptyFilterState,
  filterProducts,
  paginateProducts,
  parseFilterState,
  toggleProductFilter,
  updateFilterParams,
} from "../src/lib/product-filtering";

const option = (slug: string, name = slug) => ({ id: slug, slug, name });

const groups: ProductCategoryGroups = {
  functionalities: {
    label: "Product Function",
    description: "",
    options: [option("adjuvants"), option("emulsifiers"), option("dispersants"), option("soil-moisture-retainers")],
  },
  "formulation-type": {
    label: "Formulation Type",
    description: "",
    options: [option("ec"), option("od"), option("sl")],
  },
  "regulatory-labels": {
    label: "Regulatory / Labels",
    description: "",
    options: [option("epa"), option("reach"), option("microplastic-free")],
  },
};

function product(
  id: number,
  name: string,
  functions: string[],
  formulations: string[],
  labels: string[],
): ProductViewModel {
  return {
    id,
    slug: name.toLowerCase(),
    name,
    type: `${name} chemistry`,
    summary: `${name} summary`,
    functionalities: functions,
    functionalitySlugs: functions,
    formulations,
    formulationSlugs: formulations,
    labels,
    labelSlugs: labels,
    manufacturingSite: "Malaysia",
    casNumber: "Not specified",
  };
}

const products = [
  product(1, "Alpha", ["adjuvants"], ["ec"], ["epa"]),
  product(2, "Beta", ["emulsifiers"], ["ec"], ["reach"]),
  product(3, "Gamma", ["adjuvants", "emulsifiers"], ["od"], ["epa"]),
  product(4, "Delta", ["dispersants"], ["od"], []),
  product(5, "Echo", ["emulsifiers"], ["od"], ["epa"]),
];

test("no filters returns every published product supplied by the CMS query", () => {
  assert.equal(filterProducts(products, createEmptyFilterState()).length, 5);
});

test("single filters work for function, formulation, and regulatory label", () => {
  const state = createEmptyFilterState();
  state.selected.functionalities = ["emulsifiers"];
  assert.deepEqual(filterProducts(products, state).map(({ name }) => name), ["Beta", "Gamma", "Echo"]);
  state.selected.functionalities = [];
  state.selected["formulation-type"] = ["ec"];
  assert.equal(filterProducts(products, state).length, 2);
  state.selected["formulation-type"] = [];
  state.selected["regulatory-labels"] = ["epa"];
  assert.equal(filterProducts(products, state).length, 3);
});

test("same-group selections use OR while different groups use AND", () => {
  const state = createEmptyFilterState();
  state.selected.functionalities = ["adjuvants", "emulsifiers"];
  assert.equal(filterProducts(products, state).length, 4);
  state.selected["formulation-type"] = ["ec"];
  assert.equal(filterProducts(products, state).length, 2);
});

test("search combines with category filters", () => {
  const state = createEmptyFilterState();
  state.query = "gamma";
  state.selected.functionalities = ["emulsifiers"];
  assert.deepEqual(filterProducts(products, state).map(({ name }) => name), ["Gamma"]);
  state.selected["formulation-type"] = ["ec"];
  assert.equal(filterProducts(products, state).length, 0);
});

test("facet counts exclude their own group and respect search and other groups", () => {
  const state = createEmptyFilterState();
  state.selected.functionalities = ["emulsifiers"];
  state.selected["formulation-type"] = ["ec"];
  const counts = calculateFacetCounts(products, groups, state);
  assert.deepEqual(counts.functionalities, {
    adjuvants: 1,
    emulsifiers: 1,
    dispersants: 0,
    "soil-moisture-retainers": 0,
  });
  assert.deepEqual(counts["formulation-type"], { ec: 1, od: 2, sl: 0 });
  assert.equal(counts["regulatory-labels"].epa, 0);
  assert.equal(counts["regulatory-labels"].reach, 1);
});

test("zero-count taxonomy options remain present in facet output", () => {
  const counts = calculateFacetCounts(products, groups, createEmptyFilterState());
  assert.equal(counts.functionalities["soil-moisture-retainers"], 0);
  assert.equal(counts["regulatory-labels"]["microplastic-free"], 0);
});

test("pagination reports the pre-pagination total and clamps the page", () => {
  const many = Array.from({ length: 52 }, (_, index) => index);
  const page = paginateProducts(many, 2);
  assert.equal(page.total, 52);
  assert.equal(page.items.length, 20);
  assert.equal(page.page, 2);
  assert.equal(paginateProducts(many, 99).page, 3);
});

test("filter changes reset pagination and toggling again clears the selection", () => {
  const state = createEmptyFilterState();
  state.page = 3;
  const selected = toggleProductFilter(state, "functionalities", "emulsifiers");
  assert.equal(selected.page, 1);
  assert.deepEqual(selected.selected.functionalities, ["emulsifiers"]);
  assert.deepEqual(toggleProductFilter(selected, "functionalities", "emulsifiers").selected.functionalities, []);
});

test("URL state restores valid filters, search, and pagination", () => {
  const params = new URLSearchParams("function=emulsifiers&formulation=ec&label=epa&q=alpha&page=2");
  const state = parseFilterState(params, groups);
  assert.deepEqual(state.selected.functionalities, ["emulsifiers"]);
  assert.deepEqual(state.selected["formulation-type"], ["ec"]);
  assert.deepEqual(state.selected["regulatory-labels"], ["epa"]);
  assert.equal(state.query, "alpha");
  assert.equal(state.page, 2);
  assert.equal(updateFilterParams(new URLSearchParams(), state).toString(), params.toString());
});

test("clear all restores the complete list", () => {
  const filtered = createEmptyFilterState();
  filtered.query = "alpha";
  filtered.selected.functionalities = ["adjuvants"];
  assert.equal(filterProducts(products, filtered).length, 1);
  assert.equal(filterProducts(products, createEmptyFilterState()).length, products.length);
});
