import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("every same-group and cross-group selection uses AND", () => {
  const state = createEmptyFilterState();
  state.selected.functionalities = ["adjuvants", "emulsifiers"];
  assert.deepEqual(filterProducts(products, state).map(({ name }) => name), ["Gamma"]);
  state.selected["formulation-type"] = ["ec"];
  assert.equal(filterProducts(products, state).length, 0);
});

test("search combines with category filters", () => {
  const state = createEmptyFilterState();
  state.query = "gamma";
  state.selected.functionalities = ["emulsifiers"];
  assert.deepEqual(filterProducts(products, state).map(({ name }) => name), ["Gamma"]);
  state.selected["formulation-type"] = ["ec"];
  assert.equal(filterProducts(products, state).length, 0);
});

test("search matches product names and every taxonomy field case-insensitively", () => {
  const cases = [
    ["LpH", ["Alpha"]],
    ["ULSIF", ["Beta", "Gamma", "Echo"]],
    ["oD", ["Gamma", "Delta", "Echo"]],
    ["eAcH", ["Beta"]],
  ] as const;

  for (const [query, expected] of cases) {
    const state = createEmptyFilterState();
    state.query = query;
    assert.deepEqual(filterProducts(products, state).map(({ name }) => name), expected);
  }
});

test("search returns each product once and handles empty and no-result queries", () => {
  const state = createEmptyFilterState();
  state.query = "gamma";
  assert.deepEqual(filterProducts(products, state).map(({ name }) => name), ["Gamma"]);

  state.query = "does-not-exist";
  assert.deepEqual(filterProducts(products, state), []);

  state.query = "   ";
  assert.equal(filterProducts(products, state).length, products.length);
});

test("facet counts are prospective AND counts and selected options show the current total", () => {
  const state = createEmptyFilterState();
  state.selected.functionalities = ["emulsifiers"];
  state.selected["formulation-type"] = ["ec"];
  const counts = calculateFacetCounts(products, groups, state);
  assert.deepEqual(counts.functionalities, {
    adjuvants: 0,
    emulsifiers: 1,
    dispersants: 0,
    "soil-moisture-retainers": 0,
  });
  assert.deepEqual(counts["formulation-type"], { ec: 1, od: 0, sl: 0 });
  assert.equal(counts["regulatory-labels"].epa, 0);
  assert.equal(counts["regulatory-labels"].reach, 1);
});

test("adding any filter can only preserve or reduce the result total", () => {
  let state = createEmptyFilterState();
  const totals = [filterProducts(products, state).length];
  state = toggleProductFilter(state, "functionalities", "emulsifiers");
  totals.push(filterProducts(products, state).length);
  state = toggleProductFilter(state, "functionalities", "adjuvants");
  totals.push(filterProducts(products, state).length);
  state = toggleProductFilter(state, "formulation-type", "od");
  totals.push(filterProducts(products, state).length);
  state = toggleProductFilter(state, "regulatory-labels", "epa");
  totals.push(filterProducts(products, state).length);
  assert.deepEqual(totals, [5, 3, 1, 1, 1]);
  assert(totals.every((total, index) => index === 0 || total <= totals[index - 1]));
});

test("zero-count taxonomy options remain present in facet output", () => {
  const counts = calculateFacetCounts(products, groups, createEmptyFilterState());
  assert.equal(counts.functionalities["soil-moisture-retainers"], 0);
  assert.equal(counts["regulatory-labels"]["microplastic-free"], 0);
});

