# AgriStream AI - Flink SQL Pipeline

## Overview
Real-time pest outbreak detection using Flink SQL on Confluent Cloud.

## Execution Order

### Step 1: Create Sensor Readings Table
**File:** `01-create-sensor-table.sql`

This table reads from the `sensor-readings` Kafka topic and structures the JSON data for SQL queries.

**How to run:**
1. Open Flink SQL workspace
2. Copy the entire SQL statement
3. Paste into the editor
4. Click **Run** or press Cmd/Ctrl + Enter
5. Wait for "Statement executed successfully"

**Verify:**
```sql
SELECT * FROM sensor_readings LIMIT 10;
```

---

### Step 2: Create Outbreak Predictions Table
**File:** `02-create-predictions-table.sql`

This table writes predictions to the `outbreak-predictions` Kafka topic.

**How to run:**
1. Copy the SQL statement
2. Paste into the editor
3. Click **Run**
4. Wait for success message

---

### Step 3: Start Pest Outbreak Detection Query
**File:** `03-pest-outbreak-detection.sql`

This is a **continuous query** that runs forever, detecting pest outbreak conditions in real-time.

**Detection Logic:**
- **Trigger:** Temperature > 30°C AND Humidity < 45%
- **Risk Score:** 0-100 scale
  - 95: CRITICAL (temp > 35°C, humidity < 40%)
  - 85: HIGH (temp > 33°C, humidity < 42%)
  - 70: MODERATE (temp > 30°C, humidity < 45%)
  - 30: LOW (baseline)

**How to run:**
1. Copy the entire INSERT INTO statement
2. Paste into the editor
3. Click **Run**
4. This query will run continuously
5. You should see "Statement running" status

**To stop the query:**
- Click the **Stop** button in the Flink SQL workspace
- Or navigate to "Running Statements" and stop it there

---

### Step 4: Monitor & Test
**File:** `04-test-queries.sql`

Use these queries to verify your pipeline is working:

1. **View raw sensor data** - Verify data is flowing
2. **View predictions** - See outbreak alerts being generated
3. **Real-time statistics** - Aggregated metrics per farm (1-minute windows)
4. **Count alerts by farm** - Which farms have the most alerts
5. **High-risk sensors only** - Filter for CRITICAL/HIGH alerts

**How to run:**
- Copy individual queries from this file
- Run them one at a time to inspect different aspects

---

## Testing the Pipeline

### Option 1: Wait for Natural Conditions
Run your sensor simulator and wait for random conditions to trigger alerts:
```bash
source venv/bin/activate
python producers/sensor_simulator.py
```

### Option 2: Force Outbreak Conditions
Modify the simulator to generate outbreak conditions for testing. Edit `producers/sensor_simulator.py`:

```python
# In generate_sensor_reading(), replace temperature/humidity with:
temperature = round(random.uniform(32, 36), 2)  # Force high temp
humidity = round(random.uniform(35, 43), 2)     # Force low humidity
```

Then run the simulator to generate alerts.

---

## Monitoring Your Flink Jobs

### In Confluent Cloud UI:
1. **Flink** → **agristream-analytics** pool
2. Click **Statements** tab
3. You should see:
   - CREATE TABLE statements (Completed)
   - INSERT INTO statement (Running)

### View Metrics:
- Click on the running INSERT statement
- See throughput, records processed, backpressure

### View Output:
1. Go to **Topics** → **outbreak-predictions**
2. Click **Messages** tab
3. You should see prediction messages when conditions are met

---

## Troubleshooting

### "No data in sensor_readings table"
- Make sure your sensor simulator is running
- Check the `sensor-readings` topic has messages
- Verify the table's `scan.startup.mode` is set correctly

### "Predictions table is empty"
- Check if any sensor readings meet the criteria (temp > 30, humidity < 45)
- Verify the INSERT INTO query is running (not stopped)
- Run the test queries to inspect sensor data

### "JSON parsing errors"
- Ensure your sensor simulator is sending valid JSON
- Check that field names match exactly (case-sensitive)
- Verify the JSON structure matches the ROW definition

---

## Next Steps

After verifying the Flink pipeline works:
1. Integrate Google Vertex AI for ML-based predictions
2. Build the React dashboard to visualize alerts
3. Add the farmer-alerts topic with notification logic
4. Implement historical data analysis
5. Add more sophisticated pest detection models
