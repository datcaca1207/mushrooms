import argparse
import json
import time
from collections import deque
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from ultralytics import YOLO


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: tuple[int, int, int, int]


class AlertManager:
    def __init__(self, output_dir: Path, cooldown_seconds: int = 10, mqtt_publisher=None):
        self.output_dir = output_dir
        self.screenshot_dir = output_dir / "screenshots"
        self.log_path = output_dir / "alerts.jsonl"
        self.cooldown_seconds = cooldown_seconds
        self.last_alert_at = 0.0
        self.mqtt_publisher = mqtt_publisher

        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)

    def can_alert(self) -> bool:
        return time.time() - self.last_alert_at > self.cooldown_seconds

    def send_alert(self, level: str, message: str, frame: np.ndarray | None = None, metadata: dict | None = None):
        if not self.can_alert():
            return

        self.last_alert_at = time.time()
        metadata = metadata or {}

        event = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "message": message,
            "metadata": metadata,
        }

        with self.log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(event) + "\n")

        print(f"[ALERT][{level.upper()}] {message} | metadata={metadata}")

        if self.mqtt_publisher is not None:
            self.mqtt_publisher.publish_alert(level=level, message=message, metadata=metadata)

        if frame is not None:
            filename = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f") + ".jpg"
            cv2.imwrite(str(self.screenshot_dir / filename), frame)


class GrowthMonitor:
    def __init__(self, window_size: int = 60):
        self.area_history = deque(maxlen=window_size)

    def update(self, mushroom_detections: list[Detection]) -> dict:
        if not mushroom_detections:
            return {
                "average_area": 0.0,
                "trend_pct": 0.0,
                "count": 0,
            }

        areas = []
        for det in mushroom_detections:
            x1, y1, x2, y2 = det.bbox
            areas.append(max(1, (x2 - x1) * (y2 - y1)))

        current_avg_area = float(np.mean(areas))
        self.area_history.append(current_avg_area)

        if len(self.area_history) < 2:
            trend_pct = 0.0
        else:
            old = self.area_history[0]
            new = self.area_history[-1]
            trend_pct = ((new - old) / old) * 100.0 if old > 0 else 0.0

        return {
            "average_area": current_avg_area,
            "trend_pct": trend_pct,
            "count": len(mushroom_detections),
        }


