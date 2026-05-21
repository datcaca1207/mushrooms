FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	libgl1 \
	libglib2.0-0 \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python main.py --model ${YOLO_MODEL:-yolov8n.pt} --source ${CAMERA_SOURCE:-0} --mqtt-host ${MQTT_HOST:-mqtt-broker} --mqtt-port ${MQTT_PORT:-1883} --farm-id ${FARM_ID:-mushroom-farm-a1} --camera-id ${CAMERA_ID:-camera-zone-a} --event-topic ${EVENT_TOPIC:-farm/mushroom-farm-a1/camera-zone-a/ai/events} --alert-topic ${ALERT_TOPIC:-farm/mushroom-farm-a1/camera-zone-a/ai/alerts}"]
