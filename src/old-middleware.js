// src/middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// Public routes that anyone (signed in or out) can access without a full role check.
const publicRoutes = [
    "/auth",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/unauthorized",
];

export async function middleware(req) {
    const token = req.cookies.get("token")?.value;
    console.log("Middleware Token Status:", token ? "FOUND" : "NOT FOUND");
    const { pathname } = req.nextUrl;

    // Helper to determine if the request is for an API route
    const isApiRoute = pathname.startsWith("/api/");

    // 1. Allow access to home `/` explicitly
    if (pathname === "/") {
        return NextResponse.next();
    }

    // 2. Handle truly Public Routes and Flow Control (Req. #3, #4)
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        // If user is signed in and attempts to access /auth, redirect to home (Req. #4)
        if (token && pathname.startsWith("/auth")) {
            console.log("User already logged in, redirecting from auth to home.");
            return NextResponse.redirect(new URL("/", req.url));
        }
        // Allow access to the public route
        return NextResponse.next();
    }

    // --- 3. Authentication Gate ---

    // All remaining routes, including /api/auth/me, are PROTECTED.
    if (!token) {
        console.log("No token found for protected route, handling unauthenticated access.");

        // CRITICAL FIX: If it's an API route, return 401 JSON. Otherwise, redirect page.
        if (isApiRoute) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    // --- 4. Authorization (Token Verification & Role Check) ---
    try {
        // FIX: MUST USE AWAIT because verifyToken is now async
        const decoded = await verifyToken(token);

        // If token is expired, invalid, or corrupted
        if (!decoded || !decoded.role) {
            console.error("Token verification failed (expired or invalid token).");

            // CRITICAL FIX: If token fails, return 401 for API, or redirect for page.
            if (isApiRoute) {
                return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/auth", req.url));
        }

        const userRole = decoded.role;
        console.log(`Token verified in middleware: ${userRole}. Accessing ${pathname}`);

        // Authorization Check: Admin routes
        const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/admin-dashboard");
        if (isAdminRoute && userRole !== "admin") {
            const unauthorizedResponse = isApiRoute
                ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
                : NextResponse.redirect(new URL("/unauthorized", req.url));
            return unauthorizedResponse;
        }

        // Authorization Check: Student routes or general auth routes
        const isStudentRoute = pathname.startsWith("/student") || pathname.startsWith("/courses");
        if (isStudentRoute && !["student", "admin"].includes(userRole)) {
            const unauthorizedResponse = isApiRoute
                ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
                : NextResponse.redirect(new URL("/unauthorized", req.url));
            return unauthorizedResponse;
        }

        // If all checks pass, allow the request to proceed (including /api/auth/me)
        return NextResponse.next();

    } catch (err) {
        console.error("Unexpected JWT processing error:", err);
        // If token processing fails unexpectedly, default to 401 for API or redirect for page
        if (isApiRoute) {
            return NextResponse.json({ error: "Server error during token processing" }, { status: 500 });
        }
        return NextResponse.redirect(new URL("/auth", req.url));
    }
}

export const config = {
    // CRITICAL: Keep /api/auth/me here to force the middleware to run the token check.
    matcher: [
        "/",
        "/auth",
        "/admin/:path*",
        "/admin-dashboard",
        "/admin-dashboard/:path*",
        "/student/:path*",
        "/courses/:path*",
    ],
};
