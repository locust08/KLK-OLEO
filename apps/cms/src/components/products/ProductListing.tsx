"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import {
  calculateFacetCounts,
  createEmptyFilterState,
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categories = useMemo(
    () => (category ? [category] : productCategoryKeys),
    [category],
  );
  const state = useMemo(
    () => parseFilterState(searchParams, groups),
    [groups, searchParams],
  );

  const setUrlState = (next: ProductFilterState, replace = false) => {
    const params = updateFilterParams(searchParams, next);
    const url = params.size ? `${pathname}?${params.toString()}` : pathname;
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
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
  const hasActiveFilters =
    state.query.length > 0 || categories.some((key) => state.selected[key].length > 0);

  return (
    <section className="catalog-shell" aria-label="Product catalogue">
      <aside className="catalog-filters" aria-label="Filter products">
        <div className="catalog-filter-tools">
          <label htmlFor="catalog-search">Search products</label>
          <input
            id="catalog-search"
            type="search"
            value={state.query}
            placeholder="Search by product or application"
            onChange={(event) =>
              setUrlState({ ...state, query: event.target.value, page: 1 }, true)
            }
          />
          {hasActiveFilters && (
            <button
              type="button"
              className="catalog-clear"
              onClick={() => setUrlState(createEmptyFilterState())}
            >
              Clear all
            </button>
          )}
        </div>
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

      <div className="catalog-results" aria-live="polite" aria-atomic="false">
        <div className="catalog-results__header">
          <h2>{pagination.total} {pagination.total === 1 ? "Product" : "Products"}</h2>
          {totalPages > 1 && <p>Page {currentPage} of {totalPages}</p>}
        </div>
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
              <h2>No products match this combination.</h2>
              <p>Clear one or more filters to see more formulation solutions.</p>
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
