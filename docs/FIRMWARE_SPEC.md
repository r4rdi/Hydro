# FIRMWARE & HARDWARE CONTRACT SPECIFICATION

## 1. Pinout ESP32 Baseline
- pH Sensor: GPIO 34 (Analog)
- TDS / EC Sensor: GPIO 35 (Analog)
- Water Temp (DS18B20): GPIO 4 (OneWire)
- DHT22 (Air Temp & Humidity): GPIO 16 (Digital)
- Light Sensor (BH1750 / LDR): GPIO 32 (I2C / Analog)
- Relay Main Pump: GPIO 25 (Digital Output)
- Relay Fan: GPIO 26 (Digital Output)

## 2. Telemetry Variable Mapping
| Firmware Var | DB Column | Unit | Valid Range |
|---|---|---|---|
| phValue | ph | pH | 0.0 - 14.0 |
| waterTemp | water_temperature | °C | 0.0 - 50.0 |
| tdsValue | tds | ppm | 0 - 2000 |
| ecValue | ec | mS/cm | 0.0 - 5.0 |
| waterLevel | water_level | % | 0 - 100 |
| airTemp | air_temperature | °C | 0.0 - 60.0 |
| airHumidity | air_humidity | % | 0 - 100 |
| lightLux | light_intensity | lux | 0 - 100000 |