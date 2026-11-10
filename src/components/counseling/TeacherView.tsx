'use client';

import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  FileText,
  User,
  Users,
  AlertCircle,
  ExternalLink,
  Clock,
  Compass,
  Trophy,
  Globe,
  LayoutDashboard,
  BookMarked,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { StudentMaster, TranscriptCourse, AlumniRecord } from '@/types';
import { GpaSimulator } from './GpaSimulator';
import { CounselingLogbook } from './CounselingLogbook';

interface TeacherViewProps {
  student: StudentMaster;
  allStudents?: Record<string, StudentMaster>;
  activeStudentKey?: string;
  onSelectStudentKey?: (key: string) => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  onNavigateToPrint: () => void;
  onUpdateStudent?: (updated: StudentMaster) => void;
  alumniList?: AlumniRecord[];
}

export function TeacherView({
  student,
  allStudents = {},
  activeStudentKey = 'hose',
  onSelectStudentKey,
  isPrivacyMode,
  onTogglePrivacyMode,
  onNavigateToPrint,
  onUpdateStudent,
  alumniList = [],
}: TeacherViewProps) {
  const [activeTeacherTab, setActiveTeacherTab] = useState<'dashboard' | 'logbook' | 'alumni'>('dashboard');
  
  // Student Category: Current Students vs Alumni
  const [studentCategory, setStudentCategory] = useState<'CURRENT' | 'ALUMNI'>(
    student.is_graduated ? 'ALUMNI' : 'CURRENT'
  );
  
  // Current Student Grade & Class Filters
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  
  // Alumni Filters
  const [alumniYearFilter, setAlumniYearFilter] = useState<string>('ALL');
  const [alumniSearchTerm, setAlumniSearchTerm] = useState<string>('');
  
  const allCourses: TranscriptCourse[] = student.terms.flatMap((t) => t.courses);
  const [currentCounseling, setCurrentCounseling] = useState(student.counselingLog);

  // Sync category when student changes
  React.useEffect(() => {
    setStudentCategory(student.is_graduated ? 'ALUMNI' : 'CURRENT');
  }, [student.is_graduated]);

  // Separate Current Students vs Alumni Students from allStudents
  const currentStudents = React.useMemo(() => {
    return Object.entries(allStudents).filter(([_, s]) => !s.is_graduated);
  }, [allStudents]);

  const alumniStudents = React.useMemo(() => {
    return Object.entries(allStudents).filter(([_, s]) => !!s.is_graduated);
  }, [allStudents]);

  // Distinct Grades among current students
  const distinctGrades = React.useMemo(() => {
    const grades = new Set<number>();
    currentStudents.forEach(([_, s]) => {
      if (s.current_grade) grades.add(s.current_grade);
    });
    return Array.from(grades).sort((a, b) => b - a);
  }, [currentStudents]);

  // Distinct Homeroom Classes for current grade filter
  const distinctHomerooms = React.useMemo(() => {
    const classes = new Set<string>();
    currentStudents.forEach(([_, s]) => {
      if (selectedGradeFilter === 'ALL' || s.current_grade.toString() === selectedGradeFilter) {
        if (s.homeroom_class) classes.add(s.homeroom_class);
      }
    });
    return Array.from(classes).sort();
  }, [currentStudents, selectedGradeFilter]);

  // Filtered Current Students by Grade & Class
  const filteredCurrentStudents = React.useMemo(() => {
    return currentStudents.filter(([_, s]) => {
      const matchesGrade =
        selectedGradeFilter === 'ALL' || s.current_grade.toString() === selectedGradeFilter;
      const matchesClass =
        selectedClassFilter === 'ALL' || s.homeroom_class === selectedClassFilter;
      return matchesGrade && matchesClass;
    });
  }, [currentStudents, selectedGradeFilter, selectedClassFilter]);

  // Filtered Alumni Students by Graduation Year
  const filteredAlumniStudents = React.useMemo(() => {
    return alumniStudents.filter(([_, s]) => {
      if (alumniYearFilter === 'ALL') return true;
      return s.graduation_year?.toString() === alumniYearFilter;
    });
  }, [alumniStudents, alumniYearFilter]);

  // Handle Switch Category
  const handleCategoryChange = (category: 'CURRENT' | 'ALUMNI') => {
    setStudentCategory(category);
    if (category === 'CURRENT') {
      if (filteredCurrentStudents.length > 0 && onSelectStudentKey) {
        onSelectStudentKey(filteredCurrentStudents[0][0]);
      }
    } else {
      if (filteredAlumniStudents.length > 0 && onSelectStudentKey) {
        onSelectStudentKey(filteredAlumniStudents[0][0]);
      }
    }
  };

  // Handle Grade Filter Change
  const handleGradeFilterChange = (grade: string) => {
    setSelectedGradeFilter(grade);
    setSelectedClassFilter('ALL');
    const matched = currentStudents.filter(([_, s]) => {
      return grade === 'ALL' || s.current_grade.toString() === grade;
    });
    if (matched.length > 0 && onSelectStudentKey) {
      onSelectStudentKey(matched[0][0]);
    }
  };

  React.useEffect(() => {
    setCurrentCounseling(student.counselingLog);
  }, [student]);

  const handleCounselingChange = (field: string, value: string) => {
    setCurrentCounseling((prev) => ({ ...prev, [field]: value }));
  };

  const satRecord = student.standardizedTests.find((t) => t.test_type === 'SAT');
  const toeflRecord = student.standardizedTests.find((t) => t.test_type === 'TOEFL');
  const apTests = student.standardizedTests.filter((t) => t.test_type === 'AP');

  const totalExtracurricularHours =
    student.studentRecord.ca_hours +
    student.studentRecord.student_activities.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. TOP BREADCRUMB & METRIC ACCENT STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low px-space-lg py-space-sm rounded-xl shadow-xs border border-outline-variant/30">
        <div className="flex items-center gap-space-sm text-on-surface-variant text-label-md">
          <User className="h-4 w-4 text-primary" />
          <span>LIS CEEB: 682019</span>
          <span className="text-outline-variant font-mono">/</span>
          <span>
            {student.is_graduated
              ? `졸업생 아카이브 (${student.graduation_year || 2021}년도)`
              : `재학생 포트폴리오 (Grade ${student.current_grade} / ${student.homeroom_class})`}
          </span>
          <span className="text-outline-variant font-mono">/</span>
          <span className="font-bold text-primary">Comprehensive Academic Portfolio</span>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface text-data-tabular">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>DB Sync: {student.gradelink_last_updated || '2026-11-01 10:15 KST'}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-secondary text-on-secondary text-label-sm font-semibold shadow-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>교사 전용 기밀 (Confidential)</span>
          </div>
        </div>
      </div>

      {/* 1.5. ENHANCED STUDENT SELECTOR: CURRENT vs ALUMNI & GRADE FILTER */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/40 flex flex-col gap-3">
        {/* Row 1: Student Category Tabs (현재 재학생 vs 졸업생 구분) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant shrink-0">학생 분류:</span>
            <div className="inline-flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/40 shadow-xs">
              <button
                type="button"
                onClick={() => handleCategoryChange('CURRENT')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studentCategory === 'CURRENT'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>현재 재학생 (Current Students)</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  studentCategory === 'CURRENT'
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {currentStudents.length}명
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('ALUMNI')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studentCategory === 'ALUMNI'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>졸업생 (Alumni)</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  studentCategory === 'ALUMNI'
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {alumniStudents.length}명
                </span>
              </button>
            </div>
          </div>

          {/* Active Student Status Tag */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs">
            <span className={`w-2 h-2 rounded-full ${student.is_graduated ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            <span className="text-on-surface-variant">현재 열람:</span>
            <strong className="text-primary font-bold">
              {student.korean_name} ({student.english_name})
            </strong>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              student.is_graduated
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {student.is_graduated
                ? `${student.graduation_year || 2021}년도 졸업`
                : `Grade ${student.current_grade} (${student.homeroom_class})`}
            </span>
          </div>
        </div>

        {/* Row 2: Category Specific Filter & Student Selection */}
        {studentCategory === 'CURRENT' ? (
          /* ================= CURRENT STUDENTS: GRADE & CLASS FILTERS ================= */
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter 1: 학년별 선택 (Grade Filter) */}
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-on-surface-variant">학년(Grade):</span>
                <select
                  value={selectedGradeFilter}
                  onChange={(e) => handleGradeFilterChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="ALL">전체 학년 (All Grades: 1~12)</option>
                  {distinctGrades.map((g) => (
                    <option key={g} value={g.toString()}>
                      Grade {g} ({g}학년{g >= 9 ? ' 고등부' : g >= 6 ? ' 중등부' : ' 초등부'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: 반 선택 (Homeroom Class) */}
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
                <Filter className="h-3.5 w-3.5 text-outline" />
                <span className="text-xs font-bold text-on-surface-variant">반(Class):</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="ALL">전체 학급 (All Classes)</option>
                  {distinctHomerooms.map((c) => (
                    <option key={c} value={c}>
                      {c}반
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 3: 해당 학년/반의 학생 명단 선택 (Student Dropdown) */}
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 flex-1 min-w-[240px]">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-on-surface-variant">학생 명단:</span>
                <select
                  value={activeStudentKey}
                  onChange={(e) => {
                    if (onSelectStudentKey) {
                      onSelectStudentKey(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer w-full"
                >
                  {filteredCurrentStudents.map(([key, s]) => (
                    <option key={key} value={key}>
                      [G{s.current_grade} / {s.homeroom_class}반] {s.korean_name} ({s.english_name}) - {s.student_code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Grade Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-outline mr-1">학년 바로가기:</span>
              <button
                type="button"
                onClick={() => handleGradeFilterChange('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  selectedGradeFilter === 'ALL'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                전체
              </button>
              {distinctGrades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGradeFilterChange(g.toString())}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    selectedGradeFilter === g.toString()
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  G{g}
                </button>
              ))}

              {/* Quick Student Selection Chips within filtered set */}
              <div className="ml-auto hidden xl:flex items-center gap-1">
                <span className="text-[11px] text-outline font-semibold mr-1">명단 빠른선택:</span>
                {filteredCurrentStudents.slice(0, 5).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectStudentKey && onSelectStudentKey(key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                      activeStudentKey === key
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {s.korean_name} (G{s.current_grade})
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= ALUMNI: GRADUATION YEAR & ALUMNI SELECTOR ================= */
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter 1: 졸업년도 선택 */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-on-surface-variant">졸업년도:</span>
              <select
                value={alumniYearFilter}
                onChange={(e) => setAlumniYearFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 졸업년도</option>
                {Array.from(new Set(alumniStudents.map(([_, s]) => s.graduation_year || 2021)))
                  .sort((a, b) => b - a)
                  .map((yr) => (
                    <option key={yr} value={yr.toString()}>
                      {yr}년도 졸업생
                    </option>
                  ))}
              </select>
            </div>

            {/* Dropdown 2: 졸업생 명단 선택 */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 flex-1 min-w-[260px]">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-on-surface-variant">졸업생 명단:</span>
              <select
                value={activeStudentKey}
                onChange={(e) => {
                  if (onSelectStudentKey) {
                    onSelectStudentKey(e.target.value);
                  }
                }}
                className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer w-full"
              >
                {filteredAlumniStudents.map(([key, s]) => (
                  <option key={key} value={key}>
                    [{s.graduation_year || 2021}년도 졸업] {s.korean_name} ({s.english_name}) - {s.student_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Shortcut to Alumni Archive Tab */}
            <button
              type="button"
              onClick={() => setActiveTeacherTab('alumni')}
              className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-all shadow-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>전체 졸업생 진학 현황 아카이브로 이동</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. PRESENTATION / PRIVACY SECURITY RIBBON */}
      {isPrivacyMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-gradient-to-r from-primary-container via-tertiary-container to-primary-container text-on-primary px-space-lg py-space-md rounded-xl shadow-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-headline-sm font-bold tracking-tight text-white">
                  학부모 상담 화면 공유 모드 활성화 (Presentation Mode: ON)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-primary-fixed text-label-sm font-mono">
                  SECURE-STREAM
                </span>
              </div>
              <p className="text-body-sm text-primary-fixed-dim">
                교사용 비공개 기밀 메모, 대외비 추천서 가이드라인, 대학별 내부 합격 컷오프 지표가 안전하게 블라인드 마스킹 처리되었습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTogglePrivacyMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-label-md transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>마스킹 해제 (PIN)</span>
          </button>
        </div>
      )}

      {/* 2.5. SUB-NAVIGATION TABS: DASHBOARD vs 1:1 COUNSELING LOGBOOK */}
      <div className="flex items-center gap-2 border-b-2 border-surface-container overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTeacherTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTeacherTab === 'dashboard'
              ? 'border-primary text-primary bg-surface-container-low rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>1. 종합 학업 및 진학 대시보드 (Dashboard)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTeacherTab('logbook')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTeacherTab === 'logbook'
              ? 'border-primary text-primary bg-surface-container-low rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <BookMarked className="h-4 w-4 text-emerald-700" />
          <span>2. 1:1 진로·진학 상담 기록부 (Counseling Logbook)</span>
          <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-mono px-2 py-0.2 font-bold ml-1">
            {student.counselingHistory?.length || 1}건
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTeacherTab('alumni')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTeacherTab === 'alumni'
              ? 'border-primary text-primary bg-surface-container-low rounded-t-xl shadow-xs'
              : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/40'
          }`}
        >
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>3. 졸업생 진학 현황 (Alumni Archive)</span>
          <span className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono px-2 py-0.2 font-bold ml-1">
            {alumniList.length}명
          </span>
        </button>
      </div>

      {/* RENDER LOGBOOK VIEW */}
      {activeTeacherTab === 'logbook' && (
        <CounselingLogbook
          student={student}
          allStudents={allStudents}
          activeStudentKey={activeStudentKey}
          onSelectStudentKey={onSelectStudentKey}
          onUpdateStudent={onUpdateStudent}
          isPrivacyMode={isPrivacyMode}
        />
      )}

      {/* RENDER DASHBOARD VIEW */}
      {activeTeacherTab === 'dashboard' && (
        <>
          {/* Alumni Highlight Banner */}
          {student.is_graduated && (
            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="h-6 w-6 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      🏛️ 등대국제학교 졸업생 아카이브 ({student.graduation_year || 2021}년도 졸업)
                    </span>
                    <span className="rounded bg-amber-200 px-2 py-0.2 text-[10px] font-bold text-amber-900 font-mono">
                      ALUMNI ARCHIVE
                    </span>
                  </div>
                  <span className="text-xs text-amber-800">
                    {student.korean_name} 학생은 고교 전과정을 성공적으로 이수한 졸업생이며, 대학 진학 결과 및 누적 공식 성적표가 보존되어 있습니다.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTeacherTab('alumni')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all shrink-0 self-start sm:self-auto shadow-2xs"
              >
                <span>졸업생 진학 현황 조회</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Junior Grade Notice Banner (G1 ~ G8) */}
          {!student.is_graduated && student.current_grade < 9 && (
            <div className="rounded-xl bg-sky-50 border border-sky-300 p-4 flex items-center gap-3 text-sky-900 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center shrink-0 shadow-2xs">
                <AlertCircle className="h-5 w-5 text-sky-700" />
              </div>
              <div>
                <span className="font-bold text-sm block">
                  📌 초/중등부 학생 (Grade {student.current_grade}) 기초 학업 관리
                </span>
                <span className="text-xs text-sky-800">
                  대학 관련 상세 정보(지원 목표 대학군, SAT/AP 시험 등)는 고교 9학년(Grade 9) 진학 시점부터 입력 및 포트폴리오 관리가 활성화됩니다.
                </span>
              </div>
            </div>
          )}

          {/* 3. HERO PROFILE & QUICK SUMMARY BANNER */}
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
          {/* Student Identity */}
          <div className="flex items-start sm:items-center gap-space-lg">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-2xl shadow-md">
                {student.korean_name.slice(0, 1)}
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded bg-secondary text-on-secondary text-label-sm font-mono font-bold shadow-xs">
                G{student.current_grade}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-space-sm">
                <h1 className="text-headline-xl font-bold text-primary tracking-tight">
                  {student.korean_name}
                </h1>
                <span className="text-headline-lg font-medium text-on-surface-variant font-mono">
                  ({student.english_name})
                </span>
                <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono font-semibold">
                  {student.student_code}
                </span>
                <span className="text-label-sm px-2 py-0.5 rounded bg-surface-variant text-on-tertiary-fixed-variant font-bold">
                  Homeroom: {student.homeroom_class}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant text-label-md mt-1">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-on-surface font-semibold">Target Major:</span>
                  <span className="text-secondary font-bold">{student.intended_major}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="text-on-surface font-semibold">Target Tier:</span>
                  <span>{student.target_tier}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-on-surface font-semibold">Advisor:</span>
                  <span className="text-primary font-bold">{student.advisor_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-space-sm xl:justify-end">
            <button
              type="button"
              onClick={onNavigateToPrint}
              className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-label-md font-bold text-on-secondary shadow transition-all hover:bg-on-secondary-container active:scale-95"
            >
              <FileText className="h-4 w-4" />
              <span>A4 1:1 상담 리포트 인쇄 뷰</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. THREE CRITICAL DETAIL PANELS: Standardized Tests / Activities / Target Colleges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Panel 1: Standardized Tests Detailed Scores */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                <span className="text-label-lg font-bold text-primary">
                  공인시험 성적 (Standardized Tests)
                </span>
              </div>
              <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-bold text-primary">
                Official Scores
              </span>
            </div>

            <div className="space-y-3">
              {/* SAT Detailed Breakdown */}
              {satRecord && (
                <div className="rounded-lg bg-surface-container-low/70 p-3 border border-outline-variant/20">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-label-md font-bold text-primary">Digital SAT</span>
                    <span className="text-headline-md font-extrabold text-primary font-mono">
                      {satRecord.total_score}{' '}
                      <span className="text-xs font-normal text-on-surface-variant">/ 1600</span>
                    </span>
                  </div>
                  {satRecord.subscores && (
                    <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono pt-1 border-t border-outline-variant/20">
                      <span>EBRW: <strong className="text-primary">{String(satRecord.subscores.EBRW || '-')}</strong></span>
                      <span>Math: <strong className="text-primary">{String(satRecord.subscores.Math || '-')}</strong></span>
                      {satRecord.test_date && <span>일자: {satRecord.test_date}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* TOEFL Detailed Breakdown */}
              {toeflRecord && (
                <div className="rounded-lg bg-surface-container-low/70 p-3 border border-outline-variant/20">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-label-md font-bold text-primary">TOEFL iBT</span>
                    <span className="text-headline-md font-extrabold text-primary font-mono">
                      {toeflRecord.total_score}{' '}
                      <span className="text-xs font-normal text-on-surface-variant">/ 120</span>
                    </span>
                  </div>
                  {toeflRecord.subscores && (
                    <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-mono pt-1 border-t border-outline-variant/20 text-on-surface-variant">
                      <div>R: <strong className="text-primary">{String(toeflRecord.subscores.R || '-')}</strong></div>
                      <div>L: <strong className="text-primary">{String(toeflRecord.subscores.L || '-')}</strong></div>
                      <div>S: <strong className="text-primary">{String(toeflRecord.subscores.S || '-')}</strong></div>
                      <div>W: <strong className="text-primary">{String(toeflRecord.subscores.W || '-')}</strong></div>
                    </div>
                  )}
                </div>
              )}

              {/* AP Subject Scores List */}
              <div>
                <span className="block text-xs font-bold text-on-surface-variant uppercase mb-1.5">
                  AP 교과별 취득 점수 (AP Exam Scores):
                </span>
                <div className="flex flex-col gap-1.5">
                  {apTests.map((ap, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded bg-surface-container-low px-2.5 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                          AP
                        </span>
                        <span className="font-semibold text-on-surface">{ap.subject_name}</span>
                      </div>
                      <span className="rounded bg-primary-container px-2 py-0.5 text-label-sm font-bold text-primary-fixed font-mono">
                        Score {ap.total_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Extracurricular Hours Detailed Activity List */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-label-lg font-bold text-primary">
                  비교과 활동 상세 (Extracurricular Hours)
                </span>
              </div>
              <span className="text-label-sm font-bold text-secondary font-mono">
                총 {totalExtracurricularHours.toFixed(1)} hrs
              </span>
            </div>

            {/* CA Badge */}
            <div className="mb-2.5 rounded-lg bg-amber-50 p-2.5 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">교내 CA (Curricular Activities)</span>
                <span className="text-[11px] text-amber-800">{student.studentRecord.ca_contents.join(', ')}</span>
              </div>
              <span className="text-sm font-mono font-bold text-amber-950">
                {student.studentRecord.ca_hours} hrs
              </span>
            </div>

            {/* Detailed Activity List with Titles and Hours */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {student.studentRecord.student_activities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded bg-surface-container-low px-2.5 py-2 text-xs hover:bg-surface-container transition-colors"
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-bold text-on-surface truncate">{act.title_or_club}</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {act.record_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="rounded bg-surface-container px-2 py-1 font-mono font-bold text-primary-container shrink-0">
                    {act.hours} hrs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Target College Readiness Detailed List (9학년 이상 고등 트랙 전용) */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-700" />
                <span className="text-label-lg font-bold text-primary">
                  지원 목표 대학군 (Target College Readiness)
                </span>
              </div>
              {student.current_grade >= 9 ? (
                <span className="text-label-sm font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {student.counselingLog.target_universities.length}개교
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  G9+ 전용
                </span>
              )}
            </div>

            {student.current_grade < 9 ? (
              <div className="rounded-lg border border-dashed border-outline-variant/50 p-4 text-center bg-surface-container-low/30 my-auto">
                <GraduationCap className="h-8 w-8 text-outline mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-bold text-on-surface">대학 진학 포트폴리오 준비 단계 (Grade {student.current_grade})</p>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  대학 지원 목표 및 전형 준비는 <strong>9학년(G9 High School)</strong>부터 본격 활성화됩니다. 현재는 기초 탐구 및 교내외 비교과 역량에 집중합니다.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {student.counselingLog.target_universities.map((uni, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-outline-variant/20 bg-surface-container-low/50 p-2.5 flex items-center justify-between"
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="text-sm font-bold text-primary truncate">{uni.name}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {uni.round} • {uni.major} ({uni.country})
                      </span>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold font-mono shrink-0 ${
                        uni.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : uni.status === 'Under Review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {uni.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4.5. IN-SCHOOL AWARDS & EXTERNAL ACTIVITIES (교내 수상기록 및 외부 활동) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Panel A: In-School Awards */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <span className="text-label-lg font-bold text-primary">
                  교내 수상기록 (In-School Awards)
                </span>
              </div>
              <span className="text-label-sm font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono">
                {student.schoolAwards?.length || 0}건
              </span>
            </div>

            {(!student.schoolAwards || student.schoolAwards.length === 0) ? (
              <p className="text-xs text-on-surface-variant italic py-4 text-center">
                등록된 교내 수상기록이 없습니다.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {student.schoolAwards.map((award, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-outline-variant/20 bg-surface-container-low/50 p-2.5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                        <span className="text-amber-600">🏆</span>
                        {award.competition_title}
                      </span>
                      <span className="rounded bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-xs font-bold font-mono">
                        {award.result}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{award.memo}</span>
                      <span className="font-mono text-outline shrink-0 ml-2">{award.event_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel B: External Activities */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span className="text-label-lg font-bold text-primary">
                  외부 활동 기록 (External Activities)
                </span>
              </div>
              <span className="text-label-sm font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-mono">
                {student.externalActivities?.length || 0}건
              </span>
            </div>

            {(!student.externalActivities || student.externalActivities.length === 0) ? (
              <p className="text-xs text-on-surface-variant italic py-4 text-center">
                등록된 외부 활동 기록이 없습니다.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {student.externalActivities.map((act, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-outline-variant/20 bg-surface-container-low/50 p-2.5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                        <span className="text-blue-600">🌐</span>
                        {act.activity_title}
                      </span>
                      <span className="rounded bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 text-xs font-bold font-mono">
                        {act.result}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{act.memo}</span>
                      <span className="font-mono text-outline shrink-0 ml-2">{act.event_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE GPA SIMULATOR */}
      <GpaSimulator
        initialCourses={allCourses}
        originalUnweightedGpa={student.gradelink_unweighted_gpa}
        originalCumulativeCredits={student.gradelink_cumulative_credits}
      />

      {/* 6. GRADELINK OFFICIAL TRANSCRIPT ACCORDION */}
      <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm mb-space-md">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-headline-md font-bold text-primary">
              Gradelink 공식 성적표 내역 (Official Transcript Terms)
            </h2>
            <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-semibold text-on-surface">
              총 {student.terms.length}개 학기
            </span>
          </div>
          <span className="text-label-md font-mono text-on-surface-variant">
            CEEB Code: 682019
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {student.terms.map((term, tIdx) => (
            <div
              key={tIdx}
              className="rounded-lg border border-outline-variant/30 bg-surface-container-low/40 p-space-md"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-2">
                <div>
                  <span className="text-label-md font-bold text-primary">{term.term_title}</span>
                  <span className="ml-2 text-label-sm text-on-surface-variant font-mono">
                    Grade {term.grade_level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-label-sm font-bold text-primary-container font-mono">
                    GPA: {term.gradelink_term_gpa.toFixed(2)}
                  </span>
                  <span className="text-bilingual-sub text-on-surface-variant ml-1 font-mono">
                    ({term.gradelink_term_credits.toFixed(1)} cr)
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {term.courses.map((course, cIdx) => (
                  <div
                    key={cIdx}
                    className="flex items-center justify-between text-body-sm py-0.5 hover:bg-surface-container/40 rounded px-1"
                  >
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="truncate">{course.class_title}</span>
                      {course.course_level === 'AP' && (
                        <span className="rounded bg-blue-100 px-1 py-0.1 text-[9px] font-bold text-blue-800">
                          AP
                        </span>
                      )}
                      {course.course_level === 'Honors' && (
                        <span className="rounded bg-purple-100 px-1 py-0.1 text-[9px] font-bold text-purple-800">
                          H
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-label-sm">
                      <span className="font-bold text-primary">{course.letter_grade}</span>
                      <span className="text-on-surface-variant text-[11px]">
                        {course.credits.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. COUNSELING LOGS & CONFIDENTIAL TEACHER MEMO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: SLO & Awards (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm mb-space-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-headline-sm font-bold text-primary">5대 핵심 역량 (SLO) 평가</h3>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-label-sm font-bold text-emerald-800">
                전 영역 E
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-label-sm">
              {Object.entries(student.studentRecord.slo_ratings).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded bg-surface-container-low px-2.5 py-1.5"
                >
                  <span className="text-on-surface-variant">{key.replace('_', ' ')}</span>
                  <span className="font-bold text-emerald-700 font-mono">{val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-body-sm text-slate-800">
              <span className="block text-label-sm font-bold text-amber-900 mb-1">
                담임 교사 총평 ({student.studentRecord.homeroom_teacher_name})
              </span>
              <p className="italic text-[12px] leading-relaxed">
                "{student.studentRecord.homeroom_comment}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Counseling Log & Private Memo (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="rounded-xl border-2 border-primary-container bg-surface-container-lowest p-space-lg shadow-md">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm mb-space-md">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <h3 className="text-headline-sm font-bold text-primary">1:1 진로·진학 상담 기록부</h3>
              </div>
              <span className="text-label-sm font-mono text-on-surface-variant">
                {currentCounseling.counseling_date}
              </span>
            </div>

            <div className="space-y-3 text-body-sm">
              <div>
                <span className="block text-label-sm font-bold text-primary mb-1">
                  • 학업 / GPA 권고사항:
                </span>
                <textarea
                  rows={2}
                  value={currentCounseling.academic_advice}
                  onChange={(e) => handleCounselingChange('academic_advice', e.target.value)}
                  className="w-full rounded border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <span className="block text-label-sm font-bold text-primary mb-1">
                  • 학생/학부모 실행 과제 (Action Plan):
                </span>
                <textarea
                  rows={3}
                  value={currentCounseling.action_items}
                  onChange={(e) => handleCounselingChange('action_items', e.target.value)}
                  className="w-full rounded border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Confidential Teacher Memo (Private) */}
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50/70 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 text-label-sm font-bold text-red-900">
                    <Shield className="h-3.5 w-3.5" />
                    <span>교사 전용 비공개 메모 (Private Memo)</span>
                  </span>
                  <span className="text-[10px] font-bold text-red-700 uppercase">
                    학부모 열람 불가
                  </span>
                </div>

                {isPrivacyMode ? (
                  <div className="rounded bg-red-100/80 p-2 text-center text-xs font-mono font-semibold text-red-700">
                    🔒 [학부모 상담 모드 활성화로 마스킹됨]
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={currentCounseling.private_teacher_memo}
                    onChange={(e) => handleCounselingChange('private_teacher_memo', e.target.value)}
                    className="w-full rounded border border-red-300 bg-white px-2 py-1 text-[11.5px] text-red-950 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )}

  {/* RENDER ALUMNI BASIC ARCHIVE VIEW */}
  {activeTeacherTab === 'alumni' && (
    <section className="flex flex-col gap-space-md">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-title-lg font-bold text-on-surface">
              졸업생 진학 현황 (Alumni Admissions Archive)
            </h2>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            역대 졸업생들의 합격 대학 및 최종 진학 현황을 조회하여 재학생 진학 상담 및 전략 수립에 참고할 수 있습니다.
          </p>
          <p className="text-label-xs text-outline mt-0.5">
            ※ 교사용 뷰에서는 학사 규정에 따라 기본 진학 결과(졸업년도, 학생명, 합격 대학, 최종 등록 대학)만 열람 가능합니다.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/40">
            <Filter className="h-4 w-4 text-outline" />
            <span className="text-xs font-semibold text-on-surface-variant">졸업년도:</span>
            <select
              value={alumniYearFilter}
              onChange={(e) => setAlumniYearFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface focus:outline-none"
            >
              <option value="ALL">전체 연도</option>
              {Array.from(new Set(alumniList.map((a) => a.graduation_year)))
                .sort((a, b) => b - a)
                .map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}년도 졸업
                  </option>
                ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="학생명 또는 대학교명 검색..."
              value={alumniSearchTerm}
              onChange={(e) => setAlumniSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-56"
            />
          </div>
        </div>
      </div>

      {/* Alumni Records List Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                <th className="py-3 px-4 w-28">졸업년도</th>
                <th className="py-3 px-4 w-44">학생명</th>
                <th className="py-3 px-4">지원 및 합격한 대학교 목록 (Accepted Universities)</th>
                <th className="py-3 px-4 w-60">최종 등록(진학) 대학 (Final Enrolled)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {alumniList
                .filter((alumni) => {
                  const matchesYear =
                    alumniYearFilter === 'ALL' ||
                    alumni.graduation_year.toString() === alumniYearFilter;
                  const term = alumniSearchTerm.trim().toLowerCase();
                  if (!term) return matchesYear;

                  const matchesName =
                    alumni.korean_name.toLowerCase().includes(term) ||
                    alumni.english_name.toLowerCase().includes(term);
                  const matchesUniv =
                    alumni.final_enrolled_university.toLowerCase().includes(term) ||
                    alumni.accepted_universities.some((u) =>
                      u.university_name.toLowerCase().includes(term)
                    );
                  return matchesYear && (matchesName || matchesUniv);
                })
                .map((alumni) => (
                  <tr
                    key={alumni.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    {/* Graduation Year */}
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {alumni.graduation_year}년도
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-on-surface text-sm">
                        {alumni.korean_name}
                      </div>
                      <div className="text-[11px] font-mono text-outline">
                        {alumni.english_name}
                      </div>
                    </td>

                    {/* Accepted Universities */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {alumni.accepted_universities.map((univ, idx) => {
                          const isEnrolled =
                            univ.university_name.toLowerCase().trim() ===
                            alumni.final_enrolled_university.toLowerCase().trim();
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                                isEnrolled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                              }`}
                            >
                              <Building className="h-3 w-3 opacity-70" />
                              <span>{univ.university_name}</span>
                              {univ.major && (
                                <span className="opacity-70 text-[10px]">({univ.major})</span>
                              )}
                              {univ.round && (
                                <span className="text-[9.5px] uppercase font-mono px-1 rounded bg-black/5">
                                  {univ.round}
                                </span>
                              )}
                              {isEnrolled && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-0.5" />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Final Enrolled University */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <div>
                          <div>{alumni.final_enrolled_university}</div>
                          {alumni.final_enrolled_major && (
                            <div className="text-[10px] font-normal text-emerald-700">
                              {alumni.final_enrolled_major}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )}
</div>
);
}
