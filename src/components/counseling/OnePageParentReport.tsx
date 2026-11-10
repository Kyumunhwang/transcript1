'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  Info,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  UserCheck,
  Trophy,
  Globe,
  Users,
  Compass,
} from 'lucide-react';
import { StudentMaster } from '@/types';

interface OnePageParentReportProps {
  student: StudentMaster;
  onSwitchStudent?: (key: string) => void;
  activeKey?: string;
  allStudents?: Record<string, StudentMaster>;
}

// Single Student Printable Sheet Component
function PrintableStudentReportSheet({ student }: { student: StudentMaster }) {
  const totalActivityHours = student.studentRecord.student_activities.reduce(
    (acc, curr) => acc + curr.hours,
    0
  );

  // Standardized Tests Parsing
  const satTest = student.standardizedTests.find((t) => t.test_type === 'SAT');
  const toeflTest = student.standardizedTests.find((t) => t.test_type === 'TOEFL');
  const apTests = student.standardizedTests.filter((t) => t.test_type === 'AP');

  return (
    <div className="a4-print-sheet mx-auto max-w-[210mm] rounded-xl border border-slate-300 bg-white p-7 text-slate-900 shadow-md print:m-0 print:max-w-none print:border-none print:p-0 print:shadow-none break-after-page mb-8 print:mb-0">
      {/* 1. 상단 공식 학교 헤더 */}
      <div className="flex items-center justify-between border-b-2 border-primary-container pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-white font-bold text-xl">
            LIS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-secondary">
                Lighthouse International School
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                CEEB: 682019
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              1:1 진로·진학 상담 공식 종합 리포트
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Official Academic Counseling &amp; Holistic Portfolio Transcript
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-600 space-y-0.5">
          <p>
            <span className="font-semibold text-slate-700">상담 일자:</span> {student.counselingLog.counseling_date}
          </p>
          <p>
            <span className="font-semibold text-slate-700">담당 카운슬러:</span> {student.advisor_name}
          </p>
          <p>
            <span className="font-semibold text-slate-700">참석자:</span> {student.counselingLog.attendees}
          </p>
        </div>
      </div>

      {/* 2. 학생 기본 정보 & GPA/이수학점 핵심 메트릭스 바 */}
      <div className="mt-3.5 grid grid-cols-4 gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <div className="border-r border-slate-200 pr-2">
          <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Student / Grade
          </span>
          <p className="mt-0.5 text-sm font-extrabold text-slate-900">
            {student.korean_name}{' '}
            <span className="text-xs font-normal text-slate-600">({student.english_name})</span>
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            Grade {student.current_grade} • Class {student.homeroom_class} ({student.student_code})
          </p>
        </div>

        <div className="border-r border-slate-200 px-2">
          <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            GPA (Unweighted / Weighted)
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base font-extrabold text-primary-container">
              {student.gradelink_unweighted_gpa.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              / {student.simulated_weighted_gpa.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Gradelink 공식 환산 기준
          </p>
        </div>

        <div className="border-r border-slate-200 px-2">
          <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Earned Credits
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900">
              {student.gradelink_cumulative_credits.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500">/ 24.0+ req.</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">졸업 이수 요건 충족 중</p>
        </div>

        <div className="pl-2">
          <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Extracurricular Hours
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900">
              {(student.studentRecord.ca_hours + totalActivityHours).toFixed(1)}h
            </span>
            <span className="text-[10px] text-slate-500">총 비교과</span>
          </div>
          <p className="text-[10px] text-slate-500">
            CA {student.studentRecord.ca_hours}h + 활동 {totalActivityHours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* 3. 수상 내역 & 공인 시험 성적 (Standardized Tests) 2분할 섹션 */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* 좌측: 교내외 수상 실적 (Awards & Recognitions) */}
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary-container">
              <Award className="h-3.5 w-3.5 text-secondary" />
              <span>교내외 수상 실적 (Awards &amp; Recognitions)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              총 {(student.schoolAwards?.length || 0) + (student.studentRecord.awards?.length || 0)}건
            </span>
          </div>

          {/* 교내 수상 리스트 */}
          <div className="space-y-1 mb-2">
            {student.schoolAwards && student.schoolAwards.length > 0 ? (
              student.schoolAwards.slice(0, 3).map((a, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-slate-800">
                  <span className="flex items-center gap-1 font-medium truncate pr-1">
                    <span>🏆</span>
                    <span className="truncate">{a.competition_title}</span>
                  </span>
                  <span className="rounded bg-amber-100 text-amber-900 px-1 py-0.2 text-[9.5px] font-bold shrink-0 font-mono">
                    {a.result}
                  </span>
                </div>
              ))
            ) : student.studentRecord.awards && student.studentRecord.awards.length > 0 ? (
              student.studentRecord.awards.slice(0, 3).map((award, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-slate-800">
                  <span className="flex items-center gap-1 font-medium truncate pr-1">
                    <span>🏆</span>
                    <span className="truncate">{award.title_or_club}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{award.event_date}</span>
                </div>
              ))
            ) : (
              <p className="text-[10.5px] text-slate-400 italic">등록된 교내 수상 내역이 없습니다.</p>
            )}
          </div>

          {/* 외부 활동 간략 표시 */}
          {student.externalActivities && student.externalActivities.length > 0 && (
            <div className="border-t border-slate-100 pt-1.5">
              <span className="block text-[10px] font-bold uppercase text-blue-900 mb-0.5">
                주요 외부 활동 (External Activities):
              </span>
              <div className="space-y-0.5 text-[10.5px]">
                {student.externalActivities.slice(0, 2).map((ext, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-700">
                    <span className="truncate pr-1">🌐 {ext.activity_title}</span>
                    <span className="text-[9.5px] font-mono text-blue-800 font-semibold shrink-0">
                      {ext.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 우측: 공인 시험 성적 (Standardized Tests) - 5대 핵심 역량(SLO) 자리 대체 */}
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary-container">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                <span>공인 시험 성적 (Standardized Tests)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Official Score Records
              </span>
            </div>

            {/* TOEFL & SAT 점수만 표시 */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded border border-blue-200 bg-blue-50/70 p-1.5 text-center">
                <span className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider">TOEFL</span>
                <span className="text-sm font-black text-blue-950 font-mono">
                  {toeflTest?.total_score ? `TOEFL: ${toeflTest.total_score}` : 'TOEFL: -'}
                </span>
              </div>
              <div className="rounded border border-indigo-200 bg-indigo-50/70 p-1.5 text-center">
                <span className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Digital SAT</span>
                <span className="text-sm font-black text-indigo-950 font-mono">
                  {satTest?.total_score ? `SAT: ${satTest.total_score}` : 'SAT: -'}
                </span>
              </div>
            </div>

            {/* 점수를 취득한 AP Exam Subject와 점수만 기록 */}
            <div>
              <span className="block text-[10px] font-bold text-slate-700 mb-1">
                취득 AP 과목 및 점수 (AP Exam Subjects &amp; Scores):
              </span>
              {apTests.length > 0 ? (
                <div className="space-y-1">
                  {apTests.map((ap, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded bg-slate-50 px-2 py-0.5 border border-slate-200/80 text-[10.5px]"
                    >
                      <span className="font-semibold text-slate-800 truncate pr-1">
                        {ap.subject_name?.startsWith('AP ') ? ap.subject_name : `AP ${ap.subject_name}`}
                      </span>
                      <span className="rounded bg-primary-container text-white px-1.5 py-0.2 text-[10px] font-mono font-bold shrink-0">
                        {ap.total_score}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10.5px] text-slate-400 italic">취득된 AP 시험 성적이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 동아리 및 봉사활동 상세 표 (Student Activities) - 활동/클럽명 (Activity / Club)만 표시 */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-container flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-secondary" />
            <span>주요 동아리·봉사·리더십 활동 상세 (Student Activities &amp; Community Service)</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-medium">
            총 {student.studentRecord.student_activities.length}개 활동
          </span>
        </div>

        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-1 px-3 w-14 text-center">No.</th>
                <th className="py-1 px-3">활동/클럽명 (Activity / Club)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {student.studentRecord.student_activities.map((act, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="py-1 px-3 text-center font-mono text-slate-500 text-[10px]">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-1 px-3 font-semibold text-slate-900">
                    {act.title_or_club}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 1:1 상담 결과 및 향후 로드맵 / 학부모 액션 플랜 */}
      <div className="mt-3 rounded-lg border-2 border-primary-container bg-slate-50/90 p-3">
        <div className="flex items-center justify-between border-b border-primary-container/20 pb-1.5 mb-2">
          <h2 className="text-xs font-extrabold text-primary-container flex items-center gap-1.5 uppercase">
            <Calendar className="h-3.5 w-3.5 text-secondary" />
            <span>금일 1:1 진로·진학 상담 종합 요약 및 차기 학기 실행 과제 (Action Plan)</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">LIS CEEB: 682019</span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-800 leading-normal">
          <div>
            <strong className="text-primary-container">• 목표 대학군 및 진학 로드맵:</strong>{' '}
            <span className="text-slate-700">
              {student.current_grade >= 9
                ? student.counselingLog.target_summary
                : `[Grade ${student.current_grade} 초·중등 진학 준비 단계] 고등학교(G9) 진학 전까지 기초 학업 및 탐구 소양 함양`}
            </span>
          </div>

          <div>
            <strong className="text-primary-container">• 학업 및 GPA/공인시험 권고사항:</strong>{' '}
            <span className="text-slate-700">{student.counselingLog.academic_advice}</span>
          </div>

          {student.counselingLog.extracurricular_advice && (
            <div>
              <strong className="text-primary-container">• 비교과/봉사/리더십 보완 방향:</strong>{' '}
              <span className="text-slate-700">{student.counselingLog.extracurricular_advice}</span>
            </div>
          )}

          <div className="rounded border border-indigo-200 bg-white p-2 mt-1">
            <strong className="block text-primary-container font-extrabold mb-0.5">
              • 학생 및 학부모님 차기 실행 과제 (Action Items for Next Semester):
            </strong>
            <p className="whitespace-pre-line text-slate-800 text-[10.5px]">
              {student.counselingLog.action_items}
            </p>
          </div>
        </div>
      </div>

      {/* 하단 공식 서명란 및 CEEB 인증 푸터 */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-500">
        <div>
          <span>Lighthouse International School Academic Counseling Center • </span>
          <span className="font-mono">Official Transcript Verification System</span>
        </div>
        <div className="flex items-center gap-6">
          <span>상담 교사 확인: __________________ (인)</span>
          <span>학부모 확인: __________________ (인)</span>
        </div>
      </div>
    </div>
  );
}

export function OnePageParentReport({
  student,
  onSwitchStudent,
  activeKey = 'hose',
  allStudents,
}: OnePageParentReportProps) {
  const [printMode, setPrintMode] = useState<'single' | 'class'>('single');
  const [selectedClass, setSelectedClass] = useState<string>(student.homeroom_class || 'H11');

  const handlePrint = () => {
    window.print();
  };

  // Extract all distinct homeroom classes
  const classesList = useMemo(() => {
    if (!allStudents) return [student.homeroom_class || 'H11'];
    const set = new Set<string>();
    Object.values(allStudents).forEach((s) => {
      if (s.homeroom_class) set.add(s.homeroom_class);
    });
    return Array.from(set).sort();
  }, [allStudents, student]);

  // Determine list of students to render
  const studentsToRender: StudentMaster[] = useMemo(() => {
    if (printMode === 'single' || !allStudents) {
      return [student];
    }
    const filtered = Object.values(allStudents).filter(
      (s) => s.homeroom_class === selectedClass
    );
    return filtered.length > 0 ? filtered : [student];
  }, [printMode, selectedClass, allStudents, student]);

  return (
    <div className="w-full">
      {/* 화면에서만 보이고 인쇄 시 숨겨지는 상단 툴바 */}
      <div className="mb-6 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 shadow-sm print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                <span>LIS Academic Counseling</span>
                <span>•</span>
                <span className="font-bold text-primary">A4 원페이지 공식 상담 리포트 인쇄 미리보기</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                담임 교사 및 카운슬러를 위한 개별 학생 인쇄 및 반별 일괄 인쇄 (CEEB: 682019)
              </p>
            </div>

            {/* Print Mode Switcher (개별 학생 vs 반별 일괄 인쇄) */}
            <div className="flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setPrintMode('single')}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-all ${
                  printMode === 'single'
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>학생 개별 인쇄</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('class')}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-all ${
                  printMode === 'class'
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>반별 일괄 인쇄 (Class Batch)</span>
              </button>
            </div>

            {/* If Single Mode: Quick Switcher */}
            {printMode === 'single' && onSwitchStudent && (
              <div className="flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => onSwitchStudent('hose')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                    activeKey === 'hose'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>고호세 (H11)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchStudent('junyoung')}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                    activeKey === 'junyoung'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>황준영 (G12)</span>
                </button>
              </div>
            )}

            {/* If Class Mode: Class Dropdown */}
            {printMode === 'class' && (
              <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-lg border border-outline-variant/60 shadow-xs">
                <span className="text-xs font-bold text-on-surface">출력 학급 선택:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                >
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls} 반 ({allStudents ? Object.values(allStudents).filter((s) => s.homeroom_class === cls).length : 1}명)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-xs font-bold text-on-primary shadow transition-all hover:bg-tertiary-container active:scale-95"
            >
              <Printer className="h-4 w-4 text-primary-fixed" />
              <span>
                {printMode === 'class'
                  ? `${selectedClass}반 전체 ${studentsToRender.length}명 A4 일괄 인쇄`
                  : 'A4 리포트 즉시 인쇄 (Ctrl+P)'}
              </span>
            </button>
          </div>
        </div>

        {/* 인쇄 가이드 배너 */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-secondary" />
            <span>
              <strong>인쇄 최적화 가이드:</strong> 브라우저 인쇄 설정에서 <strong>[배경 그래픽 포함(Background Graphics: On)]</strong>을 활성화하고 여백을 <strong>[기본값 또는 10mm]</strong>로 지정하시면 각 학생별로 정확히 1페이지씩 나누어 출력됩니다.
            </span>
          </div>
          {printMode === 'class' && (
            <span className="rounded bg-primary-container/10 text-primary font-bold px-2 py-0.5 text-xs font-mono shrink-0">
              총 {studentsToRender.length}페이지 연속 인쇄
            </span>
          )}
        </div>
      </div>

      {/* Render Sheets (Single or Batch for Class) */}
      <div className="space-y-6 print:space-y-0">
        {studentsToRender.map((st) => (
          <PrintableStudentReportSheet key={st.id || st.student_code} student={st} />
        ))}
      </div>
    </div>
  );
}
