"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext"; // Use your actual AuthContext path
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import gsap from "gsap"; // Assuming you want to keep the GSAP animation for aesthetic
// import { use } from "react"; // Removed as requested

// ----------------- Cloudinary Upload Helper (Taken from reference) -----------------
// NOTE: Ensure process.env.NEXT_PUBLIC_CLOUDINARY_URL and NEXT_PUBLIC_CLOUDINARY_PRESET are set.
const uploadToCloudinary = (file, userId, setProgress = () => { }, setXhr = () => { }) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      return reject(new Error("No valid file provided"));
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append("folder", `students/${userId}`);
    formData.append("public_id", "profile"); // always overwrite the profile in that folder

    const xhr = new XMLHttpRequest();
    setXhr(xhr);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      }
    };

    xhr.onload = () => {
      setProgress(0);
      setXhr(null);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (err) {
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

    xhr.open("POST", process.env.NEXT_PUBLIC_CLOUDINARY_URL);
    xhr.send(formData);
  });
};
// ---------------------------------------------------------------------------------

// helper for profile image preview + defaults
function getProfileImage(student, preview) {
  if (preview) return preview;
  if (student?.profileImage) return student.profileImage;
  if (student?.gender?.toLowerCase() === "male") return "/images/defaults/maleDefaultProfile.png";
  if (student?.gender?.toLowerCase() === "female") return "/images/defaults/femaleDefaultProfile.png";
  return "/images/defaults/defaultProfile.png";
}

// ----------------- Validation Schema (Updated to allow blank password update) -----------------
const profileSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  stream: z.enum(["CS", "IT", "DS", ""], { required_error: "Stream is required" }),
  year: z.enum(["FY", "SY", "TY", ""], { required_error: "Year is required" }),
  mobile: z.string().regex(/^(\+?\d{1,4}[ -]?)?\d{10}$/, { message: "Invalid mobile number" }).optional().or(z.literal('')),
  division: z.string().max(10).optional().or(z.literal('')),
  gender: z.enum(["male", "female", "other", ""]).optional(),
}).refine(data => {
  // If password field is filled, confirmPassword must match, and vice versa.
  if ((data.password && !data.confirmPassword) || (!data.password && data.confirmPassword)) {
    return false;
  }
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "New passwords must match.",
  path: ["confirmPassword"],
});


