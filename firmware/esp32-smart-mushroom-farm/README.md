# ESP32 Smart Mushroom Farm Firmware

Arduino framework firmware for ESP32 with:
- DHT22 + analog sensors (CO2, water level, light)
- MQTT publish/subscribe with reconnect
- Local AUTO mode automation
- Relay/device control
- OTA update (ArduinoOTA)
- Non-blocking loop (millis scheduler)

## Required Libraries

Install in Arduino IDE Library Manager:
- PubSubClient
- ArduinoJson (v6)
- DHT sensor library
- ArduinoOTA (bundled with ESP32 core)

## Board Configuration

- Board: ESP32 Dev Module (or your ESP32 variant)
- Partition scheme: Default is fine for OTA test; choose OTA partition for production OTA.

## Pin Mapping

Edit in sketch to match your board wiring:
- DHT22: GPIO 4
- CO2 analog: GPIO 34
- Water level analog: GPIO 35
- Light analog: GPIO 32
- Relay main: GPIO 14
- LED control: GPIO 27
- Sprinkler: GPIO 26
- Fan: GPIO 25
- Dehumidifier: GPIO 33

## MQTT Topics

Base:
- `farm/{FARM_ID}/{DEVICE_ID}`

Publish:
- `{base}/sensors/data`
- `{base}/status`
- `{base}/alerts`
- `{base}/devices/state`

Subscribe:
- `{base}/control/set`
- `{base}/automation/set`
- `{base}/ota/set`

## JSON Payload Structures

### Sensor Data (publish)

```json
{
  "deviceId": "mushroom-esp32-01",
  "farmId": "mushroom-farm-a1",
  "ts": 123456,
  "autoMode": true,
  "sensors": {
    "temperatureC": 24.7,
    "humidityPct": 81.4,
    "co2Ppm": 940,
    "waterLevelPct": 66,
    "lightPct": 17,
    "dhtValid": true
  }
}
```

### Device Control (subscribe)

```json
{
  "mode": "MANUAL",
  "target": "sprinkler",
  "state": "ON"
}
```

- `mode`: `AUTO` or `MANUAL`
- `target`: `relayMain`, `led`, `sprinkler`, `fan`, `dehumidifier`
- `state`: `ON/OFF`, `true/false`, or `1/0`

### Automation Threshold Update (subscribe)

```json
{
  "minHumidity": 80,
  "maxTemperature": 26.5,
  "maxCo2": 1200,
  "minWaterLevel": 20
}
```

## AUTO Mode Logic

- If humidity < minHumidity -> sprinkler ON
- If temperature > maxTemperature -> fan ON
- If humidity > 92 -> dehumidifier ON
- If light < 20 -> LED ON
- Safety:
  - CO2 > maxCo2 -> force fan ON + alert
  - Water level < minWaterLevel -> force sprinkler OFF + alert

## Notes

- CO2 conversion in sketch is approximate for analog modules; calibrate with your specific sensor.
- Set WiFi and MQTT credentials before flashing.
- OTA host name uses `DEVICE_ID`.
