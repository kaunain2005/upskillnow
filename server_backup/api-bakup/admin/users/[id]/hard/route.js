// src/app/api/admin/users/[id]/hard/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";
import { deleteStudentCloudFolder } from "@/lib/cloudinaryHelpers";

export async function DELETE(req, { params }) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const student = await User.findById(params.id);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  await User.findByIdAndDelete(params.id);
  await deleteStudentCloudFolder(student._id);

  return NextResponse.json({ message: "Student permanently deleted" });
}
