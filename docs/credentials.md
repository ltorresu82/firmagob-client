# Credenciales de integracion FirmaGob

Este paquete no incluye credenciales de prueba ni productivas. Para ejecutar una validacion real contra FirmaGob se debe solicitar una aplicacion API habilitada para la institucion.

## Variables requeridas

| Variable | Descripcion |
| --- | --- |
| `FIRMAGOB_ENTITY` | Codigo o nombre de entidad registrado para la institucion en FirmaGob. |
| `FIRMAGOB_API_TOKEN_KEY` | Identificador publico de la aplicacion API registrada. |
| `FIRMAGOB_SECRET` | Secreto de la aplicacion API usado para firmar el JWT HS256. |
| `FIRMAGOB_RUN` | RUN del firmante habilitado, sin puntos, guion ni digito verificador. |
| `FIRMAGOB_PURPOSE` | Proposito del certificado: `Desatendido` o `Propósito General`. |
| `FIRMAGOB_ENDPOINT_API` | Endpoint API del ambiente correspondiente. |

El token JWT usa `expiration` como fecha local sin zona horaria. Por defecto este paquete usa `America/Santiago`, que replica el comportamiento esperado por los ejemplos oficiales Java cuando se ejecutan en Chile.

Endpoint de certificacion usado por los ejemplos oficiales:

```text
https://api.firma.cert.digital.gob.cl/firma/v2/files/tickets
```

Endpoint productivo:

```text
https://api.firma.digital.gob.cl/firma/v2/files/tickets
```

## Preguntas que deben quedar resueltas

- Si la integracion usara firma desatendida o firma atendida con OTP.
- Que funcionario o certificado institucional quedara autorizado para firmar en certificacion.
- Si existiran credenciales separadas para desarrollo, QA, UAT y produccion.
- Quien custodia el secreto y cual es el procedimiento de rotacion/revocacion.
- Si los documentos se firmaran por hash o por archivo completo. Para PDFs de mas de 5 MB se debe usar firma por hash.
- Que metadata debe conservar el sistema: hash, `idSolicitud`, fecha/hora, firmante, proposito, respuesta de FirmaGob y documento final.

## Solicitud sugerida

```text
Necesitamos las credenciales de integracion API FirmaGob para ambiente de certificacion de la institucion:

- Codigo de entidad/institucion registrado en FirmaGob
- API token key de la aplicacion
- Secret de la aplicacion
- RUN del firmante habilitado para pruebas, sin puntos, guion ni digito verificador
- Purpose autorizado: Desatendido o Propósito General
- Endpoint API de certificacion
- Confirmacion de si el certificado requiere OTP

Estas credenciales seran usadas inicialmente para validar firma por hash de PDFs en ambiente de desarrollo, sin documentos productivos.
```

## Manejo seguro

- No commitear valores reales en este repositorio.
- No imprimir secretos en logs ni evidencia.
- Cargar las variables desde el gestor de secretos del ambiente o desde un archivo local fuera del repositorio.
- Rotar el secreto si se comparte por canales no controlados.
