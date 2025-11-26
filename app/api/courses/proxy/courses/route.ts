import { NextResponse } from "next/server";

const API_BASE = "http://140.245.42.78:5050/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("PageNumber") ?? "1";
  const size = url.searchParams.get("PageSize") ?? "1000";

  const target = `${API_BASE}/Course/GetListCourses?PageNumber=${page}&PageSize=${size}`;

  try {
    const res = await fetch(target, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Proxy fetch failed", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy CORS/network error →", target);
    return NextResponse.json({ error: "Network or CORS blocked" }, { status: 500 });
  }
}

