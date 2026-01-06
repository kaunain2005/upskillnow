"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useCallback } from "react"; // Added useCallback
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title
);

// ----------------- Validation Schema -----------------
const profileSchema = z.object({
    mobile: z.string().optional(),
    stream: z.enum(["CS", "IT", "DS"], { required_error: "Stream required" }),
    year: z.enum(["FY", "SY", "TY"], { required_error: "Year required" }),
    division: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
});

// ----------------- Cloudinary Upload Helper -----------------
const uploadToCloudinary = (file, studentId, setProgress = () => { }, setXhr = () => { }) => {
    return new Promise((resolve, reject) => {
        if (!file || !(file instanceof File)) return reject(new Error("No file provided"));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
        formData.append("folder", `students/${studentId}`);
        formData.append("public_id", "profile");

        const xhr = new XMLHttpRequest();
        setXhr(xhr);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
            setProgress(0);
            setXhr(null);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch {
                    reject(new Error("Failed to parse Cloudinary response"));
                }
            } else reject(new Error(`Upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => {
            setProgress(0);
            setXhr(null);
            reject(new Error("Network error"));
        };

        xhr.open("POST", process.env.NEXT_PUBLIC_CLOUDINARY_URL);
        xhr.send(formData);
    });
};

// ----------------- Helper Component for Static Display -----------------
const ProfileField = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-base font-semibold text-gray-900 dark:text-white">{value || "N/A"}</span>
    </div>
);


// ----------------- Component -----------------
export default function StudentDashboardPage() {
    const { user, loading: authLoading } = useAuth({ redirectTo: "/login", role: "student" });
    const router = useRouter();

    // ----------------- Hooks -----------------
    // Changed from editMode to isModalOpen
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [student, setStudent] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const [xhr, setXhr] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const modalRef = useRef(null); // Used for the modal's internal card animation

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(profileSchema),
    });

    // ----------------- Sync student data -----------------
    const syncAndOpenModal = useCallback(() => {
        if (user) {
            setStudent(user);
            reset(user); // Reset form with current user data
        }
        setIsModalOpen(true);
    }, [user, reset]);

    useEffect(() => {
        if (user) {
            setStudent(user);
        }
    }, [user]);

    // ----------------- Animate Modal -----------------
    useEffect(() => {
        if (isModalOpen && modalRef.current) {
            gsap.fromTo(
                modalRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.2)" }
            );
        }
    }, [isModalOpen]);

    // ----------------- Profile Image -----------------
    const profileImage =
        preview || student?.profileImage?.startsWith("http")
            ? preview || student.profileImage
            : student?.gender?.toLowerCase() === "male"
                ? "/images/defaults/maleDefaultProfile.png"
                : student?.gender?.toLowerCase() === "female"
                    ? "/images/defaults/femaleDefaultProfile.png"
                    : "/images/defaults/defaultProfile.png";

    // ----------------- File Upload -----------------
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
        setUploadedUrl(null);
        setProgress(0);

        if (xhr) try { xhr.abort(); } catch { }

        setIsUploading(true);
        try {
            const studentId = user?._id || student?._id;
            if (!studentId) throw new Error("User ID is missing for upload");

            const res = await uploadToCloudinary(file, studentId, (p) => setProgress(p), setXhr);
            setUploadedUrl(res.secure_url);
            toast.success("Image uploaded");
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
            setXhr(null);
            setProgress(0);
        }
    };

    const cancelUpload = () => {
        if (xhr) try { xhr.abort(); } catch { }
        setIsUploading(false);
        setProgress(0);
        setPreview(null);
        setUploadedUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
        toast("Upload cancelled");
    };

    const triggerReupload = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    // ----------------- Submit Handler -----------------
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const profileUrl = uploadedUrl || student.profileImage || null;

            const formData = new FormData();
            ["mobile", "stream", "year", "division", "gender"].forEach((key) => {
                // Only append if the value is provided (optional fields can be empty)
                if (data[key] !== undefined && data[key] !== null) formData.append(key, data[key]);
            });
            if (profileUrl) formData.append("profileImage", profileUrl);

            const res = await fetch("/api/auth/update", { // Update API
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Failed to update profile");

            toast.success(result.message || "Profile updated!");
            setStudent(result.student);
            reset(result.student);
            setPreview(null);
            setUploadedUrl(null);
            // Close the modal on successful update
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    // ----------------- Chart Data -----------------
    const attendanceData = useMemo(() => ({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [{ label: "Attendance (%)", data: [90, 85, 88, 95, 92], backgroundColor: "rgba(55,48,163,0.8)", borderRadius: 6 }]
    }), []);

    const marksData = useMemo(() => ({
        labels: ["Math", "DSA", "DBMS", "OS", "CN"],
        datasets: [{ label: "Marks", data: [88, 92, 80, 75, 89], borderColor: "rgba(99,102,241,1)", backgroundColor: "rgba(99,102,241,0.3)", fill: true, tension: 0.4 }]
    }), []);

    const activityData = useMemo(() => ({
        labels: ["Assignments", "Projects", "Exams", "Attendance"],
        datasets: [{ label: "Performance", data: [30, 25, 35, 10], backgroundColor: ["rgba(99,102,241,0.8)", "rgba(34,197,94,0.8)", "rgba(249,115,22,0.8)", "rgba(239,68,68,0.8)"], borderWidth: 0 }]
    }), []);

    // ----------------- Render -----------------
    if (authLoading || !student) return <p className="p-6 text-center text-gray-500 dark:text-gray-300">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 md:p-10 text-gray-900 dark:text-white transition-colors duration-300">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-2">
                <h1 className="text-3xl font-bold mb-2 md:mb-0 text-gray-900 dark:text-white">
                    👋 Welcome, {student.name?.split(" ")[0]}!
                </h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                        Home
                    </button>
                    {/* Button now opens the modal */}
                    <button
                        onClick={syncAndOpenModal}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Update Profile
                    </button>
                </div>
            </div>

            {/* Profile Display Section (Always visible and Responsive) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                {/* Profile Image Display */}
                <div className="flex-shrink-0 flex flex-col items-center">
                    <img
                        src={student.profileImage || (student.gender?.toLowerCase() === "male" ? "/images/defaults/maleDefaultProfile.png" : student.gender?.toLowerCase() === "female" ? "/images/defaults/femaleDefaultProfile.png" : "/images/defaults/defaultProfile.png")}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-md object-cover"
                    />
                    <h2 className="text-2xl font-bold mt-3 text-center">{student.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                </div>

                {/* Static Profile Fields Grid (Responsive) */}
                <div className="flex-1 w-full grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 md:pl-6">
                    <ProfileField label="Stream" value={student.stream} />
                    <ProfileField label="Year" value={student.year} />
                    <ProfileField label="Mobile" value={student.mobile} />
                    <ProfileField label="Division" value={student.division} />
                    <ProfileField label="Gender" value={student.gender} />
                    {/* Add other core student fields here if needed */}
                </div>
            </div>

            {/* Charts Section (Responsive) */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-400">Weekly Attendance</h3>
                    <Bar data={attendanceData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-400">Subject-wise Marks</h3>
                    <Line data={marksData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-400">Activity Breakdown</h3>
                    <Doughnut data={activityData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Profile Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                    <form
                        ref={modalRef}
                        onSubmit={handleSubmit(onSubmit)}
                        onClick={(e) => e.stopPropagation()} // Prevent modal close on click inside
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg lg:max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300" // Responsive scrollable modal
                    >
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Edit Your Profile</h2>

                        {/* Modal Content - Responsive Layout */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">

                            {/* 1. Profile Image Section */}
                            <div className="flex-shrink-0 w-full md:w-48 flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full border-2 border-indigo-500 shadow-md object-cover" />
                                <div className="mt-4 flex flex-col gap-2 w-full">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="cursor-pointer text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-800 dark:file:text-white" />

                                    {/* Upload Controls */}
                                    <div className="flex justify-between items-center text-xs mt-1">
                                        {isUploading && <button type="button" onClick={cancelUpload} className="text-red-500 hover:text-red-600 transition">Cancel Upload</button>}
                                        {!isUploading && uploadedUrl && <span className="text-green-500">Image Ready!</span>}
                                        {!isUploading && <button type="button" onClick={triggerReupload} className="text-blue-500 hover:text-blue-600 transition">Re-upload?</button>}
                                    </div>

                                    {isUploading && <progress value={progress} max={100} className="w-full h-2 mt-1 rounded-full overflow-hidden" />}
                                </div>
                            </div>

                            {/* 2. Profile Fields Grid */}
                            <div className="flex-1 w-full grid gap-4 grid-cols-1 sm:grid-cols-2">
                                {["mobile", "stream", "year", "division", "gender"].map((key) => (
                                    <div key={key} className="flex flex-col w-full">
                                        <label htmlFor={key} className="text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">{key}</label>
                                        {key === "stream" || key === "year" || key === "gender" ? (
                                            <select
                                                id={key}
                                                {...register(key)}
                                                defaultValue={student[key] || ""}
                                                className="p-3 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Select {key}</option>
                                                {key === "stream" && ["CS", "IT", "DS"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                {key === "year" && ["FY", "SY", "TY"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                {key === "gender" && ["male", "female", "other"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                id={key}
                                                type="text"
                                                {...register(key)}
                                                defaultValue={student[key] || ""}
                                                placeholder={`Enter your ${key}`}
                                                className="p-3 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        )}
                                        {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]?.message}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading || isUploading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400">
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}