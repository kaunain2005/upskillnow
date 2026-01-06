// src/app/api/admin/users/hard/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";
import { deleteMultipleStudentsCloudFolders } from "@/lib/cloudinaryHelpers";

export async function DELETE(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "No student IDs provided" }, { status: 400 });

  const students = await User.find({ _id: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
  await deleteMultipleStudentsCloudFolders(students.map(s => s._id));

  return NextResponse.json({ message: "Students permanently deleted" });
}
