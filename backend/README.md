# FashMarket Backend - Spring Boot + PostgreSQL

Backend creado para conectar tu frontend de FashMarket con una base de datos PostgreSQL.

## Tecnologías

- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security solo para BCrypt y CORS
- PostgreSQL
- Dockerfile listo para Render

## Ejecutar localmente

Crea una base de datos local en PostgreSQL:

```sql
CREATE DATABASE fashmarket;
```

Ejecuta:

```bash
mvn spring-boot:run
```

API local:

```txt
http://localhost:8080
```

## Endpoints principales

### Auth

```http
POST /api/auth/registro
POST /api/auth/login
```

Registro:

```json
{
  "nombre": "Juan Perez",
  "correo": "juan@gmail.com",
  "telefono": "999999999",
  "password": "123456",
  "direccion": "Ica, Peru"
}
```

Login:

```json
{
  "correo": "juan@gmail.com",
  "password": "123456"
}
```

### Productos

```http
GET    /api/productos
GET    /api/productos/{id}
POST   /api/productos
PUT    /api/productos/{id}
DELETE /api/productos/{id}
```

Ejemplo producto:

```json
{
  "nombre": "Audífonos inalámbricos",
  "categoria": "tecnologia",
  "precio": 79.90,
  "precioAntes": 99.90,
  "stock": 12,
  "imagen": "data:image/png;base64,...",
  "descripcion": "Audífonos cómodos para música y llamadas.",
  "oferta": true
}
```

### Banners

```http
GET    /api/banners
GET    /api/banners?activos=true
POST   /api/banners
PUT    /api/banners/{id}
DELETE /api/banners/{id}
```

### Usuarios

```http
GET    /api/usuarios
GET    /api/usuarios/{id}
PUT    /api/usuarios/{id}
POST   /api/usuarios/{id}/direcciones
DELETE /api/usuarios/{usuarioId}/direcciones/{direccionId}
PUT    /api/usuarios/{id}/password
```

### Pedidos

```http
GET  /api/pedidos
GET  /api/pedidos/usuario/{usuarioId}
POST /api/pedidos/usuario/{usuarioId}
PUT  /api/pedidos/{pedidoId}/estado?estado=CAMINO
```

Crear pedido:

```json
{
  "metodo": "Pago contra entrega",
  "direccion": "Av. Principal 123, Ica",
  "referencia": "Casa azul",
  "horario": "Tarde",
  "productos": [
    { "productoId": 1, "cantidad": 2 }
  ]
}
```

Estados disponibles:

```txt
PENDIENTE
CAMINO
REPARTO
ENTREGADO
CANCELADO
```

### Admin

```http
GET /api/admin/indices
```

## Render

Variables de entorno recomendadas:

```txt
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:5432/DB?sslmode=require
SPRING_DATASOURCE_USERNAME=TU_USUARIO
SPRING_DATASOURCE_PASSWORD=TU_PASSWORD
SPRING_JPA_HIBERNATE_DDL_AUTO=update
CORS_ALLOWED_ORIGINS=https://tu-frontend.onrender.com,http://localhost:5500,http://127.0.0.1:5500
ADMIN_CORREO=admin@fashmarket.com
ADMIN_PASSWORD=admin123
```

## Admin inicial

Al iniciar, se crea un administrador si no existe:

```txt
correo: admin@fashmarket.com
password: admin123
```

Cambia `ADMIN_PASSWORD` en Render.

## Nota sobre imágenes

Este backend acepta `imagen` como texto. Puedes enviar una ruta como `img/logo.png` o una imagen en Base64 como `data:image/png;base64,...`.

Para un sistema real, lo ideal es subir imágenes a un storage y guardar solo la URL en PostgreSQL.
