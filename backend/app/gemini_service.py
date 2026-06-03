"""
Gemini AI Integration for Ethiopian Cultural Context
"""

import os
from pathlib import Path
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / '.env')
except ImportError:
    print("⚠️  python-dotenv not installed.")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MAX_INPUT_LENGTH = 500

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _model = genai.GenerativeModel(
        'gemini-1.5-flash',
        generation_config=GenerationConfig(max_output_tokens=2048, temperature=0.4)
    )
    print("✅ Gemini API configured successfully")
else:
    _model = None
    print("⚠️  GEMINI_API_KEY not set. Using basic treatment advice.")

_FALLBACK = {
    "amharic": "የጀሚኒ ኤፒአይ ቁልፍ አልተዘጋጀም።",
    "english": "",
    "oromoo": "Gemini API hin qophaa'ine.",
    "traditional": "",
    "organic": "Use organic compost and natural pest control methods.",
    "prevention": "Practice crop rotation and maintain good field hygiene.",
}


def _sanitize(text: str) -> str:
    return text[:MAX_INPUT_LENGTH].strip()


from functools import lru_cache

@lru_cache(maxsize=50)
def get_enhanced_treatment(crop_name: str, disease_name: str, base_treatment: str) -> dict:
    if not _model:
        return {**_FALLBACK, "english": base_treatment, "traditional": base_treatment}

    crop_name = _sanitize(crop_name)
    disease_name = _sanitize(disease_name)
    base_treatment = _sanitize(base_treatment)

    prompt = f"""You are a senior plant pathologist and agricultural scientist with 20+ years of field experience in tropical and subtropical crop diseases, specializing in Ethiopian agroecology.

Diagnosed Condition:
- Crop: {crop_name}
- Disease/Condition: {disease_name}
- Initial Assessment: {base_treatment}

Provide expert-level treatment advice covering:

1. PATHOGEN ANALYSIS & TREATMENT STRATEGY (in English)
   - Identify the causal agent (fungal, bacterial, viral, nutritional, environmental)
   - Explain the disease mechanism and spread pattern
   - Recommend evidence-based chemical/biological controls with active ingredients, application rates, and timing
   - Consider Ethiopian climate zones (highland kolla/weyna dega, lowland bereha)

2. AMHARIC TRANSLATION
   - Translate the core treatment advice into clear Amharic that Ethiopian smallholder farmers can understand
   - Use agricultural terminology familiar in Ethiopian extension services

3. AFAAN OROMOO TRANSLATION
   - Translate the core treatment advice into clear Afaan Oromoo
   - Use terminology common in Oromia region agricultural practices

4. TRADITIONAL & INDIGENOUS KNOWLEDGE
   - Recommend proven Ethiopian traditional remedies using locally available materials:
     * Neem (ኒም/Neem) extracts and application methods
     * Wood ash (አመድ/daaraa) for pH adjustment and pest deterrence
     * Garlic/chili (ነጭ ሽንኩርት/qullubbii adii, በርበሬ/barbaree) infusions
     * Biological controls from indigenous plants
   - Cite traditional farming wisdom from Ethiopian highland/lowland practices

5. ORGANIC & AGROECOLOGICAL SOLUTIONS
   - Recommend certified organic treatments (OMRI-listed or equivalent)
   - Compost tea preparation and beneficial microbe inoculation
   - Integrated Pest Management (IPM) strategies
   - Crop diversification and companion planting specific to Ethiopian crops

6. PREVENTION & INTEGRATED MANAGEMENT
   - Preventive measures considering Ethiopian rainy seasons (Kiremt/ክረምት, Belg/በልግ)
   - Crop rotation schedules suitable for Ethiopian smallholder farms (0.5-2 hectares)
   - Water management during rainy and dry seasons
   - Early warning signs and scouting protocols
   - Post-harvest residue management

Format your response EXACTLY as:

ENGLISH: [Comprehensive expert advice, 4-6 sentences with specific active ingredients, dosages, and scientific rationale]

AMHARIC: [Clear practical translation, 3-4 sentences]

OROMOO: [Clear practical translation, 3-4 sentences]

TRADITIONAL: [Detailed traditional remedy protocols with preparation and application instructions, 3-4 sentences]

ORGANIC: [Specific organic treatment recommendations with application rates and frequency, 3-4 sentences]

PREVENTION: [Integrated prevention strategy with seasonal timing and cultural practices, 3-4 sentences]

Be specific, actionable, and scientifically rigorous. Prioritize solutions accessible to Ethiopian smallholder farmers."""

    try:
        response = _model.generate_content(prompt)
        return _parse_response(response.text.strip(), base_treatment)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {**_FALLBACK, "english": base_treatment, "traditional": base_treatment,
                "amharic": "የጀሚኒ ኤፒአይ ስህተት።", "oromoo": "Dogoggora Gemini API."}


def _parse_response(text: str, base_treatment: str) -> dict:
    sections = {k: "" for k in ["amharic", "english", "oromoo", "traditional", "organic", "prevention"]}
    key_map = {
        "AMHARIC": "amharic", "ENGLISH": "english", "OROMOO": "oromoo",
        "TRADITIONAL": "traditional", "ORGANIC": "organic", "PREVENTION": "prevention"
    }
    current = None
    for line in text.split('\n'):
        line = line.strip()
        matched = False
        for prefix, key in key_map.items():
            if line.startswith(f"{prefix}:"):
                current = key
                sections[key] = line[len(prefix)+1:].strip()
                matched = True
                break
        if not matched and current and line:
            sections[current] += ' ' + line

    if not sections["english"]:
        sections["english"] = base_treatment
    return sections


def translate_to_amharic(text: str) -> str:
    if not _model:
        return text
    try:
        response = _model.generate_content(
            f"Translate this agricultural advice to natural Amharic: {_sanitize(text)}",
        )
        return response.text.strip()
    except Exception:
        return text
