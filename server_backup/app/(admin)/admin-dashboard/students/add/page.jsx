// src/app/(admin)/dashboard/students/add/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import gsap from "gsap";

// ✅ Validation schema
const studentSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  stream: z.enum(["CS", "IT", "DS"]),
  year: z.enum(["FY", "SY", "TY"]),
  mobile: z.string()
    .min(10, { message: "Mobile number must be 10 digits." })
    .max(10, { message: "Mobile number must be 10 digits." })
    .refine(value => /^\d+$/.test(value), {
      message: "Mobile number can only contain digits."
    })
    .refine(value => /^[6-9]/.test(value), {
      message: "Mobile number must start with a digit between 6 and 9."
    }),
  division: z.string().optional(),
});

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const cardsRef = useRef([]); // GSAP refs

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
  });

  // ✅ Animate on mount
  useEffect(() => {
    if (cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key]) formData.append(key, data[key]);
      });

      if (data.profileImage && data.profileImage[0]) {
        formData.append("profileImage", data.profileImage[0]);
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add student");

      toast.success("Student added successfully!");
      // setTimeout(() => router.push("/admin-dashboard"), 1500);
      reset(); // ✅ Clear form
      setPreview(null); // ✅ Reset preview
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--secondary-background)] p-6 md:p-10">
      <Toaster position="top-center" />

      {/* Back button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary-text)] dark:text-[var(--secondary-text)]">
          Add New Student 👩‍🎓
        </h1>
        <button
          onClick={() => router.push("/admin-dashboard")}
          className="px-4 border-1 dark:border-white py-2 bg-[var(--bg-dark-shade-4)]  text-[var(--primary-text)] dark:text-[var(--secondary-text)] rounded-lg hover:bg-gray-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Grid-based Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[
          {
            label: "Full Name *",
            name: "name",
            type: "text",
            error: errors.name?.message,
          },
          {
            label: "Email *",
            name: "email",
            type: "email",
            error: errors.email?.message,
          },
          {
            label: "Password *",
            name: "password",
            type: "password",
            error: errors.password?.message,
          },
          {
            label: "Stream *",
            name: "stream",
            type: "select",
            options: ["CS", "IT", "DS"],
            error: errors.stream?.message,
          },
          {
            label: "Year *",
            name: "year",
            type: "select",
            options: ["FY", "SY", "TY"],
            error: errors.year?.message,
          },
          {
            label: "Mobile",
            name: "mobile",
            type: "text",
            error: errors.mobile?.message,
          },
          {
            label: "Division",
            name: "division",
            type: "text",
          },
        ].map((field, i) => (
          <div
            key={field.name}
            ref={(el) => (cardsRef.current[i] = el)}
            className="p-4 bg-[var(--card-background)] rounded-xl shadow-md"
          >
            <label className="block text-sm font-medium text-[var(--secondary-color)] dark:text-[var(--primary-color)]">{field.label}</label>
            {field.type === "select" ? (
              <select
                {...register(field.name)}
                className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option className="bg-[var(--secondary-background)] text-[var(--primary-text)] dark:text-[var(--secondary-text)]" value="">Select</option>
                {field.options.map((opt) => (
                  <option className="bg-[var(--secondary-background)] text-[var(--primary-text)] dark:text-[var(--secondary-text)]" key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name)}
                className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
            {field.error && (
              <p className="text-red-500 text-sm mt-1">{field.error}</p>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <div
          ref={(el) => (cardsRef.current[cardsRef.current.length] = el)}
          className="sm:col-span-2 lg:col-span-3"
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Adding Student...</span>
            ) : (
              "Add Student"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
