export type CourseLevel = 'Regular' | 'Honors' | 'AP';

export type UserRole = 'admin' | 'counselor' | 'homeroom' | 'student' | 'parent';

export type SystemRole = 'ADMIN' | 'TEACHER' | 'COUNSELOR' | 'STUDENT' | 'PARENT';

export interface ParentInfo {
  relation: 'Father' | 'Mother' | 'Guardian';
  name: string;
  google_account: string;
  phone?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  english_name?: string;
  role: SystemRole;
  google_account: string;
  pin_or_password: string; // 4-digit PIN for student/parent (e.g. "1234") or password for teacher/admin
  status: 'Active' | 'Inactive' | 'Graduated' | 'Alumni';

  // Teacher / Counselor Fields
  title_or_department?: string;
  assigned_grade?: number;
  assigned_class?: string;

  // Student Fields
  student_code?: string;
  grade_level?: number;
  homeroom_class?: string;
  parents?: ParentInfo[];
  student_key?: string; // links to student DB key ('hose', 'junyoung', etc.)
  parent_pin?: string; // 4-digit PIN for parent login (e.g. "1234")

  // Promotion & Graduation Fields
  is_graduated?: boolean;
  graduation_year?: number;

  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  assigned_grade?: number;
  assigned_class?: string;
  next_year_grade?: number;
  can_view_all_students?: boolean;
}

export interface GpaScaleRule {
  letter_grade: string;
  base_points: number;
  ap_bonus: number;
  honors_bonus: number;
}

export interface TranscriptCourse {
  id?: string;
  term_id?: string;
  student_id?: string;
  class_title: string;
  course_level: CourseLevel;
  letter_grade: string;
  credits: number;
  is_included_in_simulation: boolean;
}

export interface TranscriptTerm {
  id?: string;
  student_id?: string;
  term_title: string;
  academic_year: string;
  semester_type: 'Semester 1' | 'Semester 2' | 'Summer';
  grade_level: number;
  gradelink_term_gpa: number;
  gradelink_term_credits: number;
  courses: TranscriptCourse[];
}

export interface StandardizedTest {
  id?: string;
  student_id?: string;
  test_type: 'SAT' | 'TOEFL' | 'AP' | 'ACT' | 'IELTS' | 'DUOLINGO';
  subject_name?: string;
  total_score: string;
  subscores?: Record<string, string | number>;
  test_date?: string;
}

export interface Award {
  event_date: string;
  title_or_club: string;
}

export interface SchoolAward {
  id?: string;
  competition_title: string; // 대회명
  event_date: string;        // 날짜
  result: string;            // 결과
  memo: string;              // 메모
}

export interface ExternalActivity {
  id?: string;
  activity_title: string;    // 참가명
  event_date: string;        // 날짜
  result: string;            // 결과
  memo: string;              // 메모
}

export interface StudentActivity {
  title_or_club: string;
  hours: number;
  record_type: 'Award' | 'Student_Activity' | 'Community_Service' | 'Volunteer' | 'CA';
  content_bullets: string;
  event_date?: string;
}

export interface SloRatings {
  Integrity?: string;
  Enthusiasm?: string;
  Self_Confidence?: string;
  Leadership?: string;
  Motivation?: string;
  Cooperation?: string;
  Humility?: string;
  Maturity?: string;
  Responsibility?: string;
  Perseverance?: string;
  [key: string]: string | undefined;
}

export interface StudentSemesterRecord {
  id?: string;
  student_id?: string;
  term_title: string;
  class_code?: string;
  ca_hours: number;
  ca_contents: string[];
  awards: Award[];
  student_activities: StudentActivity[];
  slo_ratings: SloRatings;
  homeroom_teacher_name: string;
  homeroom_comment: string;
}

export interface TargetUniversity {
  name: string;
  country: string;
  round: 'ED' | 'EA' | 'RD';
  status: 'Accepted' | 'Under Review' | 'Submitted' | 'Waitlisted' | 'Planned';
  major: string;
}

export interface AcceptedUniversityInfo {
  university_name: string;
  country: string;
  major: string;
  round?: 'ED' | 'EA' | 'RD';
  scholarship?: string;
}

export interface AlumniRecord {
  id: string;
  student_code?: string;
  graduation_year: number; // 졸업년도
  korean_name: string; // 학생명 (국문)
  english_name: string; // 학생명 (영문)
  accepted_universities: AcceptedUniversityInfo[]; // 지원해서 합격한 대학교들
  final_enrolled_university: string; // 최종 입학한 대학교
  final_enrolled_major?: string; // 최종 입학 전공
  additional_notes?: string; // 추가 메모 (관리자 전용 상세 메모)
  contact_email?: string;
  created_at?: string;
}

export interface CounselingLog {
  id?: string;
  student_id?: string;
  teacher_id?: string;
  counseling_date: string;
  attendees: string;
  target_summary?: string;
  target_universities: TargetUniversity[];
  academic_advice: string;
  extracurricular_advice?: string;
  action_items: string;
  private_teacher_memo: string;
}

export interface CounselingLogEntry {
  id: string;
  semester_term: string; // e.g. '2026-1학기', '2025-2학기'
  counseling_date: string; // YYYY-MM-DD
  counselor_name: string; // 상담 교사명 (담임 또는 타 교사)
  counselor_role: '담임교사' | '진학카운슬러' | '교과교사' | '부장교사' | '외부멘토';
  session_type: '정기 진학 상담' | '수시/정시 원서 전략' | '학업/GPA 관리' | '비교과/활동 포트폴리오' | '심층/정서 상담';
  attendees: string; // 참석자
  content: string; // 주요 상담 내용
  academic_advice: string; // 학업/성적 조언
  extracurricular_advice?: string; // 비교과 조언
  target_summary?: string; // 목표 대학 요약
  action_items: string; // 차기 실행 과제
  private_teacher_memo?: string; // 교사 비공개 대외비 메모
  created_at?: string;
}

export interface StudentMaster {
  id: string;
  student_code: string;
  english_name: string;
  korean_name: string;
  birth_date: string;
  gender: string;
  current_grade: number;
  homeroom_class: string;
  parent_names: string;
  graduation_date: string;
  intended_major: string;
  target_tier: string;
  gradelink_unweighted_gpa: number;
  gradelink_cumulative_credits: number;
  simulated_unweighted_gpa: number;
  simulated_weighted_gpa: number;
  avatar_url?: string;
  advisor_name: string;
  is_graduated?: boolean;
  graduation_year?: number;
  gradelink_last_updated?: string;
  records_last_updated?: string;
  sync_status?: 'UP_TO_DATE' | 'NEEDS_UPDATE';
  terms: TranscriptTerm[];
  studentRecord: StudentSemesterRecord;
  schoolAwards?: SchoolAward[];
  externalActivities?: ExternalActivity[];
  standardizedTests: StandardizedTest[];
  counselingLog: CounselingLog;
  counselingHistory?: CounselingLogEntry[];
}
