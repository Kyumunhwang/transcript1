import { UserAccount, SystemRole } from '@/types';

/**
 * Initial Lighthouse International School (CEEB: 682019) User Accounts
 */
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  // 1. Administrators
  {
    id: 'user-admin-01',
    name: 'LIS 관리자 (Admin Office)',
    english_name: 'LIS Academic Administrator',
    role: 'ADMIN',
    google_account: 'admin@lighthouse.or.kr',
    pin_or_password: 'admin2026!',
    status: 'Active',
    title_or_department: '교무처 / 진학관리 총괄',
    created_at: '2026-03-01',
  },

  // 2. Teachers / Counselors
  {
    id: 'user-teacher-01',
    name: 'Danny Pyung (평다니엘 교사)',
    english_name: 'Danny Pyung',
    role: 'COUNSELOR',
    google_account: 'danny.pyung@lighthouse.or.kr',
    pin_or_password: 'teacher2026!',
    status: 'Active',
    title_or_department: 'College Counseling & H11 Homeroom',
    assigned_grade: 11,
    assigned_class: 'H11',
    created_at: '2026-03-01',
  },
  {
    id: 'user-teacher-02',
    name: 'Sarah Kim (김사라 교사)',
    english_name: 'Sarah Kim',
    role: 'TEACHER',
    google_account: 'sarah.kim@lighthouse.or.kr',
    pin_or_password: 'teacher2026!',
    status: 'Active',
    title_or_department: 'English Dept Head & H12 Homeroom',
    assigned_grade: 12,
    assigned_class: 'H12',
    created_at: '2026-03-01',
  },

  // 3. Students (with Parents extracted from Student Profile)
  {
    id: 'user-student-hose',
    name: '고호세',
    english_name: 'HOU-SE KO',
    role: 'STUDENT',
    google_account: 'house.ko@lighthouse.or.kr',
    pin_or_password: '1234', // 4-digit numeric PIN
    parent_pin: '1234',
    status: 'Active',
    student_code: 'LIS-H11-KO',
    grade_level: 11,
    homeroom_class: 'H11',
    student_key: 'hose',
    parents: [
      {
        relation: 'Father',
        name: '고경환',
        google_account: 'father.ko@gmail.com',
        phone: '010-3456-7890',
      },
      {
        relation: 'Mother',
        name: '이정은',
        google_account: 'mother.ko@gmail.com',
        phone: '010-9876-5432',
      },
    ],
    created_at: '2026-03-01',
  },
  {
    id: 'user-student-junyoung',
    name: '황준영',
    english_name: 'JUNYOUNG HWANG',
    role: 'STUDENT',
    google_account: 'junyoung.hwang@lighthouse.or.kr',
    pin_or_password: '1234', // Default 4-digit PIN is 1234
    parent_pin: '1234',
    status: 'Active',
    student_code: 'LIS-2021-001',
    grade_level: 12,
    homeroom_class: 'H12',
    student_key: 'junyoung',
    parents: [
      {
        relation: 'Father',
        name: '황규문',
        google_account: 'father.hwang@gmail.com',
        phone: '010-1234-5678',
      },
      {
        relation: 'Mother',
        name: '김은경',
        google_account: 'mother.hwang@gmail.com',
        phone: '010-8765-4321',
      },
    ],
    created_at: '2026-03-01',
  },
];

/**
 * CSV Template for Teachers
 */
export const TEACHER_CSV_TEMPLATE = `Name,Google_Account,Password,Role,Assigned_Grade,Assigned_Class,Title_Department
Danny Pyung,danny.pyung@lighthouse.or.kr,teacher2026!,COUNSELOR,11,H11,College Counseling & H11 Homeroom
Sarah Kim,sarah.kim@lighthouse.or.kr,teacher2026!,TEACHER,12,H12,English Dept Head & H12 Homeroom
John Doe,john.doe@lighthouse.or.kr,teacher2026!,TEACHER,10,H10,Science Department Head
Admin Office,admin@lighthouse.or.kr,admin2026!,ADMIN,,,Academic Affairs General Admin`;

