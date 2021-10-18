#include <DHT.h>
#include <DHT_U.h>
                       // библиотека для работы I²C
#include <Wire.h>
#include <OneWire.h>
#include <TroykaIMU.h>
#include <DallasTemperature.h>
                
Barometer barometer;// создаём объект для работы с барометром
DHT dht(8, DHT22);
OneWire ds(10);     // Создаем объект OneWire для шины 1-Wire, с помощью которого будет осуществляться работа с датчиком


#define PIN_RELAY_1 3               // Определяем пин, используемый для подключения реле

                                    // библиотека для работы с датчиком DS18B20

                                    // сигнальный провод датчика
#define ONE_WIRE_BUS 2
                                    // создаём объект для работы с библиотекой OneWire
OneWire oneWire(ONE_WIRE_BUS);
                                    // создадим объект для работы с библиотекой DallasTemperature
DallasTemperature sensor(&oneWire);
boolean d;
float temperature;
float altitude;
float pressure;

                                    
 
void setup()
{
                                    // открываем последовательный порт
  Serial.begin(9600);
  pinMode(PIN_RELAY_1, OUTPUT);     // Объявляем пин реле как выход
  digitalWrite(PIN_RELAY_1, LOW);   // Выключаем реле - посылаем высокий сигнал
  
                                    // выводим сообщение о начале инициализации
  Serial.println("Begin init...");
                                    // инициализация барометра
  barometer.begin();
                                    // выводим сообщение об удачной инициализации
  Serial.println("Initialization completed");
  dht.begin();
  sensor.begin();
                                    // устанавливаем разрешение датчика от 9 до 12 бит
  sensor.setResolution(12);
  digitalWrite(12, HIGH);
}
 
void loop()
{


    int temp, humid;                // температура и влажность с датчика один

if(millis() % 4000 < 2000 && d == 0){
    dht.read();
    temp = dht.readTemperature();
    humid = dht.readHumidity();
    sensor.requestTemperatures();
                                    // считываем данные из регистра датчика
    temperature = sensor.getTempCByIndex(0);
                                    // значения атмосферного давления в Паскалях
    pressure = barometer.readPressurePascals() / 100;
                                    // значения высоты над уровнем море
    altitude = barometer.readAltitude();
  d = 1;
}
if(millis() % 4000 > 2000){
  d = 0;
}
 Serial.print(" Температура 1 = ");Serial.print(temp);Serial.print(" Влага 1 = ");Serial.print(humid);Serial.println(";"); 
  
                                    // Выводим полученное значение температуры в монитор порта
  Serial.println(temperature);
 
                                    // Вывод данных в Serial порт
  Serial.print("p: ");
  Serial.print(pressure);
  Serial.print(" mbar \t");
  Serial.print("h: ");
  Serial.print(altitude);
  Serial.print(" m \t");
  Serial.print("t: ");
  Serial.print(temperature);
  Serial.println(" C");

  
if (temperature <= 27)
{
  digitalWrite(PIN_RELAY_1, HIGH); // Включаем реле - посылаем низкий уровень сигнала
}
if (temperature >= 30)
{
  digitalWrite(PIN_RELAY_1, LOW);  // Включаем реле - посылаем низкий уровень сигнала
}
  delay(100);
}
