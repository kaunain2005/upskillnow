// src/context/AuthContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const AuthContext = createContext();
const auth = getAuth(app);
const db = getFirestore(app);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("DEBUG: AuthProvider mounted. Starting onAuthStateChanged listener...");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("DEBUG: Firebase Auth State Changed. firebaseUser exists:", !!firebaseUser);

      try {
        if (firebaseUser) {
          console.log("DEBUG: Fetching ID Token...");
          const token = await firebaseUser.getIdToken();
          console.log("DEBUG: Token fetched successfully.");

          console.log("DEBUG: Fetching User Doc from Firestore for UID:", firebaseUser.uid);
          // We wrap the Firestore call to prevent it from hanging the whole app if rules fail
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
            .catch(err => {
              console.error("DEBUG: Firestore getDoc error (Check your Rules!):", err);
              return null;
            });

          const userData = userDoc?.exists() ? userDoc.data() : null;
          if (!userData) {
            console.warn("DEBUG: No Firestore document found for this user in 'users' collection.");
          }

          const finalUserObject = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || userData?.name || "User",
            email: firebaseUser.email,
            role: userData?.role || "student",
            token: token
          };

          console.log("DEBUG: Setting User state:", finalUserObject);
          setUser(finalUserObject);
        } else {
          console.log("DEBUG: No firebaseUser found (Guest User).");
          setUser(null);
        }
      } catch (error) {
        console.error("DEBUG: Critical error in Auth listener:", error);
        setUser(null);
      } finally {
        console.log("DEBUG: Setting loading to FALSE.");
        setLoading(false);
      }
    });

    return () => {
      console.log("DEBUG: Unsubscribing from Auth listener.");
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStudent: user?.role === "student",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}