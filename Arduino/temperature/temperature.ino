#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include<time.h>
#include<ArduinoJson.h>

#define ONE_WIRE_BUS 2

String apiKey = "SEIUG5FATSG7BES0";     //  Enter your Write API key from ThingSpeak
const char* ssid =  "KT_WLAN_79F6";     // Enter your WiFi Network's SSID
const char* pwd =  "0000006f62"; // Enter your WiFi Network's Password
const char* server = "api.thingspeak.com";
const char* ubuntuHost = "18.223.155.255";
const char* count = "45";
float temp;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
WiFiClient client;

void setup(void)
{
  Serial.begin(9600);
  Serial.println("Dallas Temperature IC Control Library Demo");
  sensors.begin();

  Serial.print("Connecting to: ");
  Serial.println(ssid);

  WiFi.begin(ssid,pwd);

  while(WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print("*");
  }
  Serial.println("");
  Serial.println("WiFi connected");


}

void loop(void)
{

      //send data to thingspeak
      sensors.requestTemperatures();
      temp = sensors.getTempCByIndex(0);
      SendDataToThingSpeak(temp);
      delay(1000);
      //send data to ubuntu server
      sensors.requestTemperatures();
      temp = sensors.getTempCByIndex(0);
      SendDataToWebServer(temp);
      delay(58000);
}

void SendDataToThingSpeak(float temp) {
  if (client.connect(server,80))
      {  
       String sendData = apiKey+"&field1="+String(temp)+"\r\n\r\n"; 
       
       //Serial.println(sendData);

       client.print("POST /update HTTP/1.1\n");
       client.print("Host: api.thingspeak.com\n");
       client.print("Connection: close\n");
       client.print("X-THINGSPEAKAPIKEY: "+apiKey+"\n");
       client.print("Content-Type: application/x-www-form-urlencoded\n");
       client.print("Content-Length: ");
       client.print(sendData.length());
       client.print("\n\n");
       client.print(sendData);

       Serial.print("Temperature: ");
       Serial.print(temp);
       Serial.println("deg C. Connecting to Thingspeak..");
    }
    client.stop();
}

void SendDataToWebServer(float temp) {
if(client.connect(ubuntuHost,80)) {
      Serial.println("connect to ubuntu");
      String jsonData = MakeJsonData(temp); 
       Serial.println(jsonData);
      client.print("POST /dump HTTP/1.1\r\n");
      client.print("Host: 18.223.155.255\r\n");
      client.print("User-Agent: Arduino\r\n");
      client.print("Content-Type: application/json\r\n");
      client.print("Content-Length: ");
      client.print(jsonData.length());
      client.print("\n\n");
      client.println(jsonData);
      client.print("\r\n\r\n");

       Serial.print("Temperature: ");
       Serial.print(temp);
       Serial.println("deg C. Connecting to web server..");
      }
      client.stop();
}

String MakeJsonData(float temp) {
  String jsonData ="";
  StaticJsonDocument<200> doc;
  JsonObject root = doc.to<JsonObject>();
  root["tempvalue"] = temp;
  serializeJson(root,jsonData);

  return jsonData;
}
