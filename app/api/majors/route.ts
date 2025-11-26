import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Gọi đến Backend thật: GET /api/Major
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Major`, {
      cache: 'no-store', // Luôn lấy dữ liệu mới nhất
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Proxy Error] Fetch Majors:", error);
    return NextResponse.json({ error: 'Failed to fetch majors' }, { status: 500 });
  }
}