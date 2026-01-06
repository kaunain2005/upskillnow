import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // Use next/headers for cookies

// NOTE: We remove fs and path imports as local file fallback is no longer supported
// when accepting JSON body. The client handles all file uploads (Cloudinary).

export async function PUT(req) { // Changed POST to PUT for REST convention
  try {
    await dbConnect();

    // 1. Authentication
    const cookieStore = cookies();
    // FIX: The error is often solved by slightly separating the call/access
    const token = cookieStore.get("token")?.value; // <-- Accessing .value is okay here

    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // 2. Read JSON Body (FIX)
    const updateData = await req.json(); // <-- Changed from req.formData()

    // 3. Prepare Update Data
    const finalUpdate = {};

    // ✅ Only allow specific fields to be updated
    const allowedFields = ["name", "mobile", "stream", "year", "division", "gender", "profileImage"];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        // Allows null/"" to clear fields like mobile, division, or profileImage
        finalUpdate[field] = updateData[field];
      }
    }

    // ✅ Optional: Update password if provided
    if (updateData.password) {
      if (updateData.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      finalUpdate.password = await bcrypt.hash(updateData.password, 10);
    }

    // Note: The client ensures profileImage is a URL string or null/undefined if removed.
    // If the client sends `profileImage: null`, it will clear the field in the database.

    if (Object.keys(finalUpdate).length === 0) {
      return NextResponse.json({ message: "No changes submitted" }, { status: 200 });
    }

    // 4. Update the student in DB
    const student = await User.findByIdAndUpdate(decoded.userId, finalUpdate, { new: true }).select("-password");
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Ensure default image is returned if profileImage is cleared
    if (!student.profileImage) {
      if (student.gender?.toLowerCase() === "male") {
        student.profileImage = "/images/defaults/maleDefaultProfile.png";
      } else if (student.gender?.toLowerCase() === "female") {
        student.profileImage = "/images/defaults/femaleDefaultProfile.png";
      } else {
        student.profileImage = "/images/defaults/defaultProfile.png";
      }
    }

    // 5. Return success response
    return NextResponse.json({ message: "Profile updated successfully", student }, { status: 200 });
  } catch (err) {
    console.error("Student profile update failed:", err);
    // Ensure a JSON response is always sent in case of generic error
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}