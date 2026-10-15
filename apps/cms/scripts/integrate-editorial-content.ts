/** Local-only, explicit --apply backfill. Never points at production or enables schema push. */
import "dotenv/config";
import { getPayload } from "payload";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createHash } from "node:crypto";
import baseline from "../data/editorial-baseline.json";
import config from "../src/payload.config";
import { fillMissing } from "../src/lib/content/migration";
import type { Page, SitePresentation } from "../src/payload-types";
const apply = process.argv.includes("--apply");
if (
  process.env.CMS_CLOUDFLARE === "1" ||
  process.env.DATABASE_URL ||
  !process.env.SQLITE_URL?.startsWith("file:")
)
  throw Error("Use an explicitly configured isolated local SQLite copy.");
const payload = await getPayload({ config });
const sites = await payload.find({
  collection: "sites",
  where: { slug: { equals: "agrochemical" } },
  depth: 0,
  limit: 1,
});
const site = sites.docs[0];
if (!site) throw Error("Seed the site first.");
const report: {
  slug: string;
  field: string;
  cms: unknown;
  baseline: unknown;
  action: string;
}[] = [];
async function materialize(input: unknown): Promise<unknown> {
  if (Array.isArray(input)) return Promise.all(input.map(materialize));
  if (input && typeof input === "object") {
    const value = input as Record<string, unknown>;
    if ("asset" in value) {
      const path = String(value.asset);
      if (!path.startsWith("/images/") || path.includes(".."))
        throw Error("Unsupported baseline path");
      const bytes = await readFile(resolve("public", path.slice(1)));
      const digest = createHash("sha256").update(bytes).digest("hex");
      const found = await payload.find({
        collection: "media",
        where: {
          and: [
            { site: { equals: site.id } },
            { caption: { equals: `editorial-baseline:${digest}` } },
          ],
        },
        depth: 0,
        limit: 1,
      });
      if (found.docs[0]) return found.docs[0].id;
      if (!apply) return -1;
      const media = await payload.create({
        collection: "media",
        data: {
          site: site.id,
          alt: String(value.alt),
          caption: `editorial-baseline:${digest}`,
          isPublic: true,
        },
        filePath: resolve("public", path.slice(1)),
      });
      return media.id;
    }
    const output: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value))
      if (!["productName", "categorySlug"].includes(k))
        output[k] = await materialize(v);
    if (value.productName) {
      const products = await payload.find({
        collection: "products",
        where: { site: { equals: site.id } },
        pagination: false,
        depth: 0,
      });
      const target = String(value.productName).replace(/\W/g, "").toLowerCase();
      const product = products.docs.find(
        (p) => p.name.replace(/\W/g, "").toLowerCase() === target,
      );
      if (!product) throw Error(`Missing product ${value.productName}`);
      output.product = product.id;
    }
    if (value.categorySlug) {
      const result = await payload.find({
        collection: "product-functions",
        where: {
          and: [
            { site: { equals: site.id } },
            { slug: { equals: value.categorySlug } },
          ],
        },
        limit: 1,
        depth: 0,
      });
      if (!result.docs[0])
        throw Error(`Missing category ${value.categorySlug}`);
      output.category = result.docs[0].id;
    }
    return output;
  }
  return input;
}
const records = await payload.find({
  collection: "pages",
  where: { site: { equals: site.id } },
  pagination: false,
  depth: 0,
  draft: false,
  overrideAccess: true,
});
for (const [slug, source] of Object.entries(baseline.pages)) {
  const record = records.docs.find((p) => p.slug === slug);
  if (!record) throw Error(`Missing page ${slug}`);
  const old = record as unknown as Record<string, unknown>;
  const sourceContent = structuredClone(source.content) as Record<
    string,
    unknown
  >;
  // Existing visible CMS copy wins. Positional legacy fields become named fields once.
  if (record.integrationVersion !== 1 && record._status === "published") {
    if (slug === "home" && record.hero?.body) {
      (sourceContent.introduction as Record<string, unknown>).body =
        record.hero.body;
    }
    if (["products", "resources"].includes(slug) && record.sections?.[0])
      sourceContent.introduction = fillMissing(
        record.sections[0] as unknown as Record<string, unknown>,
        sourceContent.introduction as Record<string, unknown>,
      );
    if (slug === "contact" && record.hero?.body)
      (sourceContent.introduction as Record<string, unknown>).body =
        record.hero.body;
  }
  const imported = (await materialize({
    ...source,
    content: sourceContent,
  })) as Record<string, unknown>;
  const hero: Record<string, unknown> = {
    ...(imported.hero as Record<string, unknown>),
    ...(record._status === "published" ? record.hero : {}),
  };
  if (
    slug === "home" &&
    record.integrationVersion !== 1 &&
    record._status === "published"
  ) {
    const banners = await payload.find({
      collection: "banners",
      where: {
        and: [
          { site: { equals: site.id } },
          { placement: { equals: "home.hero" } },
          { _status: { equals: "published" } },
        ],
      },
      sort: "displayOrder",
      limit: 1,
      depth: 0,
    });
    const banner = banners.docs[0];
    const brand = banner?.headline || record.hero?.eyebrow || "AIDIGRO";
    hero.eyebrow = brand;
    hero.heading =
      record.hero?.heading && record.hero.heading !== brand
        ? record.hero.heading
        : banner?.body || source.hero.heading;
    hero.image =
      banner?.desktopImage ||
      record.hero?.image ||
      (imported.hero as Record<string, unknown>).image;
    if (banner?.mobileImage) hero.mobileImage = banner.mobileImage;
  }

  // Old null media means the old template used its approved fallback; import that image explicitly.
  if (!hero.image)
    hero.image =
      imported.hero &&
      ((imported.hero as Record<string, unknown>).image as never);
  if (!hero.heading) hero.heading = source.hero.heading;
  const content =
    record.integrationVersion === 1 && record._status === "published"
      ? fillMissing(
          (old.content ?? {}) as Record<string, unknown>,
          imported.content as Record<string, unknown>,
        )
      : imported.content;
  for (const field of ["hero", "content"])
    report.push({
      slug,
      field,
      cms: old[field],
      baseline: field === "hero" ? source.hero : sourceContent,
      action:
        record._status !== "published"
          ? "publish approved template baseline; preserve complete existing draft"
          : record.integrationVersion === 1
            ? "preserve-existing-and-fill-absent"
            : "backfill; review presentation differences",
    });
  if (apply) {
    const editable = (doc: Page) => ({
      title: doc.title,
      slug: doc.slug,
      template: doc.template,
      hero: doc.hero,
      sections: doc.sections,
      seo: doc.seo,
      sourceURL: doc.sourceURL,
    });
    const data = {
      ...(record._status === "published"
        ? editable(record)
        : {
            title: source.hero.heading,
            slug,
            template: record.template,
            seo: {},
            sections: [],
          }),
      hero,
      content,
      integrationVersion: 1,
    };
    // Preserve draft changes independently from the public snapshot.
    const latest = await payload.findByID({
      collection: "pages",
      id: record.id,
      depth: 0,
      draft: true,
    });
    await payload.update({
      collection: "pages",
      id: record.id,
      data: { ...data, _status: "published" } as Partial<Page>,
    });
    if (latest._status === "draft") {
      const draftContent =
        latest.integrationVersion === 1
          ? fillMissing(
              (latest.content ?? {}) as Record<string, unknown>,
              content as Record<string, unknown>,
            )
          : (structuredClone(content) as Record<string, unknown>);
      if (latest.integrationVersion !== 1) {
        if (["products", "resources"].includes(slug) && latest.sections?.[0])
          draftContent.introduction = fillMissing(
            latest.sections[0] as unknown as Record<string, unknown>,
            draftContent.introduction as Record<string, unknown>,
          );
        if (["home", "contact"].includes(slug) && latest.hero?.body)
          (draftContent.introduction as Record<string, unknown>).body =
            latest.hero.body;
      }
      await payload.update({
        collection: "pages",
        id: record.id,
        draft: true,
        data: {
          ...editable(latest),
          hero: fillMissing(
            (latest.hero ?? {}) as Record<string, unknown>,
            hero,
          ),
          content: draftContent,
          integrationVersion: 1,
          _status: "draft",
        } as Partial<Page>,
      });
    }
  }
}
const presentation = await payload.find({
  collection: "site-presentation",
  where: { site: { equals: site.id } },
  limit: 1,
  depth: 0,
});
if (!presentation.docs[0]) {
  const data = (await materialize(baseline.presentation)) as Record<
    string,
    unknown
  >;
  data.navigation = site.navigation?.filter((n) => n.path !== "/")?.length
    ? site.navigation.filter((n) => n.path !== "/")
    : data.navigation;
  data.contactEmail = site.contactEmail || data.contactEmail;
  if (apply)
    await payload.create({
      collection: "site-presentation",
      data: {
        ...data,
        site: site.id,
        _status: "published",
      } as unknown as SitePresentation,
    });
  report.push({
    slug: "site-presentation",
    field: "all",
    cms: null,
    baseline: baseline.presentation,
    action: "create missing presentation",
  });
}
await writeFile(
  process.env.CMS_MIGRATION_REPORT ||
    "/private/tmp/klk-editorial-migration-report.json",
  JSON.stringify(
    {
      apply,
      site: "agrochemical",
      conflicts: report,
      claimsReview: [
        "GA2425 existing homepage and catalogue claims differ; preserved without approval.",
      ],
    },
    null,
    2,
  ),
);
console.log(
  `${apply ? "Applied" : "Dry run"}: ${report.length} field groups recorded. Review migration report before release.`,
);
await payload.destroy();
