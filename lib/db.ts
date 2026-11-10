import fs from 'fs';
import path from 'path';

export interface Student {
  id: string;
  name: string;
  current_grade: number;
  birth_date: string;
  gender: string;
  parent_guardian: string;
  address?: string;
  entry_date?: string;
  withdrawal_date?: string;
  graduation_date?: string;
  gpa?: number;
  credits?: number;
  source_file?: string;
  has_transcript?: boolean;
  extracurricular_count?: number;
  counseling_count?: number;
}

export interface Course {
  id?: number;
  student_id: string;
  semester_name: string;
  school_name: string;
  grade_level?: string;
  course_title: string;
  grade: string;
  credits: number;
  is_makeup?: number;
  notes?: string;
}

export interface Extracurricular {
  id: number;
  student_id: string;
  category: string;
  title: string;
  score_or_level: string;
  date_achieved: string;
  details?: any;
}

export interface CounselingLogItem {
  id: number;
  student_id: string;
  counselor_name: string;
  session_date: string;
  topic: string;
  notes: string;
  next_action_items?: string;
}

export interface StudentDetail extends Student {
  transcript_data?: any;
  courses: Course[];
  extracurriculars: Extracurricular[];
  counseling_logs: CounselingLogItem[];
}

export interface GradeSummary {
  grade: number;
  label: string;
  division: 'Elementary' | 'Middle' | 'High';
  total_students: number;
  transcripts_uploaded: number;
  missing_transcripts: number;
  missing_extracurricular: number;
  missing_counseling: number;
  avg_gpa: number | null;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'lighthouse_sis.db');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

/**
 * Returns all students with transcript, extracurricular, and counseling counts.
 */
export async function getStudents(): Promise<Student[]> {
  try {
    if (fs.existsSync(DB_PATH)) {
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(DB_PATH);
      const query = db.prepare(`
        SELECT 
          s.id, s.name, COALESCE(s.current_grade, 12) as current_grade,
          s.birth_date, s.gender, s.parent_guardian, s.address,
          s.entry_date, s.graduation_date,
          t.cumulative_gpa as gpa, t.cumulative_credits as credits, t.source_filename as source_file,
          CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END as has_transcript,
          (SELECT COUNT(*) FROM extracurricular_records e WHERE e.student_id = s.id) as extracurricular_count,
          (SELECT COUNT(*) FROM counseling_logs c WHERE c.student_id = s.id) as counseling_count
        FROM students s
        LEFT JOIN (
          SELECT id, student_id, cumulative_gpa, cumulative_credits, source_filename,
                 ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY id DESC) as rn
          FROM academic_transcripts
        ) t ON s.id = t.student_id AND t.rn = 1
        ORDER BY s.current_grade DESC, s.name ASC
      `);
      const rawRows = query.all() as any[];
      return rawRows.map(row => ({
        id: String(row.id || ''),
        name: String(row.name || ''),
        current_grade: Number(row.current_grade || 12),
        birth_date: String(row.birth_date || ''),
        gender: String(row.gender || ''),
        parent_guardian: String(row.parent_guardian || ''),
        address: String(row.address || ''),
        entry_date: String(row.entry_date || ''),
        graduation_date: String(row.graduation_date || ''),
        gpa: row.gpa !== null && row.gpa !== undefined ? Number(row.gpa) : undefined,
        credits: row.credits !== null && row.credits !== undefined ? Number(row.credits) : undefined,
        source_file: row.source_file ? String(row.source_file) : undefined,
        has_transcript: Boolean(row.has_transcript),
        extracurricular_count: Number(row.extracurricular_count || 0),
        counseling_count: Number(row.counseling_count || 0),
      }));
    }
  } catch (err) {
    console.warn('[DB Adapter] SQLite query failed, falling back to JSON files:', err);
  }

  // Fallback to exports
  if (fs.existsSync(EXPORTS_DIR)) {
    const files = fs.readdirSync(EXPORTS_DIR).filter(f => f.endsWith('.json'));
    const list: Student[] = [];
    for (const f of files) {
      const content = JSON.parse(fs.readFileSync(path.join(EXPORTS_DIR, f), 'utf-8'));
      const sInfo = content.student_info || {};
      const stats = content.cumulative_stats || {};
      list.push({
        id: path.basename(f, '.json'),
        name: sInfo.name || 'Unknown',
        current_grade: Number(sInfo.grade_level || 12),
        birth_date: sInfo.birth_date || '',
        gender: sInfo.gender || '',
        parent_guardian: sInfo.parent_guardian || '',
        address: sInfo.address || '',
        gpa: stats.unweighted_gpa,
        credits: stats.cumulative_credits,
        source_file: f,
        has_transcript: true,
        extracurricular_count: 0,
        counseling_count: 0,
      });
    }
    return list;
  }

  return [];
}

/**
 * Returns grade-by-grade overview for all 12 grades (Grade 1 to Grade 12).
 * Highlights missing transcripts, missing extracurricular records, and missing counseling.
 */
