import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const startUrl = token ? `/?token=${encodeURIComponent(token)}` : '/';

  const manifest = {
    name: 'WebFixx',
    short_name: 'WebFixx',
    description: 'Your complete web solution platform',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0F172A',
    theme_color: '#2563EB',
    categories: ['utilities', 'business', 'productivity'],
    icons: [
      { src: '/favicon.ico', sizes: '256x256', type: 'image/x-icon', purpose: 'any' }
    ]
  };

  return NextResponse.json(manifest);
}
