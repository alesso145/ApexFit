# APEXFIT / GymCRUD - Implementación de requerimientos

## Cambios incluidos

### 1. Clientes y entrenadores
- Los formularios ahora solicitan `username` y `password`.
- `ClienteService` y `EntrenadorService` son transaccionales al crear/actualizar cuentas.
- Las contraseñas se almacenan con `BCryptPasswordEncoder`.
- Se reutiliza la entidad existente `AuthUser` (`auth_users`) como entidad de usuario; no se crea una segunda tabla `usuario`.
- `Cliente.authUserId` y `Entrenador.authUserId` vinculan la cuenta con la persona.
- El username se expone como campo de solo lectura para edición/consulta; la contraseña nunca se devuelve.

### 2. POS / Tienda
- Métodos disponibles: `EFECTIVO`, `TRANSFERENCIA`, `TARJETA`.
- Al elegir transferencia se muestran los datos bancarios y `assets/img/qr-transferencia-apexfit.jpeg`.
- `POST /api/ventas/checkout` ejecuta en una sola transacción:
  1. valida cliente y productos;
  2. bloquea el stock del producto;
  3. guarda la venta;
  4. guarda detalles;
  5. descuenta stock;
  6. genera automáticamente `Pago` con `tipoPago=PRODUCTO`;
  7. registra el método seleccionado.
- Si falla cualquier paso, Spring revierte toda la transacción.

### 3. Pagos
- El modal manual solo permite `MEMBRESIA`.
- Los pagos `PRODUCTO` ya no se registran manualmente desde `/pagos`; los crea exclusivamente el checkout POS.
- El modal de pagos tiene `max-height: 90vh` y `overflow-y: auto`.
- Transferencia muestra QR y datos bancarios.

## Endpoint POS

```http
POST http://localhost:8081/api/ventas/checkout
Content-Type: application/json

{
  "clienteId": 1,
  "metodoPago": "TRANSFERENCIA",
  "items": [
    { "productoId": 2, "cantidad": 2 },
    { "productoId": 5, "cantidad": 1 }
  ]
}
```

## Estructura modificada

```text
src/main/java/org/example/
├── common/
│   └── GlobalExceptionHandler.java
├── modules/
│   ├── auth/repository/
│   │   └── AuthUserRepository.java
│   ├── cliente/
│   │   ├── dto/ClienteCuentaDTO.java
│   │   ├── entity/Cliente.java
│   │   ├── controller/ClienteController.java
│   │   └── service/ClienteService.java
│   ├── entrenador/
│   │   ├── dto/EntrenadorCuentaDTO.java
│   │   ├── entity/Entrenador.java
│   │   ├── controller/EntrenadorController.java
│   │   └── service/EntrenadorService.java
│   ├── producto/repository/
│   │   └── ProductoRepository.java
│   ├── venta/
│   │   ├── dto/VentaPOSDTO.java
│   │   ├── controller/VentaController.java
│   │   └── service/VentaService.java
│   └── pago/
│       ├── dto/PagoDTO.java
│       ├── controller/PagoController.java
│       └── service/PagoService.java
└── ...resto del proyecto sin cambios

gym-frontend/src/app/
├── components/
│   ├── clientes/
│   │   ├── clientes.component.ts
│   │   ├── clientes.component.html
│   │   └── clientes.component.css
│   ├── entrenadores/
│   │   ├── entrenadores.component.ts
│   │   ├── entrenadores.component.html
│   │   └── entrenadores.component.css
│   ├── tienda/
│   │   ├── tienda.component.ts
│   │   ├── tienda.component.html
│   │   └── tienda.component.css
│   └── pagos/
│       ├── pagos.component.ts
│       ├── pagos.component.html
│       └── pagos.component.css
├── models/gym.models.ts
└── services/gym.service.ts

gym-frontend/src/styles.css
```

## Base de datos

No es necesario crear una tabla `usuario` nueva. El proyecto ya utiliza `auth_users` mediante `AuthUser` y las columnas `cliente.auth_user_id` / `entrenador.auth_user_id` ya existen en la versión entregada.

Si `spring.jpa.hibernate.ddl-auto=update` permanece activo, Hibernate mantiene la estructura compatible automáticamente.

## Instalación frontend

No empaquetar `node_modules` entre sistemas operativos. Después de extraer el proyecto:

```bash
cd gym-frontend
npm ci
npm start
```

Backend:

```bash
mvn clean package
mvn spring-boot:run
```
