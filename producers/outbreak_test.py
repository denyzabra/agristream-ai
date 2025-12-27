#!/usr/bin/env python3
"""
AgriStream AI - Force Outbreak Conditions for Testing
Generates sensor readings that will trigger HIGH/CRITICAL alerts
"""

import json
import time
import random
from datetime import datetime, timezone
from confluent_kafka import Producer
from dotenv import load_dotenv
import os

load_dotenv()

conf = {
    'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVERS'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': os.getenv('CONFLUENT_API_KEY'),
    'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
}

producer = Producer(conf)

def delivery_report(err, msg):
    if err is not None:
        print(f'✗ Failed: {err}')
    else:
        print(f'✓ Delivered to partition {msg.partition()} @ offset {msg.offset()}')

print("🚨 AgriStream AI - Outbreak Condition Generator")
print("=" * 70)
print("Generating HIGH-RISK sensor readings to trigger Flink alerts...")
print("=" * 70)
print()

try:
    for i in range(15):
        # Force outbreak conditions
        risk_type = random.choice(['CRITICAL', 'HIGH', 'MODERATE'])

        if risk_type == 'CRITICAL':
            temp = round(random.uniform(35.5, 37.5), 2)
            humidity = round(random.uniform(32, 38), 2)
        elif risk_type == 'HIGH':
            temp = round(random.uniform(33.2, 35.0), 2)
            humidity = round(random.uniform(38, 42), 2)
        else:  # MODERATE
            temp = round(random.uniform(30.5, 33.0), 2)
            humidity = round(random.uniform(40, 44), 2)

        reading = {
            'sensor_id': f'TEST-{i+1:03d}',
            'farm_id': 'FARM-OUTBREAK-TEST',
            'location': 'Test Farm (Outbreak Simulation)',
            'crop_type': 'test_corn',
            'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'readings': {
                'temperature_celsius': temp,
                'humidity_percent': humidity,
                'soil_moisture_percent': round(random.uniform(45, 65), 2)
            },
            'metadata': {
                'sensor_status': 'active',
                'battery_level': 100
            }
        }

        producer.produce(
            topic='sensor-readings',
            key=reading['sensor_id'],
            value=json.dumps(reading),
            callback=delivery_report
        )

        print(f"📊 Sensor {i+1:02d} | {risk_type:8s} | "
              f"Temp: {temp:5.2f}°C | Humidity: {humidity:5.2f}% | "
              f"Conditions: temp>{temp}>30 AND humidity<{humidity}<45")

        time.sleep(1)

    producer.flush()

    print()
    print("=" * 70)
    print(f"✅ Sent 15 outbreak condition readings")
    print()
    print("🔍 NOW CHECK FLINK:")
    print("   Run: SELECT * FROM `outbreak-predictions` LIMIT 20;")
    print()
    print("   You should see predictions with risk scores appearing!")
    print("=" * 70)

except KeyboardInterrupt:
    print("\n\n🛑 Stopped")
finally:
    producer.flush()
