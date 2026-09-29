import {
  getProductCategoryValues,
  productCategoryKeys,
  type ProductCategoryGroups,
  type ProductCategoryKey,
  type ProductViewModel,
} from "@/lib/cms/view-models";

export const PRODUCTS_PER_PAGE = 20;

export const productFilterParam: Record<ProductCategoryKey, string> = {
  functionalities: "function",
  "formulation-type": "formulation",
  "regulatory-labels": "label",
};

export type ProductFilterState = {
  selected: Record<ProductCategoryKey, string[]>;
  query: string;
  page: number;
};

export function createEmptyFilterState(): ProductFilterState {
  return {
    selected: {
      functionalities: [],
      "formulation-type": [],
      "regulatory-labels": [],
    },
    query: "",
    page: 1,
  };
}

function matchesSearch(product: ProductViewModel, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return [
    product.name,
    product.type,
    product.summary,
    ...product.functionalities,
    ...product.formulations,
    ...product.labels,
  ].some((value) => value.toLocaleLowerCase().includes(normalized));
}

export function filterProducts(
  products: ProductViewModel[],
  state: ProductFilterState,
  categories: readonly ProductCategoryKey[] = productCategoryKeys,
) {
  return products.filter(
    (product) =>
      matchesSearch(product, state.query) &&
      categories.every((key) => {
        const active = state.selected[key];
        return (
          active.length === 0 ||
          active.every((slug) => getProductCategoryValues(product, key).includes(slug))
        );
      }),
  );
}

export function toggleProductFilter(
  state: ProductFilterState,
  key: ProductCategoryKey,
  slug: string,
): ProductFilterState {
  const active = state.selected[key];
  return {
    ...state,
    page: 1,
    selected: {
      ...state.selected,
      [key]: active.includes(slug)
        ? active.filter((value) => value !== slug)
        : [...active, slug],
    },
  };
}

export function paginateProducts<T>(
  products: T[],
  requestedPage: number,
  pageSize = PRODUCTS_PER_PAGE,
) {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return {
    items: products.slice((page - 1) * pageSize, page * pageSize),
    page,
    total,
    totalPages,
  };
}

export function calculateFacetCounts(
  products: ProductViewModel[],
  groups: ProductCategoryGroups,
  state: ProductFilterState,
  categories: readonly ProductCategoryKey[] = productCategoryKeys,
) {
  const currentTotal = filterProducts(products, state, categories).length;
  return Object.fromEntries(
    categories.map((key) => [
      key,
      Object.fromEntries(
        groups[key].options.map((option) => {
          if (state.selected[key].includes(option.slug)) {
            return [option.slug, currentTotal];
          }

          const prospectiveState: ProductFilterState = {
            ...state,
            selected: {
              ...state.selected,
              [key]: [...state.selected[key], option.slug],
            },
          };
          return [
            option.slug,
            filterProducts(products, prospectiveState, categories).length,
          ];
        }),
      ),
    ]),
  ) as Record<ProductCategoryKey, Record<string, number>>;
}

export function parseFilterState(
  params: Pick<URLSearchParams, "get" | "getAll">,
  groups: ProductCategoryGroups,
): ProductFilterState {
  const state = createEmptyFilterState();
  for (const key of productCategoryKeys) {
    const valid = new Set(groups[key].options.map((option) => option.slug));
    state.selected[key] = params
      .getAll(productFilterParam[key])
      .flatMap((value) => value.split(","))
      .filter((value, index, values) => valid.has(value) && values.indexOf(value) === index);
  }
  state.query = params.get("q")?.trim() ?? "";
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  state.page = Number.isFinite(page) && page > 0 ? page : 1;
  return state;
}

export function updateFilterParams(
  current: Pick<URLSearchParams, "toString">,
  state: ProductFilterState,
) {
  const params = new URLSearchParams(current.toString());
  for (const key of productCategoryKeys) {
    const parameter = productFilterParam[key];
    params.delete(parameter);
    for (const slug of state.selected[key]) params.append(parameter, slug);
  }
  if (state.query) params.set("q", state.query);
  else params.delete("q");
  if (state.page > 1) params.set("page", String(state.page));
  else params.delete("page");
  return params;
}
