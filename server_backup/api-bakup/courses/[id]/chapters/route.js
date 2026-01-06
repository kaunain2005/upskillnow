// src/app/api/courses/[id]/chapters/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import { requireAdmin } from "@/lib/requireAdmin";

// Add chapter
export async function POST(req, context) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await context.params;
  const { title } = await req.json();

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // ✅ Ensure chapters array exists
  if (!course.chapters) course.chapters = [];
  
  course.chapters.push({ title, modules: [] });
  await course.save();

  return NextResponse.json(course);
}
