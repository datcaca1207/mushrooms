# Smart Mushroom Farm Backend

Node.js + Express + MQTT + Socket.IO + PostgreSQL + Prisma backend for SCADA/IoT mushroom farm monitoring.

## Features

- JWT authentication and role-based authorization
- User, zone, sensor, device, automation-rule, camera, and dashboard REST APIs
- MQTT integration for sensor ingestion and device command publishing
- Socket.IO realtime updates for dashboard clients
- Automation rule engine (humidity/temperature/any metric)
- Alert channels: Telegram, Zalo, SMS, and system log

## Structure

```txt
backend/
  prisma/
    schema.prisma
  src/
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    utils/
    app.js
    server.js
  .env.example
  package.json
```

## Quick Start

1. Install dependencies

```bash
cd backend
npm install
```

2. Create environment file

```bash
cp .env.example .env
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Run migrations

```bash
npm run prisma:migrate
```

5. Start server

```bash
npm run dev
```

## API Prefix

Default API prefix is `/api/v1`.

## Key Endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/zones`
- `GET /api/v1/sensors`
- `GET /api/v1/devices`
- `GET /api/v1/automation-rules`
- `GET /api/v1/cameras`

## Example Automation Rule

IF humidity < 80 THEN turn ON sprinkler

```json
{
  "name": "Humidity Recovery",
  "enabled": true,
  "metric": "humidity",
  "operator": "LT",
  "threshold": 80,
  "actionDeviceKey": "sprinkler",
  "actionCommand": "ON",
  "cooldownSeconds": 45,
  "notificationLevel": "WARNING"
}
```

## Realtime Events

- `sensor:update`
- `device:update`
- `device:command`
- `automation:triggered`

## MQTT Topics

- Subscribe: `farm/sensors/+/data`
- Subscribe: `farm/devices/+/status`
- Subscribe: `farm/+/+/sensors/data`
- Subscribe: `farm/+/+/devices/state`
- Subscribe: `farm/+/+/ai/events`
- Subscribe: `farm/+/+/ai/alerts`
- Publish: `farm/devices/{deviceKey}/set`
- Publish: `farm/{farmId}/{deviceKey}/control/set`
