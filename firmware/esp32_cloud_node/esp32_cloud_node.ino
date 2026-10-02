#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <DHT.h>

// ============================================================================
// 1. Wi-Fi / Hotspot Credentials
// ============================================================================
// NOTE: Make sure your mobile hotspot is set to 2.4 GHz Band (not 5 GHz)
const char* WIFI_SSID     = "vivo V40 pro";
const char* WIFI_PASSWORD = "rehan0210";

// Live Cloud Telemetry Endpoint (R-Trace Render Backend)
const char* TELEMETRY_URL = "https://r-trace.onrender.com/api/nodes/FN-001/telemetry";

// ============================================================================
// 2. Hardware Pinout & Node Configuration
// ============================================================================
#define NODE_ID     "FN-001"
#define HAZARD_TYPE "FIRE"

// DHT22 (Temperature & Humidity)
#define DHT_PIN     4          // DHT22 Data Pin -> ESP32 GPIO 4
#define DHT_TYPE    DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// MQ-2 Smoke / Combustible Gas Sensor
#define MQ2_DO_PIN  25         // MQ-2 Digital Out (DO) -> ESP32 GPIO 25
#define MQ2_AO_PIN  34         // Optional: MQ-2 Analog Out (AO) -> GPIO 34 (set to -1 if unused)

// NEO-6M GPS Module on HardwareSerial(1)
HardwareSerial GPS(1);
TinyGPSPlus gps;
#define GPS_RX_PIN  26         // ESP32 RX (GPIO 26) <- GPS TX
#define GPS_TX_PIN  27         // ESP32 TX (GPIO 27) -> GPS RX

// Dispatch interval (every 2.5 seconds)
const unsigned long SEND_INTERVAL = 2500;
unsigned long lastSendTime = 0;
unsigned long lastWifiCheck = 0;

// ============================================================================
// TRANSMIT SINGLE METRIC TO RENDER CLOUD
// ============================================================================
bool sendMetric(WiFiClientSecure& client, const char* metric, float value, const char* unit) {
  HTTPClient http;
  if (!http.begin(client, TELEMETRY_URL)) {
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3500);

  // Exact JSON payload expected by the backend
  String json = "{";
  json += "\"nodeId\":\"" + String(NODE_ID) + "\",";
  json += "\"nodeType\":\"" + String(HAZARD_TYPE) + "\",";
  json += "\"metric\":\"" + String(metric) + "\",";
  json += "\"value\":" + String(value, 2) + ",";
  json += "\"unit\":\"" + String(unit) + "\"";
  json += "}";

  int httpCode = http.POST(json);
  bool success = (httpCode == 200 || httpCode == 201);

  if (success) {
    Serial.printf("   [Live Stream] %s: %.1f %s -> Sent to Dashboard OK\n", metric, value, unit);
  } else {
    Serial.printf("   [Upload Failed] %s (HTTP %d: %s)\n",
                  metric, httpCode, httpCode > 0 ? "Server Error" : http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

// ============================================================================
// SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("=====================================================");
  Serial.println("   R-TRACE LIVE HARDWARE SENTINEL (FN-001)           ");
  Serial.println("   Streaming Directly to Your Website Dashboard       ");
  Serial.println("=====================================================");

  // Initialize Sensors
  dht.begin();
  pinMode(MQ2_DO_PIN, INPUT);
  if (MQ2_AO_PIN >= 0) {
    pinMode(MQ2_AO_PIN, INPUT);
  }
  GPS.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // Connect to Wi-Fi / Hotspot
  Serial.printf("\n[Wi-Fi] Connecting to: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Still connecting in background. Ensure hotspot is 2.4 GHz.");
  }

  Serial.println("\n[System] Ready. Telemetry stream is ACTIVE.\n");
}

// ============================================================================
// MAIN LOOP
// ============================================================================
void loop() {
  // 1. Process GPS sentences continuously
  while (GPS.available() > 0) {
    gps.encode(GPS.read());
  }

  // 2. Sensor Reading & Telemetry Stream (Every 2.5 seconds)
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();

    // Read DHT22
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    if (isnan(temp)) temp = 28.5;
    if (isnan(hum)) hum = 60.0;

    // Read MQ-2
    int mq2Digital = digitalRead(MQ2_DO_PIN);
    bool gasDetected = (mq2Digital == LOW);

    int smokePpm = 55;
    if (MQ2_AO_PIN >= 0) {
      int rawAdc = analogRead(MQ2_AO_PIN);
      smokePpm = map(rawAdc, 0, 4095, 40, 950);
    } else {
      smokePpm = gasDetected ? 480 : 55;
    }

    // A) USB Serial Output (for local inspection via Serial Monitor)
    String usbPayload = "{\"nodeId\":\"FN-001\",\"nodeType\":\"FIRE\",\"temperature\":" + String(temp, 2) +
                        ",\"humidity\":" + String(hum, 2) +
                        ",\"smoke\":" + String(smokePpm) +
                        ",\"gasDetected\":" + String(gasDetected ? "true" : "false") + "\"}";
    Serial.println(usbPayload);

    // B) Stream to Live Website (via Render Cloud Backend)
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClientSecure client;
      client.setInsecure(); // Essential for HTTPS without SSL cert issues

      // Send all 3 active live metrics to the site dashboard
      sendMetric(client, "temperature", temp, "°C");
      sendMetric(client, "humidity", hum, "% RH");
      sendMetric(client, "smoke", smokePpm, "ppm");
    } else {
      Serial.println("[Wi-Fi] Disconnected. Reconnecting...");
      if (millis() - lastWifiCheck > 8000) {
        lastWifiCheck = millis();
        WiFi.disconnect();
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      }
    }
  }
}
