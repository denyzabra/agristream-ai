#!/usr/bin/env python3
"""
Quick test script to verify sensor simulator can publish to Kafka
"""

import json
import sys
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

print("Testing Kafka connection...")
print(f"Bootstrap servers: {conf['bootstrap.servers']}")
print(f"API Key: {conf['sasl.username'][:8]}...")
print()

# Initialize Kafka producer
try:
    producer = Producer(conf)
    print("✓ Producer initialized successfully")
except Exception as e:
    print(f"✗ Failed to initialize producer: {e}")
    sys.exit(1)


def delivery_report(err, msg):
    """Callback for message delivery reports"""
    if err is not None:
        print(f'✗ Message delivery failed: {err}')
    else:
        print(f'✓ Message delivered to {msg.topic()} [partition {msg.partition()}] @ offset {msg.offset()}')


# Test message
test_reading = {
    'sensor_id': 'TEST-SENSOR-001',
    'farm_id': 'TEST-FARM-001',
    'location': 'Test Lab',
    'crop_type': 'test',
    'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    'readings': {
        'temperature_celsius': 25.5,
        'humidity_percent': 65.0,
        'soil_moisture_percent': 55.0
    },
    'metadata': {
        'sensor_status': 'testing',
        'battery_level': 100
    }
}

print("\nPublishing test message to sensor-readings topic...")
print(f"Data: {json.dumps(test_reading, indent=2)}")
print()

try:
    producer.produce(
        topic='sensor-readings',
        key='TEST-SENSOR-001',
        value=json.dumps(test_reading),
        callback=delivery_report
    )

    # Wait for message to be delivered
    producer.flush(timeout=10)

    print("\n✅ Test completed successfully!")
    print("Check Confluent Cloud Console to verify the message was received.")

except Exception as e:
    print(f"\n✗ Test failed: {e}")
    sys.exit(1)
