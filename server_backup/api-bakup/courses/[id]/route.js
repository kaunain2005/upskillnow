// src/app/api/courses/[id]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course";
import { requireAdmin } from "@/lib/requireAdmin";

// Get single course
export async function GET(req, context) {
  await dbConnect();
  const { id } = await context.params;
  const course = await Course.findById(id);
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}

// Update course
export async function PUT(req, context) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await context.params;
  const body = await req.json();

  const course = await Course.findByIdAndUpdate(id, body, { new: true });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}

// Delete course
export async function DELETE(req, { params }) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params;

  const course = await Course.findByIdAndDelete(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json({ message: "Course deleted successfully" });
}
