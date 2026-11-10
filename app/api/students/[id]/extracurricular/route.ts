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
    const { category, title, score_or_level, date_achieved, details } = body;

    if (!category || !title) {
      return NextResponse.json(
        { success: false, error: 'Category and title are required.' },
        { status: 400 }
      );
    }

    const DB_PATH = path.join(process.cwd(), 'data', 'lighthouse_sis.db');
    if (fs.existsSync(DB_PATH)) {
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(DB_PATH);

      const stmt = db.prepare(`
        INSERT INTO extracurricular_records (student_id, category, title, score_or_level, date_achieved, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        category,
        title,
        score_or_level || '',
        date_achieved || '',
        details ? JSON.stringify(details) : null
      );

      return NextResponse.json({
        success: true,
        message: 'Extracurricular record added successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Database not accessible' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[Extracurricular API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
