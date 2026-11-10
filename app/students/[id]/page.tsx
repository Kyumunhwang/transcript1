import React from 'react';
import { notFound } from 'next/navigation';
import { getStudentById, getStudents } from '@/lib/db';
import { INITIAL_STUDENTS } from '@/data/sample-seed';
import { convertDetailToMaster } from '@/lib/student-adapter';
import StudentCounselingContainer from '@/components/counseling/StudentCounselingContainer';
import { StudentMaster } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function StudentPage({ params }: Props) {
  const { id } = await params;

  // 1. Check if ID exists in INITIAL_STUDENTS (e.g. 'hose', 'junyoung', 'seojun')
  let currentStudentMaster: StudentMaster | null = INITIAL_STUDENTS[id] || null;

  // 2. If not, fetch from Database
  if (!currentStudentMaster) {
    const dbStudent = await getStudentById(id);
    if (dbStudent) {
      currentStudentMaster = convertDetailToMaster(dbStudent);
    }
  }

  if (!currentStudentMaster) {
    // Fallback to hose if not found
    currentStudentMaster = INITIAL_STUDENTS.hose;
  }

  // 3. Build comprehensive allStudents record combining DB and sample-seed
  const allDbStudents = await getStudents();
  const combinedStudents: Record<string, StudentMaster> = { ...INITIAL_STUDENTS };

  for (const s of allDbStudents) {
    if (!combinedStudents[s.id]) {
      const fullDetail = await getStudentById(s.id);
      if (fullDetail) {
        combinedStudents[s.id] = convertDetailToMaster(fullDetail);
      }
    }
  }

  return (
    <StudentCounselingContainer
      initialStudent={currentStudentMaster}
      allStudents={combinedStudents}
      activeKey={id in combinedStudents ? id : 'hose'}
    />
  );
}
