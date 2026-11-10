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
    const { counselor_name, session_date, topic, notes, next_action_items } = body;

    if (!counselor_name || !topic || !notes) {
      return NextResponse.json(
        { success: false, error: 'Counselor name, topic, and notes are required.' },
        { status: 400 }
      );
    }

    const DB_PATH = path.join(process.cwd(), 'data', 'lighthouse_sis.db');
    if (fs.existsSync(DB_PATH)) {
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(DB_PATH);

      const stmt = db.prepare(`
        INSERT INTO counseling_logs (student_id, counselor_name, session_date, topic, notes, next_action_items)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        counselor_name,
        session_date || new Date().toISOString().split('T')[0],
        topic,
        notes,
        next_action_items || ''
      );

      return NextResponse.json({
        success: true,
        message: 'Counseling log saved successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Database not accessible' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[Counseling API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
