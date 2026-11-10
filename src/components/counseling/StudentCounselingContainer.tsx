'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, UploadCloud } from 'lucide-react';
import { TeacherView } from './TeacherView';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { OnePageParentReport } from './OnePageParentReport';
import { AlumniManager } from './AlumniManager';
import { CounselingLogbook } from './CounselingLogbook';
import { GpaSimulator } from './GpaSimulator';
import { INITIAL_ALUMNI_RECORDS } from '@/data/alumni-data';
import { StudentMaster, UserRole, AlumniRecord } from '@/types';

interface Props {
  initialStudent: StudentMaster;
  allStudents: Record<string, StudentMaster>;
  activeKey: string;
}

export default function StudentCounselingContainer({
  initialStudent,
  allStudents,
  activeKey,
}: Props) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>('teacher-view');
  const [selectedStudentKey, setSelectedStudentKey] = useState<string>(activeKey);
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('counselor');
  const [students, setStudents] = useState<Record<string, StudentMaster>>({
    ...allStudents,
    [activeKey]: initialStudent,
  });
  const [alumniList, setAlumniList] = useState<AlumniRecord[]>(INITIAL_ALUMNI_RECORDS);

  const activeStudent = students[selectedStudentKey] || initialStudent;

  const handleTogglePrivacyMode = () => {
    setIsPrivacyMode((prev) => !prev);
  };

  const handleSwitchStudent = (key: string) => {
    setSelectedStudentKey(key);
    // If it's a route-backed student, optionally update url or state
    if (students[key]) {
      // In-memory switch works instantly
    }
  };

  const handleSaveStudent = (updatedStudent: StudentMaster) => {
    setStudents((prev) => ({
      ...prev,
      [selectedStudentKey]: updatedStudent,
    }));
  };

  const allCourses = activeStudent.terms?.flatMap((t) => t.courses) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner Navigation back to School Dashboard */}
      <div className="bg-primary-container text-on-primary-container px-6 py-2 text-xs font-semibold flex items-center justify-between border-b border-primary/20 z-50 relative print:hidden">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-on-primary hover:text-secondary-fixed transition"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>전 학년 누락 현황 대시보드 (All Grades Overview)</span>
          </Link>
          <span className="opacity-40">|</span>
          <Link
            href={`/grades/${activeStudent.current_grade || 12}`}
            className="flex items-center space-x-1 hover:text-on-primary transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Grade {activeStudent.current_grade || 12} Roster</span>
          </Link>
        </div>

        <Link
          href="/upload"
          className="flex items-center space-x-1 text-on-primary hover:text-secondary-fixed transition"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Transcript 업로드 센터</span>
        </Link>
      </div>

      {/* Top Header */}
      <Header
        onSelectTab={setCurrentTab}
        selectedStudentKey={selectedStudentKey}
        onSelectStudent={handleSwitchStudent}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={handleTogglePrivacyMode}
        currentRole={currentRole}
        authenticatedUserName="Paul Kim (교감 / Lead Counselor)"
        onOpenAdminAccess={() => setCurrentRole('admin')}
        onExitAdminMode={() => setCurrentRole('counselor')}
      />

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        targetStudent={activeStudent}
        currentRole={currentRole}
        onOpenAdminAccess={() => setCurrentRole('admin')}
        onExitAdminMode={() => setCurrentRole('counselor')}
      />

      {/* Main Content Area */}
      <div className="pl-64">
        <main className="w-full pt-20 px-gutter-desktop pb-space-xl min-h-screen">
          {currentTab === 'teacher-view' && (
            <TeacherView
              student={activeStudent}
              allStudents={students}
              activeStudentKey={selectedStudentKey}
              onSelectStudentKey={handleSwitchStudent}
              isPrivacyMode={isPrivacyMode}
              onTogglePrivacyMode={handleTogglePrivacyMode}
              onNavigateToPrint={() => setCurrentTab('print-report')}
              onUpdateStudent={handleSaveStudent}
              alumniList={alumniList}
            />
          )}

          {currentTab === 'print-report' && (
            <OnePageParentReport
              student={activeStudent}
              activeKey={selectedStudentKey}
              onSwitchStudent={handleSwitchStudent}
              allStudents={students}
            />
          )}

          {currentTab === 'counseling-log' && (
            <div className="max-w-6xl mx-auto py-6">
              <CounselingLogbook
                student={activeStudent}
                allStudents={students}
                activeStudentKey={selectedStudentKey}
                onSelectStudentKey={handleSwitchStudent}
                onUpdateStudent={handleSaveStudent}
                isPrivacyMode={isPrivacyMode}
              />
            </div>
          )}

          {currentTab === 'gpa-simulator' && (
            <div className="max-w-6xl mx-auto py-6">
              <GpaSimulator
                initialCourses={allCourses}
                originalUnweightedGpa={activeStudent.gradelink_unweighted_gpa}
                originalCumulativeCredits={activeStudent.gradelink_cumulative_credits}
              />
            </div>
          )}

          {currentTab === 'alumni-management' && (
            <div className="max-w-6xl mx-auto py-6">
              <AlumniManager
                alumniList={alumniList}
                onUpdateAlumni={setAlumniList}
              />
            </div>
          )}

          {currentTab === 'parent-student-portal' && (
            <div className="max-w-4xl mx-auto py-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 p-8">
              <h2 className="text-xl font-bold text-on-surface mb-2">학부모 / 학생 열람 포털</h2>
              <p className="text-sm text-outline mb-6">
                현재 선택된 학생 ({activeStudent.korean_name || activeStudent.english_name})의 포털 뷰 모드입니다.
              </p>
              <button
                onClick={() => setCurrentTab('print-report')}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                A4 상담 리포트 인쇄 뷰 보기
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
