#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"

// ============================================================================
// 1. Mobile Hotspot Credentials
// ============================================================================
// NOTE: Make sure your phone's hotspot is set to "2.4 GHz Band" (not 5 GHz)
const char* WIFI_SSID     = "vivo V40 pro";
const char* WIFI_PASSWORD = "rehan0210";

// ============================================================================
// 2. AI-Thinker ESP32-CAM Pin Configuration
// ============================================================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Onboard Red Status LED (GPIO 33 - Active LOW)
#define STATUS_LED        33
// Onboard Flashlight LED (GPIO 4 - Active HIGH)
#define FLASH_LED          4

httpd_handle_t camera_httpd = NULL;

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

// ============================================================================
// 3. HTTP Stream & Snapshot Handlers
// ============================================================================
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if (res != ESP_OK) return res;

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("[Camera] Failed to capture frame buffer!");
      res = ESP_FAIL;
    } else {
      _jpg_buf_len = fb->len;
      _jpg_buf = fb->buf;
    }

    if (res == ESP_OK) {
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    }

    if (fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if (res != ESP_OK) {
      break;
    }
  }
  return res;
}

static esp_err_t capture_handler(httpd_req_t *req) {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  esp_err_t res = httpd_resp_send(req, (const char *)fb->buf, fb->len);
  esp_camera_fb_return(fb);
  return res;
}

static esp_err_t index_handler(httpd_req_t *req) {
  const char* html = 
    "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'>"
    "<title>R-TRACE CAM FEED</title>"
    "<style>"
    "body{margin:0;background:#0d1117;color:#fff;font-family:sans-serif;text-align:center;padding:16px;}"
    "h2{color:#ff5252;margin-bottom:8px;}"
    ".view{display:inline-block;border:2px solid #30363d;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.7);}"
    "img{width:100%;max-width:640px;height:auto;display:block;}"
    "</style></head><body>"
    "<h2>R-TRACE CAMERA SENTINEL</h2>"
    "<div class='view'><img src='/stream'></div>"
    "</body></html>";

  httpd_resp_set_type(req, "text/html");
  return httpd_resp_send(req, html, strlen(html));
}

void startHttpServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t index_uri   = { .uri = "/",        .method = HTTP_GET, .handler = index_handler,   .user_ctx = NULL };
  httpd_uri_t stream_uri  = { .uri = "/stream",  .method = HTTP_GET, .handler = stream_handler,  .user_ctx = NULL };
  httpd_uri_t capture_uri = { .uri = "/capture", .method = HTTP_GET, .handler = capture_handler, .user_ctx = NULL };

  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &index_uri);
    httpd_register_uri_handler(camera_httpd, &stream_uri);
    httpd_register_uri_handler(camera_httpd, &capture_uri);
  }
}

// ============================================================================
// 4. SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=====================================================");
  Serial.println("   R-TRACE ESP32-CAM HOTSPOT STREAMER                ");
  Serial.println("=====================================================");

  pinMode(STATUS_LED, OUTPUT);
  pinMode(FLASH_LED, OUTPUT);
  digitalWrite(STATUS_LED, HIGH); // OFF
  digitalWrite(FLASH_LED, LOW);   // OFF

  // Camera Settings
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA;  // 640x480 resolution
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA; // 320x240 for stable internal RAM
    config.jpeg_quality = 14;
    config.fb_count = 1;
  }

  // Initialize Camera Hardware
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[Camera ERROR] Init failed: 0x%x\n", err);
    while (true) {
      // Rapid SOS blink on error
      digitalWrite(STATUS_LED, LOW); delay(100);
      digitalWrite(STATUS_LED, HIGH); delay(100);
    }
  }
  Serial.println("[Camera] OV2640 Initialized Successfully!");

  // Connect to Phone Hotspot
  Serial.printf("\n[Wi-Fi] Connecting to Hotspot: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // CRITICAL: Disable Wi-Fi sleep for uninterrupted video streaming
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int blinkCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
    digitalWrite(STATUS_LED, (blinkCount++ % 2 == 0) ? LOW : HIGH);
  }

  // Turn LED OFF when connected
  digitalWrite(STATUS_LED, HIGH);

  Serial.println("\n[Wi-Fi] Connected to Hotspot Successfully!");
  Serial.print("[Wi-Fi] Camera IP Address: ");
  Serial.println(WiFi.localIP());

  // Start HTTP Video Stream Server
  startHttpServer();

  Serial.println("\n=====================================================");
  Serial.println("   CAMERA READY TO STREAM TO PYTHON OR BROWSER:      ");
  Serial.printf("   Stream URL : http://%s/stream\n", WiFi.localIP().toString().c_str());
  Serial.printf("   Web Player : http://%s/\n", WiFi.localIP().toString().c_str());
  Serial.println("=====================================================\n");
}

// ============================================================================
// 5. MAIN LOOP
// ============================================================================
unsigned long lastReconnectCheck = 0;

void loop() {
  // Hotspot Auto-Reconnect Watchdog
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastReconnectCheck > 5000) {
      lastReconnectCheck = millis();
      Serial.println("[Wi-Fi] Hotspot disconnected! Reconnecting...");
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    }
  }
  delay(1000);
}
