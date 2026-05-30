# ADR-0005: La firma PDF se modela como preparación ByteRange más PKCS#7 externo

## Status

Accepted

## Context

El README describe el flujo de preparar el PDF, calcular hash, enviar a FirmaGob y recibir PKCS#7 base64. `src/pdf-external-signature.ts` implementa preparación de `ByteRange`, exclusión de `/Contents` y embebido de firma PKCS#7.

Los tests validan placeholder, bytes de hash y rechazo de firmas mayores al espacio reservado.

## Decision

El paquete se encarga de preparar PDFs para firma externa y de insertar una firma PKCS#7 emitida fuera del paquete.

No administra certificados, llaves privadas ni firma criptográfica local.

## Consequences

- El límite del paquete es preparación, hashing e inyección de firma externa.
- No introducir llaves privadas, certificados reales o almacenamiento de secretos en este repositorio.
- Cambios al helper PDF deben conservar el contrato de `ByteRange`, placeholder y validaciones de tamaño de firma.
