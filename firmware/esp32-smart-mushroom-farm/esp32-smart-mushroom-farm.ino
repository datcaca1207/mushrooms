#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ArduinoOTA.h>

// ==========================
// Smart Mushroom Farm ESP32
// Arduino Framework firmware
// ==========================

// ---------- WiFi ----------
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ---------- MQTT ----------
const char* MQTT_HOST = "192.168.1.100";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_USER = "";
const char* MQTT_PASSWORD = "";
const char* DEVICE_ID = "mushroom-esp32-01";
const char* FARM_ID = "mushroom-farm-a1";

// ---------- Topics ----------
String TOPIC_BASE;
String TOPIC_SENSOR_PUB;
String TOPIC_STATUS_PUB;
String TOPIC_ALERT_PUB;
String TOPIC_DEVICE_STATE_PUB;
String TOPIC_CONTROL_SUB;
String TOPIC_AUTOMATION_SUB;
String TOPIC_OTA_SUB;

// ---------- Pin mapping ----------
// Update pins to match your hardware wiring.
constexpr uint8_t PIN_DHT22 = 4;
constexpr uint8_t PIN_CO2_ANALOG = 34;
constexpr uint8_t PIN_WATER_ANALOG = 35;
constexpr uint8_t PIN_LIGHT_ANALOG = 32;

constexpr uint8_t PIN_RELAY_MAIN = 14;
constexpr uint8_t PIN_LED = 27;
constexpr uint8_t PIN_SPRINKLER = 26;
constexpr uint8_t PIN_FAN = 25;
constexpr uint8_t PIN_DEHUMIDIFIER = 33;

constexpr bool RELAY_ACTIVE_LOW = true;

// ---------- Sensor definitions ----------
#define DHT_TYPE DHT22
DHT dht(PIN_DHT22, DHT_TYPE);

struct SensorReadings {
  float temperatureC = 0.0f;
  float humidityPct = 0.0f;
  float co2Ppm = 0.0f;
  float waterLevelPct = 0.0f;
  float lightPct = 0.0f;
  bool valid = false;
};

SensorReadings latest;

struct ThresholdConfig {
  float minHumidity = 80.0f;
  float maxTemperature = 26.5f;
  float maxCo2 = 1200.0f;
  float minWaterLevel = 20.0f;
};

ThresholdConfig thresholds;

// ---------- Device state ----------
struct DeviceState {
  bool relayMain = false;
  bool led = false;
  bool sprinkler = false;
  bool fan = false;
  bool dehumidifier = false;
};

DeviceState devices;
bool autoMode = true;

// ---------- Loop timing ----------
unsigned long lastSensorReadMs = 0;
unsigned long lastSensorPublishMs = 0;
unsigned long lastStatusPublishMs = 0;
unsigned long lastAutomationMs = 0;
unsigned long lastReconnectAttemptMs = 0;

constexpr unsigned long SENSOR_READ_INTERVAL_MS = 2500;
constexpr unsigned long SENSOR_PUBLISH_INTERVAL_MS = 5000;
constexpr unsigned long STATUS_PUBLISH_INTERVAL_MS = 8000;
constexpr unsigned long AUTOMATION_INTERVAL_MS = 2000;
constexpr unsigned long RECONNECT_INTERVAL_MS = 5000;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void buildTopics() {
  TOPIC_BASE = String("farm/") + FARM_ID + "/" + DEVICE_ID;
  TOPIC_SENSOR_PUB = TOPIC_BASE + "/sensors/data";
  TOPIC_STATUS_PUB = TOPIC_BASE + "/status";
  TOPIC_ALERT_PUB = TOPIC_BASE + "/alerts";
  TOPIC_DEVICE_STATE_PUB = TOPIC_BASE + "/devices/state";

  TOPIC_CONTROL_SUB = TOPIC_BASE + "/control/set";
  TOPIC_AUTOMATION_SUB = TOPIC_BASE + "/automation/set";
  TOPIC_OTA_SUB = TOPIC_BASE + "/ota/set";
}

void writePin(uint8_t pin, bool on) {
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(pin, on ? LOW : HIGH);
  } else {
    digitalWrite(pin, on ? HIGH : LOW);
  }
}

void applyOutputs() {
  writePin(PIN_RELAY_MAIN, devices.relayMain);
  writePin(PIN_LED, devices.led);
  writePin(PIN_SPRINKLER, devices.sprinkler);
  writePin(PIN_FAN, devices.fan);
  writePin(PIN_DEHUMIDIFIER, devices.dehumidifier);
}

