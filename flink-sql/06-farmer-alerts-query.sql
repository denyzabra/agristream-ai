-- =====================================================
-- AgriStream AI - Flink SQL: Farmer Alerts Query
-- =====================================================
-- Filters high-risk predictions (risk_score > 70) and sends to farmer-alerts topic
-- This creates actionable alerts for farmers to respond to

INSERT INTO farmer_alerts
SELECT
    -- Generate unique alert ID using farm_id, sensor_id, and timestamp
    CONCAT(
        farm_id, '-',
        sensor_id, '-',
        CAST(UNIX_TIMESTAMP(CAST(detection_timestamp AS TIMESTAMP)) AS STRING)
    ) AS alert_id,

    sensor_id,
    farm_id,
    location,
    crop_type,
    detection_timestamp AS alert_timestamp,
    risk_score,
    risk_level,
    temperature_celsius,
    humidity_percent,

    -- Alert message for farmers
    CONCAT(
        'PEST OUTBREAK RISK DETECTED at ', location,
        '. Farm: ', farm_id,
        ' | Sensor: ', sensor_id,
        ' | Risk Level: ', risk_level,
        ' (Score: ', CAST(risk_score AS STRING), '/100)'
    ) AS alert_message,

    -- Action required based on risk level
    CASE
        WHEN risk_level = 'CRITICAL' THEN
            'IMMEDIATE ACTION: Deploy pest monitoring teams. Apply preventive treatments within 24 hours. High aphid/mite outbreak risk.'
        WHEN risk_level = 'HIGH' THEN
            'URGENT: Increase field monitoring frequency to every 6 hours. Prepare pest control equipment and supplies.'
        WHEN risk_level = 'MODERATE' THEN
            'ATTENTION: Monitor field conditions closely. Schedule pest assessment within 48 hours. Consider preventive measures.'
        ELSE 'Monitor conditions'
    END AS action_required,

    -- Priority level for alert routing
    CASE
        WHEN risk_score >= 85 THEN 'P1-CRITICAL'
        WHEN risk_score >= 70 THEN 'P2-HIGH'
        ELSE 'P3-MEDIUM'
    END AS priority

FROM outbreak_predictions

-- Only create farmer alerts for high-risk conditions (score > 70)
WHERE risk_score > 70;

-- =====================================================
-- This query continuously monitors outbreak_predictions
-- and creates farmer alerts when risk score exceeds 70
-- =====================================================
