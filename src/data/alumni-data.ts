import { AlumniRecord } from '@/types';

/**
 * Lighthouse International School (CEEB: 682019)
 * Official Alumni Admissions & College Matriculation Archive
 */
export const INITIAL_ALUMNI_RECORDS: AlumniRecord[] = [
  {
    id: 'alumni-2021-001',
    student_code: 'LIS-2021-001',
    graduation_year: 2021,
    korean_name: '황준영',
    english_name: 'JUNYOUNG HWANG',
    accepted_universities: [
      {
        university_name: 'New York University (Stern)',
        country: 'USA',
        major: 'Finance',
        round: 'ED',
        scholarship: 'Dean Honor Scholarship',
      },
      {
        university_name: 'Boston University (Questrom)',
        country: 'USA',
        major: 'Economics',
        round: 'RD',
      },
      {
        university_name: 'UIUC (Gies College of Business)',
        country: 'USA',
        major: 'Finance',
        round: 'EA',
      },
      {
        university_name: 'UC Irvine',
        country: 'USA',
        major: 'Business Administration',
        round: 'RD',
      },
      {
        university_name: 'Penn State University',
        country: 'USA',
        major: 'Economics',
        round: 'EA',
      },
    ],
    final_enrolled_university: 'New York University (Stern School of Business)',
    final_enrolled_major: 'Finance & Data Analytics',
    additional_notes:
      'NYU Stern Early Decision 조기합격 및 최종 등록 완료. 교내 LIS 후배 대상 미국 동부 명문 경영대 진학 멘토링 세션 참여 가능.',
    contact_email: 'junyoung.hwang@alumni.lighthouse.or.kr',
    created_at: '2021-06-25',
  },
  {
    id: 'alumni-2025-001',
    student_code: 'LIS-2025-014',
    graduation_year: 2025,
    korean_name: '이지우',
    english_name: 'JI-WOO LEE',
    accepted_universities: [
      {
        university_name: 'UC Berkeley',
        country: 'USA',
        major: 'Computer Science',
        round: 'RD',
      },
      {
        university_name: 'Georgia Institute of Technology',
        country: 'USA',
        major: 'Computer Science',
        round: 'EA',
      },
      {
        university_name: 'University of Washington',
        country: 'USA',
        major: 'Informatics',
        round: 'RD',
      },
      {
        university_name: 'University of Michigan (Ann Arbor)',
        country: 'USA',
        major: 'Computer Engineering',
        round: 'EA',
      },
    ],
    final_enrolled_university: 'UC Berkeley (College of Computing, Data Science, and Society)',
    final_enrolled_major: 'Computer Science',
    additional_notes:
      'AI 엔지니어링 및 오픈소스 기여 포트폴리오를 통해 UC 버클리 최종 진학. 실리콘밸리 인턴십 연계 및 컴퓨터비전 멘토링 지원.',
    contact_email: 'jiwoo.lee@alumni.lighthouse.or.kr',
    created_at: '2025-06-20',
  },
  {
    id: 'alumni-2025-002',
    student_code: 'LIS-2025-022',
    graduation_year: 2025,
    korean_name: '박서연',
    english_name: 'SEO-YEON PARK',
    accepted_universities: [
      {
        university_name: 'Cornell University',
        country: 'USA',
        major: 'Biological Sciences',
        round: 'ED',
      },
      {
        university_name: 'Johns Hopkins University',
        country: 'USA',
        major: 'Public Health Studies',
        round: 'RD',
      },
      {
        university_name: 'Emory University',
        country: 'USA',
        major: 'Biology',
        round: 'RD',
        scholarship: 'Emory Scholars Nominee',
      },
    ],
    final_enrolled_university: 'Cornell University (College of Agriculture and Life Sciences)',
    final_enrolled_major: 'Biological Sciences (Pre-Med Track)',
    additional_notes:
      '코넬 대학교 Early Decision 조기 합격. 생명과학 및 의학계열 진학 희망 학생 대상 랩 인턴십 에세이 코칭 가능.',
    contact_email: 'seoyeon.park@alumni.lighthouse.or.kr',
    created_at: '2025-06-20',
  },
  {
    id: 'alumni-2024-001',
    student_code: 'LIS-2024-009',
    graduation_year: 2024,
    korean_name: '김민준',
    english_name: 'MIN-JUN KIM',
    accepted_universities: [
      {
        university_name: 'Carnegie Mellon University',
        country: 'USA',
        major: 'School of Computer Science',
        round: 'ED',
      },
      {
        university_name: 'UIUC (Grainger)',
        country: 'USA',
        major: 'Computer Science',
        round: 'EA',
      },
      {
        university_name: 'Purdue University',
        country: 'USA',
        major: 'Computer Engineering',
        round: 'EA',
      },
    ],
    final_enrolled_university: 'Carnegie Mellon University (School of Computer Science)',
    final_enrolled_major: 'Computer Science',
    additional_notes:
      'CMU SCS ED 조기합격. 알고리즘 및 소프트웨어 엔지니어링 분야 학술 역량 최우수 학생.',
    contact_email: 'minjun.kim@alumni.lighthouse.or.kr',
    created_at: '2024-06-22',
  },
  {
    id: 'alumni-2024-002',
    student_code: 'LIS-2024-018',
    graduation_year: 2024,
    korean_name: '최예원',
    english_name: 'YE-WON CHOI',
    accepted_universities: [
      {
        university_name: 'Northwestern University',
        country: 'USA',
        major: 'Journalism & Media',
        round: 'ED',
      },
      {
        university_name: 'University of Southern California (USC)',
        country: 'USA',
        major: 'Annenberg Comm.',
        round: 'RD',
      },
    ],
    final_enrolled_university: 'Northwestern University (Medill School of Journalism)',
    final_enrolled_major: 'Journalism',
    additional_notes:
      '미디어 및 언론 분야 명문 노스웨스턴 메딜 스쿨 최종 진학. 교내 교지 편집장 출신.',
    contact_email: 'yewon.choi@alumni.lighthouse.or.kr',
    created_at: '2024-06-22',
  },
];
