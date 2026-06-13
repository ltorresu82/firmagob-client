import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHmac } from "node:crypto";
import { FirmaGobClient, Purpose } from "./firmagob-client.js";

describe("FirmaGobClient", () => {
  it("creates a valid HS256 JWT with FirmaGob claims", () => {
    const client = new FirmaGobClient({
      apiTokenKey: "sandbox",
      secret: "secret",
      entity: "Institucion de Prueba",
      run: "11111111",
      purpose: Purpose.Unattended,
    });

    const token = client.createToken(new Date("2026-05-24T12:00:00.000Z"));
    const [header, payload, signature] = token.split(".");
    const expectedSignature = createHmac("sha256", "secret")
      .update(`${header}.${payload}`)
      .digest("base64url");

    assert.deepEqual(JSON.parse(Buffer.from(header, "base64url").toString()), {
      alg: "HS256",
      typ: "JWT",
    });
    assert.deepEqual(JSON.parse(Buffer.from(payload, "base64url").toString()), {
      entity: "Institucion de Prueba",
      run: "11111111",
      purpose: "Desatendido",
      expiration: "2026-05-24T08:05:00",
      iat: Math.floor(new Date("2026-05-24T12:00:00.000Z").getTime() / 1000),
    });
    assert.equal(signature, expectedSignature);
  });

  it("allows overriding the JWT expiration time zone", () => {
    const client = new FirmaGobClient({
      apiTokenKey: "sandbox",
      secret: "secret",
      entity: "Institucion de Prueba",
      run: "11111111",
      purpose: Purpose.Unattended,
      tokenTimeZone: "UTC",
    });

    const [, payload] = client
      .createToken(new Date("2026-05-24T12:00:00.000Z"))
      .split(".");

    assert.equal(
      JSON.parse(Buffer.from(payload, "base64url").toString()).expiration,
      "2026-05-24T12:05:00"
    );
  });

  it("allows overriding the JWT expiration window", () => {
    const client = new FirmaGobClient({
      apiTokenKey: "sandbox",
      secret: "secret",
      entity: "Institucion de Prueba",
      run: "11111111",
      tokenTtlSeconds: 60,
    });

    const [, payload] = client
      .createToken(new Date("2026-05-24T12:00:00.000Z"))
      .split(".");

    assert.equal(
      JSON.parse(Buffer.from(payload, "base64url").toString()).expiration,
      "2026-05-24T08:01:00"
    );
  });

  it("sends hashes to the configured FirmaGob endpoint", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const client = new FirmaGobClient({
      apiTokenKey: "sandbox",
      secret: "secret",
      entity: "Institucion de Prueba",
      run: "11111111",
      testUrl: "https://firmagob.test.local",
      fetch: (async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return new Response(
          JSON.stringify({
            metadata: {
              otpExpired: false,
              filesSigned: 1,
              signedFailed: 0,
              objectsReceived: 1,
            },
            status: 200,
            hashes: [],
          }),
          { status: 200 }
        );
      }) as typeof fetch,
    });

    const result = await client.signHashes([{ content: "hash-base64" }]);

    assert.equal(result.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://firmagob.test.local");
    assert.equal(calls[0].init.method, "POST");
    assert.deepEqual(
      JSON.parse(String(calls[0].init.body)).hashes,
      [{ "content-type": "application/pdf", content: "hash-base64" }]
    );
  });
});
