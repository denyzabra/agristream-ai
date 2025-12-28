# AgriStream AI - Backend Server

FastAPI backend with Server-Sent Events (SSE) for streaming Kafka data to React frontend.

## Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Run Server

```bash
source venv/bin/activate
python main.py
```

Server runs on: **http://localhost:8000**

## SSE Endpoints

### 1. Sensor Readings Stream
```
GET /stream/sensors
```
Streams real-time sensor data (temperature, humidity, soil moisture)

### 2. Outbreak Predictions Stream
```
GET /stream/predictions
```
Streams pest outbreak predictions with risk scores

### 3. Farmer Alerts Stream
```
GET /stream/alerts
```
Streams high-priority alerts (risk_score > 70)

## Testing

### Test with curl:
```bash
# Sensor readings
curl -N http://localhost:8000/stream/sensors

# Predictions
curl -N http://localhost:8000/stream/predictions

# Alerts
curl -N http://localhost:8000/stream/alerts
```

### Test with browser:
Visit http://localhost:8000 for API info

## Architecture

```
Kafka Topics → FastAPI Consumer → SSE → React Frontend
                 (this backend)
```

## Troubleshooting

**"Connection refused"**
- Make sure backend is running: `python main.py`

**"No data streaming"**
- Ensure Kafka producers are running
- Check Flink queries are active in Confluent Cloud

**"CORS errors"**
- Frontend must be on http://localhost:5173 or http://localhost:3000
