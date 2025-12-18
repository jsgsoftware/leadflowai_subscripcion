# LeadFlow Subscription API

API de gestión de suscripciones para LeadFlow.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

Copia el archivo `.env.example` a `.env` y ajusta las variables:

```bash
cp .env.example .env
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Ejecutar en producción

```bash
npm start
```

## 🗄️ Base de Datos

### Ejecutar migraciones

Para crear la tabla `leadflow_account_subscriptions` en la base de datos:

```bash
npm run migrate:up
```

### Revertir última migración

```bash
npm run migrate:down
```

### Ejecutar migraciones en Docker

Si la aplicación está corriendo en Docker:

```bash
docker exec -it leadflow-subscription-api npm run migrate:up
```

## 🐳 Docker

### Ejecutar con Docker Compose

```bash
# Iniciar contenedores
npm run docker:run

# Ver logs en tiempo real
npm run docker:logs

# Detener contenedores
npm run docker:stop

# Reiniciar API
npm run docker:restart
```

### Construir imagen manualmente

```bash
npm run docker:build
```

## 📋 Scripts Disponibles

- `npm start` - Ejecuta la aplicación en modo producción
- `npm run dev` - Ejecuta la aplicación con nodemon (desarrollo)
- `npm run migrate:up` - Ejecuta migraciones pendientes
- `npm run migrate:down` - Revierte la última migración
- `npm run docker:build` - Construye la imagen Docker
- `npm run docker:run` - Ejecuta con Docker Compose
- `npm run docker:stop` - Detiene los contenedores
- `npm run docker:logs` - Muestra logs del contenedor
- `npm run docker:restart` - Reinicia el contenedor de la API

## 🏥 Health Check

```bash
curl http://localhost:3000/health
```

## 📚 Estructura del Proyecto

```
.
├── src/
│   ├── config/
│   │   └── database.js       # Configuración de PostgreSQL
│   ├── controllers/
│   │   └── example.controller.js
│   ├── routes/
│   │   ├── index.js
│   │   └── example.routes.js
│   ├── migrations/
│   │   └── 20251218_create_subscriptions_table.js
│   ├── scripts/
│   │   └── migrate.js        # Script de migraciones
│   └── index.js              # Punto de entrada
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## 🔧 Variables de Entorno

```env
# Server
PORT=3000

# Database
DB_HOST=65.21.110.250
DB_PORT=4503
DB_USER=postgres
DB_PASSWORD=63166d2cc665da686f10
DB_NAME=leadflowai
```

## 📊 Tabla de Suscripciones

La migración crea la tabla `leadflow_account_subscriptions` con los siguientes campos:

- `id` - SERIAL PRIMARY KEY
- `account_id` - INTEGER NOT NULL (FK a accounts)
- `plan` - VARCHAR(50) (free, starter, pro, etc)
- `status` - VARCHAR(20) (active, expired, suspended)
- `started_at` - TIMESTAMP NOT NULL
- `expires_at` - TIMESTAMP NOT NULL
- `trial` - BOOLEAN DEFAULT false
- `created_at` - TIMESTAMP DEFAULT NOW()
- `updated_at` - TIMESTAMP DEFAULT NOW()

Incluye índices en `account_id` y `status` para mejor rendimiento.
