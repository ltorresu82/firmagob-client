# @ltorresu82/firmagob-client

[![CI](https://github.com/ltorresu82/firmagob-client/actions/workflows/ci.yml/badge.svg)](https://github.com/ltorresu82/firmagob-client/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ltorresu82/firmagob-client.svg)](https://www.npmjs.com/package/@ltorresu82/firmagob-client)

Cliente TypeScript para integrar FirmaGob Chile sin depender de librerias PDF deprecadas.

Estado inicial:

- cliente HTTP/JWT para FirmaGob v2;
- soporte para firma por hash;
- utilidades para preparar e inyectar una firma PKCS#7 externa en PDFs;
- sin dependencias runtime.

Este paquete no es un SDK oficial de Gobierno Digital.

## Fuentes oficiales

El diseño del cliente se guia por la documentacion y ejemplos publicados por Gobierno Digital:

- [Manual de Integracion API FirmaGob, v.17 - Febrero 2026](https://firma.digital.gob.cl/biblioteca/manuales-firmagob/manual-api-firma/)
- [Organizacion oficial digital-gob-cl en GitHub](https://github.com/digital-gob-cl)
- [digital-gob-cl/firma-hash-ejemplo](https://github.com/digital-gob-cl/firma-hash-ejemplo)
- [digital-gob-cl/firma-pdf-ejemplo](https://github.com/digital-gob-cl/firma-pdf-ejemplo)
- [digital-gob-cl/firma-pdf-layout-ejemplo](https://github.com/digital-gob-cl/firma-pdf-layout-ejemplo)
- [digital-gob-cl/firma-json-ejemplo](https://github.com/digital-gob-cl/firma-json-ejemplo)
- [digital-gob-cl/firma-xml-ejemplo](https://github.com/digital-gob-cl/firma-xml-ejemplo)

Cuando exista diferencia entre este paquete y una fuente oficial vigente, debe prevalecer la fuente oficial.

## Instalacion

```bash
npm install @ltorresu82/firmagob-client
```

## Firma de hashes

```ts
import { FirmaGobClient, Purpose } from "@ltorresu82/firmagob-client";

const client = new FirmaGobClient({
  apiTokenKey: process.env.FIRMAGOB_API_TOKEN_KEY!,
  secret: process.env.FIRMAGOB_SECRET!,
  entity: process.env.FIRMAGOB_ENTITY!,
  run: process.env.FIRMAGOB_RUN!,
  purpose: Purpose.Unattended,
  environment: "test",
});

const response = await client.signHashes([
  { content: "sha256-base64-del-pdf-preparado", contentType: "application/pdf" },
]);
```

El JWT incluye los claims `entity`, `run`, `purpose`, `expiration` e `iat`. Por defecto el token expira en 5 minutos, alineado con los ejemplos oficiales. `expiration` se serializa como `yyyy-MM-dd'T'HH:mm:ss`. Se puede ajustar con `tokenTtlSeconds` si el ambiente lo requiere.

## PDF con firma externa

```ts
import {
  embedExternalSignature,
  preparePdfForExternalSignature,
  sha256Base64,
} from "@ltorresu82/firmagob-client";

const prepared = preparePdfForExternalSignature(pdfWithPlaceholder);
const hash = sha256Base64(prepared.bytesToHash);

// Enviar hash a FirmaGob y recibir PKCS#7 base64.
const signedPdf = embedExternalSignature({
  preparedPdf: prepared.bytesToHash,
  pkcs7Signature: firmaGobPkcs7Base64,
  placeholderLength: prepared.placeholderLength,
  signatureOffset: prepared.signatureOffset,
});
```

## Validacion sandbox

El repositorio incluye un ejemplo de firma por hash basado en el flujo oficial. Por seguridad, no trae credenciales embebidas; las lee desde variables de entorno.

Variables requeridas:

- `FIRMAGOB_ENTITY`
- `FIRMAGOB_API_TOKEN_KEY`
- `FIRMAGOB_RUN`
- `FIRMAGOB_PURPOSE`
- `FIRMAGOB_SECRET`
- `FIRMAGOB_ENDPOINT_API`

Validacion local sin llamada a FirmaGob:

```bash
npm run validate:sandbox:dry-run
```

Validacion real contra sandbox:

```bash
npm run validate:sandbox
```

El ejemplo escribe evidencia temporal en `tmp/sandbox-hash/`.

Para solicitar credenciales a la institucion o al equipo FirmaGob, ver [docs/credentials.md](docs/credentials.md).

## Ejemplos de integracion

Ejemplos completos con CLI Node.js, API Hono y app Astro:

```text
https://github.com/ltorresu82/firmagob-client-examples
```

## Desarrollo

```bash
npm install
npm test
npm pack --dry-run
```
