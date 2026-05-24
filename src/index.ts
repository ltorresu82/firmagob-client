export {
  FirmaGobClient,
  FirmaGobClientError,
  Environment,
  Purpose,
  type FirmaGobClientConfig,
  type FirmaGobFileInput,
  type FirmaGobHashInput,
  type FirmaGobSignOutput,
} from "./firmagob-client.js";

export {
  DEFAULT_BYTE_RANGE_PLACEHOLDER,
  embedExternalSignature,
  preparePdfForExternalSignature,
  type PreparedPdfForExternalSignature,
} from "./pdf-external-signature.js";

export { sha256Base64 } from "./sha256.js";
