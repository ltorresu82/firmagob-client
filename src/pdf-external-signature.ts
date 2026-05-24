export const DEFAULT_BYTE_RANGE_PLACEHOLDER =
  "********** ********** **********";

export type PreparedPdfForExternalSignature = {
  bytesToHash: Buffer;
  placeholderLength: number;
  signatureOffset: number;
  byteRange: [number, number, number, number];
};

export function preparePdfForExternalSignature(
  pdfBuffer: Buffer | Uint8Array,
  options: { byteRangePlaceholder?: string } = {}
): PreparedPdfForExternalSignature {
  const placeholder =
    options.byteRangePlaceholder ?? DEFAULT_BYTE_RANGE_PLACEHOLDER;
  let pdf = removeTrailingNewLine(Buffer.from(pdfBuffer));
  const byteRangePosition = pdf.indexOf(placeholder);

  if (byteRangePosition < 0) {
    throw new Error(`Could not find ByteRange placeholder: ${placeholder}`);
  }

  const byteRangeEnd = byteRangePosition + placeholder.length;
  const contentsPosition = pdf.indexOf("/Contents ", byteRangeEnd);

  if (contentsPosition < 0) {
    throw new Error("Could not find /Contents after /ByteRange");
  }

  const signatureStart = pdf.indexOf("<", contentsPosition);
  const signatureEnd = pdf.indexOf(">", signatureStart);

  if (signatureStart < 0 || signatureEnd < 0) {
    throw new Error("Could not find /Contents hex placeholder");
  }

  const placeholderLengthWithBrackets = signatureEnd + 1 - signatureStart;
  const placeholderLength = placeholderLengthWithBrackets - 2;
  const byteRange: [number, number, number, number] = [
    0,
    signatureStart,
    signatureStart + placeholderLengthWithBrackets,
    pdf.length - (signatureStart + placeholderLengthWithBrackets),
  ];
  const byteRangeText = `/ByteRange [${byteRange.join(" ")}]`;

  if (byteRangeText.length > placeholder.length) {
    throw new Error("Calculated /ByteRange does not fit in placeholder");
  }

  const paddedByteRangeText =
    byteRangeText + " ".repeat(placeholder.length - byteRangeText.length);

  pdf = Buffer.concat([
    pdf.subarray(0, byteRangePosition),
    Buffer.from(paddedByteRangeText),
    pdf.subarray(byteRangeEnd),
  ]);

  const bytesToHash = Buffer.concat([
    pdf.subarray(0, byteRange[1]),
    pdf.subarray(byteRange[2], byteRange[2] + byteRange[3]),
  ]);

  return {
    bytesToHash,
    placeholderLength,
    signatureOffset: byteRange[1],
    byteRange,
  };
}

export function embedExternalSignature(input: {
  preparedPdf: Buffer | Uint8Array;
  pkcs7Signature: Buffer | Uint8Array | string;
  placeholderLength: number;
  signatureOffset: number;
}): Buffer {
  const pdf = Buffer.from(input.preparedPdf);
  const signature = Buffer.isBuffer(input.pkcs7Signature)
    ? input.pkcs7Signature
    : typeof input.pkcs7Signature === "string"
      ? Buffer.from(input.pkcs7Signature, "base64")
      : Buffer.from(input.pkcs7Signature);
  const signatureHex = signature.toString("hex");

  if (signatureHex.length > input.placeholderLength) {
    throw new Error("PKCS#7 signature is larger than PDF placeholder");
  }

  const paddedSignatureHex = signatureHex.padEnd(input.placeholderLength, "0");

  return Buffer.concat([
    pdf.subarray(0, input.signatureOffset),
    Buffer.from(`<${paddedSignatureHex}>`),
    pdf.subarray(input.signatureOffset),
  ]);
}

function removeTrailingNewLine(pdf: Buffer): Buffer {
  let end = pdf.length;

  while (end > 0 && (pdf[end - 1] === 0x0a || pdf[end - 1] === 0x0d)) {
    end -= 1;
  }

  return end === pdf.length ? pdf : pdf.subarray(0, end);
}
