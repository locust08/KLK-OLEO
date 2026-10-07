import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import { installCloudflarePbkdf2 } from "../src/lib/cloudflare-pbkdf2";
import { securePayloadAuthCookie } from "../src/lib/cloudflare-auth-cookie";

test("Worker password compatibility preserves existing Payload hashes", async () => {
  const expected = crypto.pbkdf2Sync("deployment-check", "test-salt", 600000, 32, "sha256");
  const target = { ...crypto };
  installCloudflarePbkdf2(target);
  const actual = await new Promise<Buffer>((resolve, reject) => target.pbkdf2("deployment-check", "test-salt", 600000, 32, "sha256", (error, key) => error ? reject(error) : resolve(key)));
  assert.deepEqual(actual, expected);
});

test("Worker adds Secure only to Payload auth cookies", () => {
  const result = securePayloadAuthCookie(new Response("ok", { headers: { "set-cookie": "payload-token=test; HttpOnly; Path=/" } }));
  assert.match(result.headers.get("set-cookie")!, /; Secure$/);
  const ordinary = new Response("ok", { headers: { "set-cookie": "other=value; Path=/" } });
  assert.equal(securePayloadAuthCookie(ordinary), ordinary);
});
