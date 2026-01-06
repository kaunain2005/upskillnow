// src/app/api/auth/me/route.js (with added logging)
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { cookies } from "next/headers";

export async function GET() {
    try {
        await dbConnect();

        // 1. Check Cookie Retrieval
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        
        console.log("DEBUG: Token found?", !!token); // Log if the token variable is populated
        
        if (!token) {
            return NextResponse.json({ error: "Not authenticated (No Token)" }, { status: 401 });
        }

        // 2. Check Token Verification
        let decoded;
        try {
            decoded = await verifyToken(token);
            console.log("DEBUG: Decoded payload:", decoded); // Log the decoded payload
        } catch (jwtError) {
            console.error("DEBUG: JWT Verification Failed:", jwtError.message);
            // This is likely where expired/invalid tokens are caught
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Invalid token (No userId)" }, { status: 401 });
        }

        // 3. Check Database Query
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            console.log("DEBUG: User not found for ID:", decoded.userId);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (err) {
        // Catches errors outside of JWT verification (e.g., DB connection issue, other unexpected errors)
        console.error("Auth /me final catch error:", err); 
        return NextResponse.json(
            { error: "Internal Server Error or Final Catch Error" },
            { status: 500 } // Use 500 for generic server errors
        );
    }
}