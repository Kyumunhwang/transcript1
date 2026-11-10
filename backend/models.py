"""
Database and Pydantic Data Models for Lighthouse International School SIS.
Supports PostgreSQL (with JSONB) and SQLite (with JSON) compatibility.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy import (
    Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# ==========================================
# SQLAlchemy ORM Models
# ==========================================

class Student(Base):
    """Student master table."""
    __tablename__ = "students"

    id = Column(String(100), primary_key=True)  # Normalized unique key e.g. 'HAN_Yewon_20080107'
    name = Column(String(100), nullable=False, index=True)
    current_grade = Column(Integer, default=12, nullable=False, index=True)  # Grade 1 to 12
    birth_date = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    parent_guardian = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    entry_date = Column(String(50), nullable=True)
    withdrawal_date = Column(String(50), nullable=True)
    graduation_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transcripts = relationship("AcademicTranscript", back_populates="student", cascade="all, delete-orphan")
    courses = relationship("CourseRecord", back_populates="student", cascade="all, delete-orphan")
    extracurriculars = relationship("ExtracurricularRecord", back_populates="student", cascade="all, delete-orphan")
    counseling_logs = relationship("CounselingLog", back_populates="student", cascade="all, delete-orphan")


class AcademicTranscript(Base):
    """Academic transcript summary and full payload table."""
    __tablename__ = "academic_transcripts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(100), ForeignKey("students.id"), nullable=False, index=True)
    transcript_date = Column(String(50), nullable=True)
    cumulative_gpa = Column(Float, nullable=True)
    cumulative_credits = Column(Float, nullable=True)
    source_filename = Column(String(255), nullable=True)
    full_data = Column(JSON, nullable=False)  # Stores entire structured transcript payload
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="transcripts")


class CourseRecord(Base):
    """Normalized semester course grade record."""
    __tablename__ = "course_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(100), ForeignKey("students.id"), nullable=False, index=True)
    semester_name = Column(String(100), nullable=False)
    school_name = Column(String(150), default="Lighthouse International School")
    grade_level = Column(String(20), nullable=True)
    course_title = Column(String(150), nullable=False)
    grade = Column(String(10), nullable=False)
    credits = Column(Float, nullable=True)
    is_makeup = Column(Integer, default=0)  # 1 if updated via Credit Make-up program
    notes = Column(String(255), nullable=True)  # e.g., 'Credit Make-up Summer 2026'
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="courses")


class ExtracurricularRecord(Base):
    """Non-academic tests and awards record (PSAT, SAT, TOEFL, AP, Awards)."""
    __tablename__ = "extracurricular_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(100), ForeignKey("students.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # 'PSAT', 'SAT', 'TOEFL', 'AP', 'AWARD_INTERNAL', 'AWARD_EXTERNAL'
    title = Column(String(200), nullable=False)
    score_or_level = Column(String(100), nullable=True)
    date_achieved = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="extracurriculars")


class CounselingLog(Base):
    """Counseling notes and history for student meetings."""
    __tablename__ = "counseling_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(100), ForeignKey("students.id"), nullable=False, index=True)
    counselor_name = Column(String(100), nullable=False)
    session_date = Column(String(50), nullable=False)
    topic = Column(String(200), nullable=False)
    notes = Column(Text, nullable=False)
    next_action_items = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="counseling_logs")


# ==========================================
# Pydantic Schemas for Parsing & Validation
# ==========================================

class StudentInfoSchema(BaseModel):
    name: str
    grade_level: Optional[int] = 12
    birth_date: Optional[str] = ""
    gender: Optional[str] = ""
    parent_guardian: Optional[str] = ""
    address: Optional[str] = ""
    entry_date: Optional[str] = ""
    withdrawal_date: Optional[str] = ""
    graduation_date: Optional[str] = ""
    transcript_date: Optional[str] = ""


class CumulativeStatsSchema(BaseModel):
    unweighted_gpa: Optional[float] = 0.0
    cumulative_credits: Optional[float] = 0.0


class CourseItemSchema(BaseModel):
    title: str
    grade: str
    credits: Optional[float] = 0.0


class AcademicRecordSchema(BaseModel):
    semester_name: str
    school_name: Optional[str] = "Lighthouse International School"
    grade_level: Optional[Any] = None
    semester_gpa: Optional[float] = None
    semester_credits: Optional[float] = None
    courses: List[CourseItemSchema] = Field(default_factory=list)


class GraduationRequirementSchema(BaseModel):
    category: str
    required_units: Optional[float] = 0.0
    earned_units: Optional[float] = 0.0


class TranscriptPayloadSchema(BaseModel):
    student_info: StudentInfoSchema
    cumulative_stats: CumulativeStatsSchema
    academic_records: List[AcademicRecordSchema] = Field(default_factory=list)
    graduation_requirements: List[GraduationRequirementSchema] = Field(default_factory=list)
