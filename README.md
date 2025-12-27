# AgriStream AI - Real-Time Agricultural Pest Outbreak Prediction

## Project Overview
AgriStream AI is a real-time agricultural pest outbreak prediction system built for the AI Partner Catalyst Hackathon (Confluent Challenge).

### Tech Stack
- **Backend:** Python
- **Streaming Platform:** Confluent Cloud (Kafka + Flink SQL)
- **AI/ML:** Google Vertex AI (Gemini 2.0 Flash)
- **Frontend:** React + TypeScript + Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### 2. Configuration
Your Confluent Cloud credentials are stored in `.env`:
- Cluster: `agristream` (Basic tier, GCP us-central1)
- Topics: `sensor-readings`, `pest-images`, `weather-data`, `outbreak-predictions`, `farmer-alerts`

### 3. Test Kafka Connection

```bash
# Activate virtual environment
source venv/bin/activate

# Run test script
python producers/test_sensor.py
```

### 4. Run Sensor Simulator

```bash
# Activate virtual environment
source venv/bin/activate

# Start simulator (publishes data every 30 seconds)
python producers/sensor_simulator.py
```

The simulator generates realistic farm IoT data from 3 farms:
- **FARM-001** (Iowa, corn) - 2 sensors
- **FARM-002** (California, almonds) - 2 sensors
- **FARM-003** (Nebraska, soybeans) - 2 sensors

Each sensor reports:
- Temperature (°C)
- Humidity (%)
- Soil moisture (%)
- Battery level
- Sensor status

## Verify Data in Confluent Cloud

1. Go to https://confluent.cloud
2. Navigate to your `agristream` cluster
3. Click **Topics** → **sensor-readings**
4. Click **Messages** tab
5. You should see JSON messages with sensor data

## Project Structure

```
agristream-ai/
├── .env                          # Confluent Cloud credentials
├── requirements.txt              # Python dependencies
├── venv/                         # Virtual environment
├── producers/
│   ├── sensor_simulator.py       # Main sensor data simulator
│   └── test_sensor.py            # Quick connection test
└── README.md                     # This file
```

## Next Steps

1. Build pest image producer
2. Set up weather data integration
3. Create Flink SQL streaming jobs
4. Integrate Google Vertex AI for predictions
5. Build React frontend dashboard
6. Implement real-time alerting system
