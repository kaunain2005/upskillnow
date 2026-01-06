// src/app/(auth)/auth/page.jsx
"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Toaster, toast } from "react-hot-toast";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [registeredCredentials, setRegisteredCredentials] = useState(null);

  // ✅ After successful register
  const handleRegisterSuccess = (data) => {
    setRegisteredCredentials({ email: data.email, password: data.password });
    toast.success("Account created successfully! Please log in.");
    setActiveTab("login");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Toaster position="top-center" />
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            activeTab === "login"
              ? "url('/auth/login-bg.png')"
              : "url('/auth/register-bg.png')",
        }}
      />

      {/* Card */}
      <div className="relative z-10 my-5 w-full max-w-md bg-white rounded-lg shadow-lg p-8 mx-2">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {activeTab === "login"
            ? "Sign in to your account"
            : "Create your account"}
        </p>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 pb-2 text-sm font-medium ${activeTab === "login"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
              }`}
            onClick={() => setActiveTab("login")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-medium ${activeTab === "register"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
              }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* ✅ Render forms */}
        {activeTab === "login" ? (
          <LoginForm
            defaultValues={registeredCredentials}
            switchToRegister={() => setActiveTab("register")}
          />
        ) : (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            switchToLogin={() => setActiveTab("login")}
          />
        )}

      </div>
    </div>
  );
}