void setDeviceByName(const String& target, bool on) {
  if (target == "relay" || target == "relayMain") {
    devices.relayMain = on;
  } else if (target == "led") {
    devices.led = on;
  } else if (target == "sprinkler") {
    devices.sprinkler = on;
  } else if (target == "fan") {
    devices.fan = on;
  } else if (target == "dehumidifier") {
    devices.dehumidifier = on;
  }
  applyOutputs();
}

float analogToPercent(int raw) {
  float pct = (raw / 4095.0f) * 100.0f;
  if (pct < 0.0f) return 0.0f;
  if (pct > 100.0f) return 100.0f;
  return pct;
}

float analogToCo2Ppm(int raw) {
  // Approximate conversion for analog CO2 module; calibrate for your sensor.
  return 400.0f + ((raw / 4095.0f) * 4600.0f);
}

void readAllSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  int co2Raw = analogRead(PIN_CO2_ANALOG);
  int waterRaw = analogRead(PIN_WATER_ANALOG);
  int lightRaw = analogRead(PIN_LIGHT_ANALOG);

  latest.valid = !(isnan(t) || isnan(h));
  if (latest.valid) {
    latest.temperatureC = t;
    latest.humidityPct = h;
  }

  latest.co2Ppm = analogToCo2Ppm(co2Raw);
  latest.waterLevelPct = analogToPercent(waterRaw);
  latest.lightPct = analogToPercent(lightRaw);
}

void publishJson(const String& topic, const JsonDocument& doc, bool retained = false) {
  char payload[768];
  size_t n = serializeJson(doc, payload, sizeof(payload));
  mqttClient.publish(topic.c_str(), payload, n, retained);
}

void publishSensorData() {
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["farmId"] = FARM_ID;
  doc["ts"] = millis();
  doc["autoMode"] = autoMode;

  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temperatureC"] = latest.temperatureC;
  sensors["humidityPct"] = latest.humidityPct;
  sensors["co2Ppm"] = latest.co2Ppm;
  sensors["waterLevelPct"] = latest.waterLevelPct;
  sensors["lightPct"] = latest.lightPct;
  sensors["dhtValid"] = latest.valid;

  publishJson(TOPIC_SENSOR_PUB, doc);
}

void publishStatus() {
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["wifiRssi"] = WiFi.RSSI();
  doc["ip"] = WiFi.localIP().toString();
  doc["mqttConnected"] = mqttClient.connected();
  doc["autoMode"] = autoMode;

  JsonObject d = doc.createNestedObject("devices");
  d["relayMain"] = devices.relayMain;
  d["led"] = devices.led;
  d["sprinkler"] = devices.sprinkler;
  d["fan"] = devices.fan;
  d["dehumidifier"] = devices.dehumidifier;

  publishJson(TOPIC_STATUS_PUB, doc, true);
  publishJson(TOPIC_DEVICE_STATE_PUB, doc);
}

void publishAlert(const char* level, const char* message) {
  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["level"] = level;
  doc["message"] = message;
  doc["ts"] = millis();
  publishJson(TOPIC_ALERT_PUB, doc);
}

void runAutomation() {
  if (!autoMode || !latest.valid) return;

  // Humidity control: IF humidity < threshold THEN sprinkler ON
  bool humidityLow = latest.humidityPct < thresholds.minHumidity;
  devices.sprinkler = humidityLow;

  // Temperature control: fan ON when temperature high
  bool tempHigh = latest.temperatureC > thresholds.maxTemperature;
  devices.fan = tempHigh;

  // Dehumidifier for very high humidity
  devices.dehumidifier = latest.humidityPct > 92.0f;

  // Lighting: keep on when dark
  devices.led = latest.lightPct < 20.0f;

  // Safety protection
  if (latest.co2Ppm > thresholds.maxCo2) {
    devices.fan = true;
    publishAlert("danger", "CO2 above threshold, forcing fan ON");
  }

  if (latest.waterLevelPct < thresholds.minWaterLevel) {
    devices.sprinkler = false;
    publishAlert("warning", "Low water level, sprinkler locked OFF");
  }

  // Main relay follows whether any actuator is active.
  devices.relayMain = devices.sprinkler || devices.fan || devices.dehumidifier || devices.led;

  applyOutputs();
}

void handleControlMessage(JsonDocument& doc) {
  if (doc["mode"].is<const char*>()) {
    String mode = doc["mode"].as<String>();
    mode.toUpperCase();
    autoMode = (mode == "AUTO");
  }

  if (doc["target"].is<const char*>()) {
    String target = doc["target"].as<String>();
    bool on = false;

    if (doc["state"].is<bool>()) {
      on = doc["state"].as<bool>();
    } else if (doc["state"].is<const char*>()) {
      String state = doc["state"].as<String>();
      state.toUpperCase();
      on = (state == "ON" || state == "1" || state == "TRUE");
    }

    if (!autoMode) {
      setDeviceByName(target, on);
    }
  }

  publishStatus();
}

