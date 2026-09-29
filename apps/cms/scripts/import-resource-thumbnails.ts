import "dotenv/config";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, basename, join } from "node:path";
import sharp from "sharp";
import { getPayload, type Where } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import config from "../src/payload.config";
import { idOf } from "../src/access";

const args = process.argv.slice(2);
const directory = args.find((arg) => !arg.startsWith("--"));
assert(directory && args.every((arg) => arg === directory || arg === "--apply"),
  "Usage: npm run import:resource-thumbnails -- <extracted PDF directory> [--apply]");
assert(!process.env.DATABASE_URL, "This importer is restricted to local SQLite.");
assert(process.env.PAYLOAD_DROP_DATABASE !== "true", "Refusing destructive database configuration.");
assert(!process.env.SQLITE_URL || process.env.SQLITE_URL.startsWith("file:"),
  "This importer requires a local SQLite file.");
const manifest = JSON.parse(await readFile(
  new URL("../data/agrochemical-resources.json", import.meta.url), "utf8",
)) as { siteSlug: string; resources: Array<{ filename: string; slug: string; sha256: string; title: string }> };
const scratch = await mkdtemp(join(tmpdir(), "klk-resource-covers-"));
const checksum = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

// Render all covers and verify sources before making any CMS changes.
for (const item of manifest.resources) {
  assert.equal(basename(item.filename), item.filename);
  assert(/^[a-z0-9-]+$/.test(item.slug));
  const path = resolve(directory, item.filename);
  assert.equal(checksum(await readFile(path)), item.sha256, `${item.slug}: source mismatch`);
  const prefix = join(scratch, item.slug);
  execFileSync(process.env.PDFTOPPM_BIN || "pdftoppm", [
    "-f", "1", "-singlefile", "-scale-to", "1600", "-png", path, prefix,
  ]);
  await sharp(`${prefix}.png`).webp({ quality: 88 }).toFile(`${prefix}-cover.webp`);
}
console.log(`Rendered ${manifest.resources.length} first-page covers in ${scratch}`);
if (args.includes("--apply")) {
  // Apply the schema via the dev server/migrations first. A data-only importer
  // must not race a running server's Drizzle schema synchronization.
  const payload = await getPayload({ config: {
    ...await config,
    db: {
      ...sqliteAdapter({ client: { url: process.env.SQLITE_URL || "file:./cms.db" }, push: false }),
      allowIDOnCreate: false,
      name: "sqlite",
    },
  } });
  try {
    const sites = await payload.find({ collection: "sites", depth: 0, limit: 2,
      where: { slug: { equals: manifest.siteSlug } }, overrideAccess: true });
    assert.equal(sites.totalDocs, 1);
    const site = sites.docs[0];
    assert.equal(site.kind, "minisite");
    const parent = await payload.findByID({ collection: "sites", id: idOf(site.parentSite)!, depth: 0 });
    assert.equal(parent.kind, "main");
    assert(process.env.CMS_ADMIN_EMAIL);
    const users = await payload.find({ collection: "users", depth: 0, limit: 1,
      where: { email: { equals: process.env.CMS_ADMIN_EMAIL } }, overrideAccess: true });
    const user = users.docs[0];
    assert.equal(user?.role, "super-admin");
    let attached = 0;
    let preserved = 0;
    // Preflight all CMS relationships before beginning the upload batch.
    const records = [];
    for (const item of manifest.resources) {
      const where: Where = { and: [{ site: { equals: site.id } }, { slug: { equals: item.slug } }] };
      const result = await payload.find({ collection: "resources", where, draft: true,
        depth: 0, limit: 2, overrideAccess: false, user });
      assert.equal(result.totalDocs, 1, `${item.slug}: expected one existing resource`);
      const resource = result.docs[0];
      const file = await payload.findByID({ collection: "media", id: idOf(resource.file)!,
        depth: 0, overrideAccess: false, user });
      assert.equal(String(idOf(file.site)), String(site.id));
      assert.equal(checksum(await readFile(resolve("media", file.filename!))), item.sha256,
        `${item.slug}: attached PDF has changed; review manually`);
      records.push({ item, resource, file });
    }
    for (const { item, resource, file } of records) {
      if (idOf(resource.thumbnail)) {
        console.log(`Preserved existing thumbnail: ${item.title}`);
        preserved++;
        continue;
      }
      const coverPath = join(scratch, `${item.slug}-cover.webp`);
      const caption = `PDF first-page cover; source SHA-256: ${item.sha256}; renderer: pdftoppm + WebP v1`;
      const existing = await payload.find({ collection: "media", depth: 0, limit: 2,
        where: { and: [{ site: { equals: site.id } }, { caption: { equals: caption } }] },
        overrideAccess: false, user });
      assert(existing.totalDocs <= 1, "Duplicate cover media; review manually");
      const media = existing.docs[0] ?? await payload.create({ collection: "media",
        data: { site: site.id, alt: `${resource.title} - first-page cover`, caption,
          isPublic: resource._status === "published" },
        filePath: coverPath, overrideAccess: false, user });
      assert.equal(String(idOf(media.site)), String(site.id));
      assert(media.mimeType?.startsWith("image/"));
      const updated = await payload.update({ collection: "resources", id: resource.id,
        data: { thumbnail: media.id }, draft: resource._status === "draft",
        overrideAccess: false, user, depth: 0 });
      assert.equal(updated._status, resource._status, "Publication status must be preserved");
      assert.equal(idOf(updated.file), file.id, "PDF attachment must be preserved");
      const unchangedFile = await payload.findByID({ collection: "media", id: file.id,
        depth: 0, overrideAccess: false, user });
      assert.equal(unchangedFile.isPublic, file.isPublic, "PDF visibility must not change");
      console.log(`Attached cover media ${media.id} to resource ${resource.id}: ${item.title}`);
      attached++;
    }
    console.log(`Complete: ${attached} covers attached; ${preserved} existing thumbnails preserved.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await payload.destroy();
  }
} else {
  console.log("Preview only; no CMS writes. Add --apply to attach the covers.");
}
process.exit(process.exitCode ?? 0);
