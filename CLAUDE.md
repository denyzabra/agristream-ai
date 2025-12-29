# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgriStream AI is a real-time agricultural pest outbreak prediction system built for the AI Partner Catalyst Hackathon (Confluent Challenge). It demonstrates end-to-end real-time data streaming from IoT sensors through Kafka/Flink to a React dashboard.

**Core Tech Stack:**
- **Data Pipeline:** Confluent Cloud (Kafka + Flink SQL)
- **Backend:** FastAPI with Server-Sent Events (SSE)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Data Producers:** Python scripts simulating farm IoT sensors
- **AI/ML:** Google Vertex AI (Gemini 2.0 Flash) - planned integration

## Architecture Flow

```
Sensor Simulators (Python)
    ↓
Kafka Topic: sensor-readings
    ↓
Flink SQL (Real-time Processing)
    ├→ Outbreak Detection Logic → outbreak-predictions topic
    └→ Alert Filtering (risk > 70) → farmer-alerts topic
    ↓
FastAPI Backend (Kafka Consumers → SSE Streams)
    ↓
React Frontend (EventSource → Real-time Dashboard)
```

## Development Commands

### Backend (FastAPI + SSE)

**Setup & Run:**
```bash
# One-time setup (use root venv for all Python)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run backend server
cd backend
python main.py
# Runs on http://localhost:8000
```

**Test SSE Endpoints:**
```bash
# Test sensor stream
curl -N http://localhost:8000/stream/sensors

# Test predictions
curl -N http://localhost:8000/stream/predictions

# Test alerts
curl -N http://localhost:8000/stream/alerts

# Health check
curl http://localhost:8000/health

# Trigger demo outbreak (for presentations)
curl -X POST http://localhost:8000/trigger/outbreak \
  -H "Content-Type: application/json" \
  -d '{"severity": "CRITICAL", "count": 10}'
```

### Frontend (React + Vite)

**Setup & Run:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Build for Production:**
```bash
npm run build
npm run preview
```

### Data Producers (Kafka)

**Test Connection:**
```bash
source venv/bin/activate
python producers/test_sensor.py
```

**Run Continuous Sensor Simulator:**
```bash
source venv/bin/activate
python producers/sensor_simulator.py
# Generates data every 30 seconds from 3 farms (6 sensors)
```

**Generate Outbreak Test Data:**
```bash
source venv/bin/activate
python producers/outbreak_test.py
# Sends 15 high-risk readings to trigger alerts
```

## Key Architecture Patterns

### 1. Unified Python Environment
- **Single venv at root** contains all Python dependencies (backend + producers)
- No separate backend/venv - use root venv for everything
- All Python scripts assume they run from project root with venv activated

### 2. SSE Streaming Architecture
- Backend consumes from 3 Kafka topics simultaneously (sensor-readings, outbreak-predictions, farmer-alerts)
- Each topic has a dedicated Kafka consumer group: `agristream-frontend-group`
- Consumers use `auto.offset.reset: 'latest'` - only stream NEW messages
- Transform functions convert Kafka JSON to frontend-compatible types before SSE emission

**SSE Pattern:**
```python
async def kafka_stream_generator(topic: str, transform_fn):
    consumer = Consumer(KAFKA_CONFIG)
    consumer.subscribe([topic])
    while True:
        msg = consumer.poll(timeout=0.1)
        if msg:
            data = transform_fn(json.loads(msg.value()))
            yield {"event": "message", "data": json.dumps(data)}
```

### 3. React Real-time Hooks
- Custom hook `useKafkaStream<T>` wraps EventSource API
- Auto-reconnects on connection loss
- Keeps last N items in memory (configurable)
- Convenience hooks: `useSensorStream()`, `usePredictionStream()`, `useAlertStream()`

**Usage:**
```typescript
const { data, latest, isConnected } = useSensorStream();
// data: array of last 100 sensor readings
// latest: most recent reading
// isConnected: SSE connection status
```

