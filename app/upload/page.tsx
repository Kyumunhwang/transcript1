'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud, ArrowLeft, FileText, CheckCircle2, AlertTriangle, 
  Loader2, Sparkles, GraduationCap, LayoutGrid
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<number>(12);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf')));
      setResult(null);
      setError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setProgressStatus(`AI Vision 파서가 ${files.length}개 Transcript를 구조화 분석 중입니다...`);
    setError('');

    try {
      const formData = new FormData();
      formData.append('grade_level', selectedGrade.toString());
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse transcripts.');
      }

      setResult(data.result);
      setProgressStatus('데이터베이스 적재가 성공적으로 완료되었습니다!');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during ingestion.');
    } finally {
      setUploading(false);
    }
  };

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
              <div className="text-xs text-outline font-medium">Official Transcript Ingestion Center (업로드 센터)</div>
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
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-outline hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기 (Back to Grades Overview)</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-on-surface">공식 Transcript 일괄 업로드 센터</h1>
              <p className="text-xs text-outline mt-1">
                초등 1학년부터 고등 12학년까지 매 학기 최종 확정된 Transcript PDF를 드래그 앤 드롭으로 업로드하면 AI가 자동 파싱하여 데이터베이스에 저장합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Box Form */}
        <form onSubmit={handleUploadSubmit} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-6">
          {/* Grade Selection */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase mb-1">
              업로드 대상 학년 선택 (Target Grade Level)
            </label>
            <p className="text-xs text-outline mb-2">선택한 학년의 학생 마스터 레코드로 분류되어 저장됩니다.</p>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(Number(e.target.value))}
              className="w-full sm:w-64 p-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).reverse().map((g) => (
                <option key={g} value={g}>
                  Grade {g} {g >= 9 ? '(High School)' : g >= 6 ? '(Middle School)' : '(Elementary)'}
                </option>
              ))}
            </select>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase mb-2">
              Transcript PDF 파일 드래그 앤 드롭
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-outline-variant/50 hover:border-primary bg-surface-container-low/50 hover:bg-surface-container-low rounded-2xl p-8 text-center transition cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-on-surface text-sm">
                클릭하여 파일을 선택하거나 PDF 파일들을 이곳에 끌어다 놓으세요
              </h3>
              <p className="text-xs text-outline mt-1">
                인쇄물 스캔 이미지 PDF 및 디지털 PDF 모두 100% 인식 지원 (다중 파일 가능)
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>선택된 파일 목록 ({files.length}개)</span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-outline hover:text-error"
                >
                  전체 지우기
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl bg-surface-container-low p-2">
                {files.map((file, i) => (
                  <div key={i} className="py-2 px-3 flex items-center justify-between text-xs text-on-surface">
                    <span className="font-semibold truncate flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <span className="text-[11px] text-outline shrink-0 ml-2 font-mono">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressStatus || 'AI 분석 및 데이터베이스 적재 중...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-secondary-fixed" />
                  <span>AI 분석 및 데이터베이스 적재 시작 ({files.length}개 파일)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl text-xs flex items-center space-x-2 border border-error/20">
            <AlertTriangle className="w-4 h-4 text-error shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Ingestion Summary */}
        {result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>적재 완료: 총 {result.success_count || result.count}개 성적표 파싱 성공</span>
            </div>

            <p className="text-xs text-emerald-800">
              학생 기본정보, 학기별 이수과목 성적, 누적 학점 및 GPA가 데이터베이스에 안전하게 반영되었습니다.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <Link
                href={`/grades/${selectedGrade}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Grade {selectedGrade} 학생 명부 바로가기
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold transition hover:bg-emerald-100"
              >
                대시보드로 돌아가기
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
