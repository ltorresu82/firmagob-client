import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_BYTE_RANGE_PLACEHOLDER,
  embedExternalSignature,
  preparePdfForExternalSignature,
} from "./pdf-external-signature.js";

describe("PDF external signature helpers", () => {
  it("uses a default ByteRange placeholder large enough for normal PDFs", () => {
    const pdf = Buffer.from(
      [
        "%PDF-1.7\n",
        "1 0 obj\n",
        "<< /Type /Sig /ByteRange [0 ",
        DEFAULT_BYTE_RANGE_PLACEHOLDER,
        "] /Contents <",
        "0".repeat(128),
        "> >>\n",
        "endobj\n",
        "%%EOF\n",
      ].join("")
    );

    const prepared = preparePdfForExternalSignature(pdf);
    const preparedText = prepared.bytesToHash.toString("latin1");

    assert.match(preparedText, /\/ByteRange \[0 \d+ \d+ \d+\]/);
    assert.doesNotMatch(preparedText, /\*{10}/);
  });

  it("prepares bytes for external signing by replacing ByteRange and removing Contents", () => {
    const pdf = Buffer.from(
      [
        "%PDF-1.7\n",
        "1 0 obj\n",
        "<< /Type /Sig /ByteRange [0 ********** ********** **********] ",
        "/Contents <",
        "0".repeat(64),
        "> >>\n",
        "endobj\n",
      ].join("")
    );

    const prepared = preparePdfForExternalSignature(pdf, {
      byteRangePlaceholder: "********** ********** **********",
    });
    const preparedText = prepared.bytesToHash.toString("latin1");

    assert.match(preparedText, /\/ByteRange \[0 \d+ \d+ \d+\]/);
    assert.doesNotMatch(preparedText, /\*{10}/);
    assert.doesNotMatch(preparedText, /<0{64}>/);
    assert.equal(prepared.placeholderLength, 64);
  });

  it("embeds a PKCS#7 signature at the reserved offset", () => {
    const pdf = Buffer.from("beforeafter");
    const signed = embedExternalSignature({
      preparedPdf: pdf,
      pkcs7Signature: Buffer.from([0xca, 0xfe]),
      placeholderLength: 8,
      signatureOffset: "before".length,
    });

    assert.equal(signed.toString("latin1"), "before<cafe0000>after");
  });

  it("rejects signatures larger than the placeholder", () => {
    assert.throws(
      () =>
        embedExternalSignature({
          preparedPdf: Buffer.from("pdf"),
          pkcs7Signature: Buffer.from([0xca, 0xfe, 0xba, 0xbe]),
          placeholderLength: 4,
          signatureOffset: 0,
        }),
      /larger than PDF placeholder/
    );
  });
});