### 4. Flink SQL Table Naming
- **Kafka topics:** Use hyphens (`sensor-readings`, `outbreak-predictions`, `farmer-alerts`)
- **Flink tables:** Use backticks with hyphens (`` `outbreak-predictions` ``)
- **Primary key columns MUST appear first** in CREATE TABLE schema
- Tables auto-map to topics with matching names

### 5. Environment Configuration
- Root `.env` contains Confluent Cloud credentials (NEVER commit this)
- Frontend `.env.local` has `VITE_BACKEND_URL=http://localhost:8000`
- Backend reads from `../.env` (parent directory)

## Flink SQL Workflow

**Location:** `/flink-sql/` directory contains all SQL scripts

**Execution in Confluent Cloud UI:**
1. Navigate to Flink → Compute Pools → `agristream-analytics`
2. Open SQL Workspace
3. Run scripts in order:
   - `01-create-sensor-table.sql` - Map sensor-readings topic
   - `02-create-predictions-table.sql` - Create output table
   - `03-pest-outbreak-detection.sql` - **Continuous INSERT query** (runs forever)
   - `05-create-farmer-alerts-table.sql` - High-priority alerts table
   - `06-farmer-alerts-query.sql` - **Continuous INSERT** filtering risk_score > 70
   - `04-test-queries.sql` - Verification queries

**Key Flink Concepts:**
- INSERT INTO queries run **continuously** - they never stop until manually stopped
- Queries show "Running" status (green) when active
- Check "Statements" tab to see running queries
- `outbreak-predictions` filters on: `temp > 30°C AND humidity < 45%`

## Data Flow Requirements

**For the system to work end-to-end:**
1. ✅ Flink compute pool must be running
2. ✅ Both INSERT queries must show "Running" status in Confluent Cloud
3. ✅ Backend server must be running (port 8000)
4. ✅ At least one producer sending data (sensor_simulator.py or outbreak_test.py)
5. ✅ Frontend dev server running (port 5173)

**Data won't flow if:**
- Flink queries are stopped/paused
- Backend consumer subscribed before data was sent (offset=latest means it misses old messages)
- Producers aren't running
- Topics are empty

## Common Issues & Solutions

**SSE shows "Connected" but no data:**
- Restart backend AFTER starting Flink queries
- Run `outbreak_test.py` to generate fresh data
- Backend consumers only see NEW messages after they start

**Flink table creation fails:**
- Check PRIMARY KEY columns are listed FIRST in schema
- Use backticks for table names with hyphens
- Verify topic exists in Confluent Cloud before creating table

**Frontend shows 0 predictions/alerts:**
- Check Flink queries are "Running" (not Completed/Failed)
- Verify sensor readings meet outbreak criteria (temp > 30, humidity < 45)
- Use outbreak_test.py to force high-risk conditions

**Chart warnings (width -1, height -1):**
- Recharts needs container with explicit dimensions - non-blocking warning

## Demo Features

**EXECUTE PROTOCOL Button:**
- Frontend calls `POST /trigger/outbreak`
- Backend sends 10 CRITICAL sensor readings to Kafka
- Flink processes → predictions → alerts
- Dashboard updates in real-time
- Perfect for hackathon demos

**Topology:**
- 3 simulated farms: FARM-001 (Iowa, corn), FARM-002 (California, almonds), FARM-003 (Nebraska, soybeans)
- 6 sensors total (2 per farm)
- Each reading: temperature, humidity, soil_moisture, battery_level

## Git Workflow

**.gitignore covers:**
- `venv/`, `node_modules/`, `.env`, `.env.local`
- IDE files (`.vscode/`, `.idea/`, `.DS_Store`)
- Python artifacts (`__pycache__/`, `*.pyc`)

**Commit messages:**
- Follow format: `feat: description` or `fix: description`
- Include hackathon footer:
```
🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Important Notes

- **Never commit `.env`** - contains Confluent Cloud API keys
- Backend CORS allows localhost:5173 and localhost:3000 only
- All timestamps use UTC with timezone-aware datetime objects
- Frontend expects specific JSON structure from SSE - see transform functions in backend/main.py
- Flink SQL is case-sensitive for field names - match producer JSON exactly
