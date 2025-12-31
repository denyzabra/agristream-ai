"""
Google Gemini AI Service for AgriStream AI
Provides real-time pest outbreak analysis using Gemini 1.5 Flash
"""

import os
import json
import logging
from typing import Dict, Optional
import google.generativeai as genai
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GeminiService:
    """Service for analyzing pest outbreak predictions using Google Gemini AI"""

    def __init__(self):
        """Initialize Gemini service with API key validation"""
        self.enabled = False
        self.model = None

        # Load API key from environment
        api_key = os.getenv('GOOGLE_API_KEY')

        if not api_key:
            logger.warning("[Gemini] GOOGLE_API_KEY not found in environment - AI features disabled")
            return

        try:
            # Configure Gemini API
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.enabled = True
            logger.info("[Gemini] Service initialized successfully with gemini-2.5-flash")
        except Exception as e:
            logger.error(f"[Gemini] Failed to initialize: {e}")
            self.enabled = False

    async def analyze_outbreak(self, sensor_data: Dict, risk_score: float) -> Dict:
        """
        Analyze sensor data to predict pest outbreak type and recommendations

        Args:
            sensor_data: Dictionary containing sensor readings and farm metadata
            risk_score: Calculated risk score (0-100)

        Returns:
            Dictionary with pest prediction, confidence, reasoning, and recommendation
        """
        if not self.enabled:
            logger.warning("[Gemini] Service disabled - returning fallback response")
            return self._fallback_response("service_disabled")

        try:
            # Build prompt for Gemini
            prompt = self._build_pest_analysis_prompt(sensor_data, risk_score)

            # Call Gemini API
            logger.info(f"[Gemini] Analyzing outbreak for farm {sensor_data.get('farm_id')}, risk={risk_score}")
            response = self.model.generate_content(prompt)

            # Parse JSON response
            result = self._parse_gemini_response(response.text)

            logger.info(f"[Gemini] Detected: {result.get('pest_type')} (confidence={result.get('confidence')})")
            return result

        except Exception as e:
            logger.error(f"[Gemini] API call failed: {e}")
            return self._fallback_response(f"error: {str(e)}")

    def _build_pest_analysis_prompt(self, sensor_data: Dict, risk_score: float) -> str:
        """Build structured prompt for Gemini analysis"""

        # Extract sensor values
        location = sensor_data.get('location', 'Unknown')
        crop_type = sensor_data.get('crop_type', 'Unknown')
        temperature = sensor_data.get('temperature_celsius', 0)
        humidity = sensor_data.get('humidity_percent', 0)
        soil_moisture = sensor_data.get('soil_moisture_percent', 0)
        risk_level = sensor_data.get('risk_level', 'UNKNOWN')

        prompt = f"""You are an expert agricultural entomologist specializing in pest outbreak prediction.

Analyze the following sensor data and predict the most likely pest outbreak:

SENSOR DATA:
- Location: {location}
- Crop Type: {crop_type}
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Soil Moisture: {soil_moisture}%
- Risk Score: {risk_score}/100
- Risk Level: {risk_level}

TASK:
1. Identify the most likely pest species given these environmental conditions
2. Explain your reasoning in 1-2 sentences
3. Provide a specific, actionable recommendation for the farmer

RESPONSE FORMAT (JSON):
{{
  "pest_type": "Common name (Scientific name)",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation based on temperature, humidity, crop type",
  "recommendation": "Specific action the farmer should take"
}}

Focus on common agricultural pests like:
- Aphids (hot, dry conditions)
- Spider mites (high temp, low humidity)
- Whiteflies (warm, humid)
- Thrips (dry, warm)
- Fungal diseases (high humidity)

Respond ONLY with valid JSON. No markdown, no code blocks."""

        return prompt

    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse and validate Gemini's JSON response"""
        try:
            # Clean response (remove markdown code blocks if present)
            cleaned = response_text.strip()
            if cleaned.startswith('```'):
                # Remove code block markers
                lines = cleaned.split('\n')
                cleaned = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned
                if cleaned.startswith('json'):
                    cleaned = cleaned[4:]

            # Parse JSON
            data = json.loads(cleaned)

            # Validate required fields
            result = {
                "pest_type": data.get("pest_type", "Unknown pest"),
                "confidence": float(data.get("confidence", 0.0)),
                "reasoning": data.get("reasoning", "No reasoning provided"),
                "recommendation": data.get("recommendation", "Continue monitoring"),
                "ai_generated": True,
                "timestamp": datetime.utcnow().isoformat() + 'Z'
            }

            return result

        except json.JSONDecodeError as e:
            logger.error(f"[Gemini] Failed to parse JSON response: {e}")
            logger.error(f"[Gemini] Raw response: {response_text}")
            return self._fallback_response("parse_error")
        except Exception as e:
            logger.error(f"[Gemini] Error processing response: {e}")
            return self._fallback_response("processing_error")

    def _fallback_response(self, reason: str = "unavailable") -> Dict:
        """Return fallback response when Gemini is unavailable"""
        return {
            "pest_type": "Analysis unavailable",
            "confidence": 0.0,
            "reasoning": f"AI analysis temporarily {reason}",
            "recommendation": "Continue manual field monitoring and consult local agricultural extension",
            "ai_generated": False,
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        }
