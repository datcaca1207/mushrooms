# Smart Mushroom Farm AI Camera Monitoring

Python + OpenCV + YOLOv8 realtime camera analysis system.

## Features

- Mushroom disease detection
- Mushroom growth monitoring (count + bbox area trend)
- General object detection
- Abnormal condition detection
- Livestream analysis
- Alert system (console + JSONL log)
- Screenshot capture (periodic + on-alert)

## Tech Stack

- Python
- OpenCV
- Ultralytics YOLOv8
- JSON alert logs

## Install

```bash
cd ai-camera-monitoring
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

## Run

Webcam source 0:

```bash
python main.py --model yolov8n.pt --source 0 --show
```

Run with MQTT publishing enabled:

```bash
python main.py --model best.pt --source 0 --show \
  --mqtt-host localhost --mqtt-port 1883 \
  --farm-id mushroom-farm-a1 --camera-id camera-zone-a \
  --event-topic farm/mushroom-farm-a1/camera-zone-a/ai/events \
  --alert-topic farm/mushroom-farm-a1/camera-zone-a/ai/alerts
```

RTSP stream:

```bash
python main.py --model best.pt --source rtsp://user:pass@camera-ip/stream1 --show
```

Save annotated video:

```bash
python main.py --model best.pt --source 0 --show --save-video
```

## Important Notes

- For real mushroom disease detection, use your **custom trained YOLO model** (`best.pt`) with disease classes.
- Default `yolov8n.pt` is generic object detection and may not detect mushroom diseases accurately.
- Edit detection keyword arguments for your class names:

```bash
python main.py \
  --model best.pt \
  --source 0 \
  --show \
  --disease-classes disease,green_mold,bacterial_blotch \
  --mushroom-classes mushroom,fruiting_body \
  --abnormal-classes person,insect,rodent
```

## MQTT Integration

This service publishes MQTT messages directly:
- `farm/{farmId}/{cameraId}/ai/events`
- `farm/{farmId}/{cameraId}/ai/alerts`

## Output

Generated under `outputs/` by default:
- `outputs/alerts.jsonl`
- `outputs/screenshots/*.jpg`
- `outputs/annotated_output.mp4` (if `--save-video`)