class MqttPublisher:
    def __init__(self, host: str, port: int, event_topic: str, alert_topic: str, farm_id: str, camera_id: str):
        self.host = host
        self.port = port
        self.event_topic = event_topic
        self.alert_topic = alert_topic
        self.farm_id = farm_id
        self.camera_id = camera_id
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"ai-{camera_id}")

    def connect(self):
        try:
            self.client.connect(self.host, self.port, keepalive=60)
            self.client.loop_start()
            print(f"MQTT connected: {self.host}:{self.port}")
        except Exception as exc:
            print(f"MQTT connect failed: {exc}")

    def publish_event(self, payload: dict):
        message = {
            "farmId": self.farm_id,
            "cameraId": self.camera_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            **payload,
        }
        self.client.publish(self.event_topic, json.dumps(message), qos=1)

    def publish_alert(self, level: str, message: str, metadata: dict):
        payload = {
            "farmId": self.farm_id,
            "cameraId": self.camera_id,
            "level": level.upper(),
            "message": message,
            "metadata": metadata,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        self.client.publish(self.alert_topic, json.dumps(payload), qos=1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smart Mushroom Farm AI Camera Monitoring")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Path to YOLOv8 model")
    parser.add_argument("--source", type=str, default="0", help="Camera source: 0,1,... or RTSP URL/video path")
    parser.add_argument("--conf", type=float, default=0.35, help="Detection confidence threshold")
    parser.add_argument("--imgsz", type=int, default=640, help="Inference image size")
    parser.add_argument("--save-dir", type=str, default="outputs", help="Directory to save logs/screenshots")
    parser.add_argument("--show", action="store_true", help="Show live preview window")
    parser.add_argument("--save-video", action="store_true", help="Save annotated output video")
    parser.add_argument(
        "--disease-classes",
        type=str,
        default="disease,rot,mold,contamination",
        help="Comma-separated disease keywords in class names",
    )
    parser.add_argument(
        "--mushroom-classes",
        type=str,
        default="mushroom,cap,fungi",
        help="Comma-separated mushroom keywords in class names",
    )
    parser.add_argument(
        "--abnormal-classes",
        type=str,
        default="person,rat,mouse,insect",
        help="Comma-separated abnormal object keywords",
    )
    parser.add_argument("--min-mushrooms", type=int, default=1, help="Minimum expected mushroom count")
    parser.add_argument("--mqtt-host", type=str, default="localhost", help="MQTT broker host")
    parser.add_argument("--mqtt-port", type=int, default=1883, help="MQTT broker port")
    parser.add_argument("--farm-id", type=str, default="mushroom-farm-a1", help="Farm identifier")
    parser.add_argument("--camera-id", type=str, default="camera-zone-a", help="Camera identifier")
    parser.add_argument(
        "--event-topic",
        type=str,
        default="farm/mushroom-farm-a1/camera-zone-a/ai/events",
        help="MQTT topic for AI events",
    )
    parser.add_argument(
        "--alert-topic",
        type=str,
        default="farm/mushroom-farm-a1/camera-zone-a/ai/alerts",
        help="MQTT topic for AI alerts",
    )
    return parser.parse_args()


def get_capture_source(source: str):
    if source.isdigit():
        return int(source)
    return source


def class_matches(class_name: str, keywords: list[str]) -> bool:
    cn = class_name.lower()
    return any(keyword in cn for keyword in keywords)


def draw_detection(frame: np.ndarray, detection: Detection, color: tuple[int, int, int]):
    x1, y1, x2, y2 = detection.bbox
    label = f"{detection.class_name} {detection.confidence:.2f}"
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.putText(frame, label, (x1, max(y1 - 8, 12)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)


def run():
    args = parse_args()

    disease_keywords = [x.strip().lower() for x in args.disease_classes.split(",") if x.strip()]
    mushroom_keywords = [x.strip().lower() for x in args.mushroom_classes.split(",") if x.strip()]
    abnormal_keywords = [x.strip().lower() for x in args.abnormal_classes.split(",") if x.strip()]

    output_dir = Path(args.save_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    mqtt_publisher = MqttPublisher(
        host=args.mqtt_host,
        port=args.mqtt_port,
        event_topic=args.event_topic,
        alert_topic=args.alert_topic,
        farm_id=args.farm_id,
        camera_id=args.camera_id,
    )
    mqtt_publisher.connect()

    model = YOLO(args.model)
    alert_manager = AlertManager(output_dir=output_dir, cooldown_seconds=10, mqtt_publisher=mqtt_publisher)
    growth_monitor = GrowthMonitor(window_size=120)

    cap = cv2.VideoCapture(get_capture_source(args.source))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open camera source: {args.source}")

    writer = None
    if args.save_video:
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1280)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 720)
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 20.0)
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(str(output_dir / "annotated_output.mp4"), fourcc, fps, (width, height))

    last_periodic_shot = 0.0

    print("AI camera monitoring started. Press 'q' to quit.")
    while True:
        ok, frame = cap.read()
        if not ok:
            print("Frame read failed, retrying...")
            time.sleep(0.2)
            continue

        result = model.predict(source=frame, conf=args.conf, imgsz=args.imgsz, verbose=False)[0]

        detections: list[Detection] = []
        if result.boxes is not None:
            boxes = result.boxes
            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i].item())
                conf = float(boxes.conf[i].item())
                xyxy = boxes.xyxy[i].cpu().numpy().astype(int).tolist()
                class_name = model.names.get(cls_id, str(cls_id))
                detections.append(
                    Detection(
                        class_name=class_name,
                        confidence=conf,
                        bbox=(xyxy[0], xyxy[1], xyxy[2], xyxy[3]),
                    )
                )

        disease_dets = [d for d in detections if class_matches(d.class_name, disease_keywords)]
        mushroom_dets = [d for d in detections if class_matches(d.class_name, mushroom_keywords)]
        abnormal_dets = [d for d in detections if class_matches(d.class_name, abnormal_keywords)]

        # Draw bounding boxes with different colors by type.
        for det in detections:
            color = (0, 255, 255)
            if det in disease_dets:
                color = (0, 0, 255)
            elif det in abnormal_dets:
                color = (255, 0, 255)
            elif det in mushroom_dets:
                color = (0, 255, 0)
            draw_detection(frame, det, color)

        growth = growth_monitor.update(mushroom_dets)

        mqtt_publisher.publish_event(
            {
                "type": "frame_summary",
                "mushroomCount": growth["count"],
                "diseaseCount": len(disease_dets),
                "abnormalCount": len(abnormal_dets),
                "growthTrendPct": growth["trend_pct"],
                "averageArea": growth["average_area"],
                "detections": [
                    {
                        "class": d.class_name,
                        "confidence": round(d.confidence, 4),
                        "bbox": list(d.bbox),
                    }
                    for d in detections
                ],
            }
        )

        # Abnormal condition checks and alerts.
        if disease_dets:
            alert_manager.send_alert(
                level="danger",
                message="Mushroom disease indicator detected",
                frame=frame,
                metadata={
                    "diseaseCount": len(disease_dets),
                    "classes": [d.class_name for d in disease_dets],
                },
            )

        if abnormal_dets:
            alert_manager.send_alert(
                level="warning",
                message="Abnormal object detected in farm zone",
                frame=frame,
                metadata={"objects": [d.class_name for d in abnormal_dets]},
            )

        if growth["count"] < args.min_mushrooms:
            alert_manager.send_alert(
                level="warning",
                message="Mushroom count below expected threshold",
                frame=frame,
                metadata={"count": growth["count"], "minExpected": args.min_mushrooms},
            )

        # Periodic screenshot for timelapse/inspection.
        now = time.time()
        if now - last_periodic_shot > 60:
            last_periodic_shot = now
            shot_name = datetime.utcnow().strftime("periodic_%Y%m%d_%H%M%S.jpg")
            cv2.imwrite(str(output_dir / "screenshots" / shot_name), frame)

        summary = (
            f"Mushrooms: {growth['count']} | "
            f"AvgArea: {growth['average_area']:.1f} | "
            f"GrowthTrend: {growth['trend_pct']:.2f}% | "
            f"Disease: {len(disease_dets)}"
        )
        cv2.rectangle(frame, (10, 10), (920, 40), (20, 20, 20), -1)
        cv2.putText(frame, summary, (16, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (220, 220, 220), 2)

        if writer is not None:
            writer.write(frame)

        if args.show:
            cv2.imshow("Smart Mushroom Farm AI Monitor", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break

    cap.release()
    if writer is not None:
        writer.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run()
