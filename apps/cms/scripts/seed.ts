import "dotenv/config";
import { readFile } from "node:fs/promises";
import { getPayload, type CollectionSlug } from "payload";
import config from "../src/payload.config";

const payload = await getPayload({ config });
const spreadsheetURL =
  "https://docs.google.com/spreadsheets/d/1tzbxQfyaBCUGgpBA2qAx2q56yJCz805m/edit?gid=1648841370";
const products = JSON.parse(
  await readFile(
    new URL("../data/agrochemical-products.json", import.meta.url),
    "utf8",
  ),
) as Array<Record<string, any>>;
const pages = JSON.parse(
  await readFile(
    new URL("../data/agrochemical-pages.json", import.meta.url),
    "utf8",
  ),
) as Array<Record<string, any>>;
const taxonomies = JSON.parse(
  await readFile(
    new URL("../data/agrochemical-taxonomies.json", import.meta.url),
    "utf8",
  ),
) as Record<string, string[]>;

async function ensure(
  collection: CollectionSlug,
  where: Record<string, any>,
  data: Record<string, any>,
) {
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (existing.docs[0]) return existing.docs[0];
  return payload.create({
    collection,
    data: data as any,
    overrideAccess: true,
  });
}

try {
  const adminEmail = process.env.CMS_ADMIN_EMAIL;
  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  const userCount = await payload.count({ collection: "users" });
  if (!userCount.totalDocs) {
    if (!adminEmail || !adminPassword || adminPassword.length < 16)
      throw new Error(
        "Set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD (at least 16 characters) before the first seed.",
      );
    await payload.create({
      collection: "users",
      data: {
        email: adminEmail,
        password: adminPassword,
        name: "KLK OLEO Administrator",
        role: "super-admin",
      },
      overrideAccess: true,
    });
  }
  const main = await ensure(
    "sites",
    { slug: { equals: "klk-oleo" } },
    {
      name: "KLK OLEO",
      slug: "klk-oleo",
      kind: "main",
      domain: "https://www.klkoleo.com",
      active: true,
      brandName: "KLK OLEO",
    },
  );
  const agro = await ensure(
    "sites",
    { slug: { equals: "agrochemical" } },
    {
      name: "KLK OLEO Agrochemicals",
      slug: "agrochemical",
      kind: "minisite",
      parentSite: main.id,
      domain: "https://klkoleo.dev.malaysiaweb.my",
      active: true,
      market: "Agrochemicals",
      brandName: "AIDIGRO",
      parentLinkLabel: "Part of KLK OLEO",
      contactEmail: "agrochem@klkoleo.com",
      navigation: [
        { label: "Home", path: "/" },
        { label: "About Us", path: "/about-us" },
        { label: "Products", path: "/products" },
        { label: "Resources", path: "/resources" },
        { label: "Contact Us", path: "/contact" },
      ],
    },
  );
  const taxonomyIds: Record<string, Record<string, string | number>> = {};
  for (const [field, collection] of [
    ["functions", "product-functions"],
    ["formulationTypes", "formulation-types"],
    ["regulatoryLabels", "regulatory-labels"],
  ] as const) {
    taxonomyIds[field] = {};
    for (const name of taxonomies[field]) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const record = await ensure(
        collection,
        { and: [{ site: { equals: agro.id } }, { slug: { equals: slug } }] },
        { site: agro.id, name, slug, _status: "published" },
      );
      taxonomyIds[field][name] = record.id;
    }
  }
  for (const product of products) {
    const { functions, formulationTypes, regulatoryLabels, ...base } = product;
    await ensure(
      "products",
      {
        and: [
          { site: { equals: agro.id } },
          { slug: { equals: product.slug } },
        ],
      },
      {
        ...base,
        site: agro.id,
        functions: functions.map((name: string) => taxonomyIds.functions[name]),
        formulationTypes: formulationTypes.map(
          (name: string) => taxonomyIds.formulationTypes[name],
        ),
        regulatoryLabels: regulatoryLabels.map(
          (name: string) => taxonomyIds.regulatoryLabels[name],
        ),
        sourceURL: spreadsheetURL,
        _status: "draft",
        claimsReview: "source-only",
        featured: ["Aidigro GA 2425", "Aidigro WA1125"].includes(product.name),
      },
    );
  }
  for (const page of pages) {
    const slug = page.slug;
    const isResource = slug === "resources";
    const sections = isResource
      ? [
          {
            heading: "Resource library",
            body: "Official agrochemical brochures, technical guides, and safety materials will be added here when available.",
          },
        ]
      : page.sections.filter((s: any) => s.heading || s.body);
    await ensure(
      "pages",
      { and: [{ site: { equals: agro.id } }, { slug: { equals: slug } }] },
      {
        site: agro.id,
        title: page.title,
        slug,
        template:
          (
            {
              home: "home",
              products: "product-finder",
              resources: "resource-library",
              contact: "contact",
            } as Record<string, string>
          )[slug] || "standard",
        hero: {
          eyebrow: "KLK OLEO Agrochemicals",
          heading: slug === "home" ? "AIDIGRO" : page.title,
          body:
            slug === "home"
              ? "Your Trusted Global Partner in Agrochemicals"
              : "",
        },
        sections,
        sourceURL: page.sourceURL,
        _status: "draft",
        seo: { title: `${page.title} | KLK OLEO Agrochemicals` },
      },
    );
  }
  await ensure(
    "banners",
    {
      and: [
        { site: { equals: agro.id } },
        { placement: { equals: "home.hero" } },
      ],
    },
    {
      site: agro.id,
      title: "Agrochemical homepage",
      placement: "home.hero",
      headline: "AIDIGRO",
      body: "Your Trusted Global Partner in Agrochemicals",
      ctaLabel: "Find a product",
      ctaPath: "/products",
      sourceURL: "https://klkoleo.dev.malaysiaweb.my/",
      _status: "draft",
    },
  );
  for (const [slug, title, type] of [
    ["agrochemical-portfolio", "Agrochemical portfolio brochure", "brochure"],
    [
      "formulation-guides",
      "Agrochemical formulation guides",
      "technical-guide",
    ],
    ["safety-data-sheets", "Safety data sheets", "safety-data-sheet"],
  ] as const) {
    await ensure(
      "resources",
      { and: [{ site: { equals: agro.id } }, { slug: { equals: slug } }] },
      {
        site: agro.id,
        title,
        slug,
        type,
        description: "Official material will be added when available.",
        availability: "placeholder",
        placeholderLabel: "Coming soon",
        _status: "published",
      },
    );
  }
  for (const purpose of [
    "general-enquiry",
    "product-enquiry",
    "sample-request",
    "technical-support",
  ]) {
    const profile = await ensure(
      "routing-profiles",
      { and: [{ site: { equals: agro.id } }, { slug: { equals: purpose } }] },
      {
        site: agro.id,
        name: `Agrochemicals ${purpose.replaceAll("-", " ")}`,
        slug: purpose,
        purpose,
        mode: "manual",
        destinationTeam: "Agrochemical sales and technical team",
      },
    );
    await ensure(
      "forms",
      { and: [{ site: { equals: agro.id } }, { slug: { equals: purpose } }] },
      {
        site: agro.id,
        name: purpose.replaceAll("-", " "),
        slug: purpose,
        purpose,
        routingProfile: profile.id,
        consentLabel:
          "I agree that KLK OLEO may use my submitted details to respond to this enquiry.",
        successMessage: "Thank you. Your enquiry has been received.",
        _status: "draft",
      },
    );
  }
  console.log(
    JSON.stringify(
      {
        parentSite: main.id,
        minisite: agro.id,
        products: products.length,
        pages: pages.length,
        resources: 3,
        forms: 4,
        note: "Products, pages, forms, and banners are drafts for editorial review. CRM delivery is not enabled.",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await payload.destroy();
}
process.exit(process.exitCode ?? 0);
