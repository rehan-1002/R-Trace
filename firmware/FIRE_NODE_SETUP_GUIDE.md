# R-TRACE — Fire Sentinel Node (FN-001) Quick Setup Guide

This document contains everything you need to run the **Fire Sentinel Node (FN-001)** and the **Optical Camera Stream**.

---

## 1. Hardware Pinout Table (Main ESP32 Node)

Firmware File: [`firmware/esp32_cloud_node/esp32_cloud_node.ino`](file:///c:/Users/ASUS%20HN116WS/OneDrive/Desktop/R-Trace/firmware/esp32_cloud_node/esp32_cloud_node.ino)

| Component | Component Pin | ESP32 Board Pin | Notes |
| :--- | :--- | :--- | :--- |
| **SSD1306 OLED** | GND | GND | Power |
| | VCC | 5V / VIN | Power |
| | SCL | **GPIO 22** | I2C Clock |
| | SDA | **GPIO 21** | I2C Data |
| **DHT22 / AM2302** | VCC | **5V / VIN** | Power (needs 5V for signal strength) |
| | GND | GND | Ground |
| | DATA / OUT | **GPIO 4 (G4 / D4)** | Real Temperature & Humidity |
| **MQ-2 Smoke/Gas** | VCC | **5V / VIN** | Power (Internal heater coil requires 5V) |
| | GND | GND | Ground |
| | AO (Analog) | **GPIO 34 (G34)** | **REQUIRED** for real-time Smoke PPM |
| | DO (Digital) | **GPIO 25 (G25)** | Emergency digital comparator trip |
| **NEO-6M GPS** | VCC | 3.3V or 5V | Power |
| | GND | GND | Power |
| | TX | **GPIO 26** | ESP32 HardwareSerial RX |
| | RX | **GPIO 27** | ESP32 HardwareSerial TX |

* **Wi-Fi Hotspot**: `vivo V40 pro` | Password: `rehan0210` (Set to **2.4 GHz band**)
* **Live Cloud Target**: `https://r-trace.onrender.com/api/nodes/FN-001/telemetry`

---

## 2. Camera Module Options

### Option A: Phone Camera / Laptop Webcam (Instant / Zero-Hardware)
Use this if you don't have the ESP32-CAM-MB baseboard:
1. Open **"IP Webcam"** app on your Android phone (connected to your hotspot).
2. Tap **"Start Server"** -> note the URL (e.g. `http://192.168.43.1:8080`).
3. Run on your laptop:
   ```powershell
   python server/camera_server.py http://192.168.43.1:8080/video
   ```
   *(Or for laptop webcam: `python server/camera_server.py 0`)*

### Option B: Physical ESP32-CAM (Without Baseboard)
Firmware File: [`firmware/esp32_cam_node/esp32_cam_node.ino`](file:///c:/Users/ASUS%20HN116WS/OneDrive/Desktop/R-Trace/firmware/esp32_cam_node/esp32_cam_node.ino)

To flash without the baseboard, bridge `EN` to `GND` on your standard ESP32 board, then wire:
* Main ESP32 `5V` -> CAM `5V`
* Main ESP32 `GND` -> CAM `GND`
* Main ESP32 `TX` -> CAM `U0T`
* Main ESP32 `RX` -> CAM `U0R`
* On CAM: Connect `IO0` to `GND` (bootloader mode).
* Upload sketch from Arduino IDE (Board: **AI Thinker ESP32-CAM**).
* Once uploaded, remove `IO0` from `GND`. Power CAM with 5V/GND.

---

## 3. Launching Everything Tomorrow (Step-by-Step)

```powershell
# Terminal 1: Start R-Trace Web Dashboard
npm run dev

# Terminal 2: Start Local Backend (Optional / Offline SQLite)
npm run server

# Terminal 3: Start Computer Vision Camera Server
python server/camera_server.py 0
# (or with phone IP: python server/camera_server.py http://192.168.43.1:8080/video)
```

Open **`http://localhost:5173`** in your browser to view the live dashboard and real-time camera feed.
