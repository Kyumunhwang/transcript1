'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  FileText,
  Database,
  Lock,
  Key,
  ShieldAlert,
  FileEdit,
  LogOut,
  UserCog,
  GraduationCap,
} from 'lucide-react';
import { StudentMaster, UserRole } from '@/types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  targetStudent: StudentMaster;
  currentRole: UserRole;
  onOpenAdminAccess: () => void;
  onExitAdminMode: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  targetStudent,
  currentRole,
  onOpenAdminAccess,
  onExitAdminMode,
}: SidebarProps) {
  const isAdmin = currentRole === 'admin';

  const generalNavItems = [
    { id: 'teacher-view', label: '교사용 뷰 (Teacher View)', icon: LayoutDashboard },
    { id: 'parent-student-portal', label: '학부모/학생 포털', icon: Users },
    { id: 'print-report', label: 'A4 상담 리포트', icon: FileText },
  ];

  const adminNavItems = [
    { id: 'user-management', label: '사용자 및 계정 관리', icon: UserCog },
    { id: 'admin-importer', label: 'PDF 성적/기록표 파서', icon: UploadCloud },
    { id: 'admin-manual-entry', label: '수동 데이터 입력/관리', icon: FileEdit },
    { id: 'admin-reports', label: '보고서 (Report Center)', icon: FileText },
    { id: 'alumni-management', label: '졸업생 관리 (Alumni)', icon: GraduationCap },
    { id: 'db-schema', label: 'DB 스키마/데이터', icon: Database },
    { id: 'sso-login', label: 'Google SSO & RBAC', icon: Lock },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between py-space-md border-r border-outline-variant/30 print:hidden">
      <div className="flex flex-col gap-space-xs px-space-sm overflow-y-auto">
        {/* 1. General Counseling Workspace */}
        <div className="px-space-md py-1 text-label-sm uppercase text-outline tracking-wider font-semibold">
          Counseling Workspace
        </div>

        <nav className="flex flex-col gap-1">
          {generalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-space-md px-space-md py-2.5 rounded text-label-md transition-colors text-left ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-primary-fixed' : 'text-on-surface-variant'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 2. Admin Section: Either Admin Menus or Admin Access Button */}
        <div className="mt-space-md pt-space-xs border-t border-outline-variant/20">
          <div className="px-space-md py-1 text-label-sm uppercase text-outline tracking-wider font-semibold flex items-center justify-between">
            <span>Administration</span>
            {isAdmin && (
              <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 font-mono">
                ADMIN
              </span>
            )}
          </div>

          {isAdmin ? (
            <div className="flex flex-col gap-1 mt-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-space-md px-space-md py-2.5 rounded text-label-md transition-colors text-left ${
                      isActive
                        ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'text-white' : 'text-secondary'}`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Exit Admin Mode */}
              <button
                type="button"
                onClick={onExitAdminMode}
                className="mt-2 flex items-center justify-between px-space-md py-2 rounded text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  <span>관리자 모드 해제</span>
                </span>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            /* Dedicated Admin Access Menu Item */
            <div className="mt-1">
              <button
                type="button"
                onClick={onOpenAdminAccess}
                className={`w-full flex items-center gap-space-md px-space-md py-2.5 rounded text-label-md transition-all text-left border ${
                  currentTab === 'admin-access'
                    ? 'bg-primary-container text-on-primary font-bold shadow-xs border-primary'
                    : 'bg-surface-container-low text-primary font-bold border-outline-variant/40 hover:bg-surface-container hover:border-outline-variant'
                }`}
              >
                <Key className="h-5 w-5 text-secondary shrink-0" />
                <div className="flex flex-col">
                  <span className="leading-tight">관리자 접속</span>
                  <span className="text-[10px] font-normal text-on-surface-variant">
                    성적/PDF/수동입력/RBAC
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 3. Target Student Audit Card */}
        <div className="mt-space-md px-space-md py-1 text-label-sm uppercase text-outline tracking-wider font-semibold">
          Target Student Audit
        </div>
        <div className="flex flex-col gap-1 px-1">
          <div className="p-space-md bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-label-sm text-outline font-bold">ACTIVE TARGET</span>
              <span className="text-label-sm text-secondary font-mono font-bold">
                {targetStudent.homeroom_class}
              </span>
            </div>
            <p className="text-headline-sm font-bold text-on-surface">
              {targetStudent.korean_name} ({targetStudent.english_name})
            </p>
            <div className="flex items-center gap-1 mt-1 font-mono text-label-sm text-on-surface-variant">
              <span>UW: {targetStudent.simulated_unweighted_gpa.toFixed(2)}</span>
              <span className="text-outline-variant">•</span>
              <span className="font-bold text-emerald-700">
                W: {targetStudent.simulated_weighted_gpa.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>목표: {targetStudent.intended_major.split('&')[0]}</span>
              <span className="text-primary font-bold">G{targetStudent.current_grade}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="px-space-md pt-space-sm border-t border-surface-container">
        <div className="flex items-center justify-between text-on-surface-variant text-label-sm">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-secondary animate-pulse' : 'bg-emerald-600'
              }`}
            />
            <span className="font-medium">{isAdmin ? 'Admin Mode' : 'Counselor Live'}</span>
          </span>
          <span className="font-mono text-outline">v2.4.0 (2026)</span>
        </div>
      </div>
    </aside>
  );
}
