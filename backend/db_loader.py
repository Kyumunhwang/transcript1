"""
Database Loader and Repository Module.
Saves parsed transcript data into PostgreSQL / SQLite tables and local JSON exports.
Supports individual Credit Make-up updates, Extracurriculars, and Counseling Logs.
"""
import re
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.config import get_db_session, DATA_DIR
from backend.models import Student, AcademicTranscript, CourseRecord, ExtracurricularRecord, CounselingLog

EXPORTS_DIR = DATA_DIR / "exports"
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


def generate_student_id(name: str, birth_date: Optional[str] = "") -> str:
    """Generate a normalized deterministic student ID."""
    clean_name = re.sub(r"[^a-zA-Z0-9]+", "_", name.strip()).strip("_")
    clean_dob = re.sub(r"[^0-9]+", "", birth_date or "")
    if clean_dob:
        return f"{clean_name}_{clean_dob}"
    return clean_name


def save_transcript_to_db(data: Dict[str, Any], source_filename: str, current_grade: Optional[int] = None) -> str:
    """
    Upserts student and transcript records in the database.
    Also exports structured JSON to data/exports/.
    """
    session: Session = get_db_session()
    try:
        student_info = data.get("student_info", {})
        cumulative_stats = data.get("cumulative_stats", {})
        academic_records = data.get("academic_records", [])

        name = student_info.get("name", "Unknown").strip()
        birth_date = student_info.get("birth_date", "")
        student_id = generate_student_id(name, birth_date)

        # Detect grade from input or records
        if current_grade is None:
            current_grade = student_info.get("grade_level", 12)
            try:
                current_grade = int(current_grade)
            except Exception:
                current_grade = 12

        # 1. Upsert Student master record
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            student = Student(id=student_id, name=name, current_grade=current_grade)
            session.add(student)

        student.name = name
        student.current_grade = current_grade
        student.birth_date = birth_date
        student.gender = student_info.get("gender")
        student.parent_guardian = student_info.get("parent_guardian")
        student.address = student_info.get("address")
        student.entry_date = student_info.get("entry_date")
        student.withdrawal_date = student_info.get("withdrawal_date")
        student.graduation_date = student_info.get("graduation_date")

        # 2. Add or Replace Academic Transcript record
        session.query(AcademicTranscript).filter(
            AcademicTranscript.student_id == student_id,
            AcademicTranscript.source_filename == source_filename
        ).delete()

        transcript = AcademicTranscript(
            student_id=student_id,
            transcript_date=student_info.get("transcript_date"),
            cumulative_gpa=cumulative_stats.get("unweighted_gpa"),
            cumulative_credits=cumulative_stats.get("cumulative_credits"),
            source_filename=source_filename,
            full_data=data
        )
        session.add(transcript)

        # 3. Clean and insert CourseRecords
        session.query(CourseRecord).filter(CourseRecord.student_id == student_id).delete()

        for rec in academic_records:
            sem_name = rec.get("semester_name", "Unknown Semester")
            sch_name = rec.get("school_name", "Lighthouse International School")
            g_level = str(rec.get("grade_level", ""))

            for crs in rec.get("courses", []):
                course_record = CourseRecord(
                    student_id=student_id,
                    semester_name=sem_name,
                    school_name=sch_name,
                    grade_level=g_level,
                    course_title=crs.get("title", ""),
                    grade=crs.get("grade", ""),
                    credits=crs.get("credits", 0.0),
                    is_makeup=0,
                    notes=None
                )
                session.add(course_record)

        session.commit()

        # 4. Save JSON backup
        export_file = EXPORTS_DIR / f"{student_id}.json"
        with open(export_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return student_id
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def apply_credit_makeup(
    student_id: str,
    course_id: Optional[int],
    semester_name: str,
    course_title: str,
    new_grade: str,
    new_credits: float,
    notes: str,
    updated_gpa: Optional[float] = None,
    updated_cumulative_credits: Optional[float] = None
) -> Dict[str, Any]:
    """
    Applies an individual Credit Make-up grade update for a student mid-semester.
    """
    session: Session = get_db_session()
    try:
        # 1. Update or create CourseRecord
        target_course = None
        if course_id:
            target_course = session.query(CourseRecord).filter(
                CourseRecord.id == course_id,
                CourseRecord.student_id == student_id
            ).first()

        if not target_course:
            target_course = session.query(CourseRecord).filter(
                CourseRecord.student_id == student_id,
                CourseRecord.semester_name == semester_name,
                CourseRecord.course_title == course_title
            ).first()

        if target_course:
            target_course.grade = new_grade
            target_course.credits = new_credits
            target_course.is_makeup = 1
            target_course.notes = notes or "Credit Make-up Program"
        else:
            target_course = CourseRecord(
                student_id=student_id,
                semester_name=semester_name,
                course_title=course_title,
                grade=new_grade,
                credits=new_credits,
                is_makeup=1,
                notes=notes or "Credit Make-up Program"
            )
            session.add(target_course)

        # 2. Update latest AcademicTranscript GPA / Credits if provided
        latest_transcript = session.query(AcademicTranscript).filter(
            AcademicTranscript.student_id == student_id
        ).order_by(AcademicTranscript.id.desc()).first()

        if latest_transcript:
            if updated_gpa is not None:
                latest_transcript.cumulative_gpa = updated_gpa
            if updated_cumulative_credits is not None:
                latest_transcript.cumulative_credits = updated_cumulative_credits

            # Update JSON full_data payload
            full_data = latest_transcript.full_data
            if isinstance(full_data, dict):
                if updated_gpa is not None:
                    full_data.setdefault("cumulative_stats", {})["unweighted_gpa"] = updated_gpa
                if updated_cumulative_credits is not None:
                    full_data.setdefault("cumulative_stats", {})["cumulative_credits"] = updated_cumulative_credits
                latest_transcript.full_data = full_data

        session.commit()
        return {"success": True, "message": "Credit Make-up recorded successfully."}
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def add_extracurricular_record(
    student_id: str,
    category: str,
    title: str,
    score_or_level: str,
    date_achieved: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Adds an extracurricular record (PSAT, SAT, TOEFL, AP, Awards)."""
    session: Session = get_db_session()
    try:
        rec = ExtracurricularRecord(
            student_id=student_id,
            category=category,
            title=title,
            score_or_level=score_or_level,
            date_achieved=date_achieved,
            details=details or {}
        )
        session.add(rec)
        session.commit()
        return {"success": True, "id": rec.id}
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def add_counseling_log(
    student_id: str,
    counselor_name: str,
    session_date: str,
    topic: str,
    notes: str,
    next_action_items: str = ""
) -> Dict[str, Any]:
    """Adds a new student counseling log session."""
    session: Session = get_db_session()
    try:
        log = CounselingLog(
            student_id=student_id,
            counselor_name=counselor_name,
            session_date=session_date,
            topic=topic,
            notes=notes,
            next_action_items=next_action_items
        )
        session.add(log)
        session.commit()
        return {"success": True, "id": log.id}
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
