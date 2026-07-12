# Guia de sustentacion - TourClick

## Problema que resuelve

TourClick organiza la reserva de tours en Huaraz conectando turistas, empresas turisticas y administracion de plataforma.

El sistema demuestra:

- Busqueda y comparacion de tours.
- Reserva con cuenta de cliente.
- Pago centralizado a TourClick.
- Comision del 10% visible solo para administracion.
- Dashboard de empresa para historial, ingresos y validaciones.
- Dashboard admin para usuarios, empresas, catalogos, pagos y comisiones.

## Mejora importante implementada

Antes, un pago virtual quedaba confirmado apenas se generaba la reserva. Eso no era realista para Yape.

Ahora el flujo es:

1. Cliente reserva.
2. Si paga con Yape, se muestra el QR central de TourClick.
3. La reserva queda como `Pendiente Yape`.
4. El admin valida el pago cuando revisa la cuenta Yape.
5. Recien ahi pasa a `Confirmada`.

Esto evita dar por pagado algo que aun no fue validado.

## Flujo de dinero

El dinero entra a una sola cuenta de TourClick.

Por cada reserva:

- Cliente paga el total.
- TourClick registra 10% como comision.
- La empresa tiene 90% como monto por liquidar.

Importante para explicar: Yape QR no permite repartir automaticamente el pago entre TourClick y empresas. Para eso se necesitaria una pasarela de pagos con API y split payments. En este MVP, el split es contable y la liquidacion se haria manualmente.

## Roles

### Cliente

- Crea cuenta.
- Reserva tours.
- Ve sus reservas en `Mis reservas`.
- Consulta QR, voucher y estado de validacion.

### Empresa

- Ve reservas de su agencia.
- Ve ingresos que le corresponden.
- Edita su catalogo: imagenes, precios, cupos y datos del tour.
- Valida vouchers de efectivo cuando el cliente llega.

### Admin

- Ve todas las reservas.
- Valida pagos Yape y pagos virtuales.
- Controla usuarios, empresas y catalogo global.
- Registra nuevas empresas.
- Ve comisiones e ingresos globales.

## Fortalezas para defender

- Separacion de responsabilidades por rol.
- Comision oculta para el turista.
- Estados de reserva trazables.
- Preparado para Firebase y Google Cloud.
- QR Yape configurable desde carpeta publica.
- Dashboard diferenciado para empresa y admin.
- El proyecto no depende directamente de `localStorage`: usa una capa `api` que puede cambiar entre modo demo y Firebase.

## Deficiencias actuales y como responder

### 1. No hay pago automatico real

Respuesta: es una limitacion de Yape QR. El MVP valida pagos manualmente desde admin. Para produccion se integraria una pasarela con API.

### 2. El modo demo usa localStorage

Respuesta: se usa solo para pruebas locales. El proyecto ya tiene estructura para Firebase Auth, Firestore, Storage y Hosting.

### 3. Falta comprobante de pago subido por cliente

Respuesta: se puede agregar como siguiente iteracion usando Firebase Storage para subir captura de Yape y asociarla a la reserva.

### 4. Falta seguridad avanzada

Respuesta: ya existen reglas base de Firestore y Storage. En produccion se reforzarian con validacion de datos, roles por custom claims y Cloud Functions para operaciones criticas.

### 5. Falta liquidacion automatica a empresas

Respuesta: el sistema calcula el monto a liquidar. La transferencia automatica requiere integracion bancaria o pasarela de pagos.

## Siguiente mejora recomendada

Agregar carga de comprobante Yape:

- Cliente sube captura.
- Admin revisa captura.
- Admin valida o rechaza pago.
- Empresa solo ve reservas confirmadas o vouchers en efectivo.

Esta mejora cerraria mejor el circuito de pagos sin depender aun de una pasarela bancaria.
