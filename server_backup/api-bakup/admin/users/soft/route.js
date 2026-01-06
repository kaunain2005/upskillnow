// src/app/api/admin/users/soft/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";

export async function DELETE(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No student IDs provided" }, { status: 400 });
  }

  const deleted = await User.updateMany(
    { _id: { $in: ids } },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );

  return NextResponse.json({ message: "Students soft deleted", deleted });
}
