-- =====================================================
-- AgriStream AI - Flink SQL: Sensor Readings Table
-- =====================================================
-- This creates a Flink table that reads from the sensor-readings Kafka topic
-- Run this first in the Flink SQL workspace

CREATE TABLE sensor_readings (
    sensor_id STRING,
    farm_id STRING,
    location STRING,
    crop_type STRING,
    `timestamp` STRING,
    readings ROW<
        temperature_celsius DOUBLE,
        humidity_percent DOUBLE,
        soil_moisture_percent DOUBLE
    >,
    metadata ROW<
        sensor_status STRING,
        battery_level INT
    >,
    event_time AS TO_TIMESTAMP(`timestamp`),
    WATERMARK FOR event_time AS event_time - INTERVAL '30' SECONDS
) WITH (
    'kafka.topic' = 'sensor-readings',
    'value.format' = 'json-registry',
    'scan.startup.mode' = 'earliest-offset'
);

-- =====================================================
-- To verify data is flowing, run this query after creating the table:
-- SELECT * FROM sensor_readings LIMIT 10;
-- =====================================================
