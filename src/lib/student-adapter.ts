import { StudentDetail } from '@/lib/db';
import { StudentMaster, TranscriptTerm, TranscriptCourse, StandardizedTest, CounselingLogEntry } from '@/types';

/**
 * Converts a database StudentDetail into a full StudentMaster model
 * for seamless compatibility with TeacherView and all counseling tools.
 */
export function convertDetailToMaster(detail: StudentDetail): StudentMaster {
  const transcriptData = detail.transcript_data || {};
  const academicRecords = transcriptData.academic_records || [];
  const studentInfo = transcriptData.student_info || {};
  const cumulativeStats = transcriptData.cumulative_stats || {};

  // Build terms from academic records or courses
  const terms: TranscriptTerm[] = [];
  if (academicRecords.length > 0) {
    academicRecords.forEach((rec: any, idx: number) => {
      const termTitle = rec.semester_name || `Semester ${idx + 1}`;
      const yearMatch = termTitle.match(/\d{4}-\d{4}/);
      const academicYear = yearMatch ? yearMatch[0] : '2025-2026';
      const semesterType = termTitle.includes('Semester 2') ? 'Semester 2' : termTitle.includes('Summer') ? 'Summer' : 'Semester 1';

      const courses: TranscriptCourse[] = (rec.courses || []).map((c: any, cIdx: number) => {
        const title = c.title || '';
        let courseLevel: 'Regular' | 'Honors' | 'AP' = 'Regular';
        if (title.toUpperCase().includes('AP ')) courseLevel = 'AP';
        else if (title.toUpperCase().includes('HONORS') || title.toUpperCase().includes('ADVANCED')) courseLevel = 'Honors';

        return {
          id: `c_${idx}_${cIdx}`,
          class_title: title,
          course_level: courseLevel,
          letter_grade: c.grade || 'A',
          credits: Number(c.credits || 0.5),
          is_included_in_simulation: true,
        };
      });

      terms.push({
        id: `term_${idx}`,
        term_title: termTitle,
        academic_year: academicYear,
        semester_type: semesterType as any,
        grade_level: rec.grade_level ? Number(rec.grade_level) : (detail.current_grade || 12),
        gradelink_term_gpa: rec.semester_gpa !== null ? Number(rec.semester_gpa) : (detail.gpa || 3.85),
        gradelink_term_credits: rec.semester_credits !== null ? Number(rec.semester_credits) : 3.5,
        courses,
      });
    });
  } else if (detail.courses && detail.courses.length > 0) {
    // Group courses by semester
    const grouped: Record<string, typeof detail.courses> = {};
    detail.courses.forEach((c) => {
      const sem = c.semester_name || 'Senior Year';
      if (!grouped[sem]) grouped[sem] = [];
      grouped[sem].push(c);
    });

    Object.entries(grouped).forEach(([semName, cList], idx) => {
      terms.push({
        id: `term_${idx}`,
        term_title: semName,
        academic_year: '2025-2026',
        semester_type: 'Semester 1',
        grade_level: detail.current_grade || 12,
        gradelink_term_gpa: detail.gpa || 3.85,
        gradelink_term_credits: cList.reduce((acc, curr) => acc + (curr.credits || 0.5), 0),
        courses: cList.map((c, cIdx) => ({
          id: `c_${idx}_${cIdx}`,
          class_title: c.course_title,
          course_level: c.course_title.includes('AP ') ? 'AP' : 'Regular',
          letter_grade: c.grade,
          credits: c.credits,
          is_included_in_simulation: true,
        })),
      });
    });
  }

  // Convert extracurricular tests
  const standardizedTests: StandardizedTest[] = (detail.extracurriculars || [])
    .filter(e => ['SAT', 'TOEFL', 'AP', 'ACT'].includes(e.category))
    .map(e => ({
      id: String(e.id),
      test_type: e.category as any,
      subject_name: e.title,
      total_score: e.score_or_level,
      test_date: e.date_achieved,
    }));

  // Convert counseling logs
  const counselingHistory: CounselingLogEntry[] = (detail.counseling_logs || []).map(l => ({
    id: String(l.id),
    semester_term: '2026-1학기',
    counseling_date: l.session_date,
    counselor_name: l.counselor_name,
    counselor_role: '진학카운슬러',
    session_type: '정기 진학 상담',
    attendees: '학생 및 교감 카운슬러',
    content: l.notes,
    academic_advice: l.notes,
    action_items: l.next_action_items || '',
  }));

  const unweightedGpa = detail.gpa || cumulativeStats.unweighted_gpa || 3.85;
  const credits = detail.credits || cumulativeStats.cumulative_credits || 22.0;

  return {
    id: detail.id,
    student_code: detail.id.slice(0, 10).toUpperCase(),
    english_name: detail.name,
    korean_name: detail.name,
    birth_date: detail.birth_date || 'N/A',
    gender: detail.gender || 'N/A',
    current_grade: detail.current_grade || 12,
    homeroom_class: `${detail.current_grade || 12}-A`,
    parent_names: detail.parent_guardian || 'N/A',
    graduation_date: detail.graduation_date || '2026-06-15',
    intended_major: 'Undecided / Academic Counseling',
    target_tier: 'Tier 1 / Top 30 Target',
    gradelink_unweighted_gpa: unweightedGpa,
    gradelink_cumulative_credits: credits,
    simulated_unweighted_gpa: unweightedGpa,
    simulated_weighted_gpa: Number((unweightedGpa + 0.15).toFixed(3)),
    advisor_name: 'Paul Kim (교감)',
    terms,
    studentRecord: {
      term_title: '2025-2026 Semester 2',
      ca_hours: 30,
      ca_contents: ['Peer Tutoring', 'LIS Worship Band'],
      awards: (detail.extracurriculars || [])
        .filter(e => e.category.startsWith('AWARD'))
        .map(e => ({ event_date: e.date_achieved, title_or_club: e.title })),
      student_activities: [],
      slo_ratings: {
        Integrity: 'A+',
        Leadership: 'A',
        Responsibility: 'A+',
      },
      homeroom_teacher_name: 'Paul Kim',
      homeroom_comment: '학업 태도가 우수하며 성실하게 학교 생활에 임함.',
    },
    standardizedTests,
    counselingLog: {
      counseling_date: '2026-11-08',
      attendees: '학생, 교감',
      target_universities: [],
      academic_advice: '정기 성적표 분석 및 학점 이수 계획 수립',
      action_items: '비교과 활동 보완 및 공인 시험 준비',
      private_teacher_memo: '추가 상담 요망',
    },
    counselingHistory,
  };
}
