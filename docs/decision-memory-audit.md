# Auditoría de memoria durable de decisiones

Fecha: 2026-05-30

## Alcance

Auditoría del repositorio `firmagob-client` para identificar decisiones que conviene preservar como memoria durable del repositorio. No se crean ADRs en este reporte; se proponen candidatos y estados.

## Hallazgos

No existe una carpeta ADR o decision-record vigente. Si se decide formalizar estas decisiones, la ubicación recomendada es `docs/adr/`.

El repositorio ya contiene varias decisiones implícitas distribuidas entre `AGENTS.md`, `README.md`, `docs/credentials.md`, `package.json`, CI y código fuente. Las decisiones siguientes cumplen el criterio de memoria durable: si otro agente cambia estas áreas en dos meses, necesita conocerlas para no romper el contrato público del paquete.

## Propuestas de memoria durable

### ADR-0001: Mantener firmagob-client como paquete público y genérico

Estado sugerido: Accepted

Evidencia:

- `AGENTS.md`: declara que el repositorio es público y debe mantenerse genérico.
- `AGENTS.md`: prohíbe referencias a clientes, proyectos internos, instituciones específicas, conversaciones privadas y documentos no públicos.
- `README.md`: define el paquete como cliente TypeScript para integrar FirmaGob Chile y declara que no es un SDK oficial.

Decisión:

El repositorio debe mantenerse público, genérico y reutilizable por cualquier institución pública habilitada. Los ejemplos, tests y documentación deben usar nombres genéricos como `Institución de Prueba`. Las fuentes normativas o técnicas deben ser públicas y oficiales cuando existan.

Consecuencias:

- No se deben introducir referencias a clientes, instituciones específicas, proyectos internos ni evidencia institucional.
- Si aparece una referencia institucional específica, debe limpiarse antes de publicar o distribuir.
- Los cambios de documentación y ejemplos deben revisarse como superficie pública, no como material interno.

### ADR-0002: Las fuentes oficiales FirmaGob prevalecen sobre el cliente

Estado sugerido: Accepted

Evidencia:

- `README.md`: lista como fuentes oficiales el manual de integración API FirmaGob y repositorios `digital-gob-cl`.
- `README.md`: indica que, si existe diferencia entre el paquete y una fuente oficial vigente, debe prevalecer la fuente oficial.
- `src/firmagob-client.ts`: modela endpoints de certificación y producción de FirmaGob v2.

Decisión:

El contrato funcional del cliente debe seguir la documentación y ejemplos oficiales vigentes de FirmaGob. Cuando exista una discrepancia, se debe actualizar este paquete o documentar la incompatibilidad; no se debe inventar un contrato propio ni mantener comportamiento divergente como default.

Consecuencias:

- Cambios de API, claims JWT, endpoints, formatos de payload o reglas de firma deben contrastarse con fuentes oficiales.
- El README puede citar fuentes oficiales; no debe basarse en conocimiento privado.
- Las decisiones futuras de compatibilidad deben dejar explícita la versión o fuente pública usada.

### ADR-0003: Cero dependencias runtime salvo justificación técnica clara

Estado sugerido: Accepted

Evidencia:

- `AGENTS.md`: exige mantener el paquete sin dependencias runtime salvo razón técnica clara.
- `README.md`: lista `sin dependencias runtime` como parte del estado inicial.
- `package.json`: actualmente solo declara `devDependencies`.

Decisión:

El paquete debe conservarse liviano y sin dependencias runtime por defecto. Las dependencias de desarrollo para TypeScript, tipos, tests o tooling son aceptables; cualquier dependencia runtime debe justificarse por una necesidad técnica clara y quedar documentada.

Consecuencias:

- No agregar librerías PDF, JWT, HTTP o criptográficas runtime si Node.js ya cubre el caso de uso.
- Una dependencia runtime nueva debe evaluarse por superficie de seguridad, mantenimiento, tamaño de paquete y compatibilidad ESM/Node.
- La validación de publicación debe seguir revisando el contenido empacado.

### ADR-0004: Configuración y secretos fallan de forma explícita

Estado sugerido: Accepted

Evidencia:

- `src/firmagob-client.ts`: valida `apiTokenKey`, `secret`, `entity` y `run` en el constructor.
- `examples/sign-hash-sandbox.js`: falla si faltan variables de entorno requeridas.
- `docs/credentials.md`: documenta variables requeridas y manejo seguro.
- `AGENTS.md`: prohíbe commitear credenciales, RUN reales, tokens y evidencia con datos institucionales.

Decisión:

Credenciales, RUN, entidad, propósito y endpoint deben venir de configuración externa. El runtime y los ejemplos deben fallar con errores claros cuando falte configuración requerida. No se deben agregar credenciales dummy, usuarios de prueba, endpoints locales o fallbacks silenciosos como comportamiento productivo.

Consecuencias:

- Los ejemplos pueden usar dry-run explícito, pero no deben simular credenciales reales.
- Las respuestas o evidencias reales de FirmaGob no deben quedar versionadas.
- Cualquier bypass de desarrollo debe estar nombrado como tal y no ser el camino por defecto.

### ADR-0005: La firma PDF se modela como preparación ByteRange más PKCS#7 externo

Estado sugerido: Accepted

Evidencia:

- `README.md`: describe preparar el PDF, calcular hash, enviar a FirmaGob y recibir PKCS#7 base64.
- `src/pdf-external-signature.ts`: implementa preparación de `ByteRange`, exclusión de `/Contents` y embebido de firma PKCS#7.
- `src/pdf-external-signature.test.ts`: valida placeholder, bytes de hash y rechazo de firmas mayores al espacio reservado.

Decisión:

El paquete debe encargarse de preparar PDFs para firma externa y de insertar una firma PKCS#7 emitida fuera del paquete. No administra certificados, llaves privadas ni firma criptográfica local.

Consecuencias:

- El límite del paquete es preparación, hashing e inyección de firma externa.
- No se deben introducir llaves privadas, certificados reales o almacenamiento de secretos en este repositorio.
- Cambios al helper PDF deben conservar el contrato de `ByteRange`, placeholder y validaciones de tamaño de firma.

## Validación realizada

Comandos ejecutados:

```bash
npm test
npm audit
git status --short --ignored
```

Resultados:

- `npm test`: pasó con 7 tests.
- `npm audit`: `found 0 vulnerabilities`.
- `git status --short --ignored`: solo mostró `dist/` y `node_modules/` como ignorados luego de la validación.

## Resultado posterior

Esta propuesta fue aceptada y materializada como ADRs en `docs/adr/`, con un índice en `docs/adr/README.md`.
