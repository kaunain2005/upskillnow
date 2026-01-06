// src/app/api/courses/[id]/chapters/[chapterId]/modules/[moduleId]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import { requireAdmin } from "@/lib/requireAdmin";

// Get single module
export async function GET(req, context) {
  await dbConnect();
  const { id, chapterId, moduleId } = await context.params;

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = course.chapters.id(chapterId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const module = chapter.modules.id(moduleId);
  if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  return NextResponse.json(module);
}

// Update module
export async function PUT(req, context) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, chapterId, moduleId } = await context.params;
  const { title, content, image } = await req.json();

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = course.chapters.id(chapterId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const module = chapter.modules.id(moduleId);
  if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  module.title = title || module.title;
  module.content = content || module.content;
  module.image = image || module.image;

  await course.save();

  return NextResponse.json(course);
}

// Delete module
export async function DELETE(req, context) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, chapterId, moduleId } = await context.params;

  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = course.chapters.id(chapterId);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  chapter.modules.id(moduleId).remove();
  await course.save();

  return NextResponse.json(course);
}
