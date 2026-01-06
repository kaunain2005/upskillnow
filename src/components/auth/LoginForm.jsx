"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

// 🎯 NEW: Import auth from your firebase config
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import LoadingButton from "@/components/ui/LoadingButton";

const loginSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm({ defaultValues, switchToRegister }) {
    const { login } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: defaultValues || { email: "", password: "" },
    });

    useEffect(() => {
        if (defaultValues) {
            setValue("email", defaultValues.email);
            setValue("password", defaultValues.password);
        }
    }, [defaultValues, setValue]);

    async function onSubmit(data) {
        setLoading(true);
        try {
            // 🎯 auth is now defined thanks to the import above
            await signInWithEmailAndPassword(auth, data.email, data.password);

            toast.success("Login successful!");
            // No need to manually call login() here because 
            // AuthContext's onAuthStateChanged will handle it.
            router.push("/");
        } catch (error) {
            console.error("Login error:", error.code);
            // Friendly error messages
            const message = error.code === 'auth/invalid-credential'
                ? "Invalid email or password."
                : "Login failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ... Rest of your JSX remains exactly the same ... */}
            <div>
                <label htmlFor="login-email" className="text-sm text-[var(--primary-text)]">Email</label>
                <input
                    id="login-email"
                    type="email"
                    {...register("email")}
                    className="w-full border-1 border-black rounded p-2 text-black"
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="login-password" className="text-sm text-[var(--primary-text)]">Password</label>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        className="w-full border-1 border-black rounded p-2 text-black"
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            <LoadingButton type="submit" loading={loading}>
                Sign In
            </LoadingButton>

            <p className="text-sm text-center text-gray-600 mt-2">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-blue-600 hover:underline"
                >
                    Register
                </button>
            </p>
        </form>
    );
}