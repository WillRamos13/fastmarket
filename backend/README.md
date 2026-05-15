# FastMarket Backend

Backend Spring Boot + PostgreSQL para FastMarket.

## Qué incluye esta versión

- Login y registro conectados a PostgreSQL.
- Contraseñas encriptadas con BCrypt.
- Token de sesión simple para cliente/admin.
- Rutas de administrador protegidas con `Authorization: Bearer <token>`.
- Productos, banners, pedidos, usuarios e index conectados a base de datos.
- Checkout real: crea pedido en PostgreSQL y descuenta stock automáticamente.
- Pedidos del cliente reales por usuario.
- Eliminación de productos por baja lógica (`activo=false`) para no romper pedidos antiguos.
- Panel admin con cambio de estado de pedidos.
- Panel admin para editar contenido del index.

## Usuario administrador inicial

Por defecto se crea un administrador inicial, pero **no uses una contraseña simple en producción**.

Configúralo con variables de entorno:

```txt
ADMIN_NOMBRE=Administrador
ADMIN_CORREO=admin@fastmarket.com
ADMIN_PASSWORD=usa-una-clave-larga-y-unica
ADMIN_RESET_PASSWORD=false
APP_AUTH_SECRET=usa-un-secreto-largo-y-unico
```

## Variables de entorno importantes

```txt
PORT=8080
DATABASE_URL=jdbc:postgresql://HOST:5432/fastmarket?sslmode=require
SPRING_JPA_HIBERNATE_DDL_AUTO=update
CORS_ALLOWED_ORIGIN_PATTERNS=https://tu-frontend.com,http://localhost:5500,http://127.0.0.1:5500
ADMIN_CORREO=admin@fastmarket.com
ADMIN_PASSWORD=usa-una-clave-larga-y-unica
ADMIN_RESET_PASSWORD=false
APP_AUTH_SECRET=usa-un-secreto-largo-y-unico
APP_AUTH_TOKEN_HOURS=12
OPENAI_API_KEY=opcional
OPENAI_MODEL=gpt-4.1-mini
RESEND_API_KEY=opcional
MAIL_FROM=FastMarket <onboarding@resend.dev>
```

## Endpoints principales

### Auth

```txt
POST /api/auth/registro
POST /api/auth/login
POST /api/auth/recuperar
```

### Productos

```txt
GET /api/productos
GET /api/productos?oferta=true
GET /api/productos?destacado=true
GET /api/productos/{id}
POST /api/productos
PUT /api/productos/{id}
DELETE /api/productos/{id}
```

Las rutas POST/PUT/DELETE requieren token de administrador.

### Pedidos

```txt
GET /api/pedidos
GET /api/pedidos/usuario/{usuarioId}
POST /api/pedidos/usuario/{usuarioId}
PUT /api/pedidos/{pedidoId}/estado?estado=CAMINO
```

### Usuarios

```txt
GET /api/usuarios
GET /api/usuarios/{id}
PUT /api/usuarios/{id}
POST /api/usuarios/{id}/direcciones
PUT /api/usuarios/{id}/password
```

### Banners e index

```txt
GET /api/banners
POST /api/banners
PUT /api/banners/{id}
DELETE /api/banners/{id}

GET /api/index-contenido
POST /api/index-contenido
PUT /api/index-contenido/{id}
DELETE /api/index-contenido/{id}
```

## Nota sobre base de datos

Si ya habías creado tablas antiguas con columnas faltantes, puedes borrar las tablas y dejar que Hibernate las cree de nuevo con `SPRING_JPA_HIBERNATE_DDL_AUTO=update`. Para desarrollo local también puedes usar `create` una sola vez si quieres reiniciar todo.
