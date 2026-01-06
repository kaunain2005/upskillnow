// src/app/api/admin/users/[id]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAdmin } from "@/lib/requireAdmin";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

function ensureProfileImage(student) {
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
}

// GET student
export async function GET(req, context) {
  const { id } = await context.params;
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let student = await User.findById(id).select("-password");
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  student = ensureProfileImage(student);
  return NextResponse.json({ student });
}

// PUT update student
export async function PUT(req, context) {
  const { id } = await context.params;
  await dbConnect();

  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const formData = await req.formData();

    // collect fields if present
    const fields = ["name", "email", "stream", "year", "mobile", "division", "gender"];
    const updateData = {};
    for (const f of fields) {
      const v = formData.get(f);
      if (v) updateData[f] = v;
    }

    const password = formData.get("password");
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // profileImage can be:
    // - a URL string (client uploaded to Cloudinary and sent secure_url) -> store directly
    // - a File (if client sent file directly) -> fallback to local save (or handle server upload)
    const profileImage = formData.get("profileImage");
    if (profileImage) {
      if (typeof profileImage === "string") {
        // client sent cloudinary URL (normal Plan A)
        updateData.profileImage = profileImage;
      } else if (profileImage.size && profileImage.arrayBuffer) {
        // A File was sent (rare for Plan A). Fallback: save locally.
        try {
          const buffer = Buffer.from(await profileImage.arrayBuffer());
          const uploadDir = path.join(process.cwd(), "public/images/students", id.toString());
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, "profile.png");
          fs.writeFileSync(filePath, buffer);
          updateData.profileImage = `/images/students/${id}/profile.png`;
        } catch (localErr) {
          console.error("Local save failed:", localErr);
        }
      }
    }

    const student = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    ensureProfileImage(student);
    return NextResponse.json({ message: "Student updated", student });
  } catch (err) {
    console.error("PUT /api/admin/users/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE student (soft delete)
export async function DELETE(req, context) {
  const { params } = await context;
  const { id } = params;
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const student = await User.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  return NextResponse.json({ message: "Student soft deleted", student });
}
