// src/lib/requireAdmin.js (FIXED)

import { verifyToken } from "./jwt";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect"; // 💡 ASSUMING THIS UTILITY EXISTS
import User from "@/models/User";          // 💡 ASSUMING THIS MODEL EXISTS

export async function requireAdmin(req) {
    // 1. Token Extraction (Existing logic is fine)
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
    }

    if (!token) return null;

    // 2. Token Verification (Existing logic is fine)
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) return null; 

    // 3. Database Role Verification (CRITICAL NEW STEP)
    try {
        await dbConnect(); // Connect to the database
        
        const user = await User.findById(decoded.userId).select("role").lean();

        // ❌ Check if user exists OR if their actual database role is NOT 'admin'
        if (!user || user.role !== "admin") {
            return null;
        }

        // Return the verified user details
        return { 
            userId: user._id.toString(), 
            role: user.role, 
            // Add any other necessary admin data here
        };

    } catch (error) {
        console.error("Error during admin verification:", error);
        return null; // Return null on any database/fetch error
    }
}