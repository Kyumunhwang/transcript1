"""
Upload Handler Script called by Next.js API.
Parses uploaded files and saves into database with target grade.
"""
import sys
import argparse
import json
from pathlib import Path

# Ensure UTF-8 output
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.config import init_db
from backend.parser import parse_transcript_file
from backend.db_loader import save_transcript_to_db

def main():
    parser = argparse.ArgumentParser(description="Ingest uploaded transcript files.")
    parser.add_argument("--grade", type=int, default=12, help="Target Grade Level (1 to 12)")
    parser.add_argument("files", nargs="+", help="File paths to parse")
    args = parser.parse_args()

    init_db()

    results = []
    success = 0
    failed = 0

    for file_path in args.files:
        p = Path(file_path)
        try:
            data = parse_transcript_file(str(p))
            # Set target grade
            student_id = save_transcript_to_db(data, source_filename=p.name, current_grade=args.grade)
            success += 1
            results.append({"file": p.name, "student_id": student_id, "status": "success"})
        except Exception as e:
            failed += 1
            results.append({"file": p.name, "status": "failed", "error": str(e)})

    # Output pure JSON line at the end
    print(json.dumps({
        "success_count": success,
        "failed_count": failed,
        "details": results
    }))

if __name__ == "__main__":
    main()
