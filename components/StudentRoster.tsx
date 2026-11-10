'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, ArrowRight, Award, BookOpen, Calendar, FileText } from 'lucide-react';
import { Student } from '@/lib/db';

interface Props {
  students: Student[];
}

export default function StudentRoster({ students }: Props) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {students.length} Students
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                    <p className="text-xs text-slate-500">DOB: {s.birth_date || 'N/A'}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {s.gender || 'Student'}
                </span>
              </div>

              {/* Stats Badge Row */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cum. GPA</div>
                  <div className="text-lg font-extrabold text-blue-600">
                    {s.gpa ? s.gpa.toFixed(3) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Credits</div>
                  <div className="text-lg font-extrabold text-slate-800">
                    {s.credits ? s.credits.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Additional Meta */}
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                {s.parent_guardian && (
                  <div className="truncate">
                    <span className="font-medium text-slate-600">Parent/Guardian:</span> {s.parent_guardian}
                  </div>
                )}
                {s.source_file && (
                  <div className="truncate flex items-center space-x-1 text-slate-400">
                    <FileText className="w-3.5 h-3.5 inline shrink-0" />
                    <span className="truncate">{s.source_file}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                href={`/students/${s.id}`}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <span>View Full Record & Transcript</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No students found</h4>
          <p className="text-sm text-slate-400 mt-1">Try searching with a different name or keyword.</p>
        </div>
      )}
    </div>
  );
}
