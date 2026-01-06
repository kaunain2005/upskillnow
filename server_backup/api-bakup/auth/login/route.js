// src/app/api/auth/login/route.js
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 400 });
        }

        // ✅ FIX: generateToken is now async
        const token = await generateToken(user);

        // ✅ Store token in HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return new Response(JSON.stringify({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        }), { status: 200 });

    } catch (err) {
        console.error("Login error:", err);
        return new Response(JSON.stringify({ error: "Login failed" }), { status: 500 });
    }
}