/**
 * CSV Template for Students & Parents (Includes 2 Parents: Father & Mother)
 */
export const STUDENT_PARENTS_CSV_TEMPLATE = `Student_Code,Student_Name_Ko,Student_Name_En,Grade,Homeroom,Student_Google_Account,Student_PIN,Father_Name,Father_Google_Account,Mother_Name,Mother_Google_Account,Parent_PIN
LIS-H11-KO,고호세,HOU-SE KO,11,H11,house.ko@lighthouse.or.kr,1234,고경환,father.ko@gmail.com,이정은,mother.ko@gmail.com,1234
LIS-2021-001,황준영,JUNYOUNG HWANG,12,H12,junyoung.hwang@lighthouse.or.kr,1234,황규문,father.hwang@gmail.com,김은경,mother.hwang@gmail.com,1234
LIS-2024-003,이지우,JIWOO LEE,10,H10,jiwoo.lee@lighthouse.or.kr,1234,이상훈,father.lee@gmail.com,박미경,mother.lee@gmail.com,1234
LIS-2025-004,김민재,MINJAE KIM,9,H9,minjae.kim@lighthouse.or.kr,1234,김태호,father.kim@gmail.com,정수진,mother.kim@gmail.com,1234`;

/**
 * Verification result for student/parent authentication
 */
export interface AuthVerificationResult {
  success: boolean;
  role?: 'student' | 'parent';
  studentUser?: UserAccount;
  authenticatedName?: string;
  authenticatedEmail?: string;
  errorMessage?: string;
}

/**
 * Verify Student or Parent credentials:
 * Grade -> Student Selected -> Google Account -> 4-Digit PIN
 */
export function verifyStudentOrParent(
  accounts: UserAccount[],
  studentId: string,
  inputGoogleAccount: string,
  inputPin: string
): AuthVerificationResult {
  const targetStudent = accounts.find(
    (u) => u.id === studentId && u.role === 'STUDENT'
  );

  if (!targetStudent) {
    return {
      success: false,
      errorMessage: '선택한 학생 계정을 시스템에서 찾을 수 없습니다.',
    };
  }

  const cleanEmail = inputGoogleAccount.trim().toLowerCase();
  const cleanPin = inputPin.trim();

  // 1. Check if matches Student
  if (
    targetStudent.google_account.toLowerCase() === cleanEmail &&
    targetStudent.pin_or_password === cleanPin
  ) {
    return {
      success: true,
      role: 'student',
      studentUser: targetStudent,
      authenticatedName: `${targetStudent.name} (학생)`,
      authenticatedEmail: targetStudent.google_account,
    };
  }

  // 2. Check if matches Father or Mother
  if (targetStudent.parents && targetStudent.parents.length > 0) {
    const parentPin = targetStudent.parent_pin || targetStudent.pin_or_password;

    for (const parent of targetStudent.parents) {
      if (parent.google_account.toLowerCase() === cleanEmail) {
        if (cleanPin === parentPin || cleanPin === targetStudent.pin_or_password) {
          const relationKo = parent.relation === 'Father' ? '부' : parent.relation === 'Mother' ? '모' : '학부모';
          return {
            success: true,
            role: 'parent',
            studentUser: targetStudent,
            authenticatedName: `${parent.name} (${targetStudent.name} ${relationKo})`,
            authenticatedEmail: parent.google_account,
          };
        } else {
          return {
            success: false,
            errorMessage: '학부모 비밀번호(4자리 숫자 PIN)가 일치하지 않습니다.',
          };
        }
      }
    }
  }

  return {
    success: false,
    errorMessage:
      '입력하신 Google Account 또는 4자리 비밀번호가 일치하지 않습니다. 등록된 이메일을 다시 확인해주세요.',
  };
}
