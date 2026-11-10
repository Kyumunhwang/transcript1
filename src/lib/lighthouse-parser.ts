import { CourseLevel, GpaScaleRule, TranscriptCourse } from '@/types';

export interface ParsedCourse {
  class_title: string;
  course_level: CourseLevel;
  letter_grade: string;
  credits: number;
  is_included_in_simulation?: boolean;
}

export interface ParsedTerm {
  term_title: string;
  academic_year: string;
  semester_type: 'Semester 1' | 'Semester 2' | 'Summer';
  grade_level: number;
  gradelink_term_gpa: number;
  gradelink_term_credits: number;
  courses: ParsedCourse[];
}

export const DEFAULT_GPA_SCALE: GpaScaleRule[] = [
  { letter_grade: 'A+', base_points: 4.0, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'A', base_points: 4.0, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'A-', base_points: 3.7, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'B+', base_points: 3.3, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'B', base_points: 3.0, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'B-', base_points: 2.7, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'C+', base_points: 2.3, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'C', base_points: 2.0, ap_bonus: 1.0, honors_bonus: 0.5 },
  { letter_grade: 'D', base_points: 1.0, ap_bonus: 0.0, honors_bonus: 0.0 },
  { letter_grade: 'F', base_points: 0.0, ap_bonus: 0.0, honors_bonus: 0.0 },
];

/**
 * 1. 과목명(Class Title)에서 AP / Honors / Regular 등급 자동 감지
 */
export function detectCourseLevel(classTitle: string): CourseLevel {
  const normalized = classTitle.trim().toUpperCase();
  if (normalized.startsWith('AP ') || normalized.includes('(AP)') || normalized.includes('APEX')) {
    return 'AP';
  }
  if (normalized.startsWith('HONORS ') || normalized.includes('HONORS') || normalized.startsWith('H-')) {
    return 'Honors';
  }
  return 'Regular';
}

/**
 * 2. 학교 맞춤형 GPA 자체 시뮬레이션 계산기
 * (Credits 및 AP +1.0 / Honors +0.5 가중치 커스텀 반영)
 */
export function simulateLighthouseGpa(
  courses: (ParsedCourse | TranscriptCourse)[],
  scaleRules: GpaScaleRule[] = DEFAULT_GPA_SCALE
): { unweightedGpa: number; weightedGpa: number; totalCredits: number } {
  const ruleMap = new Map(scaleRules.map((r) => [r.letter_grade.toUpperCase().trim(), r]));

  let totalCredits = 0;
  let unweightedQualityPoints = 0;
  let weightedQualityPoints = 0;

  for (const course of courses) {
    // 0학점 과목이거나 시뮬레이션 제외 과목은 패스
    if (course.is_included_in_simulation === false || course.credits <= 0) continue;

    const cleanGrade = course.letter_grade.replace(/\s+/g, '').toUpperCase();
    const rule = ruleMap.get(cleanGrade);
    if (!rule) continue;

    const base = rule.base_points;
    let bonus = 0;
    if (course.course_level === 'AP') bonus = rule.ap_bonus;
    else if (course.course_level === 'Honors') bonus = rule.honors_bonus;

    totalCredits += course.credits;
    unweightedQualityPoints += base * course.credits;
    weightedQualityPoints += (base + bonus) * course.credits;
  }

  return {
    unweightedGpa: totalCredits > 0 ? Number((unweightedQualityPoints / totalCredits).toFixed(3)) : 0,
    weightedGpa: totalCredits > 0 ? Number((weightedQualityPoints / totalCredits).toFixed(3)) : 0,
    totalCredits: Number(totalCredits.toFixed(3)),
  };
}

/**
 * 3. Gradelink Official Transcript PDF 추출 텍스트 / CSV 자동 파서
 */
export function parseGradelinkTranscriptText(rawText: string) {
  const nameMatch = rawText.match(/Name:\s*([A-Z\s,]+)/i);
  const birthMatch = rawText.match(/Birth Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const parentMatch = rawText.match(/Parent\/Guardian:\s*([^\n\r]+)/i);
  const gradDateMatch = rawText.match(/Graduation Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  const cumGpaMatch = rawText.match(/Cumulative GPA:\s*(\d+\.\d+)/i);
  const cumCreditsMatch = rawText.match(/Cumulative Credits:\s*(\d+\.\d+)/i);

  return {
    english_name: nameMatch ? nameMatch[1].trim() : 'UNKNOWN',
    birth_date: birthMatch ? birthMatch[1] : null,
    parent_names: parentMatch ? parentMatch[1].trim() : null,
    graduation_date: gradDateMatch ? gradDateMatch[1] : null,
    gradelink_unweighted_gpa: cumGpaMatch ? parseFloat(cumGpaMatch[1]) : 0,
    gradelink_cumulative_credits: cumCreditsMatch ? parseFloat(cumCreditsMatch[1]) : 0,
  };
}

/**
 * 4. 교무실 Student Records (Google Docs PDF / CSV) 자동 파서
 */
export function parseStudentRecordDocText(rawText: string) {
  const termMatch = rawText.match(/(Semester\s+\d+\s+\d{4}-\d{4})/i);
  const studentMatch = rawText.match(/([A-Z,\s-]+)\s*\(([가-힣]+)\)/);
  const caHoursMatch = rawText.match(/Curricular Activities[\s\S]*?Hours\s+(\d+)/i);
  const teacherMatch = rawText.match(/Homeroom Teacher Comment\s*-\s*([^\n\r]+)/i);

  return {
    term_title: termMatch ? termMatch[1] : 'Semester 2 2024-2025',
    english_name: studentMatch ? studentMatch[1].trim() : '',
    korean_name: studentMatch ? studentMatch[2].trim() : '',
    ca_hours: caHoursMatch ? parseFloat(caHoursMatch[1]) : 0,
    homeroom_teacher_name: teacherMatch ? teacherMatch[1].trim() : '',
  };
}
