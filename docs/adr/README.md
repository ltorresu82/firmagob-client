# Architecture Decision Records

Este directorio contiene decisiones técnicas durables del repositorio `firmagob-client`.

Los ADRs se usan para preservar decisiones que futuros mantenedores o agentes necesitan conocer antes de cambiar contratos, límites del paquete, seguridad, dependencias o comportamiento público.

## Índice

| ADR | Estado | Decisión |
| --- | --- | --- |
| [ADR-0001](./ADR-0001-public-generic-package.md) | Accepted | Mantener `firmagob-client` como paquete público y genérico |
| [ADR-0002](./ADR-0002-official-firmagob-sources.md) | Accepted | Las fuentes oficiales FirmaGob prevalecen sobre el cliente |
| [ADR-0003](./ADR-0003-zero-runtime-dependencies.md) | Accepted | Mantener cero dependencias runtime salvo justificación técnica clara |
| [ADR-0004](./ADR-0004-explicit-configuration-failures.md) | Accepted | Configuración y secretos deben fallar de forma explícita |
| [ADR-0005](./ADR-0005-external-pdf-signature-boundary.md) | Accepted | La firma PDF se modela como preparación ByteRange más PKCS#7 externo |

## Candidatos pendientes

No hay candidatos pendientes al momento de crear este índice.

## Origen

Estos ADRs se originan desde la auditoría de memoria durable en [`docs/decision-memory-audit.md`](../decision-memory-audit.md).
