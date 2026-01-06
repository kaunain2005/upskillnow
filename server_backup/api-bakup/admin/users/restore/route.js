// src/app/api/admin/users/restore/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "No student IDs provided" }, { status: 400 });

  const restored = await User.updateMany(
    { _id: { $in: ids }, isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null } }
  );

  return NextResponse.json({ message: "Students restored", restored });
}
