import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const gradeLevel = formData.get('grade_level') ? Number(formData.get('grade_level')) : 12;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded.' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'data', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const savedPaths: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetPath = path.join(uploadDir, `${Date.now()}_${safeName}`);
      fs.writeFileSync(targetPath, buffer);
      savedPaths.push(targetPath);
    }

    // Call Python ingestion script on the uploaded files
    const pyScript = path.join(process.cwd(), 'backend', 'upload_handler.py');
    const venvPython = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
    const pythonBin = fs.existsSync(venvPython) ? `"${venvPython}"` : 'python';

    const cmd = `${pythonBin} "${pyScript}" --grade ${gradeLevel} ${savedPaths.map(p => `"${p}"`).join(' ')}`;
    const { stdout, stderr } = await execPromise(cmd, { cwd: process.cwd() });

    let result = { success: true, stdout, count: savedPaths.length };
    try {
      const parsed = JSON.parse(stdout.trim().split('\n').pop() || '{}');
      result = { ...result, ...parsed };
    } catch {
      // stdout was not pure json
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} transcripts.`,
      result,
    });
  } catch (error: any) {
    console.error('[Upload API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process upload' },
      { status: 500 }
    );
  }
}
