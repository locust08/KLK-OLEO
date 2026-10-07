// Preserved from the live Worker: retain existing 600,000-iteration password hashes.
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
var patchedTargets = /* @__PURE__ */ new WeakSet<typeof crypto>();
export function installCloudflarePbkdf2(target: typeof crypto) {
  if (patchedTargets.has(target)) return;
  const native = target.pbkdf2.bind(target);
  target.pbkdf2 = (password, salt, iterations, keylen, digest, callback) => {
    if (iterations !== 6e5 || keylen !== 32 || digest !== "sha256") {
      return native(password, salt, iterations, keylen, digest, callback);
    }
    if (typeof callback !== "function") {
      throw new TypeError("PBKDF2 callback must be a function");
    }
    const bytes = (value: unknown) => {
      if (typeof value === "string") return Buffer.from(value, "utf8");
      if (ArrayBuffer.isView(value)) {
        return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      }
      if (value instanceof ArrayBuffer) return new Uint8Array(value);
      throw new TypeError("Unsupported PBKDF2 input");
    };
    const passwordBytes = new Uint8Array(bytes(password));
    const saltBytes = new Uint8Array(bytes(salt));
    const derivation = pbkdf2Async(sha256, passwordBytes, saltBytes, {
      c: iterations,
      dkLen: keylen,
      asyncTick: 10
    }).finally(() => {
      passwordBytes.fill(0);
      saltBytes.fill(0);
    });
    void derivation.then(
      (key) => {
        const result = Buffer.from(key);
        key.fill(0);
        callback(null, result);
      },
      (error6) => {
        // Node ignores the result argument on failure; preserve callback semantics.
        callback(error6 instanceof Error ? error6 : new Error("PBKDF2 failed"), Buffer.alloc(0));
      }
    );
  };
  patchedTargets.add(target);
}

