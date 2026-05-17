"""
Gemini AI Integration for Ethiopian Cultural Context
Enhances treatment advice with:
- Better Amharic translations
- Traditional Ethiopian remedies
- Organic/compost solutions
- Local farming wisdom
"""

import os
from pathlib import Path
from typing import Optional

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(env_path)
except ImportError:
    print("⚠️  python-dotenv not installed. Install with: pip install python-dotenv")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Use new google.genai SDK
try:
    from google import genai
    from google.genai import types

    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = client
        print("✅ Gemini API configured successfully (google.genai)")
    else:
        client = None
        model = None
        print("⚠️  GEMINI_API_KEY not set. Using basic treatment advice.")

except ImportError:
    client = None
    model = None
    print("⚠️  google-genai not installed. Run: pip install google-genai")


def get_enhanced_treatment(crop_name: str, disease_name: str, base_treatment: str) -> dict:
    """
    Use Gemini to enhance treatment advice with:
    - Amharic, English, and Afaan Oromoo translations
    - Traditional Ethiopian remedies
    - Organic/compost solutions
    - Cultural context
    """

    if not client:
        return {
            "amharic": "የጀሚኒ ኤፒአይ ቁልፍ አልተዘጋጀም።",
            "english": base_treatment,
            "oromoo": "Gemini API hin qophaa'ine.",
            "traditional": base_treatment,
            "organic": "Use organic compost and natural pest control methods.",
            "prevention": "Practice crop rotation and maintain good field hygiene."
        }

    prompt = f"""You are an agricultural expert specializing in Ethiopian farming practices.

Crop: {crop_name}
Disease: {disease_name}
Basic Treatment: {base_treatment}

Provide treatment advice in 6 sections:

1. AMHARIC: Translate the treatment advice to proper Amharic. Use natural Ethiopian farming language.
2. ENGLISH: Provide clear treatment advice in simple English that farmers can understand.
3. OROMOO: Translate the treatment advice to proper Afaan Oromoo.
4. TRADITIONAL: Provide traditional Ethiopian remedies using local materials (neem/ኒም, wood ash/አመድ, garlic/ነጭ ሽንኩርት, chili pepper/በርበሬ).
5. ORGANIC: Suggest organic and compost-based solutions from local materials.
6. PREVENTION: Preventive measures for Ethiopian highland/lowland farming, considering rainy seasons (ክረምት/በልግ).

Format EXACTLY like this:
AMHARIC: [text]
ENGLISH: [text]
OROMOO: [text]
TRADITIONAL: [text]
ORGANIC: [text]
PREVENTION: [text]

Keep each section concise (2-3 sentences max)."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = response.text.strip()

        sections = {
            "amharic": "", "english": "", "oromoo": "",
            "traditional": "", "organic": "", "prevention": ""
        }

        current_section = None
        for line in text.split('\n'):
            line = line.strip()
            if line.startswith('AMHARIC:'):
                current_section = 'amharic'
                sections['amharic'] = line.replace('AMHARIC:', '').strip()
            elif line.startswith('ENGLISH:'):
                current_section = 'english'
                sections['english'] = line.replace('ENGLISH:', '').strip()
            elif line.startswith('OROMOO:'):
                current_section = 'oromoo'
                sections['oromoo'] = line.replace('OROMOO:', '').strip()
            elif line.startswith('TRADITIONAL:'):
                current_section = 'traditional'
                sections['traditional'] = line.replace('TRADITIONAL:', '').strip()
            elif line.startswith('ORGANIC:'):
                current_section = 'organic'
                sections['organic'] = line.replace('ORGANIC:', '').strip()
            elif line.startswith('PREVENTION:'):
                current_section = 'prevention'
                sections['prevention'] = line.replace('PREVENTION:', '').strip()
            elif current_section and line:
                sections[current_section] += ' ' + line

        return sections

    except Exception as e:
        print(f"Gemini API error: {e}")
        return {
            "amharic": "የጀሚኒ ኤፒአይ ስህተት።",
            "english": base_treatment,
            "oromoo": "Dogoggora Gemini API.",
            "traditional": base_treatment,
            "organic": "Use organic compost and natural pest control methods.",
            "prevention": "Practice crop rotation and maintain good field hygiene."
        }


def translate_to_amharic(text: str) -> str:
    """Simple translation helper for any text."""
    if not client:
        return text
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Translate this agricultural advice to natural Amharic that Ethiopian farmers understand: {text}",
        )
        return response.text.strip()
    except:
        return text
