import { StudentMaster, TranscriptTerm, TranscriptCourse } from '@/types';
import { simulateLighthouseGpa, DEFAULT_GPA_SCALE } from './lighthouse-parser';

export interface ParsedGradelinkCourseRow {
  transcriptId: string;
  termId: string;
  termTitle: string;
  termStart: string;
  termEnd: string;
  studentId: string;
  gradeLevel: number;
  fname: string;
  mname: string;
  lname: string;
  classId: string;
  classTitle: string;
  classUnits: number;
  unitsEarned: number;
  letterGrade: string;
  percentageGrade: number;
  gpaPoints: number;
  gpaBoost: number;
  calculateGpa: boolean;
}

export interface GradelinkStudentSummary {
  studentId: string;
  koreanName: string;
  englishName: string;
  currentGrade: number;
  homeroomClass: string;
  totalTerms: number;
  totalCourses: number;
  unweightedGpa: number;
  totalEarnedCredits: number;
  terms: TranscriptTerm[];
}

export interface GradelinkParseResult {
  totalRowsProcessed: number;
  totalStudentsFound: number;
  students: Record<string, GradelinkStudentSummary>;
  highSchoolStudents: GradelinkStudentSummary[];
}

/**
 * Robust CSV Line Parser handling quotes and commas
 */
export function parseCsvLines(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/);
  const rows: string[][] = [];

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l].trim();
    if (!line) continue;

    const cols: string[] = [];
    let cur = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === ',' && !inQuote) {
        cols.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    cols.push(cur);
    rows.push(cols);
  }

  return rows;
}

/**
 * Determine Course Level based on Course Title (AP, Honors, Regular)
 */
export function detectCourseLevel(title: string): 'AP' | 'Honors' | 'Regular' {
  const upper = title.toUpperCase();
  if (upper.includes('AP ') || upper.startsWith('AP') || upper.includes('ADVANCED PLACEMENT')) {
    return 'AP';
  }
  if (upper.includes('HONORS') || upper.includes('HONOR') || upper.startsWith('H-') || upper.includes('(H)')) {
    return 'Honors';
  }
  return 'Regular';
}

/**
 * Parse full Gradelink TranscriptExport.csv
 */
