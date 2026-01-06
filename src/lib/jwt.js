import { auth } from "./firebase"; 
import { Capacitor } from "@capacitor/core";
import { jwtDecode } from "jwt-decode"; // To read the token payload on the client

/**
 * Generates a Firebase ID Token.
 * Replaces jose.SignJWT logic.
 */
export async function generateToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("No user logged in to generate token.");
    return null;
  }
  // Firebase automatically manages this JWT. 'true' forces a refresh.
  return await currentUser.getIdToken(true); 
}

/**
 * Verifies the token.
 * Replaces jose.jwtVerify logic.
 */
export async function verifyToken(token) {
  if (!token) return null;

  try {
    // 1. Decode the token to get user info (email, uid, etc.)
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("Token has expired");
      return null;
    }

    // 2. Map Firebase structure to your existing App logic
    // Firebase tokens use 'user_id' for the UID.
    // Note: 'role' will need to be fetched from Firestore or Custom Claims.
    return { 
      userId: decoded.user_id, 
      email: decoded.email,
      role: decoded.role || "student" // Defaulting to student if not in token
    };

  } catch (error) {
    console.error("Token verification failed:", error);
    
    // Fallback for Native: If decoding fails but SDK has a session, use the SDK
    if (Capacitor.isNativePlatform()) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return { userId: currentUser.uid, role: "student" }; 
      }
    }
    return null;
  }
}