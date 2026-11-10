import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      course_id,
      semester_name,
      course_title,
      new_grade,
      new_credits,
      notes,
      updated_gpa,
      updated_credits,
    } = body;

    const DB_PATH = path.join(process.cwd(), 'data', 'lighthouse_sis.db');
    if (fs.existsSync(DB_PATH)) {
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(DB_PATH);

      if (course_id) {
        const updateStmt = db.prepare(`
          UPDATE course_records
          SET grade = ?, credits = ?, is_makeup = 1, notes = ?
          WHERE id = ? AND student_id = ?
        `);
        updateStmt.run(new_grade, Number(new_credits), notes || 'Credit Make-up', course_id, id);
      } else {
        const insertStmt = db.prepare(`
          INSERT INTO course_records (student_id, semester_name, course_title, grade, credits, is_makeup, notes)
          VALUES (?, ?, ?, ?, ?, 1, ?)
        `);
        insertStmt.run(id, semester_name || 'Credit Make-up', course_title, new_grade, Number(new_credits), notes || 'Credit Make-up');
      }

      // Update transcript GPA if provided
      if (updated_gpa !== undefined || updated_credits !== undefined) {
        const transStmt = db.prepare(`
          UPDATE academic_transcripts
          SET cumulative_gpa = COALESCE(?, cumulative_gpa),
              cumulative_credits = COALESCE(?, cumulative_credits)
          WHERE student_id = ?
        `);
        transStmt.run(
          updated_gpa !== undefined ? Number(updated_gpa) : null,
          updated_credits !== undefined ? Number(updated_credits) : null,
          id
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Credit Make-up grade updated successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Database not accessible' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[Credit Makeup Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
