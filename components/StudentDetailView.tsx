'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, User, GraduationCap, Award, BookOpen, Calendar, MapPin, 
  Phone, CheckCircle2, Clock, FileText, MessageSquarePlus, PlusCircle,
  Edit3, RefreshCw, Sparkles, Trophy, BookCheck, ShieldCheck, X
} from 'lucide-react';
import { StudentDetail } from '@/lib/db';

interface Props {
  student: StudentDetail;
}

export default function StudentDetailView({ student }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'transcript' | 'extracurricular' | 'counseling' | 'graduation'>('all');

  // Modals state
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [makeupGrade, setMakeupGrade] = useState('A');
  const [makeupCredits, setMakeupCredits] = useState('0.500');
  const [makeupNotes, setMakeupNotes] = useState('Credit Make-up Completed');
  const [updatedGpa, setUpdatedGpa] = useState<string>(student.gpa ? student.gpa.toString() : '');
  const [updatedCredits, setUpdatedCredits] = useState<string>(student.credits ? student.credits.toString() : '');

  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraCategory, setExtraCategory] = useState<'PSAT' | 'SAT' | 'TOEFL' | 'AP' | 'AWARD_INTERNAL' | 'AWARD_EXTERNAL'>('SAT');
  const [extraTitle, setExtraTitle] = useState('');
  const [extraScore, setExtraScore] = useState('');
  const [extraDate, setExtraDate] = useState('');

  const [showCounselModal, setShowCounselModal] = useState(false);
  const [counselorName, setCounselorName] = useState('Vice Principal Paul Kim');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('Academic Progress & College Counseling');
  const [counselNotes, setCounselNotes] = useState('');
  const [actionItems, setActionItems] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const transcript = student.transcript_data || {};
  const sInfo = transcript.student_info || {};
  const academicRecords = transcript.academic_records || [];
  const gradRequirements = transcript.graduation_requirements || [];

  // Submit Credit Make-up
  const handleMakeupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${student.id}/credit-makeup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourse?.id,
          semester_name: selectedCourse?.semester_name || 'Credit Make-up',
          course_title: selectedCourse?.course_title || selectedCourse?.title || '',
          new_grade: makeupGrade,
          new_credits: parseFloat(makeupCredits) || 0.5,
          notes: makeupNotes,
          updated_gpa: updatedGpa ? parseFloat(updatedGpa) : undefined,
          updated_credits: updatedCredits ? parseFloat(updatedCredits) : undefined,
        }),
      });
      if (res.ok) {
        setShowMakeupModal(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Extracurricular / Awards
  const handleExtraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${student.id}/extracurricular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: extraCategory,
          title: extraTitle,
          score_or_level: extraScore,
          date_achieved: extraDate,
        }),
      });
      if (res.ok) {
        setShowExtraModal(false);
        setExtraTitle('');
        setExtraScore('');
        setExtraDate('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Counseling Log
  const handleCounselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${student.id}/counseling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselor_name: counselorName,
          session_date: sessionDate,
          topic,
          notes: counselNotes,
          next_action_items: actionItems,
        }),
      });
      if (res.ok) {
        setShowCounselModal(false);
        setCounselNotes('');
        setActionItems('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href={`/grades/${student.current_grade || 12}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grade {student.current_grade || 12} Roster</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {student.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Grade {student.current_grade || 12}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
              <span><strong>DOB:</strong> {student.birth_date || 'N/A'}</span>
              <span><strong>Gender:</strong> {student.gender || 'N/A'}</span>
              <span><strong>Student ID:</strong> {student.id}</span>
              {student.parent_guardian && <span><strong>Parent/Guardian:</strong> {student.parent_guardian}</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons & Summary Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedCourse(null);
              setShowMakeupModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Credit Make-up Update</span>
          </button>

          <button
            onClick={() => setShowExtraModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Add Test/Award</span>
          </button>

          <button
            onClick={() => setShowCounselModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Log Counseling</span>
          </button>
        </div>
      </div>

      {/* High-level Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumulative GPA</div>
          <div className="text-2xl font-black text-blue-600">
            {student.gpa ? student.gpa.toFixed(3) : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumulative Credits</div>
          <div className="text-2xl font-black text-slate-800">
            {student.credits ? student.credits.toFixed(1) : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">External Tests & Awards</div>
          <div className="text-2xl font-black text-indigo-600">
            {student.extracurriculars?.length || 0} Records
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Counseling Sessions</div>
          <div className="text-2xl font-black text-emerald-600">
            {student.counseling_logs?.length || 0} Sessions
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>All-in-One Comprehensive View</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`py-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'transcript'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Transcript ({academicRecords.length} Semesters)</span>
        </button>

        <button
          onClick={() => setActiveTab('extracurricular')}
          className={`py-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'extracurricular'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tests & Awards ({student.extracurriculars?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('counseling')}
          className={`py-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'counseling'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Counseling History ({student.counseling_logs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('graduation')}
          className={`py-3 px-4 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'graduation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Graduation Requirements</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ALL-IN-ONE VIEW (or INDIVIDUAL TABS)                           */}
      {/* ============================================================== */}

      {/* 1. Extracurriculars Section (PSAT, SAT, TOEFL, AP, Awards) */}
      {(activeTab === 'all' || activeTab === 'extracurricular') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Standardized Tests & Honors/Awards (비교과 & 외부 시험)</span>
              </h2>
              <p className="text-xs text-slate-500">PSAT, SAT, TOEFL, AP Exam Scores, and School/Community Honors</p>
            </div>
            <button
              onClick={() => setShowExtraModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Score / Award</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Quick Test Badges */}
            {['PSAT', 'SAT', 'TOEFL', 'AP'].map((testCat) => {
              const testItems = (student.extracurriculars || []).filter(e => e.category === testCat);
              return (
                <div key={testCat} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">{testCat} Scores</div>
                  {testItems.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {testItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{item.title}</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-mono">
                            {item.score_or_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-2 italic">Not entered yet</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Awards List */}
          {student.extracurriculars && student.extracurriculars.filter(e => e.category.startsWith('AWARD')).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Honors & Awards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {student.extracurriculars.filter(e => e.category.startsWith('AWARD')).map(award => (
                  <div key={award.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-950">{award.title}</span>
                      <span className="text-amber-800 ml-2">({award.category === 'AWARD_INTERNAL' ? 'Internal' : 'External'})</span>
                    </div>
                    <span className="text-amber-700 font-medium">{award.date_achieved || 'Recognized'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Counseling History Section */}
      {(activeTab === 'all' || activeTab === 'counseling') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <MessageSquarePlus className="w-4 h-4 text-blue-600" />
                <span>Counseling History & Notes (이전 상담 기록)</span>
              </h2>
              <p className="text-xs text-slate-500">Historical advisement logs and upcoming action items for consultations</p>
            </div>
            <button
              onClick={() => setShowCounselModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log New Session</span>
            </button>
          </div>

          {student.counseling_logs && student.counseling_logs.length > 0 ? (
            <div className="space-y-3 pt-2">
              {student.counseling_logs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{log.topic}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                        {log.counselor_name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{log.session_date}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{log.notes}</p>
                  {log.next_action_items && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-blue-700 font-medium">
                      <strong>Action Items:</strong> {log.next_action_items}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              No prior counseling sessions logged yet. Click &quot;Log New Session&quot; to add consultation notes.
            </div>
          )}
        </div>
      )}

      {/* 3. Academic Transcript (Semesters & Courses + Credit Make-up) */}
      {(activeTab === 'all' || activeTab === 'transcript') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Academic Transcript & Credit Records (교과 성적)</span>
              </h2>
              <p className="text-xs text-slate-500">Official course grades by semester. Use &quot;Credit Make-up&quot; to update mid-term scores.</p>
            </div>
          </div>

          {academicRecords.map((sem: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{sem.semester_name}</h3>
                  <div className="text-[11px] text-slate-500">
                    Institution: <span className="font-semibold text-slate-700">{sem.school_name || 'Lighthouse International School'}</span>
                    {sem.grade_level && <span className="ml-2 font-medium">| Grade {sem.grade_level}</span>}
                  </div>
                </div>
                {(sem.semester_gpa !== null || sem.semester_credits !== null) && (
                  <div className="flex items-center space-x-3 text-xs font-semibold">
                    {sem.semester_gpa !== null && (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Term GPA: {sem.semester_gpa}
                      </span>
                    )}
                    {sem.semester_credits !== null && (
                      <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Credits: {sem.semester_credits}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Course list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-6">Class Title</th>
                      <th className="py-2 px-6 text-center w-24">Grade</th>
                      <th className="py-2 px-6 text-right w-24">Credits</th>
                      <th className="py-2 px-6 text-right w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(sem.courses || []).map((crs: any, cIdx: number) => (
                      <tr key={cIdx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-6 font-semibold text-slate-900 flex items-center space-x-2">
                          <span>{crs.title}</span>
                          {crs.notes && crs.notes.includes('Make-up') && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              Make-up
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-6 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            crs.grade.startsWith('A')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : crs.grade.startsWith('B')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {crs.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-6 text-right font-mono">{Number(crs.credits).toFixed(3)}</td>
                        <td className="py-2.5 px-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedCourse({
                                semester_name: sem.semester_name,
                                course_title: crs.title,
                                ...crs,
                              });
                              setMakeupGrade(crs.grade);
                              setMakeupCredits(crs.credits.toString());
                              setShowMakeupModal(true);
                            }}
                            className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Credit Make-up</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Graduation Requirements */}
      {(activeTab === 'all' || activeTab === 'graduation') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Graduation Requirements Progress</span>
            </h2>
            <p className="text-xs text-slate-500">Official required units versus earned units by subject category</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gradRequirements.map((req: any, idx: number) => {
              const reqVal = Number(req.required_units || 0);
              const earnVal = Number(req.earned_units || 0);
              const isMet = earnVal >= reqVal && reqVal > 0;
              const pct = reqVal > 0 ? Math.min(Math.round((earnVal / reqVal) * 100), 100) : 100;

              return (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{req.category}</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                      isMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {earnVal.toFixed(1)} / {reqVal.toFixed(1)} Units
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isMet ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: Credit Make-up Update Modal                           */}
      {/* ============================================================== */}
      {showMakeupModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Credit Make-up Program Update</span>
              </h3>
              <button onClick={() => setShowMakeupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Update a specific course grade and credits mid-term when a student completes the Credit Make-up program.
            </p>

            <form onSubmit={handleMakeupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Course Title</label>
                <input
                  type="text"
                  required
                  value={selectedCourse?.course_title || selectedCourse?.title || ''}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, course_title: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">New Grade</label>
                  <select
                    value={makeupGrade}
                    onChange={(e) => setMakeupGrade(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  >
                    {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'Pass'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Earned Credits</label>
                  <input
                    type="number"
                    step="0.05"
                    value={makeupCredits}
                    onChange={(e) => setMakeupCredits(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Updated Cumulative GPA</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 3.92"
                    value={updatedGpa}
                    onChange={(e) => setUpdatedGpa(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Updated Total Credits</label>
                  <input
                    type="number"
                    step="0.25"
                    placeholder="e.g. 24.5"
                    value={updatedCredits}
                    onChange={(e) => setUpdatedCredits(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Make-up Reason / Notes</label>
                <input
                  type="text"
                  value={makeupNotes}
                  onChange={(e) => setMakeupNotes(e.target.value)}
                  placeholder="e.g. Completed Summer 2026 Credit Make-up course"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMakeupModal(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Make-up Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Extracurricular / Awards Entry Modal                  */}
      {/* ============================================================== */}
      {showExtraModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Add Extracurricular Test Score or Award</span>
              </h3>
              <button onClick={() => setShowExtraModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExtraSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Record Category</label>
                <select
                  value={extraCategory}
                  onChange={(e) => setExtraCategory(e.target.value as any)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                >
                  <option value="SAT">SAT (Digital SAT)</option>
                  <option value="PSAT">PSAT / NMSQT</option>
                  <option value="TOEFL">TOEFL iBT</option>
                  <option value="AP">AP Exam Score</option>
                  <option value="AWARD_INTERNAL">School Honor / Internal Award</option>
                  <option value="AWARD_EXTERNAL">External / Community Competition Award</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP Calculus BC / Total Score / Science Fair 1st Place"
                  value={extraTitle}
                  onChange={(e) => setExtraTitle(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Score / Level</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1520 / 110 / Score: 5"
                    value={extraScore}
                    onChange={(e) => setExtraScore(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Test / Event Date</label>
                  <input
                    type="date"
                    value={extraDate}
                    onChange={(e) => setExtraDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExtraModal(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Log Counseling Session Modal                          */}
      {/* ============================================================== */}
      {showCounselModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <MessageSquarePlus className="w-4 h-4 text-blue-600" />
                <span>Log Student Counseling Session</span>
              </h3>
              <button onClick={() => setShowCounselModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCounselSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Counselor</label>
                  <input
                    type="text"
                    required
                    value={counselorName}
                    onChange={(e) => setCounselorName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Session Date</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Counseling Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US University Application & Early Decision Strategy"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Consultation Notes & Discussion</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed notes of academic progress, extracurricular development, student questions..."
                  value={counselNotes}
                  onChange={(e) => setCounselNotes(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Follow-Up Action Items</label>
                <input
                  type="text"
                  placeholder="e.g. Submit AP score report by Friday; Register for December SAT"
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCounselModal(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Counseling Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
