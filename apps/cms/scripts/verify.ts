import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { idOf } from "../src/access";
const payload = await getPayload({ config });
const createdUsers: (string | number)[] = [];
const createdProducts: (string | number)[] = [];
try {
  const agro = (
    await payload.find({
      collection: "sites",
      where: { slug: { equals: "agrochemical" } },
      depth: 0,
    })
  ).docs[0];
  const main = (
    await payload.find({
      collection: "sites",
      where: { slug: { equals: "klk-oleo" } },
      depth: 0,
    })
  ).docs[0];
  assert.equal(agro.kind, "minisite");
  assert.equal(agro.parentSite, main.id);
  const imported = await payload.find({
    collection: "products",
    where: { site: { equals: agro.id } },
    depth: 0,
    limit: 200,
  });
  assert.equal(imported.totalDocs, 99);
  const visible = await payload.find({
    collection: "products",
    overrideAccess: false,
    depth: 0,
  });
  assert.equal(visible.totalDocs, 0, "Products remain draft pending review");
  const resources = await payload.find({
    collection: "resources",
    overrideAccess: false,
    depth: 0,
  });
  assert.equal(resources.totalDocs, 3);
  assert(
    resources.docs.every((r) => r.availability === "placeholder" && !r.file),
  );
  const editor = await payload.create({
    collection: "users",
    data: {
      email: `test-${randomUUID()}@example.com`,
      password: randomUUID(),
      role: "editor",
      sites: [agro.id],
    },
  });
  createdUsers.push(editor.id);
  const mainEditor = await payload.create({
    collection: "users",
    data: {
      email: `test-${randomUUID()}@example.com`,
      password: randomUUID(),
      role: "editor",
      sites: [main.id],
    },
  });
  createdUsers.push(mainEditor.id);
  const scopeRead = await payload.find({
    collection: "products",
    user: mainEditor,
    overrideAccess: false,
    depth: 0,
  });
  assert.equal(
    scopeRead.totalDocs,
    0,
    "Main-site assignment must not automatically grant access to subsidiary records",
  );
  const ownRead = await payload.find({
    collection: "products",
    user: editor,
    overrideAccess: false,
    depth: 0,
    limit: 200,
  });
  assert.equal(ownRead.totalDocs, 99);
  await assert.rejects(
    payload.update({
      collection: "products",
      id: imported.docs[0].id,
      data: { site: main.id },
      user: editor,
      overrideAccess: false,
    }),
  );
  const attemptedEscalation = await payload.update({
    collection: "users",
    id: editor.id,
    data: { role: "super-admin", sites: [main.id] },
    user: editor,
    overrideAccess: false,
  });
  assert.equal(attemptedEscalation.role, "editor");
  assert.deepEqual(attemptedEscalation.sites?.map(idOf), [agro.id]);
  await assert.rejects(
    payload.create({
      collection: "products",
      data: {
        site: main.id,
        name: "Forbidden",
        slug: "forbidden",
        description: "Test",
        chemicalDescription: "Test",
        claimsReview: "source-only",
      },
      user: editor,
      overrideAccess: false,
    }),
  );
  const ownProduct = await payload.create({
    collection: "products",
    data: {
      site: agro.id,
      name: "Permission test",
      slug: `permission-${randomUUID()}`,
      description: "Test",
      chemicalDescription: "Test",
      claimsReview: "source-only",
      _status: "draft",
    },
    user: editor,
    overrideAccess: false,
  });
  createdProducts.push(ownProduct.id);
  await assert.rejects(
    payload.delete({
      collection: "products",
      id: ownProduct.id,
      user: editor,
      overrideAccess: false,
    }),
  );
  const publishAttempt = await payload.update({
    collection: "products",
    id: ownProduct.id,
    data: { _status: "published" },
    user: editor,
    overrideAccess: false,
  });
  assert.equal(publishAttempt._status, "draft");
  const published = await payload.update({
    collection: "products",
    id: ownProduct.id,
    data: { _status: "published" },
    overrideAccess: true,
  });
  assert.equal(published._status, "published");
  await assert.rejects(
    payload.update({
      collection: "products",
      id: ownProduct.id,
      data: { name: "Unreviewed live edit" },
      user: editor,
      overrideAccess: false,
    }),
  );
  const publicProduct = await payload.findByID({
    collection: "products",
    id: ownProduct.id,
    overrideAccess: false,
  });
  assert.equal(publicProduct.name, "Permission test");
  await assert.rejects(
    payload.create({
      collection: "resources",
      data: {
        site: agro.id,
        title: "Invalid download",
        slug: `invalid-${randomUUID()}`,
        type: "brochure",
        availability: "available",
      },
      overrideAccess: true,
    }),
  );
  await assert.rejects(
    payload.create({
      collection: "sites",
      data: {
        name: "Invalid minisite",
        slug: `invalid-${randomUUID()}`,
        kind: "minisite",
        domain: "https://example.com",
      },
      overrideAccess: true,
    }),
  );
  await assert.rejects(
    payload.find({ collection: "leads", user: editor, overrideAccess: false }),
  );
  console.log(
    "Integration checks passed: 99 imported products, parent linkage, draft privacy, resource placeholders, scope isolation, no self-escalation, publication restrictions, and protected leads.",
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const id of createdProducts)
    await payload.delete({ collection: "products", id, overrideAccess: true });
  for (const id of createdUsers)
    await payload.delete({ collection: "users", id, overrideAccess: true });
  await payload.destroy();
}
process.exit(process.exitCode ?? 0);
