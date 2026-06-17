import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');
  if (!fileId) {
    return NextResponse.json({ success: false, error: 'fileId required' }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
      { redirect: 'follow' }
    );
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Drive returned ${res.status}` }, { status: 502 });
    }
    const text = await res.text();
    return NextResponse.json({ success: true, data: text });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
