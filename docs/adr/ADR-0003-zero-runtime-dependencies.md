# ADR-0003: Mantener cero dependencias runtime salvo justificación técnica clara

## Status

Accepted

## Context

`AGENTS.md` exige mantener el paquete sin dependencias runtime salvo razón técnica clara. El README lista `sin dependencias runtime` como parte del estado inicial, y `package.json` actualmente solo declara `devDependencies`.

## Decision

Mantener el paquete liviano y sin dependencias runtime por defecto.

Las dependencias de desarrollo para TypeScript, tipos, tests o tooling son aceptables. Cualquier dependencia runtime debe justificarse por una necesidad técnica clara y quedar documentada.

## Consequences

- No agregar librerías PDF, JWT, HTTP o criptográficas runtime si Node.js ya cubre el caso de uso.
- Evaluar cualquier dependencia runtime nueva por seguridad, mantenimiento, tamaño de paquete y compatibilidad ESM/Node.
- Mantener la validación del contenido empacado antes de publicar.
