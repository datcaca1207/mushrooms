# Deployment Guide

## 1. Prerequisites

- Docker + Docker Compose
- (Optional local dev) Node.js 20+, Python 3.11+, Arduino IDE

## 2. One-command production stack

From project root:

```bash
docker compose up --build -d
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:4010
- PostgreSQL: localhost:5432
- MQTT broker: localhost:1883

## 3. Database migration (first run)

```bash
docker compose exec backend npx prisma migrate deploy
```

## 4. Seed first admin user (example via API)

```bash
curl -X POST http://localhost:4010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farm.local","fullName":"Farm Admin","password":"StrongPass123","role":"ADMIN"}'
```

## 5. Frontend runtime env

Build-time Socket URL can be configured in frontend with:
- VITE_SOCKET_URL

## 6. Edge onboarding (ESP32)

- Flash firmware from firmware/esp32-smart-mushroom-farm
- Configure WiFi + MQTT host
- Device publishes to `farm/{farmId}/{deviceId}/sensors/data`
- Device listens on `farm/{farmId}/{deviceId}/control/set`

## 7. AI camera onboarding

- Build/start ai-camera service via compose
- Provide camera source and model by env:
  - CAMERA_SOURCE
  - YOLO_MODEL
- AI events publish to:
  - farm/{farmId}/{cameraId}/ai/events
  - farm/{farmId}/{cameraId}/ai/alerts

## 8. Production hardening checklist

- Replace JWT secret and all default credentials.
- Disable anonymous MQTT and enable ACL/authentication.
- Put frontend/backend behind TLS reverse proxy.
- Configure PostgreSQL backups.
- Add centralized logs and metrics (Prometheus/Grafana).
- Use managed object storage for screenshots/videos.
