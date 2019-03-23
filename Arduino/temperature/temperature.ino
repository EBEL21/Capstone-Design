#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE_BUS D2
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
void setup(void)
{
  Serial.begin(115200);
  Serial.println("Dallas Temperature");
  sensors.begin();
}
void loop(void)
{
  sensors.requestTemperatures();
  Serial.print("Temperature for Device 1 is: ");
  Serial.print(sensors.getTempCByIndex(0));
}