void handleAutomationMessage(JsonDocument& doc) {
  if (doc["minHumidity"].is<float>() || doc["minHumidity"].is<int>()) {
    thresholds.minHumidity = doc["minHumidity"].as<float>();
  }
  if (doc["maxTemperature"].is<float>() || doc["maxTemperature"].is<int>()) {
    thresholds.maxTemperature = doc["maxTemperature"].as<float>();
  }
  if (doc["maxCo2"].is<float>() || doc["maxCo2"].is<int>()) {
    thresholds.maxCo2 = doc["maxCo2"].as<float>();
  }
  if (doc["minWaterLevel"].is<float>() || doc["minWaterLevel"].is<int>()) {
    thresholds.minWaterLevel = doc["minWaterLevel"].as<float>();
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    publishAlert("warning", "Invalid MQTT JSON payload");
    return;
  }

  String t = String(topic);

  if (t == TOPIC_CONTROL_SUB) {
    handleControlMessage(doc);
  } else if (t == TOPIC_AUTOMATION_SUB) {
    handleAutomationMessage(doc);
  } else if (t == TOPIC_OTA_SUB) {
    // Optional OTA trigger message.
    publishAlert("info", "OTA command received");
  }
}

void connectWiFiIfNeeded() {
  if (WiFi.status() == WL_CONNECTED) return;

  unsigned long now = millis();
  if (now - lastReconnectAttemptMs < RECONNECT_INTERVAL_MS) return;
  lastReconnectAttemptMs = now;

  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void connectMqttIfNeeded() {
  if (WiFi.status() != WL_CONNECTED || mqttClient.connected()) return;

  unsigned long now = millis();
  if (now - lastReconnectAttemptMs < RECONNECT_INTERVAL_MS) return;
  lastReconnectAttemptMs = now;

  bool ok;
  if (strlen(MQTT_USER) > 0) {
    ok = mqttClient.connect(DEVICE_ID, MQTT_USER, MQTT_PASSWORD, TOPIC_STATUS_PUB.c_str(), 1, true, "offline");
  } else {
    ok = mqttClient.connect(DEVICE_ID, TOPIC_STATUS_PUB.c_str(), 1, true, "offline");
  }

  if (ok) {
    mqttClient.subscribe(TOPIC_CONTROL_SUB.c_str());
    mqttClient.subscribe(TOPIC_AUTOMATION_SUB.c_str());
    mqttClient.subscribe(TOPIC_OTA_SUB.c_str());

    StaticJsonDocument<128> onlineDoc;
    onlineDoc["deviceId"] = DEVICE_ID;
    onlineDoc["status"] = "online";
    publishJson(TOPIC_STATUS_PUB, onlineDoc, true);
  }
}

void setupPins() {
  pinMode(PIN_RELAY_MAIN, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_SPRINKLER, OUTPUT);
  pinMode(PIN_FAN, OUTPUT);
  pinMode(PIN_DEHUMIDIFIER, OUTPUT);

  applyOutputs();
}

void setupOta() {
  ArduinoOTA.setHostname(DEVICE_ID);

  ArduinoOTA.onStart([]() {
    publishAlert("info", "OTA start");
  });

  ArduinoOTA.onEnd([]() {
    publishAlert("info", "OTA end");
  });

  ArduinoOTA.onError([](ota_error_t error) {
    (void)error;
    publishAlert("danger", "OTA error");
  });

  ArduinoOTA.begin();
}

void setup() {
  Serial.begin(115200);
  delay(200);

  buildTopics();
  setupPins();

  dht.begin();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setBufferSize(1024);
  mqttClient.setCallback(mqttCallback);

  setupOta();
}

void loop() {
  connectWiFiIfNeeded();
  connectMqttIfNeeded();

  if (mqttClient.connected()) {
    mqttClient.loop();
  }

  ArduinoOTA.handle();

  unsigned long now = millis();

  if (now - lastSensorReadMs >= SENSOR_READ_INTERVAL_MS) {
    lastSensorReadMs = now;
    readAllSensors();
  }

  if (now - lastAutomationMs >= AUTOMATION_INTERVAL_MS) {
    lastAutomationMs = now;
    runAutomation();
  }

  if (mqttClient.connected() && now - lastSensorPublishMs >= SENSOR_PUBLISH_INTERVAL_MS) {
    lastSensorPublishMs = now;
    publishSensorData();
  }

  if (mqttClient.connected() && now - lastStatusPublishMs >= STATUS_PUBLISH_INTERVAL_MS) {
    lastStatusPublishMs = now;
    publishStatus();
  }
}
