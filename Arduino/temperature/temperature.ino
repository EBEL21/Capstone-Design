#include <ESP8266WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2

String apiKey = "SEIUG5FATSG7BES0";     //  Enter your Write API key from ThingSpeak
const char* ssid =  "KT_WLAN_79F6";     // Enter your WiFi Network's SSID
const char* pwd =  "0000006f62"; // Enter your WiFi Network's Password
const char* server = "api.thingspeak.com";
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
  
      sensors.requestTemperatures();
      temp = sensors.getTempCByIndex(0);
 
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

      Serial.println("Sending....");
  
      delay(60000);
}
