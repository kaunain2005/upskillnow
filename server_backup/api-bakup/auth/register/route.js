// src/app/api/auth/register/route.js
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // ✅ Force role = student
    const user = new User({ name, email, password, role: "student" });
    await user.save();

    return new Response(JSON.stringify({ message: "Registered successfully" }), { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: "Registration failed", details: err.message }), { status: 500 });
  }
}
