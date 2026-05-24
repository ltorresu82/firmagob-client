import { createHmac } from "node:crypto";

export type Environment = "test" | "production";

export const Purpose = {
  Attended: "Propósito General",
  Unattended: "Desatendido",
} as const;

export type Purpose = (typeof Purpose)[keyof typeof Purpose];

export type FirmaGobClientConfig = {
  apiTokenKey: string;
  secret: string;
  entity: string;
  run: string;
  purpose?: Purpose;
  environment?: Environment;
  tokenTtlSeconds?: number;
  fetch?: typeof fetch;
  testUrl?: string;
  productionUrl?: string;
};

export type FirmaGobFileInput = {
  content: string;
  contentType: string;
  checksum?: string;
  description?: string;
  layout?: string;
  references?: string[];
  xmlObjects?: string[];
};

export type FirmaGobHashInput = {
  content: string;
  contentType?: "application/pdf";
  description?: string;
};

type FirmaGobPayloadFile = {
  "content-type": string;
  content: string;
  checksum?: string;
  description?: string;
  layout?: string;
  references?: string[];
  xmlObjects?: string[];
};

export type FirmaGobSignOutput = {
  metadata: {
    otpExpired: boolean;
    filesSigned: number;
    signedFailed: number;
    objectReceived: number;
  };
  status: number;
  error?: string;
  idSolicitud?: number;
  files?: Array<Record<string, unknown>>;
  hashes?: Array<{
    content: string;
    status: "OK" | "error";
    contentType: string;
    documentStatus: string;
    checksum_original: string | null;
    hashOriginal?: string;
  }>;
};

export class FirmaGobClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly responseBody?: string
  ) {
    super(message);
    this.name = "FirmaGobClientError";
  }
}

const TEST_URL = "https://api.firma.cert.digital.gob.cl/firma/v2/files/tickets";
const PRODUCTION_URL =
  "https://api.firma.digital.gob.cl/firma/v2/files/tickets";
const DEFAULT_TOKEN_TTL_SECONDS = 5 * 60;

export class FirmaGobClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: FirmaGobClientConfig) {
    assertRequired("apiTokenKey", config.apiTokenKey);
    assertRequired("secret", config.secret);
    assertRequired("entity", config.entity);
    assertRequired("run", config.run);

    this.fetchImpl = config.fetch ?? fetch;
  }

  async signHashes(
    hashes: FirmaGobHashInput[],
    options: { otp?: string } = {}
  ): Promise<FirmaGobSignOutput> {
    if (hashes.length === 0) {
      throw new FirmaGobClientError("At least one hash is required");
    }

    return this.sign(
      {
        hashes: hashes.map((hash) => ({
          "content-type": hash.contentType ?? "application/pdf",
          content: hash.content,
          description: hash.description,
        })),
      },
      options.otp
    );
  }

  async signFiles(
    files: FirmaGobFileInput[],
    options: { otp?: string } = {}
  ): Promise<FirmaGobSignOutput> {
    if (files.length === 0) {
      throw new FirmaGobClientError("At least one file is required");
    }

    return this.sign(
      {
        files: files.map((file) => ({
          "content-type": file.contentType,
          content: file.content,
          checksum: file.checksum,
          description: file.description,
          layout: file.layout,
          references: file.references,
          xmlObjects: file.xmlObjects,
        })),
      },
      options.otp
    );
  }

  createToken(now = new Date()): string {
    const tokenTtlSeconds =
      this.config.tokenTtlSeconds ?? DEFAULT_TOKEN_TTL_SECONDS;
    const header = base64UrlEncodeJson({ alg: "HS256", typ: "JWT" });
    const payload = base64UrlEncodeJson({
      entity: this.config.entity,
      run: this.config.run,
      purpose: this.config.purpose ?? Purpose.Unattended,
      expiration: new Date(now.getTime() + tokenTtlSeconds * 1000).toISOString(),
    });
    const unsignedToken = `${header}.${payload}`;
    const signature = createHmac("sha256", this.config.secret)
      .update(unsignedToken)
      .digest("base64url");

    return `${unsignedToken}.${signature}`;
  }

  private async sign(
    payload: { files?: FirmaGobPayloadFile[]; hashes?: FirmaGobPayloadFile[] },
    otp?: string
  ): Promise<FirmaGobSignOutput> {
    const purpose = this.config.purpose ?? Purpose.Unattended;

    if (purpose === Purpose.Attended && !otp) {
      throw new FirmaGobClientError("Attended signatures require an OTP");
    }

    const response = await this.fetchImpl(this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(otp ? { otp } : {}),
      },
      body: JSON.stringify({
        api_token_key: this.config.apiTokenKey,
        token: this.createToken(),
        ...payload,
      }),
    });

    const body = await response.text();

    if (!response.ok) {
      throw new FirmaGobClientError(
        `FirmaGob request failed with HTTP ${response.status}`,
        response.status,
        body
      );
    }

    return parseJsonResponse(body);
  }

  private get url(): string {
    if ((this.config.environment ?? "test") === "production") {
      return this.config.productionUrl ?? PRODUCTION_URL;
    }

    return this.config.testUrl ?? TEST_URL;
  }
}

function assertRequired(name: string, value: string): void {
  if (!value || value.trim().length === 0) {
    throw new FirmaGobClientError(`Missing required config: ${name}`);
  }
}

function base64UrlEncodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function parseJsonResponse(body: string): FirmaGobSignOutput {
  try {
    return JSON.parse(body) as FirmaGobSignOutput;
  } catch (error) {
    throw new FirmaGobClientError(
      "FirmaGob returned a non-JSON response",
      undefined,
      body
    );
  }
}
