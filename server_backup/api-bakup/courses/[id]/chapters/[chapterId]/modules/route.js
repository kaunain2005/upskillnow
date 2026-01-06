// src/app/api/courses/[id]/chapters/[chapterId]/modules/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import { requireAdmin } from "@/lib/requireAdmin";

// Add module
export async function POST(req, context) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, chapterId } = await context.params;
  const { title, content, image } = await req.json();

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = course.chapters.id(chapterId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  chapter.modules.push({ title, content, image });
  await course.save();

  return NextResponse.json(course);
}
