import test from "node:test";
import assert from "node:assert/strict";
import { scopedAccess, siteIds, type ScopedUser } from "../src/access";
test("public reads are limited to published documents", () => {
  assert.deepEqual(scopedAccess(null, "read", true), {
    _status: { equals: "published" },
  });
  assert.equal(scopedAccess(null, "write"), false);
  assert.equal(scopedAccess(null, "leads"), false);
});
test("site assignments determine record visibility", () => {
  const user: ScopedUser = { id: 1, role: "editor", sites: [12, { id: 13 }] };
  assert.deepEqual(siteIds(user), [12, 13]);
  assert.deepEqual(scopedAccess(user, "write"), { site: { in: [12, 13] } });
  assert.equal(scopedAccess(user, "delete"), false);
  assert.equal(scopedAccess(user, "leads"), false);
});
test("viewer cannot mutate and lead manager cannot edit content", () => {
  assert.equal(
    scopedAccess({ id: 1, role: "viewer", sites: [1] }, "write"),
    false,
  );
  assert.equal(
    scopedAccess({ id: 2, role: "lead-manager", sites: [1] }, "write"),
    false,
  );
  assert.deepEqual(
    scopedAccess({ id: 2, role: "lead-manager", sites: [1] }, "leads"),
    { site: { in: [1] } },
  );
});
test("super admin can manage all sites, unassigned users cannot", () => {
  assert.equal(scopedAccess({ id: 1, role: "super-admin" }, "write"), true);
  assert.equal(
    scopedAccess({ id: 2, role: "editor", sites: [] }, "read"),
    false,
  );
});
