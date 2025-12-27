-- =====================================================
-- AgriStream AI - Flink SQL: Test & Monitoring Queries
-- =====================================================
-- Use these queries to test and monitor your Flink pipeline

-- =====================================================
-- 1. View Raw Sensor Data
-- =====================================================
-- Run this to see data flowing from sensor-readings topic
SELECT
    sensor_id,
    farm_id,
    location,
    readings.temperature_celsius,
    readings.humidity_percent,
    readings.soil_moisture_percent,
    `timestamp`
FROM sensor_readings
LIMIT 20;


-- =====================================================
-- 2. View Live Outbreak Predictions
-- =====================================================
-- Run this to see predictions being generated
SELECT
    sensor_id,
    farm_id,
    location,
    temperature_celsius,
    humidity_percent,
    risk_score,
    risk_level,
    recommendation,
    detection_timestamp
FROM outbreak_predictions
LIMIT 20;


-- =====================================================
-- 3. Real-time Statistics (Tumbling Window - 1 minute)
-- =====================================================
-- Monitor aggregated metrics per farm
SELECT
    farm_id,
    location,
    TUMBLE_START(event_time, INTERVAL '1' MINUTE) AS window_start,
    COUNT(*) AS reading_count,
    AVG(readings.temperature_celsius) AS avg_temp,
    AVG(readings.humidity_percent) AS avg_humidity,
    AVG(readings.soil_moisture_percent) AS avg_soil_moisture,
    MAX(readings.temperature_celsius) AS max_temp,
    MIN(readings.humidity_percent) AS min_humidity
FROM sensor_readings
GROUP BY
    farm_id,
    location,
    TUMBLE(event_time, INTERVAL '1' MINUTE);


-- =====================================================
-- 4. Count Alerts by Farm (Real-time)
-- =====================================================
-- See which farms are generating the most alerts
SELECT
    farm_id,
    location,
    risk_level,
    COUNT(*) AS alert_count
FROM outbreak_predictions
GROUP BY farm_id, location, risk_level;


-- =====================================================
-- 5. High-Risk Sensors Only
-- =====================================================
-- Filter for only HIGH and CRITICAL alerts
SELECT
    sensor_id,
    farm_id,
    risk_score,
    risk_level,
    recommendation,
    detection_timestamp
FROM outbreak_predictions
WHERE risk_level IN ('HIGH', 'CRITICAL')
LIMIT 50;
