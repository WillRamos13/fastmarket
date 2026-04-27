# FastMarket Backend

Backend completo en Spring Boot + PostgreSQL para FastMarket.

## Endpoints principales

- `GET /api/productos`
- `GET /api/productos?oferta=true`
- `GET /api/productos?destacado=true`
- `POST /api/productos`
- `PUT /api/productos/{id}`
- `DELETE /api/productos/{id}`
- `GET /api/banners`
- `POST /api/banners`
- `PUT /api/banners/{id}`
- `DELETE /api/banners/{id}`
- `POST /api/auth/registro`
- `POST /api/auth/login`
- `GET /api/usuarios`
- `GET /api/pedidos`
- `POST /api/pedidos/usuario/{usuarioId}`
- `GET /api/index-contenido`
- `POST /api/index-contenido`
- `PUT /api/index-contenido/{id}`
- `DELETE /api/index-contenido/{id}`
- `GET /api/admin/indices`

## Variables de entorno en Render

```txt
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:5432/fastmarket?sslmode=require
SPRING_DATASOURCE_USERNAME=fastmarket_user
SPRING_DATASOURCE_PASSWORD=PASSWORD_DE_POSTGRESQL
SPRING_JPA_HIBERNATE_DDL_AUTO=update
CORS_ALLOWED_ORIGINS=https://tu-frontend.onrender.com,http://localhost:5500,http://127.0.0.1:5500
ADMIN_CORREO=admin@fastmarket.com
ADMIN_PASSWORD=admin123
```
