// src/app/(admin)/admin-dashboard/students/update/[id]/page.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import gsap from "gsap";
import { use } from "react";

// ----------------- inline Cloudinary helper -----------------
const uploadToCloudinary = (file, studentId, setProgress = () => {}, setXhr = () => {}) => {
  return new Promise((resolve, reject) => {
    console.log("Cloudinary upload start", { file, studentId });

    if (!file || !(file instanceof File)) {
      return reject(new Error("No valid file provided"));
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append("folder", `students/${studentId}`);
    formData.append("public_id", "profile"); // always overwrite the profile in that folder

    const xhr = new XMLHttpRequest();
    setXhr(xhr);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
        console.log("Upload progress:", pct);
      }
    };

    xhr.onload = () => {
      setProgress(0);
      setXhr(null);
      console.log("Cloudinary status:", xhr.status, "response:", xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (err) {
          console.error("Failed to parse Cloudinary response", err);
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      setProgress(0);
      setXhr(null);
      reject(new Error("Network error during upload"));
    };

    console.log("Posting to:", process.env.NEXT_PUBLIC_CLOUDINARY_URL);
    xhr.open("POST", process.env.NEXT_PUBLIC_CLOUDINARY_URL);
    xhr.send(formData);
  });
};
// ------------------------------------------------------------

// helper for profile image preview + defaults
function getProfileImage(student, preview) {
  if (preview) return preview;
  if (student?.profileImage) return student.profileImage;
  if (student?.gender?.toLowerCase() === "male") return "/images/defaults/maleDefaultProfile.png";
  if (student?.gender?.toLowerCase() === "female") return "/images/defaults/femaleDefaultProfile.png";
  return "/images/defaults/defaultProfile.png";
}

// validation
const studentSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  stream: z.enum(["CS", "IT", "DS"], { required_error: "Stream is required" }),
  year: z.enum(["FY", "SY", "TY"], { required_error: "Year is required" }),
  mobile: z.string().optional(),
  division: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export default function UpdateStudentPage({ params }) {
  const router = useRouter();
  // unwrap params
  const { id: studentId } = use(params);

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [xhr, setXhr] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null); // cloud secure_url
  const fileInputRef = useRef(null);
  const cardsRef = useRef([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
  });

  // fetch student details
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${studentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch student");
        setStudent(data.student);
        reset(data.student);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [studentId, reset]);

  // animate cards
  useEffect(() => {
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    }
  }, []);

  // cleanup preview URL
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  // Cancel upload — abort XHR and clear states (also clears uploadedUrl)
  const cancelUpload = () => {
    if (xhr) {
      try { xhr.abort(); } catch (e) { /* ignore */ }
    }
    setIsUploading(false);
    setProgress(0);
    setPreview(null);
    setXhr(null);
    setUploadedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    toast("Upload cancelled");
  };

  // handle file selection -> auto upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // cleanup previous preview
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
    setProgress(0);

    // abort any existing upload
    if (xhr) {
      try { xhr.abort(); } catch (err) { /* */ }
      setXhr(null);
    }

    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(file, studentId, (p) => setProgress(p), setXhr);
      console.log("Cloudinary response:", res);
      setUploadedUrl(res.secure_url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed: " + (err?.message || "unknown"));
      setUploadedUrl(null);
    } finally {
      setIsUploading(false);
      setXhr(null);
      setProgress(0);
    }
  };

  // reupload (trigger file input)
  const triggerReupload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // on submit: prefer uploadedUrl; fallback to uploading the selected file synchronously if needed
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let profileUrl = uploadedUrl || null;

      // if no uploadedUrl but user selected file (and didn't upload), upload now (fallback)
      if (!profileUrl && fileInputRef.current?.files?.[0]) {
        setIsUploading(true);
        try {
          const res = await uploadToCloudinary(fileInputRef.current.files[0], studentId, (p) => setProgress(p), setXhr);
          profileUrl = res.secure_url;
          setUploadedUrl(profileUrl);
        } catch (err) {
          console.error("Fallback upload failed:", err);
        } finally {
          setIsUploading(false);
          setXhr(null);
          setProgress(0);
        }
      }

      // build FormData
      const formData = new FormData();
      ["name", "email", "stream", "year", "mobile", "division", "gender", "password"].forEach((key) => {
        if (data[key]) formData.append(key, data[key]);
      });
      if (profileUrl) formData.append("profileImage", profileUrl); // send cloud URL to API

      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: "PUT",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update student");

      toast.success("Student updated successfully!");
      setStudent(result.student);
      reset(result.student);
      setPreview(null);
      setUploadedUrl(null);
      setProgress(0);

      setTimeout(() => router.push("/admin-dashboard/students/list"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update student");
      setProgress(0);
    } finally {
      setLoading(false);
      setXhr(null);
      setIsUploading(false);
    }
  };

  if (!student) return <p className="p-6 text-center text-gray-500">Loading student details...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-10">
      <Toaster position="top-center" />
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Update Student ✏️</h1>
        <button onClick={() => router.push("/admin-dashboard/students/list")} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">← Back to List</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Full Name", name: "name", type: "text", error: errors.name?.message },
          { label: "Email", name: "email", type: "email", error: errors.email?.message },
          { label: "Password (leave blank to keep)", name: "password", type: "password" },
          { label: "Stream", name: "stream", type: "select", options: ["CS", "IT", "DS"], error: errors.stream?.message },
          { label: "Year", name: "year", type: "select", options: ["FY", "SY", "TY"], error: errors.year?.message },
          { label: "Mobile", name: "mobile", type: "text", error: errors.mobile?.message },
          { label: "Division", name: "division", type: "text" },
          { label: "Gender", name: "gender", type: "select", options: ["male", "female", "other"] },
        ].map((field, i) => (
          <div key={field.name} ref={(el) => (cardsRef.current[i] = el)} className="p-4 bg-white rounded-xl shadow-md">
            <label className="block text-sm font-medium">{field.label}</label>
            {field.type === "select" ? (
              <select {...register(field.name)} defaultValue={student[field.name] || ""} className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={field.type} {...register(field.name)} defaultValue={student[field.name] || ""} className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            )}
            {field.error && <p className="text-red-500 text-sm mt-1">{field.error}</p>}
          </div>
        ))}

        {/* Profile Image */}
        <div ref={(el) => (cardsRef.current[cardsRef.current.length] = el)} className="p-4 bg-white rounded-xl shadow-md sm:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium">Profile Image</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            // keep register removed for file input (we manage file manually)
            onChange={handleFileSelect}
            className="w-full mt-2 cursor-pointer"
          />

          <div className="mt-4 flex items-center gap-6">
            <img src={getProfileImage(student, preview)} alt="Profile Preview" className="w-28 h-28 object-cover rounded-full border" />
            <div className="flex-1">
              {isUploading && <progress value={progress} max={100} className="w-full mb-2" />}
              {!isUploading && uploadedUrl && (
                <p className="text-sm text-green-700">Uploaded ✅</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Current profile image (will be replaced if you upload a new one).</p>

              <div className="mt-2 flex gap-3">
                {isUploading ? (
                  <button type="button" onClick={cancelUpload} className="text-red-500 hover:underline">Cancel Upload</button>
                ) : (
                  <>
                    <button type="button" onClick={triggerReupload} className="text-blue-600 hover:underline">Re-upload</button>
                    {uploadedUrl && <button type="button" onClick={() => { setPreview(null); setUploadedUrl(null); if (fileInputRef.current) fileInputRef.current.value = null; toast("Cleared uploaded image"); }} className="text-red-600 hover:underline">Remove</button>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={loading || isUploading} className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center">
            {loading ? <span className="animate-pulse">Updating...</span> : "Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
