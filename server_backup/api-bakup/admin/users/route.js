// src/app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";

// ✅ Create Student (Admin only)
export async function POST(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // ✅ Handle multipart form data
  const formData = await req.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const stream = formData.get("stream");
  const year = formData.get("year");
  const mobile = formData.get("mobile");
  const division = formData.get("division");
  const gender = formData.get("gender");

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  // ⚡ Create student first
  const student = new User({
    name,
    email,
    password, // if using pre-save hook, it will auto-hash
    role: "student",
    stream,
    year,
    mobile,
    division,
    gender,
  });
  await student.save();

  return NextResponse.json({ message: "Student created", student }, { status: 201 });
}

// ✅ List Students (with filters)
export async function GET(req) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const filters = { role: "student", isDeleted: false };
  if (searchParams.get("name"))
    filters.name = { $regex: searchParams.get("name"), $options: "i" };
  if (searchParams.get("email"))
    filters.email = { $regex: searchParams.get("email"), $options: "i" };
  if (searchParams.get("stream")) filters.stream = searchParams.get("stream");
  if (searchParams.get("year")) filters.year = searchParams.get("year");
  if (searchParams.get("mobile"))
    filters.mobile = searchParams.get("mobile");

  const students = await User.find(filters)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // ✅ return plain JS objects, avoids Mongoose mutation warnings

  // ✅ Ensure default profile images
  const studentsWithDefaults = students.map((student) => {
    if (!student.profileImage) {
      if (student.gender?.toLowerCase() === "male") {
        student.profileImage = "/images/defaults/maleDefaultProfile.png";
      } else if (student.gender?.toLowerCase() === "female") {
        student.profileImage = "/images/defaults/femaleDefaultProfile.png";
      } else {
        student.profileImage = "/images/defaults/defaultProfile.png";
      }
    }
    return student;
  });

  const total = await User.countDocuments(filters);

  return NextResponse.json({
    students: studentsWithDefaults,
    total,
    page,
    limit,
  });
}
