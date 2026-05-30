# ADR-0004: Configuración y secretos deben fallar de forma explícita

## Status

Accepted

## Context

`src/firmagob-client.ts` valida `apiTokenKey`, `secret`, `entity` y `run` en el constructor. El ejemplo `examples/sign-hash-sandbox.js` falla cuando faltan variables de entorno requeridas. `docs/credentials.md` documenta variables requeridas y manejo seguro.

`AGENTS.md` prohíbe commitear credenciales, RUN reales, tokens y evidencia con datos institucionales.

## Decision

Credenciales, RUN, entidad, propósito y endpoint deben venir de configuración externa.

El runtime y los ejemplos deben fallar con errores claros cuando falte configuración requerida. No se deben agregar credenciales dummy, usuarios de prueba, endpoints locales o fallbacks silenciosos como comportamiento productivo.

## Consequences

- Los ejemplos pueden usar dry-run explícito, pero no deben simular credenciales reales.
- Las respuestas o evidencias reales de FirmaGob no deben quedar versionadas.
- Cualquier bypass de desarrollo debe estar nombrado como tal y no ser el camino por defecto.
