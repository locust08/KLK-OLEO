import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { idOf } from "../src/access";
import type { Page, SitePresentation } from "../src/payload-types";
if (
  process.env.CMS_CLOUDFLARE === "1" ||
  process.env.DATABASE_URL ||
  !process.env.SQLITE_URL?.includes("klk-cms-integration")
)
  throw Error("Run only on the named isolated rehearsal database.");
const payload = await getPayload({ config });
const site = (
  await payload.find({
    collection: "sites",
    where: { slug: { equals: "agrochemical" } },
    limit: 1,
  })
).docs[0];
const home = (
  await payload.find({
    collection: "pages",
    where: {
      and: [{ site: { equals: site.id } }, { slug: { equals: "home" } }],
    },
    limit: 1,
    depth: 0,
    draft: false,
  })
).docs[0];
const presentation = (
  await payload.find({
    collection: "site-presentation",
    where: { site: { equals: site.id } },
    limit: 1,
    depth: 0,
    draft: false,
  })
).docs[0];
const nonce = randomUUID();
const users = [];
const editor = await payload.create({
  collection: "users",
  data: {
    email: `qa-editor-${nonce}@example.test`,
    password: randomUUID(),
    role: "editor",
    sites: [site.id],
  },
});
users.push(editor);
const publisher = await payload.create({
  collection: "users",
  data: {
    email: `qa-publisher-${nonce}@example.test`,
    password: randomUUID(),
    role: "publisher",
    sites: [site.id],
  },
});
users.push(publisher);
let checks = 0;
try {
  const modified = {
    ...home.content,
    introduction: {
      ...home.content?.introduction,
      body: "QA DRAFT ONLY — must not leak",
    },
  };
  await payload.update({
    collection: "pages",
    id: home.id,
    draft: true,
    overrideAccess: false,
    user: editor,
    data: { content: modified, _status: "draft" },
  });
  const publicPage = (
    await payload.find({
      collection: "pages",
      where: { id: { equals: home.id } },
      draft: false,
      overrideAccess: false,
      depth: 0,
    })
  ).docs[0];
  assert.equal(
    publicPage.content?.introduction?.body,
    home.content?.introduction?.body,
  );
  checks++;
  const draft = await payload.findByID({
    collection: "pages",
    id: home.id,
    draft: true,
    overrideAccess: false,
    user: editor,
    depth: 0,
  });
  assert.match(draft.content?.introduction?.body ?? "", /QA DRAFT ONLY/);
  checks++;
  await assert.rejects(
    payload.update({
      collection: "pages",
      id: home.id,
      overrideAccess: false,
      user: editor,
      data: { _status: "published" },
    }),
  );
  checks++;
  await assert.rejects(
    payload.update({
      collection: "pages",
      id: home.id,
      draft: true,
      overrideAccess: false,
      user: editor,
      data: { _status: "published" },
    }),
  );
  checks++;
  await assert.rejects(
    payload.update({
      collection: "pages",
      id: home.id,
      overrideAccess: false,
      user: publisher,
      data: {
        content: {
          ...home.content,
          introduction: { ...home.content?.introduction, heading: "" },
        },
        _status: "published",
      },
    }),
  );
  checks++;
  await assert.rejects(
    payload.update({
      collection: "pages",
      id: home.id,
      data: { _status: "draft" },
    }),
  );
  checks++;
  const image = idOf(home.hero?.image);
  assert.ok(image);
  await assert.rejects(
    payload.update({
      collection: "media",
      id: image!,
      data: { isPublic: false },
    }),
  );
  checks++;
  await assert.rejects(payload.delete({ collection: "media", id: image! }));
  checks++;
  const selected = home.content?.innovations?.items?.[0]?.product;
  assert.ok(selected);
  await assert.rejects(
    payload.update({
      collection: "products",
      id: typeof selected === "object" ? selected.id : selected!,
      data: { _status: "draft" },
    }),
  );
  checks++;
  await payload.update({
    collection: "site-presentation",
    id: presentation.id,
    draft: true,
    overrideAccess: false,
    user: editor,
    data: { brandName: "QA DRAFT BRAND", _status: "draft" },
  });
  const publicPresentation = (
    await payload.find({
      collection: "site-presentation",
      where: { id: { equals: presentation.id } },
      draft: false,
      overrideAccess: false,
      depth: 0,
    })
  ).docs[0];
  assert.equal(publicPresentation.brandName, presentation.brandName);
  checks++;
  const other = (
    await payload.find({
      collection: "sites",
      where: { slug: { equals: "klk-oleo" } },
      limit: 1,
    })
  ).docs[0];
  const outsider = await payload.create({
    collection: "users",
    data: {
      email: `qa-other-${nonce}@example.test`,
      password: randomUUID(),
      role: "editor",
      sites: [other.id],
    },
  });
  users.push(outsider);
  await assert.rejects(
    payload.findByID({
      collection: "pages",
      id: home.id,
      draft: true,
      overrideAccess: false,
      user: outsider,
    }),
  );
  checks++;
  await assert.rejects(
    payload.find({ collection: "users", overrideAccess: false }),
  );
  checks++;
  const createdProduct = await payload.create({
    collection: "products",
    draft: true,
    overrideAccess: false,
    user: editor,
    data: {
      site: site.id,
      name: "QA editor draft",
      slug: `qa-editor-${nonce}`,
      chemicalDescription: "QA",
      description: "QA",
      claimsReview: "source-only",
      _status: "draft",
    },
  });
  try {
    assert.equal(createdProduct._status, "draft");
    checks++;
    await assert.rejects(
      payload.update({
        collection: "products",
        id: createdProduct.id,
        draft: true,
        overrideAccess: false,
        user: editor,
        data: { slug: `qa-renamed-${nonce}` },
      }),
    );
    checks++;
  } finally {
    await payload.delete({ collection: "products", id: createdProduct.id });
  }
  console.log(
    `${checks} real Payload integration checks passed (draft isolation, publication, references and site permissions).`,
  );
} finally {
  await payload.update({
    collection: "pages",
    id: home.id,
    data: {
      hero: home.hero,
      content: home.content,
      integrationVersion: 1,
      _status: "published",
    } as Partial<Page>,
  });
  await payload.update({
    collection: "site-presentation",
    id: presentation.id,
    data: {
      ...presentation,
      _status: "published",
    } as Partial<SitePresentation>,
  });
  for (const user of users)
    await payload.delete({ collection: "users", id: user.id });
  await payload.destroy();
}
