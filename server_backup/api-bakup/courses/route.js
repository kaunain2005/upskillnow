// src/app/api/courses/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import { requireAdmin } from "@/lib/requireAdmin";

// 📌 GET all courses
export async function GET() {
  await dbConnect();
  const courses = await Course.find();
  return NextResponse.json(courses);
}

// 📌 Create new course (Admin only)
export async function POST(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  try {
    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
