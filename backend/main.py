"""
AgriStream AI - FastAPI Backend with SSE
Streams real-time data from Kafka to React frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
import asyncio
import json
import random
from datetime import datetime, timezone
from confluent_kafka import Consumer, Producer, KafkaError
from dotenv import load_dotenv
import os
from typing import AsyncGenerator

load_dotenv('../.env')

app = FastAPI(title="AgriStream AI Backend")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kafka consumer configuration
KAFKA_CONFIG = {
    'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVERS'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': os.getenv('CONFLUENT_API_KEY'),
    'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
    'group.id': 'agristream-frontend-group',
    'auto.offset.reset': 'latest',  # Only get new messages
    'enable.auto.commit': True
}


async def kafka_stream_generator(topic: str, transform_fn=None) -> AsyncGenerator:
    """
    Generic Kafka consumer that yields SSE events
    """
    consumer = Consumer(KAFKA_CONFIG)
    consumer.subscribe([topic])

    try:
        while True:
            msg = consumer.poll(timeout=0.1)  # Non-blocking poll

            if msg is None:
                await asyncio.sleep(0.1)  # Prevent busy loop
                continue

            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(f"Consumer error: {msg.error()}")
                    continue

            try:
                # Parse JSON message
                data = json.loads(msg.value().decode('utf-8'))

                # Transform data if needed
                if transform_fn:
                    data = transform_fn(data)

                # Yield as SSE event
                yield {
                    "event": "message",
                    "data": json.dumps(data)
                }

            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                continue

    except asyncio.CancelledError:
        print(f"Stream cancelled for topic: {topic}")
    finally:
        consumer.close()


def transform_sensor_reading(data: dict) -> dict:
    """Transform sensor reading to match frontend SensorDataPoint type"""
    return {
        "timestamp": data.get("timestamp"),
        "temperature": data.get("readings", {}).get("temperature_celsius"),
        "humidity": data.get("readings", {}).get("humidity_percent"),
        "soilMoisture": data.get("readings", {}).get("soil_moisture_percent"),
        "sensorId": data.get("sensor_id"),
        "farmId": data.get("farm_id"),
        "location": data.get("location")
    }


def transform_outbreak_prediction(data: dict) -> dict:
    """Transform outbreak prediction for frontend"""
    return {
        "sensorId": data.get("sensor_id"),
        "farmId": data.get("farm_id"),
        "location": data.get("location"),
        "riskScore": data.get("risk_score"),
        "riskLevel": data.get("risk_level"),
        "temperature": data.get("temperature_celsius"),
        "humidity": data.get("humidity_percent"),
        "recommendation": data.get("recommendation"),
        "timestamp": data.get("detection_timestamp")
    }


def transform_farmer_alert(data: dict) -> dict:
    """Transform farmer alert to match frontend Alert type"""
    # Map risk_level to frontend alert type
    risk_to_type = {
        'CRITICAL': 'critical',
        'HIGH': 'warning',
        'MODERATE': 'warning',
        'LOW': 'info'
    }

    return {
        "id": data.get("alert_id"),
        "type": risk_to_type.get(data.get("risk_level"), 'info'),
        "title": f"{data.get('risk_level')} Risk Alert",
        "message": data.get("alert_message"),
        "timestamp": data.get("alert_timestamp"),
        "farmId": data.get("farm_id"),
        "sensorId": data.get("sensor_id"),
        "riskScore": data.get("risk_score"),
        "priority": data.get("priority"),
        "actionRequired": data.get("action_required")
    }


@app.get("/")
async def root():
    return {
        "service": "AgriStream AI Backend",
        "status": "running",
        "endpoints": {
            "sensor_stream": "/stream/sensors",
            "predictions_stream": "/stream/predictions",
            "alerts_stream": "/stream/alerts"
        }
    }


@app.get("/stream/sensors")
async def stream_sensors():
    """
    SSE endpoint for sensor readings
    Frontend: EventSource('/stream/sensors')
    """
    return EventSourceResponse(
        kafka_stream_generator("sensor-readings", transform_sensor_reading)
    )


@app.get("/stream/predictions")
async def stream_predictions():
    """
    SSE endpoint for outbreak predictions
    Frontend: EventSource('/stream/predictions')
    """
    return EventSourceResponse(
        kafka_stream_generator("outbreak-predictions", transform_outbreak_prediction)
    )


@app.get("/stream/alerts")
async def stream_alerts():
    """
    SSE endpoint for farmer alerts
    Frontend: EventSource('/stream/alerts')
    """
    return EventSourceResponse(
        kafka_stream_generator("farmer-alerts", transform_farmer_alert)
    )


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


class OutbreakTrigger(BaseModel):
    severity: str = "CRITICAL"
    count: int = 10


@app.post("/trigger/outbreak")
async def trigger_outbreak(trigger: OutbreakTrigger):
    """
    Trigger a demo outbreak scenario for presentation
    Sends high-risk sensor data to Kafka that will trigger alerts
    """
    # Kafka producer config
    producer_config = {
        'bootstrap.servers': os.getenv('CONFLUENT_BOOTSTRAP_SERVERS'),
        'security.protocol': 'SASL_SSL',
        'sasl.mechanisms': 'PLAIN',
        'sasl.username': os.getenv('CONFLUENT_API_KEY'),
        'sasl.password': os.getenv('CONFLUENT_API_SECRET'),
    }

    producer = Producer(producer_config)
    sent_count = 0

    try:
        for i in range(trigger.count):
            # Generate CRITICAL outbreak conditions
            if trigger.severity == "CRITICAL":
                temp = round(random.uniform(35.5, 38.0), 2)
                humidity = round(random.uniform(30, 38), 2)
            elif trigger.severity == "HIGH":
                temp = round(random.uniform(33.0, 35.0), 2)
                humidity = round(random.uniform(38, 42), 2)
            else:  # MODERATE
                temp = round(random.uniform(30.5, 33.0), 2)
                humidity = round(random.uniform(40, 45), 2)

            reading = {
                'sensor_id': f'DEMO-{i+1:03d}',
                'farm_id': 'DEMO-OUTBREAK',
                'location': 'Demo Farm (Protocol Execution)',
                'crop_type': 'demo',
                'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                'readings': {
                    'temperature_celsius': temp,
                    'humidity_percent': humidity,
                    'soil_moisture_percent': round(random.uniform(40, 60), 2)
                },
                'metadata': {
                    'sensor_status': 'active',
                    'battery_level': 100
                }
            }

            producer.produce(
                topic='sensor-readings',
                key=reading['sensor_id'],
                value=json.dumps(reading)
            )
            sent_count += 1

        producer.flush(timeout=10)

        return {
            "status": "success",
            "message": f"Outbreak protocol executed: {sent_count} {trigger.severity} readings sent",
            "severity": trigger.severity,
            "readings_sent": sent_count
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    finally:
        producer.flush()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
