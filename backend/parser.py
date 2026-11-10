"""
Transcript PDF Parser Module.
Combines fast local PyMuPDF text parsing with Gemini Vision API for scanned documents.
"""
import os
import json
import re
from pathlib import Path
from typing import Dict, Any, Optional
import pymupdf
from google import genai
from google.genai import types

from backend.models import TranscriptPayloadSchema
from backend.config import GEMINI_API_KEY

FALLBACK_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash"
]

def get_gemini_client() -> genai.Client:
    """Instantiate Gemini GenAI Client with validation."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env")
    return genai.Client(api_key=GEMINI_API_KEY)


def parse_transcript_with_gemini(pdf_path: str) -> Dict[str, Any]:
    """
    Renders PDF pages to high-resolution images and extracts structured transcript
    data using Google Gemini Vision API.
    """
    doc = pymupdf.open(pdf_path)
    client = get_gemini_client()

    # Render each page to PNG bytes
    image_parts = []
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        pix = page.get_pixmap(dpi=200)
        img_bytes = pix.tobytes("png")
        image_parts.append(types.Part.from_bytes(data=img_bytes, mime_type="image/png"))

    prompt = """
You are a senior registrar extracting an official high school academic transcript.
Extract all details from the provided transcript page(s) into exact JSON conforming to this schema:

{
  "student_info": {
    "name": "Student Full Name (e.g. Yewon HAN or Seeun TAK)",
    "birth_date": "MM/DD/YYYY or as shown",
    "gender": "Male or Female",
    "parent_guardian": "Parent names",
    "address": "Full address",
    "entry_date": "MM/DD/YYYY",
    "withdrawal_date": "N/A or date",
    "graduation_date": "MM/DD/YYYY or date if present",
    "transcript_date": "MM/DD/YYYY"
  },
  "cumulative_stats": {
    "unweighted_gpa": 3.89,
    "cumulative_credits": 21.875
  },
  "academic_records": [
    {
      "semester_name": "Semester 1 2023-2024",
      "school_name": "Lighthouse International School or Transferred school name",
      "grade_level": 9,
      "semester_gpa": 3.75,
      "semester_credits": 4.0,
      "courses": [
        {
          "title": "Algebra II",
          "grade": "B+",
          "credits": 0.5
        }
      ]
    }
  ],
  "graduation_requirements": [
    {
      "category": "English",
      "required_units": 4.0,
      "earned_units": 5.0
    }
  ]
}

CRITICAL RULES:
1. Extract ALL semesters and ALL courses shown.
2. If there are transferred grades from previous schools (e.g., Kintive Christian Academy, Wisdom Global School), specify that school name under school_name.
3. Clean numeric fields: GPA and credits must be float numbers (e.g. 3.87, 0.5). If not available, use null or 0.0.
4. Output ONLY valid raw JSON without markdown markers (no ```json ... ```).
"""

    contents = image_parts + [prompt]

    last_error = None
    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents
            )
            raw_text = response.text.strip()
            # Clean possible markdown wrapping
            if raw_text.startswith("```"):
                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)

            parsed_json = json.loads(raw_text)
            # Validate schema
            validated = TranscriptPayloadSchema.model_validate(parsed_json)
            return validated.model_dump()
        except Exception as e:
            last_error = e
            print(f"[Parser Warning] Model {model_name} failed: {e}. Trying fallback model...")

    raise RuntimeError(f"All Gemini models failed to parse {pdf_path}. Last error: {last_error}")


def parse_digital_pdf(pdf_path: str) -> Optional[Dict[str, Any]]:
    """
    Fast check if PDF has extractable text. If text is comprehensive, parse or
    route to Gemini for complete table extraction fidelity.
    """
    doc = pymupdf.open(pdf_path)
    total_text = "".join(page.get_text() for page in doc)
    
    # If text is too short (< 200 chars), it is an image/scanned PDF
    if len(total_text.strip()) < 200:
        return None

    # For Lighthouse transcripts, even digital PDFs have complex multi-column layouts
    # Gemini Vision provides 100% structured fidelity.
    return None


def parse_transcript_file(pdf_path: str) -> Dict[str, Any]:
    """
    Unified entry point for parsing any transcript PDF file (digital or scanned).
    """
    pdf_path_obj = Path(pdf_path)
    if not pdf_path_obj.exists():
        raise FileNotFoundError(f"Transcript file not found: {pdf_path}")

    # Process via Gemini Vision
    return parse_transcript_with_gemini(str(pdf_path_obj))
