// api/courses/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const ts = Date.now();
  const res = await fetch(`/api/proxy/Course/GetListCourses?PageNumber=1&PageSize=1000&_t=${ts}` , {
  cache: "no-store",
  next: { revalidate: 0 },
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});


  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
