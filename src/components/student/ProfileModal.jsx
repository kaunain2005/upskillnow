// src/components/student/ProfileModal.jsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/common/Modal";

// ✅ Zod schema for profile validation
const schema = z.object({
  mobile: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .regex(/^[0-9]+$/, "Only numbers are allowed"),
  stream: z.enum(["CS", "IT", "DS"], { required_error: "Stream is required" }),
  year: z.enum(["FY", "SY", "TY"], { required_error: "Year is required" }),
  division: z.string().min(1, "Division is required"),
  profileImage: z.any().optional(), // handled separately
});

export default function ProfileModal({ user, token, onClose }) {
  const [modal, setModal] = useState({ open: false, title: "", message: "", type: "info" });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      mobile: user?.mobile || "",
      stream: user?.stream || "",
      year: user?.year || "",
      division: user?.division || "",
    },
  });

  const onSubmit = async (form) => {
    try {
      const formData = new FormData();
      formData.append("mobile", form.mobile);
      formData.append("stream", form.stream);
      formData.append("year", form.year);
      formData.append("division", form.division);

      if (form.profileImage && form.profileImage[0]) {
        formData.append("profileImage", form.profileImage[0]);
      }

      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setModal({ open: true, title: "Success", message: "Profile updated successfully!", type: "success" });
        onClose();
      } else {
        setModal({ open: true, title: "Error", message: data.error, type: "error" });
      }
    } catch (err) {
      setModal({ open: true, title: "Error", message: "Something went wrong", type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Complete Your Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Mobile */}
          <input
            type="text"
            placeholder="Mobile Number"
            {...register("mobile")}
            className="border p-2 w-full"
          />
          {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}

          {/* Stream */}
          <select {...register("stream")} className="border p-2 w-full">
            <option value="">Select Stream</option>
            <option value="CS">CS</option>
            <option value="IT">IT</option>
            <option value="DS">DS</option>
          </select>
          {errors.stream && <p className="text-red-500 text-sm">{errors.stream.message}</p>}

          {/* Year */}
          <select {...register("year")} className="border p-2 w-full">
            <option value="">Select Year</option>
            <option value="FY">FY</option>
            <option value="SY">SY</option>
            <option value="TY">TY</option>
          </select>
          {errors.year && <p className="text-red-500 text-sm">{errors.year.message}</p>}

          {/* Division */}
          <input
            type="text"
            placeholder="Division"
            {...register("division")}
            className="border p-2 w-full"
          />
          {errors.division && <p className="text-red-500 text-sm">{errors.division.message}</p>}

          {/* Profile Image */}
          <input
            type="file"
            accept="image/*"
            {...register("profileImage")}
            onChange={(e) => setValue("profileImage", e.target.files)}
            className="border p-2 w-full"
          />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Profile
          </button>
        </form>

        <button onClick={onClose} className="mt-3 text-sm text-gray-500 underline">
          Skip for now
        </button>
      </div>

      {/* Global modal for success/error */}
      <Modal {...modal} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );
}
