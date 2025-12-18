# LeadFlow Subscription API - Docker

## 🐳 Ejecutar con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# Construir y ejecutar
npm run docker:run

# Ver logs
npm run docker:logs

# Detener
npm run docker:stop

# Reiniciar
npm run docker:restart
```

### Opción 2: Docker manual

```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
docker run -d -p 3000:3000 --name leadflow-api --env-file .env leadflow-subscription-api

# Ver logs
docker logs -f leadflow-api

# Detener
docker stop leadflow-api
docker rm leadflow-api
```

## 🔧 Ejecutar migraciones en Docker

```bash
# Entrar al contenedor
docker exec -it leadflow-subscription-api sh

# Ejecutar migraciones
npm run migrate:up

# Salir
exit
```

## 📦 Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

## 🏥 Health Check

La API incluye un endpoint de health check:

```bash
curl http://localhost:3000/health
```

## 📊 Verificar estado del contenedor

```bash
docker ps
docker logs leadflow-subscription-api
```
