'use client';

import React from 'react';
import {
  UserCheck,
  EyeOff,
  Eye,
  Printer,
  User,
  ShieldAlert,
  Lock,
  Filter,
  Key,
} from 'lucide-react';
import { UserRole } from '@/types';

interface HeaderProps {
  onSelectTab: (tab: string) => void;
  selectedStudentKey: string;
  onSelectStudent: (key: string) => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  currentRole: UserRole;
  authenticatedUserName?: string;
  onOpenAdminAccess: () => void;
  onExitAdminMode: () => void;
  onOpenStudentParentLogin?: () => void;
  onLogoutToCounselor?: () => void;
  onOpenPinChange?: () => void;
}

export function Header({
  onSelectTab,
  selectedStudentKey,
  onSelectStudent,
  isPrivacyMode,
  onTogglePrivacyMode,
  currentRole,
  authenticatedUserName,
  onOpenAdminAccess,
  onExitAdminMode,
  onOpenStudentParentLogin,
  onLogoutToCounselor,
  onOpenPinChange,
}: HeaderProps) {
  const isAdmin = currentRole === 'admin';
  const isStudent = currentRole === 'student';
  const isParent = currentRole === 'parent';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between px-gutter-desktop border-b border-outline-variant/30 print:hidden">
      {/* Brand & CEEB Logo (Left) */}
      <div className="flex items-center gap-space-md">
        <div
          className="flex items-center gap-space-sm cursor-pointer select-none"
          onClick={() => onSelectTab(isStudent || isParent ? 'parent-student-portal' : 'teacher-view')}
        >
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-primary-fixed font-bold text-lg overflow-hidden shrink-0 shadow-xs">
            <span className="font-mono text-sm tracking-tighter">LIS</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="text-headline-sm font-bold text-primary tracking-tight">
                LIS Counseling
              </span>
              <span className="text-label-sm px-1.5 py-0.2 bg-surface-container text-on-surface-variant rounded uppercase font-mono">
                CEEB: 682019
              </span>
            </div>
            <span className="text-bilingual-sub text-on-surface-variant">
              등대국제학교 대학진학 상담 시스템
            </span>
          </div>
        </div>
      </div>

      {/* Center Controls: Grade Filter & Student Quick Switcher */}
      <div className="flex items-center gap-space-md">
        <div className="hidden lg:flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant/30">
          <Filter className="h-4 w-4 text-on-surface-variant" />
          <select className="bg-transparent text-label-md text-on-surface focus:outline-none cursor-pointer pr-1">
            <option>내 담당 학급 (H11 / H12)</option>
            <option>차년도 배정 (G10 → G11)</option>
            <option>전교생 전체 조회 (G9-G12)</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-container-lowest ring-1 ring-outline-variant/60 rounded px-2.5 py-1 shadow-xs">
          <UserCheck className="h-4 w-4 text-primary" />
          <select
            value={selectedStudentKey}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-transparent text-data-tabular font-bold text-on-surface focus:outline-none cursor-pointer pr-1"
          >
            <optgroup label="🎓 현재 재학생 (Current Students)">
              <option value="seojun">[G12/H12] 김서준 (SEO-JUN KIM)</option>
              <option value="hose">[G11/H11] 고호세 (KO, HOU-SE)</option>
              <option value="jiwoo">[G10/H10] 이지우 (JI-WOO LEE)</option>
              <option value="minjae">[G9/H9] 김민재 (MIN-JAE KIM)</option>
              <option value="haeun">[G7/M7] 박하은 (HAEUN PARK)</option>
              <option value="doyun">[G3/E3] 최도윤 (DOYUN CHOI)</option>
            </optgroup>
            <optgroup label="🏛️ 졸업생 (Alumni)">
              <option value="junyoung">[2021년 졸업] 황준영 (JUNYOUNG HWANG) - NYU</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Right Controls: Student/Parent Login, Admin Access, Privacy Mode, Print, User Profile */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {/* Student or Parent Authenticated Badge */}
        {(isStudent || isParent) ? (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-xs ${
            isStudent
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-purple-100 text-purple-900 border-purple-300'
          }`}>
            <span className="text-xs font-bold">
              {authenticatedUserName || (isStudent ? '학생 모드' : '학부모 모드')}
            </span>
            {onOpenPinChange && (
              <button
                type="button"
                onClick={onOpenPinChange}
                className="ml-1 text-[11px] bg-white/90 hover:bg-white text-primary font-bold px-1.5 py-0.2 rounded transition-colors shadow-2xs flex items-center gap-0.5"
                title="4자리 PIN 변경"
              >
                <Key className="h-3 w-3 text-secondary" />
                <span>PIN 변경</span>
              </button>
            )}
            {onLogoutToCounselor && (
              <button
                type="button"
                onClick={onLogoutToCounselor}
                className="ml-0.5 text-[11px] bg-white/80 hover:bg-white text-on-surface font-bold px-1.5 py-0.2 rounded transition-colors shadow-2xs"
                title="교사 모드로 복귀"
              >
                로그아웃
              </button>
            )}
          </div>
        ) : (
          /* Student / Parent 4-Step Login Trigger */
          onOpenStudentParentLogin && (
            <button
              type="button"
              onClick={onOpenStudentParentLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-container-lowest text-primary hover:bg-surface-container-high border border-outline-variant/60 text-label-sm font-semibold transition-colors shadow-2xs"
              title="학생 및 학부모 4단계 PIN 인증 로그인"
            >
              <User className="h-3.5 w-3.5 text-secondary" />
              <span className="hidden sm:inline">학생/학부모 로그인</span>
            </button>
          )
        )}

        {/* Admin Access / Status Button */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded px-2.5 py-1 shadow-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
            <span className="text-label-sm font-bold">관리자 모드</span>
            <button
              type="button"
              onClick={onExitAdminMode}
              className="ml-1 text-[11px] bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold px-1.5 py-0.2 rounded transition-colors"
              title="관리자 권한 해제"
            >
              해제
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAdminAccess}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-primary-container text-primary-fixed hover:bg-tertiary-container text-label-sm font-semibold transition-colors shadow-xs"
            title="관리자 전용 데이터 관리 메뉴 진입"
          >
            <Lock className="h-3.5 w-3.5 text-secondary-fixed" />
            <span className="hidden sm:inline">관리자 접속</span>
          </button>
        )}

        {/* Privacy Mode Toggle */}
        <button
          type="button"
          onClick={onTogglePrivacyMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-label-sm font-semibold transition-colors border ${
            isPrivacyMode
              ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-container'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high'
          }`}
          title={isPrivacyMode ? '상담 화면 공유 모드 켜짐' : '상담 화면 공유 모드 꺼짐'}
        >
          {isPrivacyMode ? (
            <>
              <EyeOff className="h-3.5 w-3.5 text-secondary" />
              <span className="hidden 2xl:inline">공유 모드 (메모 마스킹 중)</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="hidden 2xl:inline">교사 전용 모드</span>
            </>
          )}
        </button>

        {/* Print Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab('print-report')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-on-secondary hover:bg-on-secondary-container transition-colors text-label-sm font-semibold shadow-xs"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">A4 리포트</span>
        </button>

        <div className="h-6 w-[1px] bg-outline-variant/40" />

        {/* Profile Avatar & Role */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => (isAdmin ? onSelectTab('sso-login') : onOpenAdminAccess())}
          title={isAdmin ? '관리자 권한 센터' : '관리자 로그인'}
        >
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-label-md text-on-surface leading-tight font-bold">
              {isAdmin ? 'Administrator' : 'Danny Pyung'}
            </span>
            <span className="text-bilingual-sub text-on-surface-variant leading-tight">
              {isAdmin ? 'System Admin' : 'Academic Counselor'}
            </span>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-on-primary ${
              isAdmin ? 'bg-secondary text-white' : 'bg-primary'
            }`}
          >
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
