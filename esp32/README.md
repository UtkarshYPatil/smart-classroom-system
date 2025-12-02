# ESP32 RFID Attendance System

## Hardware Requirements

- ESP32 Development Board
- MFRC522 RFID Reader Module
- RFID Tags/Cards
- Jumper Wires
- USB Cable for programming

## Pin Connections

Connect the MFRC522 RFID reader to ESP32 as follows:

| MFRC522 Pin | ESP32 GPIO |
|-------------|------------|
| SDA (SS)    | GPIO 21    |
| SCK         | GPIO 18    |
| MOSI        | GPIO 23    |
| MISO        | GPIO 19    |
| RST         | GPIO 22    |
| 3.3V        | 3.3V       |
| GND         | GND        |

## Software Requirements

- Arduino IDE (1.8.x or later) or PlatformIO
- ESP32 Board Support Package
- Required Libraries:
  - MFRC522 (by GithubCommunity)
  - WiFi (built-in)
  - HTTPClient (built-in)

## Installation Steps

### Arduino IDE Setup

1. Install Arduino IDE from https://www.arduino.cc/en/software
2. Add ESP32 board support:
   - Go to File > Preferences
   - Add to "Additional Board Manager URLs": 
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to Tools > Board > Boards Manager
   - Search for "ESP32" and install "esp32 by Espressif Systems"

3. Install MFRC522 library:
   - Go to Sketch > Include Library > Manage Libraries
   - Search for "MFRC522" and install "MFRC522 by GithubCommunity"

### Configuration

1. Open `esp32_rfid_attendance.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Update backend API URL:
   ```cpp
   const char* serverUrl = "YOUR_BACKEND_API_URL/api/attendance";
   ```

### Upload to ESP32

1. Connect ESP32 to computer via USB
2. Select board: Tools > Board > ESP32 Dev Module
3. Select correct COM port: Tools > Port
4. Click Upload button
5. Open Serial Monitor (115200 baud) to view debug output

## Usage

1. Power on the ESP32 device
2. Wait for WiFi connection (LED indicator or Serial Monitor)
3. Hold RFID card near the reader
4. System will automatically log attendance to backend
5. Check Serial Monitor for success/failure messages

## Troubleshooting

### WiFi Connection Issues
- Verify SSID and password are correct
- Check WiFi signal strength
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)

### RFID Reader Not Detecting Cards
- Verify pin connections match the configuration
- Check power supply (3.3V, not 5V)
- Test with different RFID cards
- Ensure SPI communication is initialized correctly

### HTTP Request Failures
- Verify backend API URL is correct and accessible
- Check network connectivity
- Ensure backend server is running
- Review Serial Monitor for error codes

## Project Structure

```
esp32/
├── esp32_rfid_attendance.ino    # Main Arduino sketch
├── config.h                      # Configuration file (WiFi, API)
└── README.md                     # This file
```

## Serial Monitor Output

Expected output:
```
Connecting to WiFi...
WiFi connected
IP address: 192.168.1.100
RFID Reader initialized
Waiting for card...
Card detected!
UID: A1:B2:C3:D4
Sending attendance...
Attendance logged successfully
```
