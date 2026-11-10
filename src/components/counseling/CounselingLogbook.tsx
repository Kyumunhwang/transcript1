'use client';

import React, { useState, useMemo } from 'react';
import {
  BookMarked,
  Plus,
  Calendar,
  User,
  Users,
  Shield,
  ShieldAlert,
  Edit2,
  Trash2,
  Check,
  X,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import { StudentMaster, CounselingLogEntry } from '@/types';

interface CounselingLogbookProps {
  student: StudentMaster;
  allStudents?: Record<string, StudentMaster>;
  activeStudentKey?: string;
  onSelectStudentKey?: (key: string) => void;
  onUpdateStudent?: (updated: StudentMaster) => void;
  isPrivacyMode?: boolean;
}

export function CounselingLogbook({
  student,
  allStudents = {},
  activeStudentKey = 'hose',
  onSelectStudentKey,
  onUpdateStudent,
  isPrivacyMode = false,
}: CounselingLogbookProps) {
  // Counseling history array (fallback to student's counselingLog if empty)
  const historyList: CounselingLogEntry[] = useMemo(() => {
    if (student.counselingHistory && student.counselingHistory.length > 0) {
      return student.counselingHistory;
    }
    // Fallback: derive 1 default entry from existing student.counselingLog
    return [
      {
        id: 'initial-log-01',
        semester_term: '현재 학기',
        counseling_date: student.counselingLog.counseling_date || '2026-03-15',
        counselor_name: student.advisor_name || 'Mr. Danny Pyung',
        counselor_role: '담임교사',
        session_type: '정기 진학 상담',
        attendees: student.counselingLog.attendees || '학생 + 학부모',
        content:
          student.counselingLog.target_summary ||
          '1:1 정기 진로진학 상담을 통해 학생의 학업 성취도 및 비교과 역량을 다각도로 검토함.',
        academic_advice: student.counselingLog.academic_advice || 'GPA 관리 지속 권고',
        extracurricular_advice: student.counselingLog.extracurricular_advice || '',
        action_items: student.counselingLog.action_items || '',
        private_teacher_memo: student.counselingLog.private_teacher_memo || '',
        created_at: '2026-03-15',
      },
    ];
  }, [student]);

  // Student Category & Filters
  const [studentCategory, setStudentCategory] = useState<'CURRENT' | 'ALUMNI'>(
    student.is_graduated ? 'ALUMNI' : 'CURRENT'
  );
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Year & Semester Filter States (오직 상담 년도와 학기만 검색)
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [termFilter, setTermFilter] = useState<string>('ALL');

  // Modal / Form State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CounselingLogEntry>>({
    semester_term: '2026-1학기',
    counseling_date: new Date().toISOString().slice(0, 10),
    counselor_name: student.advisor_name || 'Mr. Danny Pyung',
    counselor_role: '담임교사',
    session_type: '정기 진학 상담',
    attendees: '학생 + 학부모',
    content: '',
    academic_advice: '',
    extracurricular_advice: '',
    action_items: '',
    private_teacher_memo: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync category when student changes
  React.useEffect(() => {
    setStudentCategory(student.is_graduated ? 'ALUMNI' : 'CURRENT');
  }, [student.is_graduated]);

  // Separate Current Students vs Alumni Students
  const currentStudents = useMemo(() => {
    return Object.entries(allStudents).filter(([_, s]) => !s.is_graduated);
  }, [allStudents]);

  const alumniStudents = useMemo(() => {
    return Object.entries(allStudents).filter(([_, s]) => !!s.is_graduated);
  }, [allStudents]);

  // Distinct Grades among current students
  const distinctGrades = useMemo(() => {
    const grades = new Set<number>();
    currentStudents.forEach(([_, s]) => {
      if (s.current_grade) grades.add(s.current_grade);
    });
    return Array.from(grades).sort((a, b) => b - a);
  }, [currentStudents]);

  // Distinct Homeroom Classes
  const distinctHomerooms = useMemo(() => {
    const classes = new Set<string>();
    currentStudents.forEach(([_, s]) => {
      if (selectedGradeFilter === 'ALL' || s.current_grade.toString() === selectedGradeFilter) {
        if (s.homeroom_class) classes.add(s.homeroom_class);
      }
    });
    return Array.from(classes).sort();
  }, [currentStudents, selectedGradeFilter]);

  // Filtered Current Students by Grade & Class
  const filteredCurrentStudents = useMemo(() => {
    return currentStudents.filter(([_, s]) => {
      const matchesGrade =
        selectedGradeFilter === 'ALL' || s.current_grade.toString() === selectedGradeFilter;
      const matchesClass =
        selectedClassFilter === 'ALL' || s.homeroom_class === selectedClassFilter;
      return matchesGrade && matchesClass;
    });
  }, [currentStudents, selectedGradeFilter, selectedClassFilter]);

  // Filtered Alumni Students
  const filteredAlumniStudents = useMemo(() => {
    return alumniStudents;
  }, [alumniStudents]);

  // Handle Switch Category
  const handleCategoryChange = (cat: 'CURRENT' | 'ALUMNI') => {
    setStudentCategory(cat);
    if (cat === 'CURRENT') {
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
  const handleGradeFilterChange = (g: string) => {
    setSelectedGradeFilter(g);
    setSelectedClassFilter('ALL');
    const matched = currentStudents.filter(([_, s]) => {
      return g === 'ALL' || s.current_grade.toString() === g;
    });
    if (matched.length > 0 && onSelectStudentKey) {
      onSelectStudentKey(matched[0][0]);
    }
  };

  // Available Years from counseling records
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    historyList.forEach((log) => {
      if (log.counseling_date) {
        const yr = log.counseling_date.slice(0, 4);
        if (yr) set.add(yr);
      }
    });
    return Array.from(set).sort().reverse();
  }, [historyList]);

  // Available Semester Terms from counseling records
  const availableTerms = useMemo(() => {
    const set = new Set<string>();
    historyList.forEach((log) => {
      if (log.semester_term) set.add(log.semester_term);
    });
    return Array.from(set).sort().reverse();
  }, [historyList]);

  // Distinct Counselors
  const distinctCounselors = useMemo(() => {
    const map = new Map<string, string>();
    historyList.forEach((log) => {
      map.set(log.counselor_name, log.counselor_role);
    });
    return Array.from(map.entries());
  }, [historyList]);

  // Filtered Logs by Year & Semester only
  const filteredLogs = useMemo(() => {
    return historyList.filter((log) => {
      if (yearFilter !== 'ALL') {
        const logYear = log.counseling_date ? log.counseling_date.slice(0, 4) : '';
        if (logYear !== yearFilter) return false;
      }
      if (termFilter !== 'ALL' && log.semester_term !== termFilter) return false;
      return true;
    });
  }, [historyList, yearFilter, termFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingLogId(null);
    setFormData({
      id: `log-${Date.now()}`,
      semester_term: '2026-1학기',
      counseling_date: new Date().toISOString().slice(0, 10),
      counselor_name: student.advisor_name || 'Mr. Danny Pyung',
      counselor_role: '담임교사',
      session_type: '정기 진학 상담',
      attendees: '학생 + 학부모',
      content: '',
      academic_advice: '',
      extracurricular_advice: '',
      action_items: '',
      private_teacher_memo: '',
      created_at: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (log: CounselingLogEntry) => {
    setEditingLogId(log.id);
    setFormData({ ...log });
    setIsModalOpen(true);
  };

  // Delete Log
  const handleDeleteLog = (logId: string) => {
    if (!confirm('이 1:1 상담 기록을 영구 삭제하시겠습니까?')) return;
    const updatedHistory = historyList.filter((l) => l.id !== logId);

    if (onUpdateStudent) {
      onUpdateStudent({
        ...student,
        counselingHistory: updatedHistory,
      });
    }
    setToastMessage('상담 기록이 정상적으로 삭제되었습니다.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save Modal Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content?.trim()) {
      alert('상담 내용은 필수 입력 항목입니다.');
      return;
    }

    let updatedHistory: CounselingLogEntry[];
    if (editingLogId) {
      // Edit existing
      updatedHistory = historyList.map((log) =>
        log.id === editingLogId ? ({ ...log, ...formData } as CounselingLogEntry) : log
      );
    } else {
      // Create new (prepend so latest is first)
      const newEntry: CounselingLogEntry = {
        id: `log-${Date.now()}`,
        semester_term: formData.semester_term || '2026-1학기',
        counseling_date: formData.counseling_date || new Date().toISOString().slice(0, 10),
        counselor_name: formData.counselor_name || student.advisor_name || '교사',
        counselor_role: formData.counselor_role || '담임교사',
        session_type: formData.session_type || '정기 진학 상담',
        attendees: formData.attendees || '학생',
        content: formData.content || '',
        academic_advice: formData.academic_advice || '',
        extracurricular_advice: formData.extracurricular_advice || '',
        action_items: formData.action_items || '',
        private_teacher_memo: formData.private_teacher_memo || '',
        created_at: new Date().toISOString().slice(0, 10),
      };
      updatedHistory = [newEntry, ...historyList];
    }

    // Sort by counseling_date descending
    updatedHistory.sort(
      (a, b) => new Date(b.counseling_date).getTime() - new Date(a.counseling_date).getTime()
    );

    if (onUpdateStudent) {
      // Also sync latest counselingLog for backward-compatibility
      const latest = updatedHistory[0];
      onUpdateStudent({
        ...student,
        counselingHistory: updatedHistory,
        counselingLog: {
          ...student.counselingLog,
          counseling_date: latest.counseling_date,
          attendees: latest.attendees,
          academic_advice: latest.academic_advice,
          extracurricular_advice: latest.extracurricular_advice,
          action_items: latest.action_items,
          private_teacher_memo: latest.private_teacher_memo || student.counselingLog.private_teacher_memo,
        },
      });
    }

    setIsModalOpen(false);
    setToastMessage(
      editingLogId
        ? '1:1 상담 기록이 성공적으로 수정 및 저장되었습니다.'
        : '새 1:1 진로·진학 상담 기록이 데이터베이스에 등록되었습니다.'
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Header & Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-headline-lg font-bold text-primary">
                1:1 진로·진학 상담 기록부 (Counseling Logbook)
              </h1>
              <span className="rounded bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-label-sm font-bold">
                Multi-Counselor Record
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              학생 성명: <strong className="text-primary">{student.korean_name} ({student.english_name})</strong> • 담당 담임교사: <strong>{student.advisor_name}</strong> • 학기별 담임 및 교과·진학 교사 누적 상담 관리
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-label-md font-bold text-on-primary hover:bg-tertiary-container shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 text-primary-fixed" />
            <span>새 1:1 상담 기록 작성</span>
          </button>
        </div>
      </div>

      {/* 1.5. ENHANCED STUDENT SELECTOR: CURRENT vs ALUMNI & GRADE FILTER */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/40 flex flex-col gap-3">
        {/* Row 1: Student Category Tabs (현재 재학생 vs 졸업생 구분) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant shrink-0">상담 대상 분류:</span>
            <div className="inline-flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/40 shadow-xs">
              <button
                type="button"
                onClick={() => handleCategoryChange('CURRENT')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studentCategory === 'CURRENT'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>현재 재학생 (Current Students)</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  studentCategory === 'CURRENT'
                    ? 'bg-white/20 text-white'
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
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>졸업생 (Alumni)</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  studentCategory === 'ALUMNI'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {alumniStudents.length}명
                </span>
              </button>
            </div>
          </div>

          {/* Active Student Status Tag */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${student.is_graduated ? 'bg-amber-500' : 'bg-emerald-600'} animate-pulse`} />
            <span className="text-emerald-900 font-medium">상담 조회 대상:</span>
            <strong className="text-emerald-950 font-bold">
              {student.korean_name} ({student.english_name})
            </strong>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              student.is_graduated
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-200/80 text-emerald-900'
            }`}>
              {student.is_graduated
                ? `${student.graduation_year || 2021}년 졸업`
                : `G${student.current_grade} (${student.homeroom_class}반)`}
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
                <span className="text-xs font-bold text-on-surface-variant">학생 선택:</span>
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
              <span className="text-[11px] font-bold text-outline mr-1">학년 빠른 필터:</span>
              <button
                type="button"
                onClick={() => handleGradeFilterChange('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  selectedGradeFilter === 'ALL'
                    ? 'bg-emerald-800 text-white'
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
                      ? 'bg-emerald-800 text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  G{g}
                </button>
              ))}

              {/* Quick Student Selection Chips within filtered set */}
              <div className="ml-auto hidden xl:flex items-center gap-1">
                <span className="text-[11px] text-outline font-semibold mr-1">학생 빠른선택:</span>
                {filteredCurrentStudents.slice(0, 5).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectStudentKey && onSelectStudentKey(key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                      activeStudentKey === key
                        ? 'border-emerald-600 bg-emerald-100 text-emerald-900 font-bold'
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
            {/* Dropdown: 졸업생 명단 선택 */}
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
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-100 p-3 text-xs font-bold text-emerald-900 border border-emerald-300 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Stats & Participant Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">총 누적 상담 횟수</span>
          <span className="text-2xl font-black text-primary font-mono">{historyList.length}회</span>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">최근 상담 일자</span>
          <span className="text-sm font-bold text-secondary font-mono mt-1 block">
            {historyList[0]?.counseling_date || '-'}
          </span>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">담당 담임 교사</span>
          <span className="text-sm font-bold text-on-surface mt-1 block truncate">
            {student.advisor_name} ({student.homeroom_class})
          </span>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">참여 교사 수</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {distinctCounselors.length}명
          </span>
        </div>
      </div>

      {/* 3. Year & Semester Exclusive Search / Filter Bar (오직 상담 년도와 학기만 검색) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Filter className="h-4 w-4 text-secondary" />
            <span>상담 기간 검색 (Year &amp; Semester Filter):</span>
          </span>

          {/* 1. Year Search Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-on-surface-variant font-semibold">상담 년도:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 연도 (All Years)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}년도 상담
                </option>
              ))}
            </select>
          </div>

          {/* 2. Semester Search Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs">
            <Clock className="h-4 w-4 text-secondary" />
            <span className="text-on-surface-variant font-semibold">상담 학기:</span>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 학기 (All Semesters)</option>
              {availableTerms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>

          {(yearFilter !== 'ALL' || termFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setYearFilter('ALL');
                setTermFilter('ALL');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-outline hover:text-primary transition-colors px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container"
            >
              <RotateCcw className="h-3 w-3" />
              <span>검색 필터 초기화</span>
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-outline self-start sm:self-auto">
          조회 결과: <strong className="text-primary font-bold">{filteredLogs.length}건</strong> / 전체 {historyList.length}건
        </div>
      </div>

      {/* 4. Counseling Records List / Timeline Cards */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest p-10 text-center">
            <BookMarked className="h-10 w-10 text-outline mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-on-surface">일치하는 1:1 상담 기록이 없습니다.</p>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">
              [새 1:1 상담 기록 작성] 버튼을 눌러 첫 상담 일지를 기록해보세요.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-xs font-bold text-on-primary shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>상담 일지 작성하기</span>
            </button>
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-sm hover:border-primary/40 transition-all flex flex-col gap-3"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-container pb-2.5 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded bg-surface-container-low px-2 py-0.5 text-xs font-mono font-bold text-primary">
                    <Calendar className="h-3.5 w-3.5 text-secondary" />
                    <span>{log.counseling_date}</span>
                  </span>

                  <span className="rounded bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface">
                    {log.semester_term}
                  </span>

                  {/* Counselor Badge */}
                  <span
                    className={`rounded px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 ${
                      log.counselor_role === '담임교사'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : log.counselor_role === '진학카운슬러'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    <span>👤</span>
                    <span>
                      {log.counselor_name} ({log.counselor_role})
                    </span>
                  </span>

                  {/* Session Type */}
                  <span className="rounded bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 text-[11px] font-bold">
                    {log.session_type}
                  </span>

                  {/* Attendees */}
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    참석: <strong className="text-on-surface">{log.attendees}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(log)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-secondary" />
                    <span>수정</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                    title="기록 삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-2.5 text-xs text-on-surface">
                {/* 1. Counseling Content */}
                <div>
                  <span className="font-bold text-primary block mb-0.5">
                    • 상담 상세 내용 (Counseling Record):
                  </span>
                  <p className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20 leading-relaxed whitespace-pre-line text-on-surface">
                    {log.content}
                  </p>
                </div>

                {/* 2. Grid: Academic & Extracurricular Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {log.academic_advice && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-2.5">
                      <span className="block font-bold text-blue-950 mb-0.5">
                        • 학업 및 성적/GPA 권고사항 (Academic Advice):
                      </span>
                      <p className="text-[11.5px] text-blue-900 leading-relaxed whitespace-pre-line">
                        {log.academic_advice}
                      </p>
                    </div>
                  )}

                  {log.extracurricular_advice && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5">
                      <span className="block font-bold text-emerald-950 mb-0.5">
                        • 비교과 및 진로 탐색 조언 (Extracurricular Advice):
                      </span>
                      <p className="text-[11.5px] text-emerald-900 leading-relaxed whitespace-pre-line">
                        {log.extracurricular_advice}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Action Items */}
                {log.action_items && (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                    <span className="block font-bold text-indigo-950 mb-0.5">
                      • 차기 학기 학생/학부모 실행 과제 (Action Plan):
                    </span>
                    <p className="text-[11.5px] text-indigo-900 leading-relaxed whitespace-pre-line">
                      {log.action_items}
                    </p>
                  </div>
                )}

                {/* 4. Confidential Teacher Memo */}
                {log.private_teacher_memo && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-0.5">
                      <Shield className="h-3.5 w-3.5 text-amber-800" />
                      <span>[교사 전용 대외비 메모] 타 교사 공유 및 비공개 참고 사항:</span>
                    </div>
                    {isPrivacyMode ? (
                      <p className="text-[11px] text-amber-800 italic">
                        [화면 공유 보호 모드 활성화로 비공개 메모가 숨겨져 있습니다.]
                      </p>
                    ) : (
                      <p className="text-[11.5px] text-amber-900 leading-relaxed italic">
                        {log.private_teacher_memo}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Create / Edit Counseling Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-container p-space-lg bg-surface-container-low/60">
              <div className="flex items-center gap-space-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-title-lg font-bold text-primary">
                    {editingLogId ? '1:1 진로·진학 상담 기록 수정' : '새 1:1 진로·진학 상담 기록 작성'}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    대상 학생: <strong className="text-primary">{student.korean_name} ({student.english_name})</strong> • 담임 및 교과 교사 상담 일지 등록
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                title="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="p-space-lg overflow-y-auto space-y-3.5 text-xs">
              {/* Row 1: Term, Date, Counselor, Role */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-on-surface mb-1">상담 학기 (Term)</label>
                  <input
                    type="text"
                    value={formData.semester_term || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, semester_term: e.target.value }))}
                    placeholder="2026-1학기"
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">상담 일자 (Date)</label>
                  <input
                    type="date"
                    value={formData.counseling_date || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, counseling_date: e.target.value }))}
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">상담 교사명</label>
                  <input
                    type="text"
                    value={formData.counselor_name || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, counselor_name: e.target.value }))}
                    placeholder="Mr. Danny Pyung"
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-bold text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">교사 구분 (Role)</label>
                  <select
                    value={formData.counselor_role || '담임교사'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        counselor_role: e.target.value as any,
                      }))
                    }
                    className="w-full rounded border border-outline-variant/60 bg-white px-2 py-1.5 text-xs font-bold text-primary"
                  >
                    <option value="담임교사">담임교사 (Homeroom)</option>
                    <option value="진학카운슬러">진학 카운슬러</option>
                    <option value="교과교사">교과 지도교사 (Subject)</option>
                    <option value="부장교사">부장/관리교사</option>
                    <option value="외부멘토">외부 멘토</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Session Type & Attendees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-on-surface mb-1">상담 유형 (Session Type)</label>
                  <select
                    value={formData.session_type || '정기 진학 상담'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        session_type: e.target.value as any,
                      }))
                    }
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="정기 진학 상담">정기 진학 상담 (Regular College Counseling)</option>
                    <option value="수시/정시 원서 전략">수시/정시 원서 전략 및 에세이 지도</option>
                    <option value="학업/GPA 관리">학업/성적(GPA) 및 교과 난이도 상담</option>
                    <option value="비교과/활동 포트폴리오">비교과 및 활동 포트폴리오 상담</option>
                    <option value="심층/정서 상담">심층 진로 탐색 및 학교생활/정서 상담</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">참석자 (Attendees)</label>
                  <input
                    type="text"
                    value={formData.attendees || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, attendees: e.target.value }))}
                    placeholder="예: 학생 + 학부모 (고경환/이정은)"
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Content (Required) */}
              <div>
                <label className="block font-bold text-primary mb-1">
                  1:1 상담 상세 기록 (Counseling Content) *
                </label>
                <textarea
                  rows={4}
                  value={formData.content || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="상담에서 논의된 주요 주제, 학생의 진로 희망, 강점 및 보완점 등을 구체적으로 기록하세요..."
                  className="w-full rounded-lg border border-outline-variant/60 bg-white p-2.5 text-xs leading-relaxed focus:outline-none"
                  required
                />
              </div>

              {/* Row 4: Academic & Extracurricular Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    학업 및 성적/GPA 권고사항 (Academic Advice)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.academic_advice || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, academic_advice: e.target.value }))
                    }
                    placeholder="수강 과목 선정, GPA 방어 전략 등"
                    className="w-full rounded-lg border border-outline-variant/60 bg-white p-2 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    비교과/진로 활동 보완 방향 (Extracurricular Advice)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.extracurricular_advice || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        extracurricular_advice: e.target.value,
                      }))
                    }
                    placeholder="동아리, 리더십, 대회 참가 등"
                    className="w-full rounded-lg border border-outline-variant/60 bg-white p-2 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Row 5: Action Items */}
              <div>
                <label className="block font-bold text-indigo-900 mb-1">
                  차기 실행 과제 (Action Plan for Student &amp; Parents)
                </label>
                <textarea
                  rows={2}
                  value={formData.action_items || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, action_items: e.target.value }))}
                  placeholder="1. Common App 에세이 1차 초안 제출&#10;2. 여름방학 프로젝트 포트폴리오 정리"
                  className="w-full rounded-lg border border-indigo-200 bg-indigo-50/30 p-2 text-xs leading-relaxed"
                />
              </div>

              {/* Row 6: Confidential Teacher Memo */}
              <div>
                <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                  <span>[교사 전용 대외비 메모] 타 교사 공유 및 비공개 참고 사항 (Confidential)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.private_teacher_memo || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, private_teacher_memo: e.target.value }))
                  }
                  placeholder="학부모/학생 포털에는 공개되지 않으며 교원들 간에만 공유되는 내부 참고 메모입니다."
                  className="w-full rounded-lg border border-amber-300 bg-amber-50/40 p-2 text-xs leading-relaxed"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-outline-variant/60 bg-white px-4 py-2 font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  취소 (Cancel)
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-container px-6 py-2 font-bold text-on-primary hover:bg-tertiary-container shadow-md transition-all active:scale-95"
                >
                  {editingLogId ? '상담 기록 수정 저장' : '1:1 상담 일지 저장 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
