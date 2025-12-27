-- =====================================================
-- AgriStream AI - Flink SQL: Outbreak Predictions Table
-- =====================================================
-- This creates the output table for pest outbreak predictions
-- Run this second

CREATE TABLE outbreak_predictions (
    sensor_id STRING,
    farm_id STRING,
    location STRING,
    crop_type STRING,
    detection_timestamp STRING,
    temperature_celsius DOUBLE,
    humidity_percent DOUBLE,
    soil_moisture_percent DOUBLE,
    risk_score DOUBLE,
    risk_level STRING,
    conditions_met STRING,
    recommendation STRING,
    PRIMARY KEY (sensor_id, detection_timestamp) NOT ENFORCED
) WITH (
    'kafka.topic' = 'outbreak-predictions',
    'value.format' = 'json-registry'
);
