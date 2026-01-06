// src/components/auth/RegisterForm.jsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useState } from "react";

// 🎯 NEW: Firebase Imports
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

import LoadingButton from "@/components/ui/LoadingButton";

const auth = getAuth(app);
const db = getFirestore(app);

const registerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export function RegisterForm({ onRegisterSuccess, switchToLogin }) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(data) {
        setLoading(true);
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            const user = userCredential.user;

            // 2. Update Display Name in Auth Profile
            await updateProfile(user, { displayName: data.name });

            // 3. Create User Document in Firestore (to store the Role)
            // This replaces your MongoDB logic
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: data.name,
                email: data.email,
                role: "student", // Default role
                createdAt: new Date().toISOString(),
            });

            toast.success("Account created successfully!");

            // Pass the email/password back if your parent component needs it to auto-login
            if (onRegisterSuccess) {
                onRegisterSuccess({ email: data.email, password: data.password });
            }
        } catch (error) {
            console.error("Firebase Auth Error Code:", error.code);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    toast.error("This email is already registered. Try logging in.");
                    break;
                case 'auth/invalid-email':
                    toast.error("The email address is not valid.");
                    break;
                case 'auth/operation-not-allowed':
                    toast.error("Email/Password accounts are not enabled in Firebase Console.");
                    break;
                case 'auth/weak-password':
                    toast.error("The password is too weak.");
                    break;
                default:
                    toast.error(error.message || "An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="register-name" className="text-sm text-[var(--primary-text)] dark:[var(--secondary-text)]">Full Name</label>
                <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    {...register("name")}
                    className="w-full border border-[var(--background)] rounded text-[var(--primary-text)] dark:[var(--secondary-text)] p-2"
                />
                {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="register-email" className="text-sm text-[var(--primary-text)] dark:[var(--secondary-text)]">Email</label>
                <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className="w-full border border-[var(--background)] rounded text-[var(--primary-text)] dark:[var(--secondary-text)] p-2"
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="register-password" className="text-sm text-[var(--primary-text)] dark:[var(--secondary-text)]">Password</label>
                <input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full border border-[var(--background)] rounded text-[var(--primary-text)] dark:[var(--secondary-text)] p-2"
                />
                {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="register-confirm" className="text-sm text-[var(--primary-text)] dark:[var(--secondary-text)]">Confirm Password</label>
                <input
                    id="register-confirm"
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className="w-full border border-[var(--background)] rounded text-[var(--primary-text)] dark:[var(--secondary-text)] p-2"
                />
                {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
                )}
            </div>

            {/* Submit */}
            <LoadingButton type="submit" loading={loading} className="bg-green-600 hover:bg-green-700">
                Create Account
            </LoadingButton>

            {/* Switch link */}
            <p className="text-sm text-[var(--primary-text)] dark:[var(--secondary-text)] text-center text-gray-600 mt-2">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-blue-600 hover:underline"
                >
                    Sign In
                </button>
            </p>
        </form>
    );
}
