// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear JWT cookie
    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
