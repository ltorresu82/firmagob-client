# ADR-0001: Mantener firmagob-client como paquete público y genérico

## Status

Accepted

## Context

`firmagob-client` es un repositorio público orientado a integrar FirmaGob Chile desde TypeScript. `AGENTS.md` define que debe mantenerse genérico, sin referencias a clientes, proyectos internos, instituciones específicas, conversaciones privadas ni documentos no públicos.

El README presenta el paquete como cliente TypeScript para FirmaGob Chile y aclara que no es un SDK oficial.

## Decision

Mantener el repositorio público, genérico y reutilizable por cualquier institución pública habilitada.

Los ejemplos, tests y documentación deben usar nombres genéricos como `Institución de Prueba`. Las fuentes normativas o técnicas deben ser públicas y oficiales cuando existan.

## Consequences

- No introducir referencias a clientes, instituciones específicas, proyectos internos ni evidencia institucional.
- Si aparece una referencia institucional específica, limpiarla antes de publicar o distribuir.
- Revisar documentación, ejemplos y tests como superficie pública, no como material interno.
