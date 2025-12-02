/**
 * Smart Classroom ESP32 - Production Configuration
 * 
 * This file contains the configuration for connecting ESP32 to your deployed backend
 * 
 * IMPORTANT: Update the values below with your actual deployment URLs and WiFi credentials
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// Backend API Configuration
// Replace with your deployed Render URL
const char* serverUrl = "https://smart-classroom-api-xxxx.onrender.com/api/attendance";

// Health check URL (to test connection)
const char* healthCheckUrl = "https://smart-classroom-api-xxxx.onrender.com/api/health";

// ============================================
// RFID READER CONFIGURATION
// ============================================

#define SS_PIN 5
#define RST_PIN 22

MFRC522 mfrc522(SS_PIN, RST_PIN);

// ============================================
// LED INDICATORS (Optional)
// ============================================

#define LED_SUCCESS 2   // Green LED - Successful scan
#define LED_ERROR 4     // Red LED - Error
#define LED_WIFI 15     // Blue LED - WiFi status

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=================================");
  Serial.println("Smart Classroom RFID System");
  Serial.println("=================================\n");
  
  // Initialize LED pins
  pinMode(LED_SUCCESS, OUTPUT);
  pinMode(LED_ERROR, OUTPUT);
  pinMode(LED_WIFI, OUTPUT);
  
  // Initialize RFID reader
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("✓ RFID Reader initialized");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Test backend connection
  testBackendConnection();
  
  Serial.println("\n✓ System ready!");
  Serial.println("Waiting for RFID cards...\n");
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi disconnected! Reconnecting...");
    digitalWrite(LED_WIFI, LOW);
    connectToWiFi();
  }
  
  // Check for new RFID card
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }
  
  // Read UID
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  Serial.println("\n📱 Card detected!");
  Serial.println("UID: " + uid);
  
  // Send to backend
  sendAttendance(uid);
  
  // Halt PICC
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  // Delay to prevent multiple reads
  delay(2000);
}

// ============================================
// WIFI CONNECTION
// ============================================

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  digitalWrite(LED_WIFI, LOW);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED_WIFI, HIGH);
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    digitalWrite(LED_ERROR, HIGH);
    Serial.println("\n✗ WiFi connection failed!");
    Serial.println("Please check your WiFi credentials");
    delay(5000);
    digitalWrite(LED_ERROR, LOW);
  }
}

// ============================================
// BACKEND CONNECTION TEST
// ============================================

void testBackendConnection() {
  Serial.println("\nTesting backend connection...");
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ Cannot test - WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.begin(healthCheckUrl);
  http.setTimeout(10000); // 10 second timeout
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("✓ Backend is reachable!");
    Serial.println("Response: " + response);
  } else if (httpCode > 0) {
    Serial.println("⚠ Backend responded with code: " + String(httpCode));
  } else {
    Serial.println("✗ Cannot reach backend");
    Serial.println("Error: " + http.errorToString(httpCode));
    Serial.println("\nPossible issues:");
    Serial.println("1. Backend URL is incorrect");
    Serial.println("2. Backend is sleeping (Render free tier)");
    Serial.println("3. No internet connection");
  }
  
  http.end();
}

// ============================================
// SEND ATTENDANCE TO BACKEND
// ============================================

void sendAttendance(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ Cannot send - WiFi not connected");
    blinkLED(LED_ERROR, 3);
    return;
  }
  
  Serial.println("📤 Sending to backend...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout (Render may need time to wake up)
  
  // Create JSON payload
  String jsonPayload = "{\"uid\":\"" + uid + "\"}";
  
  // Send POST request
  int httpCode = http.POST(jsonPayload);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Response code: " + String(httpCode));
    Serial.println("Response: " + response);
    
    if (httpCode == 201) {
      // Attendance logged successfully
      Serial.println("✓ Attendance logged!");
      blinkLED(LED_SUCCESS, 2);
    } else if (httpCode == 202) {
      // Student not registered - added to pending queue
      Serial.println("⚠ Student not registered - added to pending queue");
      blinkLED(LED_ERROR, 1);
    } else {
      // Other response
      Serial.println("⚠ Unexpected response");
      blinkLED(LED_ERROR, 2);
    }
  } else {
    Serial.println("✗ Request failed");
    Serial.println("Error: " + http.errorToString(httpCode));
    
    if (httpCode == -1) {
      Serial.println("Possible causes:");
      Serial.println("1. Backend is sleeping (wait 30 seconds and try again)");
      Serial.println("2. No internet connection");
      Serial.println("3. Backend URL is incorrect");
    }
    
    blinkLED(LED_ERROR, 3);
  }
  
  http.end();
}

// ============================================
// LED HELPER FUNCTION
// ============================================

void blinkLED(int pin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(200);
    digitalWrite(pin, LOW);
    delay(200);
  }
}

// ============================================
// ADDITIONAL HELPER FUNCTIONS
// ============================================

// Print system status
void printStatus() {
  Serial.println("\n=== System Status ===");
  Serial.print("WiFi: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  }
  
  Serial.print("Backend URL: ");
  Serial.println(serverUrl);
  Serial.println("====================\n");
}

// You can call printStatus() from Serial Monitor by sending 's'
// Add this to loop() if you want:
/*
if (Serial.available() > 0) {
  char cmd = Serial.read();
  if (cmd == 's' || cmd == 'S') {
    printStatus();
  } else if (cmd == 't' || cmd == 'T') {
    testBackendConnection();
  }
}
*/
