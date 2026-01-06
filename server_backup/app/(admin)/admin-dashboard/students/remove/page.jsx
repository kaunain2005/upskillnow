"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import LoadingButton from "@/components/ui/LoadingButton";

export default function Remove() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]); // Track per-student actions
  const [bulkLoading, setBulkLoading] = useState(false);

  // ✅ Fetch soft deleted students
  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/users/deleted", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch students");
      setStudents(data.students);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Toggle checkbox selection
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ✅ Restore single student
  const handleRestore = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      const res = await fetch(`/api/admin/users/${id}/restore`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      toast.success("Student restored");
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  // ✅ Hard delete single student
  const handleHardDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this student?")) return;
    setLoadingIds((prev) => [...prev, id]);
    try {
      const res = await fetch(`/api/admin/users/${id}/hard`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Student permanently deleted");
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  // ✅ Bulk restore
  const handleBulkRestore = async () => {
    if (selected.length === 0) return toast.error("No students selected");
    setBulkLoading(true);
    try {
      const res = await fetch(`/api/admin/users/restore`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk restore failed");
      toast.success("Selected students restored");
      setSelected([]);
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ✅ Bulk hard delete
  const handleBulkHardDelete = async () => {
    if (selected.length === 0) return toast.error("No students selected");
    if (!confirm("Are you sure you want to permanently delete selected students?")) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`/api/admin/users/hard`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk delete failed");
      toast.success("Selected students permanently deleted");
      setSelected([]);
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <Toaster position="top-center" />

      {/* Header + Back Button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Removed Students 🗑️
        </h1>
        <button
          onClick={() => router.push("/admin-dashboard")}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Bulk Buttons */}
      <div className="flex gap-4 mb-6">
        <LoadingButton
          loading={bulkLoading}
          onClick={handleBulkRestore}
          className="bg-green-600 hover:bg-green-700"
        >
          Bulk Restore
        </LoadingButton>
        <LoadingButton
          loading={bulkLoading}
          onClick={handleBulkHardDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Bulk Hard Delete
        </LoadingButton>
      </div>

      {/* Student Cards */}
      {students.length === 0 ? (
        <p className="text-gray-600">No soft deleted students found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="p-4 bg-white rounded-lg shadow-md border flex flex-col gap-3"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.includes(student._id)}
                onChange={() => toggleSelect(student._id)}
                className="w-4 h-4"
              />

              {/* Info */}
              <div className="flex items-center gap-4">
                <img
                  src={student.profileImage || "/default-avatar.png"}
                  alt={student.name}
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <h2 className="text-lg font-semibold">{student.name}</h2>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p className="text-sm text-gray-500">
                    {student.stream} - {student.year}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <LoadingButton
                  loading={loadingIds.includes(student._id)}
                  onClick={() => handleRestore(student._id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Restore
                </LoadingButton>
                <LoadingButton
                  loading={loadingIds.includes(student._id)}
                  onClick={() => handleHardDelete(student._id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Hard Delete
                </LoadingButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
