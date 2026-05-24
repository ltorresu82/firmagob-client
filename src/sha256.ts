import { createHash } from "node:crypto";

export function sha256Base64(input: Buffer | Uint8Array | string): string {
  return createHash("sha256").update(input).digest("base64");
}
