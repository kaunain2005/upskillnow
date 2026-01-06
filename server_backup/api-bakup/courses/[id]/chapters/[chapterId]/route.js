// src/app/api/courses/[id]/chapters/[chapterId]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import { requireAdmin } from "@/lib/requireAdmin";

// Get single chapter
export async function GET(req, context) {
  await dbConnect();
  const { id, chapterId } = await context.params;

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = course.chapters.id(chapterId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  return NextResponse.json(chapter);
}

// Update chapter
export async function PUT(req, context) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, chapterId } = await context.params;
  const { title } = await req.json();

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = course.chapters.id(chapterId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  chapter.title = title;
  await course.save();

  return NextResponse.json(course);
}

// Delete chapter
export async function DELETE(req, { params }) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, chapterId } = params;

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // ✅ Use filter
  course.chapters = course.chapters.filter(
    (ch) => ch._id.toString() !== chapterId
  );

  await course.save();
  return NextResponse.json({ message: "Chapter deleted successfully", course });
}
