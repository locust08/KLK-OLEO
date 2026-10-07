import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { projectPoint } from "../src/lib/maps/model";

const payload = await getPayload({ config });
const base = process.env.MAP_VERIFY_URL || "http://127.0.0.1:3000";
let pointID: number | undefined;
const users: number[] = [];
try {
  const main = (await payload.find({ collection: "sites", where: { slug: { equals: "klk-oleo" } }, limit: 1 })).docs[0];
  const market = (await payload.find({ collection: "sites", where: { slug: { equals: "agrochemical" } }, limit: 1 })).docs[0];
  assert(main && market);
  const publisher = await payload.create({ collection: "users", data: { email: `map-test-${randomUUID()}@example.com`, password: randomUUID(), role: "publisher", sites: [main.id] } });
  users.push(publisher.id);
  const marketEditor = await payload.create({ collection: "users", data: { email: `map-test-${randomUUID()}@example.com`, password: randomUUID(), role: "editor", sites: [market.id] } });
  users.push(marketEditor.id);
  const data = { site: main.id, key: `test-${randomUUID()}`, label: "CMS lifecycle test location", country: "Test country", region: "South East Asia" as const, latitude: 5, longitude: 95, displayOrder: 100, enabled: true, _status: "published" as const };
  await assert.rejects(payload.create({ collection: "map-locations", data: { ...data, site: market.id }, overrideAccess: true }), /main site/);
  await assert.rejects(payload.create({ collection: "map-locations", data: { ...data, latitude: 91 }, user: publisher, overrideAccess: false }));
  await assert.rejects(payload.create({ collection: "map-locations", data, user: marketEditor, overrideAccess: false }));
  const point = await payload.create({ collection: "map-locations", data, user: publisher, overrideAccess: false });
  pointID = point.id;
  const read = async () => {
    const response = await fetch(`${base}/api/map-locations?limit=1000&depth=0`, { cache: "no-store" });
    assert.equal(response.status, 200);
    return (await response.json()).docs as Array<{ id: number; label: string; latitude: number; longitude: number }>;
  };
  const frontend = async () => {
    const response = await fetch(`${base}/about-us`, { cache: "no-store" });
    assert.equal(response.status, 200);
    return response.text();
  };
  assert((await read()).some(record => record.id === point.id));
  assert((await frontend()).includes(data.label));
  await payload.update({ collection: "map-locations", id: point.id, data: { label: "Updated CMS test label", latitude: 10, longitude: 100 }, user: publisher, overrideAccess: false });
  const updated = (await read()).find(record => record.id === point.id);
  assert.equal(updated?.label, "Updated CMS test label");
  assert.equal(updated?.latitude, 10);
  const html = await frontend();
  assert(html.includes("Updated CMS test label"));
  const position = projectPoint(10, 100);
  assert(html.includes(`translate(${(position.x * 10).toFixed(2)} ${(position.y * 4.95).toFixed(2)})`), "Frontend marker uses edited coordinates");
  await payload.update({ collection: "map-locations", id: point.id, data: { enabled: false }, user: publisher, overrideAccess: false });
  assert(!(await read()).some(record => record.id === point.id));
  assert(!(await frontend()).includes("Updated CMS test label"));
  await payload.update({ collection: "map-locations", id: point.id, data: { enabled: true, _status: "draft" }, user: publisher, overrideAccess: false, draft: true });
  // A draft edit must not replace the last published version; the published version remains disabled.
  assert(!(await read()).some(record => record.id === point.id));
  console.log("PASS: main-site ownership, coordinate validation, market isolation, CMS add/edit/disable, frontend position updates and published visibility.");
} finally {
  if (pointID !== undefined) await payload.delete({ collection: "map-locations", id: pointID, overrideAccess: true });
  for (const id of users) await payload.delete({ collection: "users", id, overrideAccess: true });
  await payload.destroy();
  console.log("Temporary test location and users removed.");
}
process.exit(0);