export async function getGradeSummaries(): Promise<GradeSummary[]> {
  const students = await getStudents();

  const summaries: GradeSummary[] = [];

  for (let g = 1; g <= 12; g++) {
    const gradeStudents = students.filter(s => s.current_grade === g);
    const total = gradeStudents.length;

    let division: 'Elementary' | 'Middle' | 'High' = 'High';
    if (g <= 5) division = 'Elementary';
    else if (g <= 8) division = 'Middle';

    const uploaded = gradeStudents.filter(s => s.has_transcript).length;
    const missingTranscripts = total - uploaded;
    const missingExtracurricular = gradeStudents.filter(s => (s.extracurricular_count || 0) === 0).length;
    const missingCounseling = gradeStudents.filter(s => (s.counseling_count || 0) === 0).length;

    const gpas = gradeStudents.map(s => s.gpa).filter((v): v is number => typeof v === 'number' && v > 0);
    const avgGpa = gpas.length > 0 ? Number((gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(3)) : null;

    summaries.push({
      grade: g,
      label: `Grade ${g}`,
      division,
      total_students: total,
      transcripts_uploaded: uploaded,
      missing_transcripts: missingTranscripts,
      missing_extracurricular: missingExtracurricular,
      missing_counseling: missingCounseling,
      avg_gpa: avgGpa,
    });
  }

  // Return Grade 12 down to Grade 1 (or Grade 1 to 12)
  return summaries.reverse();
}

/**
 * Returns students for a specific grade.
 */
export async function getStudentsByGrade(grade: number): Promise<Student[]> {
  const all = await getStudents();
  return all.filter(s => s.current_grade === grade);
}

/**
 * Returns comprehensive student detail: transcript, courses, extracurriculars, counseling logs.
 */
export async function getStudentById(id: string): Promise<StudentDetail | null> {
  const students = await getStudents();
  const student = students.find(s => s.id === id);
  if (!student) return null;

  let courses: Course[] = [];
  let transcriptData: any = null;
  let extracurriculars: Extracurricular[] = [];
  let counseling_logs: CounselingLogItem[] = [];

  try {
    if (fs.existsSync(DB_PATH)) {
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(DB_PATH);

      // Courses
      const courseQuery = db.prepare(`
        SELECT id, student_id, semester_name, school_name, grade_level, course_title, grade, credits, is_makeup, notes
        FROM course_records
        WHERE student_id = ?
        ORDER BY id ASC
      `);
      const rawCourses = courseQuery.all(id) as any[];
      courses = rawCourses.map(c => ({
        id: Number(c.id),
        student_id: String(c.student_id),
        semester_name: String(c.semester_name),
        school_name: String(c.school_name || 'Lighthouse International School'),
        grade_level: c.grade_level ? String(c.grade_level) : undefined,
        course_title: String(c.course_title),
        grade: String(c.grade),
        credits: Number(c.credits || 0),
        is_makeup: Number(c.is_makeup || 0),
        notes: c.notes ? String(c.notes) : undefined,
      }));

      // Academic Transcript
      const transQuery = db.prepare(`
        SELECT full_data FROM academic_transcripts
        WHERE student_id = ?
        ORDER BY id DESC LIMIT 1
      `);
      const row = transQuery.get(id) as any;
      if (row && row.full_data) {
        transcriptData = typeof row.full_data === 'string' ? JSON.parse(row.full_data) : row.full_data;
      }

      // Extracurriculars
      const extraQuery = db.prepare(`
        SELECT id, student_id, category, title, score_or_level, date_achieved, details
        FROM extracurricular_records
        WHERE student_id = ?
        ORDER BY id DESC
      `);
      const rawExtras = extraQuery.all(id) as any[];
      extracurriculars = rawExtras.map(e => ({
        id: Number(e.id),
        student_id: String(e.student_id),
        category: String(e.category),
        title: String(e.title),
        score_or_level: String(e.score_or_level || ''),
        date_achieved: String(e.date_achieved || ''),
        details: e.details ? (typeof e.details === 'string' ? JSON.parse(e.details) : e.details) : {}
      }));

      // Counseling Logs
      const counselQuery = db.prepare(`
        SELECT id, student_id, counselor_name, session_date, topic, notes, next_action_items
        FROM counseling_logs
        WHERE student_id = ?
        ORDER BY id DESC
      `);
      const rawCounsel = counselQuery.all(id) as any[];
      counseling_logs = rawCounsel.map(c => ({
        id: Number(c.id),
        student_id: String(c.student_id),
        counselor_name: String(c.counselor_name),
        session_date: String(c.session_date),
        topic: String(c.topic),
        notes: String(c.notes),
        next_action_items: c.next_action_items ? String(c.next_action_items) : undefined
      }));
    }
  } catch (err) {
    console.warn('[DB Adapter] SQLite student detail query failed:', err);
  }

  // Fallback to JSON file if needed
  if (!transcriptData) {
    const jsonPath = path.join(EXPORTS_DIR, `${id}.json`);
    if (fs.existsSync(jsonPath)) {
      transcriptData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    }
  }

  return {
    ...student,
    transcript_data: transcriptData ? JSON.parse(JSON.stringify(transcriptData)) : null,
    courses,
    extracurriculars,
    counseling_logs
  };
}
