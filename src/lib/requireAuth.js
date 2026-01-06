// src/lib/requireAuth.js
import { verifyToken } from "./jwt";
import { cookies } from "next/headers";

// FIX: This must now be async to await verifyToken
export async function requireAuth(req) {
  let token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    const cookieStore = cookies();
    token = cookieStore.get("token")?.value;
  }

  if (!token) return null;

  // FIX: Must use await
  const decoded = await verifyToken(token);
  if (!decoded) return null;

  return decoded; // { userId, role }
}
