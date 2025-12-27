-- =====================================================
-- AgriStream AI - Flink SQL: Pest Outbreak Detection
-- =====================================================
-- This is the main streaming query that detects pest outbreak conditions
-- Run this third (after creating both tables)

INSERT INTO outbreak_predictions
SELECT
    sensor_id,
    farm_id,
    location,
    crop_type,
    CAST(CURRENT_TIMESTAMP AS STRING) AS detection_timestamp,
    readings.temperature_celsius,
    readings.humidity_percent,
    readings.soil_moisture_percent,

    -- Risk Score Calculation (0-100 scale)
    -- Higher temp + lower humidity = higher risk
    CASE
        WHEN readings.temperature_celsius > 35 AND readings.humidity_percent < 40 THEN 95.0
        WHEN readings.temperature_celsius > 33 AND readings.humidity_percent < 42 THEN 85.0
        WHEN readings.temperature_celsius > 30 AND readings.humidity_percent < 45 THEN 70.0
        WHEN readings.temperature_celsius > 28 AND readings.humidity_percent < 50 THEN 50.0
        ELSE 30.0
    END AS risk_score,

    -- Risk Level Classification
    CASE
        WHEN readings.temperature_celsius > 35 AND readings.humidity_percent < 40 THEN 'CRITICAL'
        WHEN readings.temperature_celsius > 33 AND readings.humidity_percent < 42 THEN 'HIGH'
        WHEN readings.temperature_celsius > 30 AND readings.humidity_percent < 45 THEN 'MODERATE'
        ELSE 'LOW'
    END AS risk_level,

    -- Conditions Met Description
    CONCAT(
        'Temp: ', CAST(readings.temperature_celsius AS STRING), '°C (threshold: >30°C), ',
        'Humidity: ', CAST(readings.humidity_percent AS STRING), '% (threshold: <45%)'
    ) AS conditions_met,

    -- Actionable Recommendation
    CASE
        WHEN readings.temperature_celsius > 35 AND readings.humidity_percent < 40
            THEN 'URGENT: Deploy pest monitoring immediately. Apply preventive measures. High aphid/mite risk.'
        WHEN readings.temperature_celsius > 33 AND readings.humidity_percent < 42
            THEN 'WARNING: Increase monitoring frequency. Prepare pest control equipment.'
        WHEN readings.temperature_celsius > 30 AND readings.humidity_percent < 45
            THEN 'ALERT: Monitor closely for pest activity. Consider preventive spraying.'
        ELSE 'NORMAL: Continue routine monitoring.'
    END AS recommendation

FROM sensor_readings

-- Filter: Only alert when outbreak conditions are met
WHERE
    readings.temperature_celsius > 30.0
    AND readings.humidity_percent < 45.0
    AND metadata.sensor_status = 'active';

-- =====================================================
-- This query will continuously process sensor readings
-- and write predictions to the outbreak-predictions topic
-- when the conditions are met
-- =====================================================
