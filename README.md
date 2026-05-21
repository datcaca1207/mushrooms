# Smart Mushroom Farm Platform

Complete production-oriented smart farming platform with microservice architecture.

## Modules

- frontend: ReactJS dashboard (Tailwind, Recharts, Socket.IO)
- backend: NodeJS API and realtime service (Express, Prisma, PostgreSQL, MQTT)
- firmware: ESP32 Arduino firmware (DHT22 + relay control + MQTT + OTA)
- ai-camera-monitoring: Python OpenCV + YOLOv8 camera analytics service
- deployment: Mosquitto config + Docker Compose assets

## Quick Start

```bash
docker compose up --build -d
```

Then open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:4010/health

## Key Features

- Realtime dashboard and charts
- MQTT-based IoT communication
- AUTO/MANUAL actuator control
- AI camera detection and alerts
- Smart automation rules
- Device and zone management
- JWT auth + role-based access

## Detailed docs

- SYSTEM_ARCHITECTURE.md
- DEPLOYMENT_GUIDE.md
- backend/README.md
- firmware/esp32-smart-mushroom-farm/README.md
- ai-camera-monitoring/README.md
