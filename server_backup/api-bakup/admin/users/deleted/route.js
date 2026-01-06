// src/app/api/admin/users/deleted/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";

// ✅ Get all soft-deleted students
export async function GET(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const filters = { role: "student", isDeleted: true };

  // Optional filters
  if (searchParams.get("name")) filters.name = { $regex: searchParams.get("name"), $options: "i" };
  if (searchParams.get("email")) filters.email = { $regex: searchParams.get("email"), $options: "i" };
  if (searchParams.get("stream")) filters.stream = searchParams.get("stream");
  if (searchParams.get("year")) filters.year = searchParams.get("year");
  if (searchParams.get("mobile")) filters.mobile = searchParams.get("mobile");

  const students = await User.find(filters)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(filters);

  return NextResponse.json({ students, total, page, limit });
}