test("prospective options become available again when a restrictive filter is removed", () => {
  const restricted = createEmptyFilterState();
  restricted.selected.functionalities = ["emulsifiers"];
  restricted.selected["formulation-type"] = ["ec"];
  assert.equal(
    calculateFacetCounts(products, groups, restricted).functionalities.adjuvants,
    0,
  );

  restricted.selected["formulation-type"] = [];
  assert.equal(
    calculateFacetCounts(products, groups, restricted).functionalities.adjuvants,
    1,
  );
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

type ReferenceProduct = {
  name: string;
  slug: string;
  chemicalDescription: string;
  description: string;
  functions: string[];
  formulationTypes: string[];
  regulatoryLabels: string[];
};

type ReferenceTaxonomies = {
  functions: string[];
  formulationTypes: string[];
  regulatoryLabels: string[];
};

const taxonomySlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const referenceSource = JSON.parse(
  readFileSync(new URL("../data/agrochemical-products.json", import.meta.url), "utf8"),
) as ReferenceProduct[];
const referenceTaxonomies = JSON.parse(
  readFileSync(new URL("../data/agrochemical-taxonomies.json", import.meta.url), "utf8"),
) as ReferenceTaxonomies;
const referenceProducts: ProductViewModel[] = referenceSource.map((item, index) => ({
  id: index + 1,
  slug: item.slug,
  name: item.name,
  type: item.chemicalDescription,
  summary: item.description,
  functionalities: item.functions,
  functionalitySlugs: item.functions.map(taxonomySlug),
  formulations: item.formulationTypes,
  formulationSlugs: item.formulationTypes.map(taxonomySlug),
  labels: item.regulatoryLabels,
  labelSlugs: item.regulatoryLabels.map(taxonomySlug),
  manufacturingSite: "Not specified",
  casNumber: "Not specified",
}));
const referenceGroups: ProductCategoryGroups = {
  functionalities: {
    label: "Product Function",
    description: "",
    options: referenceTaxonomies.functions.map((name) => option(taxonomySlug(name), name)),
  },
  "formulation-type": {
    label: "Formulation Type",
    description: "",
    options: referenceTaxonomies.formulationTypes.map((name) => option(taxonomySlug(name), name)),
  },
  "regulatory-labels": {
    label: "Regulatory / Labels",
    description: "",
    options: referenceTaxonomies.regulatoryLabels.map((name) => option(taxonomySlug(name), name)),
  },
};

function referenceState({
  functions = [],
  formulations = [],
  labels = [],
}: {
  functions?: string[];
  formulations?: string[];
  labels?: string[];
}) {
  const state = createEmptyFilterState();
  state.selected.functionalities = functions;
  state.selected["formulation-type"] = formulations;
  state.selected["regulatory-labels"] = labels;
  return state;
}

test("the 99-product reference fixture matches cumulative AND validation totals", () => {
  const emulsifiers = taxonomySlug("Emulsifiers");
  const adjuvants = taxonomySlug("Adjuvants");
  const ec = taxonomySlug("Emulsifiable Concentrates (EC)");
  const epa = taxonomySlug("EPA");
  const cases = [
    [referenceState({}), 99],
    [referenceState({ functions: [emulsifiers] }), 73],
    [referenceState({ functions: [adjuvants] }), 33],
    [referenceState({ functions: [emulsifiers, adjuvants] }), 31],
    [referenceState({ formulations: [ec] }), 65],
    [referenceState({ functions: [emulsifiers], formulations: [ec] }), 52],
    [referenceState({ functions: [emulsifiers, adjuvants], formulations: [ec] }), 29],
    [referenceState({ functions: [emulsifiers], formulations: [ec], labels: [epa] }), 32],
    [referenceState({ functions: [emulsifiers, adjuvants], labels: [epa] }), 20],
    [referenceState({ functions: [emulsifiers, adjuvants], formulations: [ec], labels: [epa] }), 18],
  ] as const;
  for (const [state, expected] of cases) {
    assert.equal(filterProducts(referenceProducts, state).length, expected);
  }
});

test("the reference fixture produces prospective counts for every additional filter", () => {
  const emulsifiers = taxonomySlug("Emulsifiers");
  const adjuvants = taxonomySlug("Adjuvants");
  const ec = taxonomySlug("Emulsifiable Concentrates (EC)");
  const epa = taxonomySlug("EPA");

  let state = referenceState({ functions: [emulsifiers] });
  let counts = calculateFacetCounts(referenceProducts, referenceGroups, state);
  assert.equal(counts.functionalities[emulsifiers], 73);
  assert.equal(counts.functionalities[adjuvants], 31);
  assert.equal(counts["formulation-type"][ec], 52);
  assert.equal(counts["regulatory-labels"][epa], 36);

  state = referenceState({ functions: [emulsifiers, adjuvants] });
  counts = calculateFacetCounts(referenceProducts, referenceGroups, state);
  assert.equal(counts.functionalities[emulsifiers], 31);
  assert.equal(counts.functionalities[adjuvants], 31);
  assert.equal(counts["formulation-type"][ec], 29);
  assert.equal(counts["regulatory-labels"][epa], 20);

  state = referenceState({ functions: [emulsifiers, adjuvants], formulations: [ec] });
  counts = calculateFacetCounts(referenceProducts, referenceGroups, state);
  assert.equal(counts.functionalities[emulsifiers], 29);
  assert.equal(counts.functionalities[adjuvants], 29);
  assert.equal(counts["formulation-type"][ec], 29);
  assert.equal(counts["regulatory-labels"][epa], 18);
});
