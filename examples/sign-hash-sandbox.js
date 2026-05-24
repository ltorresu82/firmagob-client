import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_BYTE_RANGE_PLACEHOLDER,
  FirmaGobClient,
  Purpose,
  embedExternalSignature,
  preparePdfForExternalSignature,
  sha256Base64,
} from "../dist/index.js";

const dryRun = process.argv.includes("--dry-run");
const outputDir = join("tmp", "sandbox-hash");
const placeholderLength = 15000 * 2;

mkdirSync(outputDir, { recursive: true });

const sourcePdf = createMinimalPdfWithSignaturePlaceholder({
  reason: "Validacion sandbox FirmaGob",
  placeholderLength,
});
const prepared = preparePdfForExternalSignature(sourcePdf);
const hash = sha256Base64(prepared.bytesToHash);

writeFileSync(join(outputDir, "source-with-placeholder.pdf"), sourcePdf);
writeFileSync(join(outputDir, "hash.txt"), `${hash}\n`);

if (dryRun) {
  const signedPdf = embedExternalSignature({
    preparedPdf: prepared.bytesToHash,
    pkcs7Signature: Buffer.from("dry-run-signature"),
    placeholderLength: prepared.placeholderLength,
    signatureOffset: prepared.signatureOffset,
  });

  writeFileSync(join(outputDir, "dry-run-signed.pdf"), signedPdf);
  console.log(`Dry run OK. Evidence written to ${outputDir}`);
  process.exit(0);
}

const config = readConfigFromEnv();
const client = new FirmaGobClient({
  apiTokenKey: config.apiTokenKey,
  secret: config.secret,
  entity: config.entity,
  run: config.run,
  purpose: config.purpose,
  environment: "test",
  testUrl: config.endpointApi,
});

console.log("Signing prepared PDF hash with FirmaGob sandbox...");
const response = await client.signHashes([
  { content: hash, contentType: "application/pdf" },
]);

if (response.status !== 200 || response.metadata.signedFailed > 0) {
  writeFileSync(
    join(outputDir, "firmagob-error.json"),
    `${JSON.stringify(response, null, 2)}\n`
  );
  throw new Error("FirmaGob sandbox signing failed");
}

const pkcs7 = response.hashes?.[0]?.content;

if (!pkcs7) {
  throw new Error("FirmaGob response did not include hashes[0].content");
}

const signedPdf = embedExternalSignature({
  preparedPdf: prepared.bytesToHash,
  pkcs7Signature: pkcs7,
  placeholderLength: prepared.placeholderLength,
  signatureOffset: prepared.signatureOffset,
});

writeFileSync(join(outputDir, "firmagob-response.json"), `${JSON.stringify(response, null, 2)}\n`);
writeFileSync(join(outputDir, "signed.pdf"), signedPdf);
console.log(`Signed PDF written to ${join(outputDir, "signed.pdf")}`);

function readConfigFromEnv() {
  const required = {
    entity: "FIRMAGOB_ENTITY",
    apiTokenKey: "FIRMAGOB_API_TOKEN_KEY",
    run: "FIRMAGOB_RUN",
    purpose: "FIRMAGOB_PURPOSE",
    secret: "FIRMAGOB_SECRET",
    endpointApi: "FIRMAGOB_ENDPOINT_API",
  };
  const missing = Object.values(required).filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    entity: process.env[required.entity],
    apiTokenKey: process.env[required.apiTokenKey],
    run: process.env[required.run],
    purpose: normalizePurpose(process.env[required.purpose]),
    secret: process.env[required.secret],
    endpointApi: process.env[required.endpointApi],
  };
}

function normalizePurpose(value) {
  if (value === Purpose.Attended || value === Purpose.Unattended) {
    return value;
  }

  throw new Error(
    `Unsupported FIRMAGOB_PURPOSE. Expected "${Purpose.Unattended}" or "${Purpose.Attended}".`
  );
}

function createMinimalPdfWithSignaturePlaceholder({ reason, placeholderLength }) {
  const contents = "0".repeat(placeholderLength);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R /AcroForm << /Fields [5 0 R] /SigFlags 3 >> >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    [
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]",
      "/Resources << /Font << /F1 4 0 R >> >>",
      "/Contents 6 0 R",
      "/Annots [5 0 R] >>",
    ].join(" "),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    [
      "<< /Type /Annot /Subtype /Widget /FT /Sig /Rect [72 72 260 120]",
      "/T (Signature1) /F 4 /P 3 0 R /V 7 0 R >>",
    ].join(" "),
    "<< /Length 63 >>\nstream\nBT /F1 16 Tf 72 700 Td (Documento sandbox FirmaGob) Tj ET\nendstream",
    [
      "<< /Type /Sig /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached",
      `/ByteRange [0 ${DEFAULT_BYTE_RANGE_PLACEHOLDER}]`,
      `/Contents <${contents}>`,
      `/Reason (${escapePdfString(reason)})`,
      `/M (D:${formatPdfDate(new Date())}) >>`,
    ].join(" "),
  ];

  return buildPdf(objects);
}

function buildPdf(objects) {
  const chunks = ["%PDF-1.7\n"];
  const offsets = [0];

  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(chunks.join(""), "latin1"));
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  }

  const xrefOffset = Buffer.byteLength(chunks.join(""), "latin1");
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");

  for (const offset of offsets.slice(1)) {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  }

  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return Buffer.from(chunks.join(""), "latin1");
}

function escapePdfString(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatPdfDate(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}
