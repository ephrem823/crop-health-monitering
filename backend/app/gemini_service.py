"""
Gemini AI Integration for Ethiopian Cultural Context
-----------------------------------------------------
Enhances treatment advice with:
- Better Amharic translations
- Traditional Ethiopian remedies
- Organic/compost solutions
- Local farming wisdom
"""

import os
from pathlib import Path
import google.generativeai as genai
from typing import Optional

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(env_path)
except ImportError:
    print("⚠️  python-dotenv not installed. Install with: pip install python-dotenv")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    print(f"✅ Gemini API configured successfully")
else:
    model = None
    print("⚠️  GEMINI_API_KEY not set. Using basic treatment advice.")


def get_enhanced_treatment(crop_name: str, disease_name: str, base_treatment: str) -> dict:
    """
    Use Gemini to enhance treatment advice with:
    - Amharic, English, and Afaan Oromoo translations
    - Traditional Ethiopian remedies
    - Organic/compost solutions
    - Cultural context
    """
    
    if not model:
        return {
            "amharic": "የጀሚኒ ኤፒአይ ቁልፍ አልተዘጋጀም።",
            "english": base_treatment,
            "oromoo": "Gemini API hin qophaa'ine.",
            "traditional": base_treatment,
            "organic": "Use organic compost and natural pest control methods.",
            "prevention": "Practice crop rotation and maintain good field hygiene."
        }
    
    prompt = f"""
You are an agricultural expert specializing in Ethiopian farming practices.

Crop: {crop_name}
Disease: {disease_name}
Basic Treatment: {base_treatment}

Provide treatment advice in 6 sections:

1. AMHARIC: Translate the treatment advice to proper Amharic (not just transliteration). Use natural Ethiopian farming language that Amharic-speaking farmers understand.

2. ENGLISH: Provide clear treatment advice in simple English that farmers can understand.

3. OROMOO: Translate the treatment advice to proper Afaan Oromoo. Use natural farming language that Oromo-speaking farmers understand.

4. TRADITIONAL: Provide traditional Ethiopian remedies using local materials available to smallholder farmers (neem/ኒም/eeboo, wood ash/አመድ/daaraa, garlic/ነጭ ሽንኩርት/qullubbii adii, chili pepper/በርበሬ/barbaree, compost tea, etc.)

5. ORGANIC: Suggest organic and compost-based solutions that don't require expensive chemicals. Include how to make organic fungicides/pesticides from local materials.

6. PREVENTION: Preventive measures specific to Ethiopian highland/lowland farming conditions, considering rainy seasons (ክረምት/በልግ/ganna/birraa).

Format your response EXACTLY like this:
AMHARIC: [Amharic text here]
ENGLISH: [English text here]
OROMOO: [Afaan Oromoo text here]
TRADITIONAL: [Traditional remedies here]
ORGANIC: [Organic solutions here]
PREVENTION: [Prevention tips here]

Keep each section concise (2-3 sentences max).
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse the response
        sections = {
            "amharic": "",
            "english": "",
            "oromoo": "",
            "traditional": "",
            "organic": "",
            "prevention": ""
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
    if not model:
        return text
    
    try:
        prompt = f"Translate this agricultural advice to natural Amharic that Ethiopian farmers understand: {text}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return text
