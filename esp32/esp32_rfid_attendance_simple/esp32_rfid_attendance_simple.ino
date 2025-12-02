#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Configuration
const char* API_BASE_URL = "http://10.209.64.71:3000";
const char* ATTENDANCE_ENDPOINT = "/api/attendance";
const char* WIFI_SSID = "Utkarsh's S24";        // Change this
const char* WIFI_PASSWORD = "NiggerNetSolutions";    // Change this

// RFID pins
#define SS_PIN 5
#define RST_PIN 22

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  
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
  
  // Prevent multiple reads of same card
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
    Serial.println("Please check your WiFi credentials and try again");
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
  
  // Send to backend
  sendAttendance(uid);
  
  // Halt card
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

void sendAttendance(String uid) {
  Serial.println("\n--- Sending Attendance to Backend ---");
  Serial.print("URL: ");
  Serial.print(API_BASE_URL);
  Serial.println(ATTENDANCE_ENDPOINT);
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected. Reconnecting...");
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("✗ Failed to reconnect. Skipping attendance.");
      return;
    }
  }
  
  HTTPClient http;
  http.begin(String(API_BASE_URL) + String(ATTENDANCE_ENDPOINT));
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout
  
  String payload = "{\"uid\":\"" + uid + "\"}";
  Serial.print("Payload: ");
  Serial.println(payload);
  Serial.println("Sending POST request...");
  
  // Add small delay before sending
  delay(100);
  
  int httpResponseCode = http.POST(payload);
  
  Serial.print("HTTP Response Code: ");
  Serial.println(httpResponseCode);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
    
    if (httpResponseCode == 201) {
      Serial.println("✓ Attendance recorded successfully");
    } else if (httpResponseCode == 202) {
      Serial.println("⚠️ UID not registered - stored for admin registration");
      Serial.println("Please register this student in the admin panel");
    } else if (httpResponseCode == 404) {
      Serial.println("ERROR: Student not found - UID not registered");
      Serial.println("✗ Failed to record attendance");
    } else {
      Serial.println("⚠️ Unexpected response code");
    }
  } else {
    Serial.print("✗ HTTP Error: ");
    Serial.println(httpResponseCode);
    Serial.println("Please check:");
    Serial.println("  - Backend server is running");
    Serial.println("  - API_BASE_URL is correct");
    Serial.println("  - Network connection is stable");
  }
  
  http.end();
  
  // Add delay to prevent rapid requests
  delay(100);
  
  Serial.println("Ready for next card...\n");
}
