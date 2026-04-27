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

Por defecto:

```txt
Correo: admin@fastmarket.com
Contraseña: admin123
```

Cámbialo con variables de entorno:

```txt
ADMIN_NOMBRE=Administrador
ADMIN_CORREO=admin@fastmarket.com
ADMIN_PASSWORD=admin123
APP_AUTH_SECRET=cambia-esta-clave-en-produccion
```

## Variables de entorno importantes

```txt
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:5432/fastmarket?sslmode=require
SPRING_DATASOURCE_USERNAME=usuario
SPRING_DATASOURCE_PASSWORD=password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
CORS_ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://tu-frontend.com
APP_AUTH_SECRET=cambia-esta-clave-en-produccion
APP_AUTH_TOKEN_HOURS=12
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
