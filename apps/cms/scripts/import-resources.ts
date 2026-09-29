import "dotenv/config";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { getPayload, type Where } from "payload";
import config from "../src/payload.config";
import { idOf } from "../src/access";
import type { Media } from "../src/payload-types";

// Explicitly local, trusted import; never a public upload endpoint or production seed.
const args = process.argv.slice(2);
const directory = args.find((arg) => !arg.startsWith("--"));
assert(directory && args.every((arg) => arg === directory || arg === "--apply"),
  "Usage: npm run import:resources -- <extracted PDF directory> [--apply]");
assert(!process.env.DATABASE_URL, "This importer is restricted to local SQLite.");
assert(!process.env.SQLITE_URL || process.env.SQLITE_URL.startsWith("file:"),
  "This importer requires a local SQLite file.");
const apply = args.includes("--apply");
const manifest = JSON.parse(await readFile(
  new URL("../data/agrochemical-resources.json", import.meta.url), "utf8",
)) as {
  siteSlug: string;
  sourceFolderURL: string;
  resources: Array<{
    filename: string; sha256: string; bytes: number; slug: string;
    title: string; description: string; type: "brochure";
  }>;
};

// Validate the entire batch before initializing the CMS or creating any records.
for (const item of manifest.resources) {
  assert.equal(basename(item.filename), item.filename);
  const bytes: Buffer = await readFile(resolve(directory, item.filename));
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-", item.filename);
  assert.equal(bytes.length, item.bytes, `${item.filename}: size mismatch`);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256,
    `${item.filename}: checksum mismatch`);
}
if (!apply) {
  console.log(`Validated ${manifest.resources.length} PDFs. No CMS writes. Add --apply to import private drafts.`);
} else {
  const payload = await getPayload({ config });
  try {
    const sites = await payload.find({ collection: "sites", depth: 0,
      where: { slug: { equals: manifest.siteSlug } }, limit: 2, overrideAccess: true });
    assert.equal(sites.totalDocs, 1, "Expected one agrochemical site");
    const site = sites.docs[0];
    assert.equal(site.kind, "minisite");
    const parent = await payload.findByID({ collection: "sites", id: idOf(site.parentSite)!,
      depth: 0, overrideAccess: true });
    assert.equal(parent.kind, "main");
    // Use an existing authorized account and enforce collection/field RBAC on writes.
    assert(process.env.CMS_ADMIN_EMAIL, "Set CMS_ADMIN_EMAIL to an existing super admin.");
    const admins = await payload.find({ collection: "users", depth: 0,
      where: { email: { equals: process.env.CMS_ADMIN_EMAIL } }, limit: 1, overrideAccess: true });
    const user = admins.docs[0];
    assert.equal(user?.role, "super-admin", "Import requires the existing super admin");
    const scope = (slug: string): Where => ({ and: [
      { site: { equals: site.id } }, { slug: { equals: slug } },
    ] });
    let created = 0;
    let skipped = 0;
    for (const item of manifest.resources) {
      const caption = `Source: ${item.filename}; SHA-256: ${item.sha256}; Folder: ${manifest.sourceFolderURL}`;
      const existing = await payload.find({ collection: "resources", where: scope(item.slug),
        draft: true, depth: 0, limit: 1, overrideAccess: false, user });
      if (existing.docs[0]) {
        const fileId = idOf(existing.docs[0].file);
        assert(fileId, `${item.slug}: existing resource has no file; review manually`);
        const media = await payload.findByID({ collection: "media", id: fileId,
          depth: 0, overrideAccess: false, user });
        assert.equal(media.caption, caption, `${item.slug}: provenance conflict`);
        assert.equal(String(idOf(media.site)), String(site.id));
        const bytes = await readFile(resolve("media", media.filename!));
        assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256);
        // Preserve editorial edits and publication decisions on subsequent runs.
        skipped++;
        continue;
      }
      const matches = await payload.find({ collection: "media", depth: 0, limit: 2,
        where: { and: [{ site: { equals: site.id } }, { caption: { equals: caption } }] },
        overrideAccess: false, user });
      assert(matches.totalDocs <= 1, `${item.slug}: duplicate media; review manually`);
      const media: Media = matches.docs[0] ?? await payload.create({ collection: "media",
        data: { site: site.id, alt: item.title, caption, isPublic: false },
        filePath: resolve(directory, item.filename), overrideAccess: false, user });
      assert.equal(media.isPublic, false, "New draft attachments must remain private");
      const stored = await readFile(resolve("media", media.filename!));
      assert.equal(createHash("sha256").update(stored).digest("hex"), item.sha256);
      const resource = await payload.create({ collection: "resources", draft: true,
        data: { site: site.id, slug: item.slug, title: item.title,
          description: item.description, type: item.type, availability: "available",
          file: media.id, placeholderLabel: null, _status: "draft" },
        overrideAccess: false, user });
      assert.equal(resource._status, "draft");
      assert.equal(idOf(resource.file), media.id);
      const publicResource = await payload.find({ collection: "resources",
        where: scope(item.slug), depth: 0, overrideAccess: false });
      assert.equal(publicResource.totalDocs, 0, "Draft must not be anonymously readable");
      const publicMedia = await payload.find({ collection: "media",
        where: { id: { equals: media.id } }, depth: 0, overrideAccess: false });
      assert.equal(publicMedia.totalDocs, 0, "Private media must not be anonymously readable");
      console.log(`Created draft resource ${resource.id}, private media ${media.id}: ${item.title}`);
      created++;
    }
    console.log(`Import complete: ${created} created, ${skipped} existing resources preserved.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await payload.destroy();
  }
}
// Payload's background timers can retain a CLI process after adapter shutdown.
process.exit(process.exitCode ?? 0);
