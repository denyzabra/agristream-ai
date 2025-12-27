-- =====================================================
-- AgriStream AI - Flink SQL: Farmer Alerts Table
-- =====================================================
-- This creates the output table for high-priority farmer alerts
-- Only alerts with risk_score > 70 are written here

CREATE TABLE farmer_alerts (
    alert_id STRING,
    sensor_id STRING,
    farm_id STRING,
    location STRING,
    crop_type STRING,
    alert_timestamp STRING,
    risk_score DOUBLE,
    risk_level STRING,
    temperature_celsius DOUBLE,
    humidity_percent DOUBLE,
    alert_message STRING,
    action_required STRING,
    priority STRING,
    PRIMARY KEY (alert_id) NOT ENFORCED
) WITH (
    'kafka.topic' = 'farmer-alerts',
    'value.format' = 'json-registry'
);
