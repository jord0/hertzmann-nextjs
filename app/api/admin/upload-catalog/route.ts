import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { uploadCatalogPdf } from '@/lib/r2';

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const catalogId = parseInt(formData.get('catalogId') as string, 10);
  const file = formData.get('file') as File | null;

  if (!file || isNaN(catalogId)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadCatalogPdf(catalogId, buffer);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('R2 catalog upload failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
