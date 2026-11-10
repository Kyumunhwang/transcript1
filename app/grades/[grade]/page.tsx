import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentsByGrade } from '@/lib/db';
import StudentRoster from '@/components/StudentRoster';
import { ArrowLeft, UploadCloud, Users, Award, GraduationCap, ShieldAlert, LayoutGrid } from 'lucide-react';

interface Props {
  params: Promise<{ grade: string }>;
}

export const revalidate = 0;

export default async function GradeDetailPage({ params }: Props) {
  const { grade: gradeStr } = await params;
  const grade = parseInt(gradeStr, 10);

  if (isNaN(grade) || grade < 1 || grade > 12) {
    notFound();
  }

  const students = await getStudentsByGrade(grade);

  const totalStudents = students.length;
  const validGpas = students.map(s => s.gpa).filter((g): g is number => typeof g === 'number' && g > 0);
  const avgGpa = validGpas.length > 0 ? (validGpas.reduce((a, b) => a + b, 0) / validGpas.length).toFixed(3) : 'N/A';
  
  const validCredits = students.map(s => s.credits).filter((c): c is number => typeof c === 'number' && c > 0);
  const avgCredits = validCredits.length > 0 ? (validCredits.reduce((a, b) => a + b, 0) / validCredits.length).toFixed(1) : 'N/A';

  const missingExtracurricular = students.filter(s => (s.extracurricular_count || 0) === 0).length;
  const missingCounseling = students.filter(s => (s.counseling_count || 0) === 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <Link href="/" className="text-lg font-bold text-on-surface tracking-tight hover:text-secondary transition">
                Lighthouse International School
              </Link>
              <div className="text-xs text-outline font-medium">Grade {grade} Student Directory</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 bg-surface-container text-primary hover:bg-surface-container-high rounded-xl transition border border-outline-variant/40"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>전 학년 누락 현황 대시보드</span>
            </Link>

            <Link
              href={`/upload?grade=${grade}`}
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-xl transition shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Grade {grade} Transcript 업로드</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-outline hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기 (All Grades Overview)</span>
          </Link>
        </div>

        {/* Grade Header */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-on-surface">Grade {grade} 학생 명부</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-surface-container text-primary border border-outline-variant/30">
                {grade <= 5 ? '초등과정 (Elementary)' : grade <= 8 ? '중등과정 (Middle School)' : '고등과정 (High School)'}
              </span>
            </div>
            <p className="text-xs text-outline mt-1">
              학생을 선택하면 성적표, 공인시험, 비교과, 가상 GPA 시뮬레이터 및 1:1 상담 기록을 종합 열람할 수 있는 교사용 뷰 화면으로 이동합니다.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 self-stretch md:self-auto justify-around bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            <div className="text-center px-3">
              <div className="text-[10px] font-bold text-outline uppercase">재학생수</div>
              <div className="text-xl font-black text-on-surface">{totalStudents}명</div>
            </div>
            <div className="h-6 w-px bg-outline-variant/30" />
            <div className="text-center px-3">
              <div className="text-[10px] font-bold text-outline uppercase">평균 GPA</div>
              <div className="text-xl font-black text-primary">{avgGpa}</div>
            </div>
            <div className="h-6 w-px bg-outline-variant/30" />
            <div className="text-center px-3">
              <div className="text-[10px] font-bold text-outline uppercase">평균 학점</div>
              <div className="text-xl font-black text-on-surface">{avgCredits}</div>
            </div>
          </div>
        </div>

        {/* Missing Data Notification Banner for this Grade */}
        {totalStudents > 0 && (missingExtracurricular > 0 || missingCounseling > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Grade {grade} 미기록 데이터 안내: </span>
                {missingExtracurricular > 0 && <span>외부 공인시험/수상 미입력 {missingExtracurricular}명. </span>}
                {missingCounseling > 0 && <span>상담 일지 미작성 {missingCounseling}명.</span>}
              </div>
            </div>
            <span className="text-amber-800 font-semibold shrink-0">학생 카드를 클릭하여 즉시 입력 가능</span>
          </div>
        )}

        {/* Student Roster Component */}
        {totalStudents > 0 ? (
          <StudentRoster students={students} />
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50 p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Grade {grade}에 등록된 성적표가 없습니다.</h3>
              <p className="text-xs text-outline max-w-md mx-auto mt-1">
                Grade {grade}의 공식 Transcript PDF를 업로드하여 학생 성적 및 프로필을 데이터베이스에 구축하세요.
              </p>
            </div>
            <div>
              <Link
                href={`/upload?grade=${grade}`}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-bold transition shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Grade {grade} Transcript 지금 업로드</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
