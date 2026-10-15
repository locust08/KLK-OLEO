import { getPayload } from "payload";
import config from "../src/payload.config";
import { writeFile, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import type { Page } from "../src/payload-types";
if (
  process.env.CMS_CLOUDFLARE === "1" ||
  !process.env.SQLITE_URL?.includes("klk-cms-integration")
)
  throw Error("Isolated copy only.");
const payload = await getPayload({ config });
const originalFile = "/private/tmp/klk-migration-draft-fixture.json";
if (process.argv.includes("--verify")) {
  const original = JSON.parse(await readFile(originalFile, "utf8")) as Page;
  try {
    const pub = await payload.findByID({
      collection: "pages",
      id: original.id,
      draft: false,
      depth: 0,
    });
    const draft = await payload.findByID({
      collection: "pages",
      id: original.id,
      draft: true,
      depth: 0,
    });
    assert.equal(pub.title, original.title);
    assert.equal(draft.title, "QA pending draft title");
    assert.equal(draft.seo?.description, "QA pending draft SEO");
    assert.equal(draft.content?.introduction?.body, "QA pending draft body");
    console.log(
      "Migration preserves independent published and draft titles, SEO and section content.",
    );
  } finally {
    await payload.update({
      collection: "pages",
      id: original.id,
      data: {
        title: original.title,
        hero: original.hero,
        content: original.content,
        seo: original.seo,
        _status: "published",
      },
    });
    await payload.destroy();
  }
} else {
  const original = (
    await payload.find({
      collection: "pages",
      where: { slug: { equals: "home" } },
      limit: 1,
      draft: false,
      depth: 0,
    })
  ).docs[0];
  await writeFile(originalFile, JSON.stringify(original), { mode: 0o600 });
  await payload.update({
    collection: "pages",
    id: original.id,
    draft: true,
    data: {
      title: "QA pending draft title",
      seo: { ...original.seo, description: "QA pending draft SEO" },
      content: {
        ...original.content,
        introduction: {
          ...original.content?.introduction,
          body: "QA pending draft body",
        },
      },
      _status: "draft",
    },
  });
  await payload.destroy();
  for (const args of [
    ["scripts/integrate-editorial-content.ts", "--apply"],
    ["scripts/verify-editorial-migration.ts", "--verify"],
  ]) {
    const run = spawnSync(
      process.execPath,
      ["--import", "./node_modules/tsx/dist/loader.mjs", ...args],
      { env: { ...process.env, CMS_SCHEMA_PUSH: "0" }, encoding: "utf8" },
    );
    if (run.status !== 0) {
      console.error(run.stdout, run.stderr);
      process.exitCode = 1;
      break;
    }
    console.log(run.stdout.trim());
  }
}
