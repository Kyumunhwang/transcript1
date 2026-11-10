'use client';

import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Building,
  CheckCircle2,
  Award,
  Globe,
  X,
  Check,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AlumniRecord, AcceptedUniversityInfo } from '@/types';

interface AlumniManagerProps {
  alumniList: AlumniRecord[];
  onUpdateAlumni: (updated: AlumniRecord[]) => void;
}

export function AlumniManager({
  alumniList,
  onUpdateAlumni,
}: AlumniManagerProps) {
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<AlumniRecord>>({
    graduation_year: new Date().getFullYear(),
    korean_name: '',
    english_name: '',
    student_code: '',
    accepted_universities: [],
    final_enrolled_university: '',
    final_enrolled_major: '',
    additional_notes: '',
    contact_email: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available Graduation Years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    alumniList.forEach((a) => set.add(a.graduation_year));
    return Array.from(set).sort((a, b) => b - a);
  }, [alumniList]);

  // Filtered Alumni List
  const filteredList = useMemo(() => {
    return alumniList.filter((a) => {
      if (yearFilter !== 'ALL' && a.graduation_year !== parseInt(yearFilter, 10)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          a.korean_name.toLowerCase().includes(q) ||
          a.english_name.toLowerCase().includes(q);
        const matchUni = a.final_enrolled_university.toLowerCase().includes(q);
        const matchAccepted = a.accepted_universities.some(
          (u) =>
            u.university_name.toLowerCase().includes(q) ||
            u.major.toLowerCase().includes(q)
        );
        const matchNotes = a.additional_notes?.toLowerCase().includes(q) || false;
        return matchName || matchUni || matchAccepted || matchNotes;
      }
      return true;
    });
  }, [alumniList, yearFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      id: `alumni-${Date.now()}`,
      graduation_year: new Date().getFullYear(),
      korean_name: '',
      english_name: '',
      student_code: `LIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      accepted_universities: [
        {
          university_name: '',
          country: 'USA',
          major: '',
          round: 'RD',
        },
      ],
      final_enrolled_university: '',
      final_enrolled_major: '',
      additional_notes: '',
      contact_email: '',
      created_at: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (record: AlumniRecord) => {
    setEditingId(record.id);
    setFormData(JSON.parse(JSON.stringify(record)));
    setIsModalOpen(true);
  };

  // Delete Record
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`'${name}' 졸업생의 진학 및 합격 기록을 영구 삭제하시겠습니까?`)) return;
    const updated = alumniList.filter((a) => a.id !== id);
    onUpdateAlumni(updated);
    setToastMessage(`'${name}' 졸업생 데이터가 삭제되었습니다.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamic Accepted University Handlers inside modal
  const handleAddAcceptedUni = () => {
    setFormData((prev) => ({
      ...prev,
      accepted_universities: [
        ...(prev.accepted_universities || []),
        { university_name: '', country: 'USA', major: '', round: 'RD' },
      ],
    }));
  };

  const handleUpdateAcceptedUni = (
    index: number,
    field: keyof AcceptedUniversityInfo,
    val: string
  ) => {
    setFormData((prev) => {
      const list = [...(prev.accepted_universities || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, accepted_universities: list };
    });
  };

  const handleDeleteAcceptedUni = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      accepted_universities: (prev.accepted_universities || []).filter((_, i) => i !== index),
    }));
  };

  const handleSetFinalEnrolled = (uniName: string, majorName: string) => {
    setFormData((prev) => ({
      ...prev,
      final_enrolled_university: uniName,
      final_enrolled_major: majorName,
    }));
  };

  // Save Modal Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.korean_name?.trim() || !formData.final_enrolled_university?.trim()) {
      alert('학생명(국문)과 최종 입학 대학교명은 필수 입력 항목입니다.');
      return;
    }

    let updated: AlumniRecord[];
    if (editingId) {
      updated = alumniList.map((a) =>
        a.id === editingId ? ({ ...a, ...formData } as AlumniRecord) : a
      );
    } else {
      const newRecord: AlumniRecord = {
        id: `alumni-${Date.now()}`,
        graduation_year: formData.graduation_year || new Date().getFullYear(),
        korean_name: formData.korean_name.trim(),
        english_name: formData.english_name?.trim() || '',
        student_code: formData.student_code || '',
        accepted_universities: formData.accepted_universities || [],
        final_enrolled_university: formData.final_enrolled_university.trim(),
        final_enrolled_major: formData.final_enrolled_major || '',
        additional_notes: formData.additional_notes || '',
        contact_email: formData.contact_email || '',
        created_at: new Date().toISOString().slice(0, 10),
      };
      updated = [newRecord, ...alumniList];
    }

    // Sort by graduation year descending
    updated.sort((a, b) => b.graduation_year - a.graduation_year);

    onUpdateAlumni(updated);
    setIsModalOpen(false);
    setToastMessage(
      editingId
        ? '졸업생 진학 정보가 성공적으로 수정되었습니다.'
        : '새 졸업생 진학 및 합격 대학 기록이 데이터베이스에 등록되었습니다.'
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-headline-lg font-bold text-primary">
                졸업생 관리 (Alumni Admissions Management)
              </h1>
              <span className="rounded bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 text-label-sm font-bold">
                Admin Dedicated
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              12학년 졸업생의 연도별 진학 성과(졸업년도, 학생명, 합격 대학 리스트, 최종 진학 대학, 커리어/멘토링 추가 메모) 통합 기록 및 관리
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-label-md font-bold text-on-primary hover:bg-tertiary-container shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 text-primary-fixed" />
            <span>졸업생 진학 기록 신규 등록</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-100 p-3 text-xs font-bold text-emerald-900 border border-emerald-300 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">총 등록 졸업생</span>
          <span className="text-2xl font-black text-indigo-900 font-mono">{alumniList.length}명</span>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">최근 졸업 기수</span>
          <span className="text-2xl font-black text-primary font-mono">
            {availableYears[0] ? `${availableYears[0]}년도` : '-'}
          </span>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">총 합격 대학 오퍼</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {alumniList.reduce((sum, a) => sum + a.accepted_universities.length, 0)}건
          </span>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant block">보유 졸업 기수 수</span>
          <span className="text-2xl font-black text-purple-700 font-mono">
            {availableYears.length}개 연도
          </span>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/40">
          <Search className="h-4 w-4 text-outline shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생명, 최종 진학 대학, 합격 대학, 전공 검색..."
            className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder:text-outline"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-outline hover:text-on-surface">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs">
            <Calendar className="h-3.5 w-3.5 text-on-surface-variant" />
            <span className="text-on-surface-variant font-medium">졸업년도:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 졸업년도 ({alumniList.length}명)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}년도 졸업생 ({alumniList.filter((a) => a.graduation_year === yr).length}명)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Alumni Management Table */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant font-bold">
                <th className="py-3 px-3 w-28">졸업년도</th>
                <th className="py-3 px-3 w-40">학생명 (국문/영문)</th>
                <th className="py-3 px-3 w-64">최종 입학 대학교 (Matriculation)</th>
                <th className="py-3 px-3">지원 합격 대학 리스트 (Accepted Offers)</th>
                <th className="py-3 px-3 w-64">추가 메모 (진로/멘토링 추적)</th>
                <th className="py-3 px-3 text-right w-24">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40 text-outline" />
                    <p className="font-semibold text-sm">해당 조건에 일치하는 졸업생 데이터가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((alumni) => (
                  <tr key={alumni.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Graduation Year */}
                    <td className="py-3 px-3 align-top">
                      <span className="rounded bg-indigo-100 text-indigo-950 border border-indigo-300 px-2 py-0.5 text-xs font-bold font-mono inline-block">
                        {alumni.graduation_year}년도
                      </span>
                      <span className="block text-[10px] text-outline font-mono mt-0.5">
                        Class of {alumni.graduation_year}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-3 align-top">
                      <strong className="text-sm font-bold text-primary block">
                        {alumni.korean_name}
                      </strong>
                      <span className="text-[11px] text-on-surface-variant font-mono block">
                        {alumni.english_name}
                      </span>
                      {alumni.student_code && (
                        <span className="text-[9.5px] text-outline font-mono bg-surface-container px-1 rounded">
                          {alumni.student_code}
                        </span>
                      )}
                    </td>

                    {/* Final Enrolled University */}
                    <td className="py-3 px-3 align-top">
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-950">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                          <span>{alumni.final_enrolled_university}</span>
                        </div>
                        {alumni.final_enrolled_major && (
                          <span className="block text-[10.5px] text-emerald-800 font-mono mt-0.5">
                            전공: {alumni.final_enrolled_major}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Accepted Universities */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {alumni.accepted_universities.map((uni, uIdx) => (
                          <span
                            key={uIdx}
                            className="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-1 text-[11px] border border-outline-variant/30"
                          >
                            <span className="font-semibold text-on-surface">{uni.university_name}</span>
                            {uni.round && (
                              <span className="rounded bg-blue-100 text-blue-800 px-1 text-[9px] font-mono font-bold">
                                {uni.round}
                              </span>
                            )}
                            {uni.major && (
                              <span className="text-[10px] text-outline font-mono">({uni.major})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Additional Notes */}
                    <td className="py-3 px-3 align-top">
                      <p className="text-[11.5px] text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low/40 p-2 rounded border border-outline-variant/20">
                        {alumni.additional_notes || '-'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(alumni)}
                          className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                          title="수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(alumni.id, alumni.korean_name)}
                          className="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Edit Alumni Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-container p-space-lg bg-surface-container-low/60">
              <div className="flex items-center gap-space-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-xs">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-title-lg font-bold text-primary">
                    {editingId ? '졸업생 진학 정보 수정' : '새 졸업생 진학 정보 등록'}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    졸업년도, 학생명, 합격 대학 리스트, 최종 등록 대학교, 진로 추적 메모를 관리합니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                title="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="p-space-lg overflow-y-auto space-y-4 text-xs">
              {/* Row 1: Graduation Year & Student Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">졸업년도 (Year) *</label>
                  <input
                    type="number"
                    min={2010}
                    max={2035}
                    value={formData.graduation_year || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduation_year: parseInt(e.target.value, 10) || new Date().getFullYear(),
                      }))
                    }
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-bold font-mono text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">학생명 (국문) *</label>
                  <input
                    type="text"
                    value={formData.korean_name || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, korean_name: e.target.value }))}
                    placeholder="황준영"
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">학생명 (영문)</label>
                  <input
                    type="text"
                    value={formData.english_name || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, english_name: e.target.value }))}
                    placeholder="JUNYOUNG HWANG"
                    className="w-full rounded border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Final Enrolled University & Major */}
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 space-y-2">
                <span className="block font-bold text-emerald-950">
                  ★ 최종 입학 대학교 (Final Enrolled University) *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-0.5">
                      최종 진학 대학명
                    </label>
                    <input
                      type="text"
                      value={formData.final_enrolled_university || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, final_enrolled_university: e.target.value }))
                      }
                      placeholder="New York University (Stern)"
                      className="w-full rounded border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-950"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-0.5">
                      최종 진학 전공
                    </label>
                    <input
                      type="text"
                      value={formData.final_enrolled_major || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, final_enrolled_major: e.target.value }))
                      }
                      placeholder="Finance & Economics"
                      className="w-full rounded border border-emerald-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Accepted Universities List */}
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low/40 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-surface-container pb-1 mb-1">
                  <span className="font-bold text-primary">지원 합격 대학교 리스트 (Accepted Universities)</span>
                  <button
                    type="button"
                    onClick={handleAddAcceptedUni}
                    className="flex items-center gap-1 rounded bg-primary-container px-2.5 py-1 text-[11px] font-bold text-on-primary hover:bg-tertiary-container shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>합격 대학 추가</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.accepted_universities?.map((uni, uIdx) => (
                    <div
                      key={uIdx}
                      className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white border border-outline-variant/30"
                    >
                      <input
                        type="text"
                        value={uni.university_name}
                        onChange={(e) => handleUpdateAcceptedUni(uIdx, 'university_name', e.target.value)}
                        placeholder="합격 대학명 (예: Boston University)"
                        className="flex-1 min-w-[200px] rounded border border-outline-variant/60 bg-white px-2 py-1 text-xs font-semibold"
                      />

                      <input
                        type="text"
                        value={uni.major}
                        onChange={(e) => handleUpdateAcceptedUni(uIdx, 'major', e.target.value)}
                        placeholder="합격 전공"
                        className="w-32 rounded border border-outline-variant/60 bg-white px-2 py-1 text-xs"
                      />

                      <select
                        value={uni.round || 'RD'}
                        onChange={(e) => handleUpdateAcceptedUni(uIdx, 'round', e.target.value as any)}
                        className="rounded border border-outline-variant/60 bg-white px-1.5 py-1 text-xs font-mono font-bold"
                      >
                        <option value="ED">ED (Early Decision)</option>
                        <option value="EA">EA (Early Action)</option>
                        <option value="RD">RD (Regular Decision)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleSetFinalEnrolled(uni.university_name, uni.major)}
                        className="rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 px-2 py-1 text-[10.5px] font-bold"
                        title="이 대학을 최종 진학 대학으로 지정"
                      >
                        최종진학 지정
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAcceptedUni(uIdx)}
                        className="text-outline hover:text-error p-1"
                        title="삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Additional Notes */}
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  추가 메모 (진로 추적, 멘토링 가능 여부, 특이사항)
                </label>
                <textarea
                  rows={3}
                  value={formData.additional_notes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additional_notes: e.target.value }))}
                  placeholder="예: NYU Stern ED 조기합격 및 최종 등록 완료. 교내 LIS 후배 대상 미국 동부 명문 경영대 진학 멘토링 세션 참여 가능..."
                  className="w-full rounded-lg border border-outline-variant/60 bg-white p-2.5 text-xs leading-relaxed focus:outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-outline-variant/60 bg-white px-4 py-2 font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  취소 (Cancel)
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-container px-6 py-2 font-bold text-on-primary hover:bg-tertiary-container shadow-md transition-all active:scale-95"
                >
                  {editingId ? '졸업생 기록 수정 저장' : '졸업생 기록 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
