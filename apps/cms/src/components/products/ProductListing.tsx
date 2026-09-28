"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import {
  getProductCategoryValues,
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

function FilterGroup({
  category,
  groups,
  selected,
  onChange,
}: {
  category: ProductCategoryKey;
  groups: ProductCategoryGroups;
  selected: string[];
  onChange: (value: string) => void;
}) {
  const group = groups[category];
  const title = category === "functionalities" ? "Functionality" : group.label;
  return (
    <fieldset className="catalog-filter-group">
      <legend>{title}</legend>
      {group.options.map((option) => (
        <label key={option}>
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function ProductListing({ category, groups, products }: ProductListingProps) {
  const categories = useMemo(() => category ? [category] : productCategoryKeys, [category]);
  const [selected, setSelected] = useState<Record<ProductCategoryKey, string[]>>({
    functionalities: [],
    "formulation-type": [],
    "regulatory-labels": [],
  });

  const toggle = (key: ProductCategoryKey, value: string) => {
    setSelected((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const results = useMemo(
    () =>
      products.filter((product) =>
        categories.every((key) => {
          const active = selected[key];
          return active.length === 0 || active.some((value) => getProductCategoryValues(product, key).includes(value));
        }),
      ),
    [categories, selected],
  );

  return (
    <section className="catalog-shell" aria-label="Product catalogue">
      <aside className="catalog-filters" aria-label="Filter products">
        {categories.map((key) => (
          <FilterGroup
            key={key}
            category={key}
            groups={groups}
            selected={selected[key]}
            onChange={(value) => toggle(key, value)}
          />
        ))}
      </aside>

      <div className="catalog-results" aria-live="polite">
        <div className="catalog-list">
          {results.map((product, index) => (
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
              <Link
                href={`/products/product/${product.slug}`}
                className="catalog-product-row__arrow"
                aria-label={`View ${product.name}`}
              >
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
      </div>
    </section>
  );
}
