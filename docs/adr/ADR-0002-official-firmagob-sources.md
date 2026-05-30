# ADR-0002: Las fuentes oficiales FirmaGob prevalecen sobre el cliente

## Status

Accepted

## Context

El README lista como fuentes oficiales el manual de integración API FirmaGob y repositorios `digital-gob-cl`. También declara que, si existe diferencia entre este paquete y una fuente oficial vigente, debe prevalecer la fuente oficial.

El código modela endpoints de certificación y producción de FirmaGob v2.

## Decision

El contrato funcional del cliente debe seguir la documentación y ejemplos oficiales vigentes de FirmaGob.

Cuando exista una discrepancia, se debe actualizar este paquete o documentar la incompatibilidad. No se debe inventar un contrato propio ni mantener comportamiento divergente como default.

## Consequences

- Cambios de API, claims JWT, endpoints, formatos de payload o reglas de firma deben contrastarse con fuentes oficiales.
- El README puede citar fuentes oficiales; no debe basarse en conocimiento privado.
- Las decisiones futuras de compatibilidad deben dejar explícita la versión o fuente pública usada.
