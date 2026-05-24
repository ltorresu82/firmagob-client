# AGENTS.md - firmagob-client

Este repositorio es publico y debe mantenerse generico.

## Alcance

- El paquete esta pensado como cliente TypeScript para FirmaGob Chile, utilizable por cualquier institucion publica habilitada.
- No debe contener referencias a clientes, proyectos internos, instituciones especificas, conversaciones privadas ni documentos no publicos.
- Los ejemplos, tests y documentacion deben usar nombres genericos como `Institucion de Prueba`.
- Las fuentes normativas o tecnicas deben ser publicas y oficiales cuando existan, especialmente el sitio de FirmaGob y los repositorios `digital-gob-cl`.

## Seguridad

- No commitear credenciales, secretos, RUN reales de firmantes, tokens, respuestas productivas ni evidencia con datos institucionales.
- Las credenciales deben cargarse por variables de entorno o gestor de secretos externo al repositorio.
- Si aparece una referencia institucional especifica por accidente, limpiar archivos e historial antes de publicar.

## Calidad

- Mantener el paquete sin dependencias runtime salvo que exista una razon tecnica clara.
- Antes de publicar o empujar cambios funcionales, ejecutar:

```bash
npm test
npm audit
npm pack --dry-run
```
