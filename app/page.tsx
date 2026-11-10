import React from 'react';
import Link from 'next/link';
import { getGradeSummaries } from '@/lib/db';
import {
  AlertTriangle, CheckCircle2, ChevronRight, UploadCloud,
  Users, Award, BookOpen, MessageSquare, ShieldAlert, ArrowUpRight, GraduationCap
} from 'lucide-react';

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  const gradeSummaries = await getGradeSummaries();

  // Aggregate totals
  const totalStudents = gradeSummaries.reduce((acc, g) => acc + g.total_students, 0);
  const totalUploaded = gradeSummaries.reduce((acc, g) => acc + g.transcripts_uploaded, 0);
  const totalMissingTranscripts = gradeSummaries.reduce((acc, g) => acc + g.missing_transcripts, 0);
  const totalMissingExtracurricular = gradeSummaries.reduce((acc, g) => acc + g.missing_extracurricular, 0);
  const totalMissingCounseling = gradeSummaries.reduce((acc, g) => acc + g.missing_counseling, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Navbar */}
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
              <div className="text-xs text-outline font-medium">등대국제학교 학생정보 & 1:1 진로진학 상담시스템</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/students/hose"
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 bg-surface-container text-primary hover:bg-surface-container-high rounded-xl transition border border-outline-variant/40"
            >
              <Users className="w-3.5 h-3.5" />
              <span>교사용 뷰 종합 화면 (Teacher View)</span>
            </Link>

            <Link
              href="/upload"
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-xl transition shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Transcript 업로드 센터</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Vice Principal Executive Header */}
        <div className="bg-gradient-to-r from-primary via-primary-container to-tertiary-container rounded-2xl p-6 sm:p-8 text-on-primary shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30 rounded-full text-xs font-semibold mb-3">
              Vice Principal Academic & Counseling Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              전 학년 누락 현황 대시보드 (School-Wide Records Audit)
            </h1>
            <p className="mt-2 text-sm text-on-primary-container leading-relaxed">
              초등 1학년부터 고등 12학년까지 전 학년의 성적표(Transcript) 업로드율을 점검하고, 
              외부 시험(PSAT/SAT/TOEFL/AP), 교내외 수상, 이전 상담 기록 누락 상태를 실시간 모니터링합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/upload"
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-secondary-container hover:bg-secondary text-on-secondary rounded-xl text-xs font-bold shadow-lg transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>정기 Transcript 일괄 업로드</span>
            </Link>
          </div>
        </div>

        {/* Missing Data Status Metrics Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-on-surface flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-secondary" />
              <span>학년별 미입력 자료 누락 현황 모니터링 (Audit Matrix)</span>
            </h2>
            <span className="text-xs text-outline">Real-time status across Grades 1 ~ 12</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between text-outline text-xs font-semibold">
                <span>전교 등록 학생수</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-2 text-2xl font-black text-on-surface">{totalStudents}</div>
              <div className="text-[11px] text-outline mt-1">12학년 확정자료 및 시드 학생</div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm ${
              totalMissingTranscripts > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-surface-container-lowest border-outline-variant/30'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                <span>성적표 미등록 (Missing)</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-950">{totalMissingTranscripts}</div>
              <div className="text-[11px] text-amber-800/80 mt-1">공식 Transcript PDF 업로드 필요</div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm ${
              totalMissingExtracurricular > 0 ? 'bg-indigo-50/70 border-indigo-200' : 'bg-surface-container-lowest border-outline-variant/30'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                <span>비교과/공인시험 미입력</span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-indigo-950">{totalMissingExtracurricular}</div>
              <div className="text-[11px] text-indigo-800/80 mt-1">PSAT, SAT, TOEFL, AP, 수상</div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm ${
              totalMissingCounseling > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-surface-container-lowest border-outline-variant/30'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
                <span>상담 미실시 (Missing)</span>
                <MessageSquare className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-rose-950">{totalMissingCounseling}</div>
              <div className="text-[11px] text-rose-800/80 mt-1">1:1 상담 일지 미기록 학생</div>
            </div>
          </div>
        </div>

        {/* Grade Selection & Completion Status Grid (Grade 12 down to Grade 1) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">학년별 선택 디렉토리 (Grades 1 to 12)</h2>
              <p className="text-xs text-outline">학년을 선택하면 해당 학년의 학생 명부 및 교사용 뷰 종합 화면으로 연결됩니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gradeSummaries.map((g) => {
              const hasData = g.total_students > 0;

              return (
                <Link
                  key={g.grade}
                  href={`/grades/${g.grade}`}
                  className={`group block p-5 rounded-2xl border transition relative shadow-sm hover:shadow-md ${
                    hasData
                      ? 'bg-surface-container-lowest border-primary/20 hover:border-primary ring-1 ring-primary/5'
                      : 'bg-surface-container-low/70 border-outline-variant/30 hover:border-outline'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-surface-container text-on-surface-variant border border-outline-variant/30">
                        {g.division}
                      </span>
                      <h3 className="text-xl font-black text-on-surface mt-2 group-hover:text-primary transition flex items-center space-x-1">
                        <span>{g.label}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </h3>
                    </div>

                    {hasData ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{g.total_students}명</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-outline bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/20">
                        미등록
                      </span>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs">
                    {hasData ? (
                      <>
                        <div className="flex items-center justify-between text-on-surface-variant">
                          <span>성적표 업로드:</span>
                          <span className="font-bold text-on-surface">{g.transcripts_uploaded} / {g.total_students}</span>
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant">
                          <span>학년 평균 GPA:</span>
                          <span className="font-bold text-primary">{g.avg_gpa !== null ? g.avg_gpa.toFixed(3) : 'N/A'}</span>
                        </div>
                        {g.missing_extracurricular > 0 && (
                          <div className="flex items-center justify-between text-amber-800 bg-amber-50 px-2 py-1 rounded text-[11px] font-semibold">
                            <span>비교과 미입력:</span>
                            <span>{g.missing_extracurricular}건</span>
                          </div>
                        )}
                        {g.missing_counseling > 0 && (
                          <div className="flex items-center justify-between text-rose-800 bg-rose-50 px-2 py-1 rounded text-[11px] font-semibold">
                            <span>상담 미기록:</span>
                            <span>{g.missing_counseling}건</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-2.5 text-center text-outline text-xs">
                        클릭하여 {g.label} 성적표 업로드
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs font-bold text-primary group-hover:translate-x-0.5 transition">
                    <span>{g.label} 학생 명부 열기</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-6 text-center text-xs text-outline print:hidden">
        <p>© 2026 Lighthouse International School. All Rights Reserved. Confidential Counseling & Academic Records.</p>
      </footer>
    </div>
  );
}
