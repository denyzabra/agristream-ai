#!/usr/bin/env python3
"""
AgriStream AI - Farm Sensor Simulator
Generates realistic IoT sensor data for agricultural monitoring
"""

import json
import time
import random
from datetime import datetime, timezone
from confluent_kafka import Producer
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Confluent Cloud configuration
conf = {
    'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVERS'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': os.getenv('CONFLUENT_API_KEY'),
    'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
}

# Initialize Kafka producer
producer = Producer(conf)

# Farm configurations - simulating 3 different farms
FARMS = [
    {
        'farm_id': 'FARM-001',
        'location': 'Iowa',
        'crop_type': 'corn',
        'sensors': ['SENSOR-001', 'SENSOR-002']
    },
    {
        'farm_id': 'FARM-002',
        'location': 'California',
        'crop_type': 'almonds',
        'sensors': ['SENSOR-003', 'SENSOR-004']
    },
    {
        'farm_id': 'FARM-003',
        'location': 'Nebraska',
        'crop_type': 'soybeans',
        'sensors': ['SENSOR-005', 'SENSOR-006']
    }
]


def delivery_report(err, msg):
    """Callback for message delivery reports"""
    if err is not None:
        print(f'❌ Message delivery failed: {err}')
    else:
        print(f'✓ Message delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}')


def generate_sensor_reading(farm, sensor_id):
    """Generate realistic sensor data for agricultural monitoring"""

    # Base values with realistic variations
    # Temperature: 15-35°C with daily cycles
    hour = datetime.now().hour
    temp_base = 25 + 8 * (0.5 - abs((hour - 14) / 12))  # Peak at 2 PM
    temperature = round(temp_base + random.uniform(-2, 2), 2)

    # Humidity: 40-90% (inversely correlated with temperature)
    humidity = round(75 - (temperature - 25) * 1.5 + random.uniform(-5, 5), 2)
    humidity = max(40, min(90, humidity))  # Clamp between 40-90%

    # Soil moisture: 20-80% with gradual depletion
    soil_moisture = round(random.uniform(45, 75), 2)

    # Construct sensor reading
    reading = {
        'sensor_id': sensor_id,
        'farm_id': farm['farm_id'],
        'location': farm['location'],
        'crop_type': farm['crop_type'],
        'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'readings': {
            'temperature_celsius': temperature,
            'humidity_percent': humidity,
            'soil_moisture_percent': soil_moisture
        },
        'metadata': {
            'sensor_status': 'active',
            'battery_level': random.randint(75, 100)
        }
    }

    return reading


def main():
    """Main function to simulate sensor data stream"""

    print("🌾 AgriStream AI - Sensor Simulator")
    print("=" * 50)
    print(f"📡 Connected to: {conf['bootstrap.servers']}")
    print(f"📤 Publishing to topic: sensor-readings")
    print("=" * 50)
    print("\nGenerating sensor data... (Press Ctrl+C to stop)\n")

    try:
        message_count = 0

        while True:
            # Generate readings from all farms
            for farm in FARMS:
                for sensor_id in farm['sensors']:
                    # Generate sensor reading
                    reading = generate_sensor_reading(farm, sensor_id)

                    # Convert to JSON
                    message = json.dumps(reading)

                    # Publish to Kafka
                    producer.produce(
                        topic='sensor-readings',
                        key=sensor_id,
                        value=message,
                        callback=delivery_report
                    )

                    message_count += 1

                    # Print summary
                    print(f"📊 {sensor_id} | {farm['farm_id']} | "
                          f"Temp: {reading['readings']['temperature_celsius']}°C | "
                          f"Humidity: {reading['readings']['humidity_percent']}% | "
                          f"Soil: {reading['readings']['soil_moisture_percent']}%")

            # Flush messages
            producer.flush()

            print(f"\n✅ Batch complete: {message_count} total messages sent\n")

            # Wait before next batch (simulate readings every 30 seconds)
            time.sleep(30)

    except KeyboardInterrupt:
        print("\n\n🛑 Stopping sensor simulator...")
        print(f"📈 Total messages sent: {message_count}")
    finally:
        producer.flush()
        print("✅ Producer closed successfully")


if __name__ == '__main__':
    main()