export function parseGradelinkTranscriptCsv(csvText: string): GradelinkParseResult {
  const rows = parseCsvLines(csvText);
  if (rows.length < 2) {
    return {
      totalRowsProcessed: 0,
      totalStudentsFound: 0,
      students: {},
      highSchoolStudents: [],
    };
  }

  // Header verification
  const header = rows[0].map((h) => h.replace(/^\uFEFF/, '').trim());
  const idIdx = header.indexOf('StudentID');
  const termTitleIdx = header.indexOf('TermTitle');
  const gradeIdx = header.indexOf('GradeLevel');
  const fnameIdx = header.indexOf('Fname');
  const mnameIdx = header.indexOf('Mname');
  const lnameIdx = header.indexOf('Lname');
  const classTitleIdx = header.indexOf('ClassTitle');
  const unitsEarnedIdx = header.indexOf('UnitsEarned');
  const classUnitsIdx = header.indexOf('ClassUnits');
  const letterGradeIdx = header.indexOf('LetterGrade');
  const calcGpaIdx = header.indexOf('CalculateGPA');

  // Intermediate Student Grouping
  const studentMap = new Map<string, {
    studentId: string;
    fname: string;
    mname: string;
    lname: string;
    grades: Set<number>;
    termsMap: Map<string, {
      termTitle: string;
      gradeLevel: number;
      courses: TranscriptCourse[];
    }>;
  }>();

  let processedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;
    processedCount++;

    const studentId = row[idIdx]?.trim();
    if (!studentId) continue;

    const termTitle = row[termTitleIdx]?.trim() || 'General Term';
    const gradeLevel = parseInt(row[gradeIdx] || '0', 10) || 9;
    const fname = row[fnameIdx]?.trim() || '';
    const mname = row[mnameIdx]?.trim() || '';
    const lname = row[lnameIdx]?.trim() || '';
    const classTitle = row[classTitleIdx]?.trim() || 'Course';
    const letterGrade = row[letterGradeIdx]?.trim() || 'A';
    const unitsEarned = parseFloat(row[unitsEarnedIdx] || row[classUnitsIdx] || '0.5') || 0.5;
    const calcGpa = row[calcGpaIdx] !== '0';

    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        studentId,
        fname,
        mname,
        lname,
        grades: new Set(),
        termsMap: new Map(),
      });
    }

    const st = studentMap.get(studentId)!;
    st.grades.add(gradeLevel);

    if (!st.termsMap.has(termTitle)) {
      st.termsMap.set(termTitle, {
        termTitle,
        gradeLevel,
        courses: [],
      });
    }

    const termObj = st.termsMap.get(termTitle)!;
    const level = detectCourseLevel(classTitle);

    termObj.courses.push({
      class_title: classTitle,
      course_level: level,
      letter_grade: letterGrade,
      credits: unitsEarned,
      is_included_in_simulation: calcGpa,
    });
  }

  // Convert to structured summaries
  const resultStudents: Record<string, GradelinkStudentSummary> = {};
  const highSchoolList: GradelinkStudentSummary[] = [];

  Array.from(studentMap.entries()).forEach(([id, st]) => {
    const gradesArr: number[] = Array.from(st.grades).sort((a: number, b: number) => a - b);
    const maxGrade: number = gradesArr.length > 0 ? gradesArr[gradesArr.length - 1] : 9;

    // Build terms
    const terms: TranscriptTerm[] = [];
    let totalEarnedCredits = 0;
    let totalQualityPoints = 0;
    let totalGpaCredits = 0;

    Array.from(st.termsMap.entries()).forEach(([termTitle, termData]) => {
      let termEarned = 0;
      let termQP = 0;
      let termGpaCr = 0;

      for (const c of termData.courses) {
        termEarned += c.credits;
        if (c.is_included_in_simulation) {
          const rule = DEFAULT_GPA_SCALE.find((r) => r.letter_grade === c.letter_grade);
          const pts = rule ? rule.base_points : 4.0;
          termQP += pts * c.credits;
          termGpaCr += c.credits;
        }
      }

      const termGpa = termGpaCr > 0 ? Number((termQP / termGpaCr).toFixed(2)) : 4.0;

      terms.push({
        term_title: termTitle,
        academic_year: termTitle.replace(/[^0-9-]/g, '').slice(0, 9) || '2024-2025',
        semester_type: termTitle.includes('Semester 1')
          ? 'Semester 1'
          : termTitle.includes('Summer')
          ? 'Summer'
          : 'Semester 2',
        grade_level: termData.gradeLevel,
        gradelink_term_gpa: termGpa,
        gradelink_term_credits: Number(termEarned.toFixed(2)),
        courses: termData.courses,
      });

      totalEarnedCredits += termEarned;
      totalQualityPoints += termQP;
      totalGpaCredits += termGpaCr;
    });

    const unweightedGpa = totalGpaCredits > 0 ? Number((totalQualityPoints / totalGpaCredits).toFixed(3)) : 3.8;

    // Sort terms chronologically by grade level, academic year, and semester
    terms.sort((a, b) => {
      if (a.grade_level !== b.grade_level) {
        return a.grade_level - b.grade_level;
      }
      const yearA = parseInt(a.academic_year.split('-')[0] || '0', 10);
      const yearB = parseInt(b.academic_year.split('-')[0] || '0', 10);
      if (yearA !== yearB) return yearA - yearB;
      const semOrder = (s: string) => (s.includes('1') ? 1 : s.includes('2') ? 2 : 3);
      return semOrder(a.semester_type) - semOrder(b.semester_type);
    });

    // Check Korean name in mname or fname
    const koreanRegex = /[가-힣]/;
    let koreanName = '';
    let englishName = '';

    if (koreanRegex.test(st.mname)) {
      koreanName = st.mname;
      englishName = `${st.fname} ${st.lname}`.trim();
    } else if (koreanRegex.test(st.fname)) {
      koreanName = st.fname;
      englishName = `${st.mname} ${st.lname}`.trim();
    } else {
      // Default mapping for known students
      if (id === '1119') koreanName = '고호세';
      else if (id === '1095') koreanName = '황준영';
      else koreanName = `${st.fname} ${st.lname}`;
      englishName = `${st.fname} ${st.mname ? st.mname + ' ' : ''}${st.lname}`.trim();
    }

    const homeroomClass = `H${maxGrade}`;

    const summary: GradelinkStudentSummary = {
      studentId: id,
      koreanName,
      englishName,
      currentGrade: maxGrade,
      homeroomClass,
      totalTerms: terms.length,
      totalCourses: terms.reduce((acc, t) => acc + t.courses.length, 0),
      unweightedGpa,
      totalEarnedCredits: Number(totalEarnedCredits.toFixed(1)),
      terms,
    };

    resultStudents[id] = summary;
    if (maxGrade >= 9) {
      highSchoolList.push(summary);
    }
  });

  return {
    totalRowsProcessed: processedCount,
    totalStudentsFound: studentMap.size,
    students: resultStudents,
    highSchoolStudents: highSchoolList.sort((a, b) => b.totalCourses - a.totalCourses),
  };
}