// ----------------- Main Profile Page Component -----------------
export default function ProfilePage() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    // FIX: Using safe destructuring for updateUser
    updateUser = () => console.error("AuthContext.updateUser is not available")
  } = useAuth();
  const router = useRouter();

  // UI/State management
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cardsRef = useRef([]);

  // Image upload state
  const [preview, setPreview] = useState(null); // Local URL for immediate image preview
  const [progress, setProgress] = useState(0); // Cloudinary upload progress
  const [xhr, setXhr] = useState(null); // XHR object for canceling upload
  const [isUploading, setIsUploading] = useState(false); // Flag for current upload status
  const [uploadedUrl, setUploadedUrl] = useState(null); // The final Cloudinary secure_url

  const defaultFormValues = {
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    stream: user?.stream || "",
    year: user?.year || "",
    division: user?.division || "",
    gender: user?.gender || "",
    password: "",
    confirmPassword: "",
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  // Sync form on user change (e.g., initial load or successful update)
  useEffect(() => {
    if (user) {
      // Create a new object for reset to avoid stale closures with defaultFormValues
      const newDefaultValues = {
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        stream: user.stream || "",
        year: user.year || "",
        division: user.division || "",
        gender: user.gender || "",
        password: "",
        confirmPassword: "",
      };
      reset(newDefaultValues);
      setPreview(null);
      setUploadedUrl(null);
    }
  }, [user, reset]);

  // Animation Effect (Keeping the reference's style)
  useEffect(() => {
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    }
  }, [isEditing]);

  // Cleanup preview URL
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  // --- Image Upload Logic ---

  // Cancel upload
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
    toast("Upload cancelled", { icon: '❌' });
  };

  // Handle file selection -> auto upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return; // Need user ID for Cloudinary folder

    // Cleanup previous state
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
    setProgress(0);

    // Abort any existing upload
    if (xhr) {
      try { xhr.abort(); } catch (err) { /* */ }
      setXhr(null);
    }

    setIsUploading(true);
    const uploadToastId = toast.loading("Uploading image...", { duration: 0 });
    try {
      const res = await uploadToCloudinary(file, user._id, (p) => setProgress(p), setXhr);
      setUploadedUrl(res.secure_url);
      toast.success("Image uploaded successfully!", { id: uploadToastId });
    } catch (err) {
      toast.error("Image upload failed: " + (err?.message || "unknown"), { id: uploadToastId });
      setUploadedUrl(null);
    } finally {
      setIsUploading(false);
      setXhr(null);
      setProgress(0);
    }
  };

  // Trigger file input click
  const triggerReupload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Remove locally selected/uploaded file
  const removeImage = () => {
    if (isUploading) cancelUpload();
    setPreview(null);
    setUploadedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    toast("Image selection cleared.");
  }

  // --- Form Submission Logic ---
  const onSubmit = async (data) => {
    if (isUploading) {
      toast.error("Please wait for the image upload to finish or cancel it.");
      return;
    }

    setIsSubmitting(true);
    const submitToastId = toast.loading("Saving profile changes...");

    try {
      const finalData = {};
      let changed = false;

      // 1. Process all fields, only sending changed values
      Object.keys(data).forEach(key => {
        const currentValue = data[key];
        // Safely access the initial value from the user object
        const initialValue = user[key];

        if (key === 'confirmPassword') return;

        // Password fields: only send if both are filled and valid
        if (key === 'password' && currentValue.length > 0) {
          finalData[key] = currentValue;
          changed = true;
          return;
        }

        // General fields: send if different from initial value
        // Comparison handles null/undefined/"" correctly for clearing fields
        if (String(currentValue || '') !== String(initialValue || '')) {
          finalData[key] = currentValue;
          changed = true;
        }
      });

      // 2. Process Profile Image
      let finalImageUrl = user.profileImage; // Start with current DB image

      if (uploadedUrl) {
        // If we have a newly uploaded URL, use it
        finalImageUrl = uploadedUrl;
        changed = true;
      } else if (preview && !fileInputRef.current?.files?.[0] && !user.profileImage) {
        // Case: User selected a file, preview is set, but then canceled the upload (uploadedUrl is null).
        // The image should not be changed from the original DB value (unless it was cleared explicitly).
        // We can ignore this as the change detection below handles it.
      } else if (!preview && !uploadedUrl && user.profileImage) {
        // If user cleared both local states, and the DB still has an image, clear it. (Explicit "Remove")
        finalImageUrl = null;
        changed = true;
      }

      // Check if the final determined image URL is different from the original one
      if (finalImageUrl !== user.profileImage) {
        finalData.profileImage = finalImageUrl;
        changed = true;
      }


      if (!changed) {
        toast.dismiss(submitToastId);
        toast.success("No changes detected.");
        setIsEditing(false);
        return;
      }

      // API call to student profile update API (using PUT for REST convention)
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });
      const result = await res.json();

      toast.dismiss(submitToastId);

      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }

      toast.success("Profile updated successfully! ✨");

      // Update global auth state with new student data
      updateUser(result.student);

      // Clear local image states
      setPreview(null);
      setUploadedUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = null;

      // Exit edit mode
      setIsEditing(false);

    } catch (err) {
      toast.dismiss(submitToastId);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------- Auth/Loading/Error Handling -----------------
  if (authLoading) {
    return <div className="p-6 text-center text-gray-500">Loading user data...</div>;
  }

  if (!isAuthenticated || !user) {
    router.push("/auth/login"); // Redirect to login if not authenticated
    return null;
  }

  // ----------------- UI Rendering -----------------

  // Reusable Input Field component
  const InputField = ({ label, name, type = "text", error, disabled = false, options = null, isPassword = false }) => (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          {...register(name)}
          defaultValue={user[name] || ""}
          disabled={disabled}
          className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
        >
          <option value="">Select</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          {...register(name)}
          // Use the initial value from the user object for input
          defaultValue={user[name] || (isPassword ? "" : "")}
          disabled={disabled}
          className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          autoComplete={isPassword ? 'new-password' : 'off'}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  // View Mode (Profile Details)
  const ProfileView = ({ user, setIsEditing }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Profile Information</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push("/")} // Added Home Navigation Button
            className="px-4 cursor-pointer py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-md flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Home
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 cursor-pointer py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.232 3.232z"></path></svg>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {Object.entries({
          "Full Name": user.name,
          "Email Address": user.email,
          "Mobile Number": user.mobile || "N/A",
          "Stream": user.stream || "N/A",
          "Year": user.year || "N/A",
          "Division": user.division || "N/A",
          "Gender": user.gender || "N/A",
        }).map(([label, value]) => (
          <div key={label}>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex justify-center">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100 my-8">

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-200 mb-6">
          <img
            src={getProfileImage(user, preview)}
            alt={`${user.name}'s profile`}
            className="w-24 h-24 object-cover rounded-full ring-4 ring-indigo-500"
            onError={(e) => e.target.src = "/images/defaults/defaultProfile.png"}
          />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
            <p className="text-md font-medium text-indigo-600">{user.role.toUpperCase()}</p>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Edit Your Details</h2>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-md flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); reset(defaultFormValues); removeImage(); }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Profile Image Management */}
            <div className="p-4 bg-white rounded-xl shadow-lg border border-indigo-100">
              <h3 className="text-lg font-semibold mb-3">Profile Image</h3>

              <div className="flex items-center gap-6">
                <img src={getProfileImage(user, preview)} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border-2 border-indigo-400" />
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={isUploading || isSubmitting}
                  />
                  {isUploading && (
                    <div className="mt-2">
                      <progress value={progress} max={100} className="w-full h-2 rounded-lg" />
                      <p className="text-xs text-indigo-600 mt-1">Uploading... {progress}%</p>
                    </div>
                  )}
                  <div className="mt-2 flex gap-3">
                    {(uploadedUrl || (user.profileImage && !preview)) && (
                      <button type="button" onClick={removeImage} className="text-red-600 cursor-pointer hover:underline text-sm">Remove Image</button>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" name="name" error={errors.name?.message} />
              <InputField label="Email Address" name="email" type="email" error={errors.email?.message} disabled={true} />
              <InputField label="Mobile Number" name="mobile" error={errors.mobile?.message} />
              <InputField label="Division" name="division" error={errors.division?.message} />

              <InputField label="Stream" name="stream" options={["CS", "IT", "DS"]} error={errors.stream?.message} />
              <InputField label="Year" name="year" options={["FY", "SY", "TY"]} error={errors.year?.message} />
              <InputField label="Gender" name="gender" options={["male", "female", "other"]} error={errors.gender?.message} />

              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Change Password (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="New Password" name="password" type="password" error={errors.password?.message} isPassword />
                  <InputField label="Confirm New Password" name="confirmPassword" type="password" error={errors.confirmPassword?.message} isPassword />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full cursor-pointer py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center disabled:bg-indigo-400"
              >
                {isSubmitting ? <span className="animate-pulse">Saving Changes...</span> : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <ProfileView user={user} setIsEditing={setIsEditing} />
        )}
      </div>
    </div>
  );
}