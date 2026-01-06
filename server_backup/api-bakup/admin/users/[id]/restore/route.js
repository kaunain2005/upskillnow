// src/app/api/admin/users/[id]/restore/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(req, { params }) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const student = await User.findByIdAndUpdate(
    params.id,
    { isDeleted: false, deletedAt: null },
    { new: true }
  ).select("-password");

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  return NextResponse.json({ message: "Student restored", student });
}
