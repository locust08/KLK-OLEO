"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import {
  calculateFacetCounts,
  filterProducts,
  paginateProducts,
  parseFilterState,
  toggleProductFilter,
  updateFilterParams,
  type ProductFilterState,
} from "@/lib/product-filtering";
import {
  productCategoryKeys,
  type ProductCategoryGroups,
  type ProductCategoryKey,
  type ProductViewModel,
} from "@/lib/cms/view-models";

type ProductListingProps = {
  category?: ProductCategoryKey;
  groups: ProductCategoryGroups;
  products: ProductViewModel[];
};

const emptySearchParams = new URLSearchParams();

function FilterGroup({ category, groups, selected, counts, onChange }: {
  category: ProductCategoryKey;
  groups: ProductCategoryGroups;
  selected: string[];
  counts: Record<string, number>;
  onChange: (value: string) => void;
}) {
  const group = groups[category];
  const title = category === "functionalities" ? "Product Function" : group.label;
  return (
    <fieldset className="catalog-filter-group">
      <legend>{title}</legend>
      {group.options.map((option) => {
        const count = counts[option.slug] ?? 0;
        const isSelected = selected.includes(option.slug);
        const isDisabled = count === 0 && !isSelected;
        return (
          <label key={option.id} className={isDisabled ? "is-disabled" : undefined}>
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => onChange(option.slug)}
            />
            <span>
              {option.name} <span className="catalog-filter-count">({count})</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export function ProductListing({ category, groups, products }: ProductListingProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterId = useId();
  const resultsId = useId();
  const router = useRouter();
  const pathname = usePathname() ?? "/products";
  const searchParams = useSearchParams() ?? emptySearchParams;
  const categories = useMemo<readonly ProductCategoryKey[]>(
    () => (category ? [category] : productCategoryKeys),
    [category],
  );
  const state = useMemo(
    () => parseFilterState(searchParams, groups),
    [groups, searchParams],
  );

  const setUrlState = (next: ProductFilterState) => {
    const params = updateFilterParams(searchParams, next);
    const url = params.size ? `${pathname}?${params.toString()}` : pathname;
    router.push(url, { scroll: false });
  };

  const toggle = (key: ProductCategoryKey, value: string) => {
    setUrlState(toggleProductFilter(state, key, value));
  };

  const results = useMemo(
    () => filterProducts(products, state, categories),
    [categories, products, state],
  );
  const facetCounts = useMemo(
    () => calculateFacetCounts(products, groups, state, categories),
    [categories, groups, products, state],
  );
  const pagination = paginateProducts(results, state.page);
  const { items: pageProducts, page: currentPage, totalPages } = pagination;
  const selectedCount = categories.reduce<number>((total, key) => total + state.selected[key].length, 0);
  const clearFilters = () => setUrlState({
    query: "",
    selected: { functionalities: [], "formulation-type": [], "regulatory-labels": [] },
    page: 1,
  });
  return (
    <section className="catalog-shell" aria-label="Product catalogue">
      <div className="catalog-mobile-tools">
        <span aria-live="polite">{pagination.total} {pagination.total === 1 ? "Product" : "Products"}</span>
        <button type="button" aria-expanded={filtersOpen} aria-controls={filterId} onClick={() => setFiltersOpen((current) => !current)}>
          {filtersOpen ? "Hide filters" : "Show filters"}{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </button>
        {(selectedCount > 0 || state.query) && <button type="button" onClick={clearFilters}>Clear filters</button>}
        {filtersOpen && <a href={`#${resultsId}`}>View results</a>}
      </div>
      <aside id={filterId} className={`catalog-filters${filtersOpen ? " is-open" : ""}`} aria-label="Filter products">
        {categories.map((key) => (
          <FilterGroup
            key={key}
            category={key}
            groups={groups}
            selected={state.selected[key]}
            counts={facetCounts[key]}
            onChange={(value) => toggle(key, value)}
          />
        ))}
      </aside>

      <div id={resultsId} className="catalog-results" aria-live="polite" aria-atomic="false">
        {!category && (
          <div className="catalog-results__header">
            <h2>{pagination.total} {pagination.total === 1 ? "Product" : "Products"}</h2>
            {totalPages > 1 && <p>Page {currentPage} of {totalPages}</p>}
          </div>
        )}
        <div className="catalog-list">
          {pageProducts.map((product, index) => (
            <article className="catalog-product-row" key={product.slug} style={{ "--row-delay": `${index * 70}ms` } as React.CSSProperties}>
              <div>
                <h2>
                  <Link href={`/products/product/${product.slug}`} className="catalog-product-row__title">
                    {product.name}
                  </Link>
                </h2>
                <h3>{product.type}</h3>
                <p>{product.summary}</p>
                <span>{product.formulations.map((item) => item.match(/\(([^)]+)\)/)?.[1]).filter(Boolean).join(", ")}</span>
              </div>
              <Link href={`/products/product/${product.slug}`} className="catalog-product-row__arrow" aria-label={`View ${product.name}`}>
                <FaArrowRightLong aria-hidden="true" />
              </Link>
            </article>
          ))}
          {results.length === 0 && (
            <div className="catalog-empty">
              <h2>No products found.</h2>
              <p>
                {state.query
                  ? "Try another keyword or clear the search to see all products."
                  : "Clear one or more filters to see more formulation solutions."}
              </p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <nav className="catalog-pagination" aria-label="Product results pages">
            <button type="button" disabled={currentPage === 1} onClick={() => setUrlState({ ...state, page: currentPage - 1 })}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setUrlState({ ...state, page: currentPage + 1 })}>
              Next
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
