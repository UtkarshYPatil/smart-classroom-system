#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Configuration
const char* API_BASE_URL = "https://nonsaleable-clair-postpupillary.ngrok-free.dev";
const char* ATTENDANCE_ENDPOINT = "/api/attendance";
const char* WIFI_SSID = "Utkarsh's S24";
const char* WIFI_PASSWORD = "NiggerNetSolutions";

// RFID pins
#define SS_PIN 5
#define RST_PIN 22

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n==== ESP32 RFID Attendance System ====");
  
  // Initialize SPI and RFID
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("RFID Reader initialized");
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("\n==== System Ready ====");
  Serial.println("Waiting for RFID cards...\n");
}

void loop() {
  // Check for new card
  if (!mfrc522.PICC_IsNewCardPresent()) {
    delay(50);
    return;
  }
  
  if (!mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }
  
  // Process card
  processCard();
  
  // Prevent multiple reads
  delay(2000);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi Connection Failed");
  }
}

void processCard() {
  Serial.println("\n--- RFID Card Detected ---");
  
  // Get UID
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  Serial.print("Card UID: ");
  Serial.println(uid);
  
  // Get card type
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  Serial.print("Card Type: ");
  Serial.println(mfrc522.PICC_GetTypeName(piccType));
  
  // Send to backend with retry
  sendAttendanceWithRetry(uid, 3);
  
  // Halt card
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

void sendAttendanceWithRetry(String uid, int maxRetries) {
  for (int attempt = 1; attempt <= maxRetries; attempt++) {
    Serial.println("\n--- Sending Attendance to Backend ---");
    if (attempt > 1) {
      Serial.print("Retry attempt ");
      Serial.print(attempt);
      Serial.print(" of ");
      Serial.println(maxRetries);
    }
    
    // Check WiFi
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("✗ WiFi disconnected. Reconnecting...");
      connectWiFi();
      if (WiFi.status() != WL_CONNECTED) {
        Serial.println("✗ WiFi reconnection failed");
        continue;
      }
    }
    
    HTTPClient http;
    http.begin(String(API_BASE_URL) + String(ATTENDANCE_ENDPOINT));
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // 10 second timeout (increased from 5)
    http.setConnectTimeout(5000); // 5 second connection timeout
    
    String payload = "{\"uid\":\"" + uid + "\"}";
    Serial.print("URL: ");
    Serial.println(String(API_BASE_URL) + String(ATTENDANCE_ENDPOINT));
    Serial.print("Payload: ");
    Serial.println(payload);
    Serial.println("Sending POST request...");
    
    int httpResponseCode = http.POST(payload);
    
    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode > 0) {
      // Success!
      String response = http.getString();
      Serial.print("Response: ");
      Serial.println(response);
      
      if (httpResponseCode == 201) {
        Serial.println("✓ Attendance recorded successfully");
      } else if (httpResponseCode == 202) {
        Serial.println("⚠️ UID not registered - stored for admin registration");
      } else {
        Serial.println("⚠️ Unexpected response code");
      }
      
      http.end();
      Serial.println("Ready for next card...\n");
      return; // Success - exit retry loop
      
    } else {
      // Error
      Serial.print("✗ HTTP Error: ");
      Serial.println(httpResponseCode);
      
      if (httpResponseCode == -1) {
        Serial.println("Connection failed - possible causes:");
        Serial.println("  - Network congestion");
        Serial.println("  - Backend server not responding");
        Serial.println("  - Firewall blocking connection");
      }
      
      http.end();
      
      // If not last attempt, wait before retry
      if (attempt < maxRetries) {
        Serial.println("Waiting 2 seconds before retry...");
        delay(2000);
      }
    }
  }
  
  // All retries failed
  Serial.println("\n✗ Failed to send attendance after all retries");
  Serial.println("Please check:");
  Serial.println("  - Backend server is running");
  Serial.println("  - Network connection is stable");
  Serial.println("  - Firewall settings");
  Serial.println("Ready for next card...\n");
}
