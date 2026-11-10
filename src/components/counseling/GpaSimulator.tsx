'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, RotateCcw, Sparkles, Check, Info } from 'lucide-react';
import { CourseLevel, GpaScaleRule, TranscriptCourse } from '@/types';
import { DEFAULT_GPA_SCALE, simulateLighthouseGpa } from '@/lib/lighthouse-parser';

interface GpaSimulatorProps {
  initialCourses: TranscriptCourse[];
  originalUnweightedGpa: number;
  originalCumulativeCredits: number;
  scaleRules?: GpaScaleRule[];
  onSimulationChange?: (simulated: {
    unweightedGpa: number;
    weightedGpa: number;
    totalCredits: number;
  }) => void;
}

export function GpaSimulator({
  initialCourses,
  originalUnweightedGpa,
  originalCumulativeCredits,
  scaleRules = DEFAULT_GPA_SCALE,
  onSimulationChange,
}: GpaSimulatorProps) {
  const [courses, setCourses] = useState<TranscriptCourse[]>(() =>
    JSON.parse(JSON.stringify(initialCourses))
  );

  // Sync when initialCourses change from master DB
  useEffect(() => {
    setCourses(JSON.parse(JSON.stringify(initialCourses)));
  }, [initialCourses]);

  // Compute live GPA
  const simulation = useMemo(() => {
    const res = simulateLighthouseGpa(courses, scaleRules);
    if (onSimulationChange) {
      onSimulationChange(res);
    }
    return res;
  }, [courses, scaleRules, onSimulationChange]);

  const handleToggleInclude = (index: number) => {
    setCourses((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        is_included_in_simulation: !updated[index].is_included_in_simulation,
      };
      return updated;
    });
  };

  const handleReset = () => {
    setCourses(JSON.parse(JSON.stringify(initialCourses)));
  };

  const gpaDelta = Number((simulation.weightedGpa - originalUnweightedGpa).toFixed(3));

  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-lg shadow-sm">
      {/* Simulator Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-container pb-space-md mb-space-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-primary-fixed shadow-sm">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-headline-md font-bold text-primary">
                등대 자체 GPA 시뮬레이터 (LIS GPA Simulation Engine)
              </h2>
              <span className="rounded bg-secondary-fixed px-2 py-0.5 text-label-sm font-semibold text-on-secondary-fixed-variant">
                Live Engine
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              AP (+1.00) / Honors (+0.50) 맞춤 가중치 및 과목별 시뮬레이션 On/Off 실시간 계산
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/60 px-3 py-1.5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>초기화 (Reset)</span>
        </button>
      </div>

      {/* KPI Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mb-space-md">
        {/* Gradelink Original */}
        <div className="rounded-lg bg-surface-container-low p-space-md border border-outline-variant/20">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block">
            Gradelink Unweighted
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-headline-lg font-bold text-on-surface font-mono">
              {originalUnweightedGpa.toFixed(3)}
            </span>
            <span className="text-body-sm text-on-surface-variant">/ 4.000</span>
          </div>
          <span className="text-bilingual-sub text-on-surface-variant block mt-0.5">
            Gradelink 공식 원본 누적
          </span>
        </div>

        {/* Simulated Unweighted */}
        <div className="rounded-lg bg-surface-container-low p-space-md border border-outline-variant/20">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block">
            Simulated Unweighted
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-headline-lg font-bold text-primary-container font-mono">
              {simulation.unweightedGpa.toFixed(3)}
            </span>
            <span className="text-body-sm text-on-surface-variant">/ 4.000</span>
          </div>
          <span className="text-bilingual-sub text-on-surface-variant block mt-0.5">
            선택 과목 반영 비가중치
          </span>
        </div>

        {/* LIS Weighted GPA */}
        <div className="rounded-lg bg-emerald-50 p-space-md border border-emerald-200">
          <span className="text-label-sm text-emerald-800 font-bold uppercase tracking-wider block">
            LIS Weighted GPA (AP/H)
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-headline-lg font-bold text-emerald-700 font-mono">
              {simulation.weightedGpa.toFixed(3)}
            </span>
            <span className="text-body-sm text-emerald-600 font-mono">
              {gpaDelta >= 0 ? `(+${gpaDelta.toFixed(3)})` : `(${gpaDelta.toFixed(3)})`}
            </span>
          </div>
          <span className="text-bilingual-sub text-emerald-700 block mt-0.5">
            AP +1.0 / Honors +0.5 가중치
          </span>
        </div>

        {/* Total Credits */}
        <div className="rounded-lg bg-surface-container-low p-space-md border border-outline-variant/20">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block">
            Total Credits
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-headline-lg font-bold text-secondary font-mono">
              {simulation.totalCredits.toFixed(3)}
            </span>
            <span className="text-body-sm text-on-surface-variant">학점</span>
          </div>
          <span className="text-bilingual-sub text-on-surface-variant block mt-0.5">
            Gradelink {originalCumulativeCredits.toFixed(1)} 기준
          </span>
        </div>
      </div>

      {/* Admin Mode Management Notice Banner */}
      <div className="mb-space-md flex items-center justify-between rounded-lg bg-surface-container-low/80 p-space-sm border border-outline-variant/30 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5 font-medium">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>
            가상 과목의 신규 추가 및 과목별 속성(레벨/등급/학점) 편집·삭제는{' '}
            <strong className="text-primary font-bold">
              [관리자 모드 &gt; 수동 데이터 입력/관리 &gt; 3. 등대 GPA 시뮬레이터]
            </strong>
            에서 통합 관리됩니다. 본 화면에서는 실시간 반영 여부 체크박스를 온/오프하여 예상 GPA를 자유롭게 시뮬레이션할 수 있습니다.
          </span>
        </span>
      </div>

      {/* Simulator Table */}
      <div className="max-h-[380px] overflow-y-auto rounded-lg border border-outline-variant/30">
        <table className="w-full text-left text-body-sm border-collapse">
          <thead className="sticky top-0 bg-surface-container text-label-sm font-semibold text-on-surface-variant border-b border-outline-variant/30 z-10">
            <tr>
              <th className="p-2.5 w-12 text-center">반영</th>
              <th className="p-2.5">과목명 (Course Title)</th>
              <th className="p-2.5 w-32 text-center">레벨 / 가산점</th>
              <th className="p-2.5 w-28 text-center">취득 등급</th>
              <th className="p-2.5 w-28 text-center">이수 학점</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
            {courses.map((course, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${
                  course.is_included_in_simulation !== false
                    ? 'hover:bg-surface-container-low/50'
                    : 'bg-surface-container-low/30 opacity-60'
                }`}
              >
                <td className="p-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={course.is_included_in_simulation !== false}
                    onChange={() => handleToggleInclude(idx)}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                </td>

                <td className="p-2.5 font-medium text-on-surface">
                  <div className="flex items-center gap-1.5">
                    <span>{course.class_title}</span>
                    {course.course_level === 'AP' && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                        AP (+1.0)
                      </span>
                    )}
                    {course.course_level === 'Honors' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-700">
                        Honors (+0.5)
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-2.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      course.course_level === 'AP'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : course.course_level === 'Honors'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {course.course_level}{' '}
                    {course.course_level === 'AP'
                      ? '(+1.0)'
                      : course.course_level === 'Honors'
                      ? '(+0.5)'
                      : '(+0.0)'}
                  </span>
                </td>

                <td className="p-2.5 text-center">
                  <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-xs">
                    {course.letter_grade}
                  </span>
                </td>

                <td className="p-2.5 text-center font-mono text-xs text-on-surface-variant">
                  {course.credits.toFixed(3)} 학점
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
