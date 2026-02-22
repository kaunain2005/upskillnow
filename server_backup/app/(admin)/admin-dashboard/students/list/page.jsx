// src/app/(admin)/admin-dashboard/students/list/page.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import gsap from "gsap";

export default function ListStudentsPage({ isDeleted = false, name = "List Students 👩‍🎓" }) {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    stream: "",
    year: "",
    mobile: "",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const cardsRef = useRef([]);

  // ✅ Debounce filter changes
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delay);
  }, [filters, page]);

  // ✅ Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...filters, page, limit });
      const res = await fetch(`/api/admin/users?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch students");

      setStudents(data.students);
      setTotal(data.total);

      // GSAP animation
      setTimeout(() => {
        if (cardsRef.current.length > 0) {
          gsap.fromTo(
            cardsRef.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: "power3.out",
            }
          );
        }
      }, 100);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle soft delete
  const handleSoftDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");

      toast.success("Student moved to deleted list");
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(total / limit);

  // ✅ Group by stream
  const grouped = {
    CS: students.filter((s) => s.stream === "CS"),
    IT: students.filter((s) => s.stream === "IT"),
    DS: students.filter((s) => s.stream === "DS"),
  };

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--secondary-background)] p-6 md:p-10">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary-text)] dark:text-[var(--secondary-text)]">
          {name}
        </h1>
        <button
          onClick={() => router.push("/admin-dashboard")}
          className="px-4 py-2 bg-[var(--bg-dark-shade-4)] text-[var(--primary-text)] dark:text-[var(--secondary-text)] rounded-lg hover:bg-gray-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {["name", "email", "mobile"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={`Search by ${field}`}
            value={filters[field]}
            onChange={(e) =>
              setFilters({ ...filters, [field]: e.target.value })
            }
            className="px-3 py-2 rounded-lg border border-gray-300 w-full"
          />
        ))}
        <select
          value={filters.stream}
          onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300"
        >
          <option value="">All Streams</option>
          <option value="CS">CS</option>
          <option value="IT">IT</option>
          <option value="DS">DS</option>
        </select>
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300"
        >
          <option value="">ars</option>
          <option value="FY">FY</option>
          <option value="SY">SY</option>
          <option value="TY">TY</option>
        </select>
      </div>

      {/* Student Sections */}
      {loading ? (
        <p className="text-center text-gray-500">Loading students...</p>
      ) : students.length === 0 ? (
        <p className="text-center text-gray-500">No students found</p>
      ) : (
        Object.entries(grouped).map(([stream, list]) =>
          list.length > 0 ? (
            <div key={stream} className="mb-10">
              <h2 className="text-xl font-bold mb-4 text-[var(--secondary-color)] dark:text-[var(--primary-color)]">
                {stream === "CS"
                  ? "Computer Science"
                  : stream === "IT"
                    ? "Information Technology"
                    : "Data Science"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {list.map((student, i) => (
                  <div
                    key={student._id}
                    ref={(el) => (cardsRef.current[i] = el)}
                    className="p-6 border-1 bg-[var(--card-background)] dark:bg-[var(--bg-dark-shade-4)] dark:border-white rounded-xl shadow-md hover:shadow-xl transition"
                  >
                    {/* Profile Image */}
                    <img
                      src={
                        student.profileImage ||
                        (student.gender?.toLowerCase() === "male"
                          ? "/images/defaults/maleDefaultProfile.png"
                          : student.gender?.toLowerCase() === "female"
                            ? "/images/defaults/femaleDefaultProfile.png"
                            : "/images/defaults/defaultProfile.png")
                      }
                      alt="profile"
                      className={`w-35 h-35 rounded-full mx-auto mb-2 object-cover border ${student.gender?.toLowerCase() === "male" ? "border-blue-500" : student.gender?.toLowerCase() === "female" ? "border-pink-500" : "border-gray-500"}`}
                    />

                    {/* Name & Email */}
                    <h3 className="text-lg font-semibold text-center">{student.name}</h3>
                    <p className="text-sm text-gray-500 text-center">{student.email}</p>
                    <p className="text-sm text-gray-500 text-center">
                      {student.stream} - {student.year}
                    </p>
                    <p className="text-sm text-gray-500 text-center">
                      {student.division} | {student.mobile || "No mobile"}
                    </p>

                    {/* ✅ Gender Badge */}
                    <div className="flex justify-center mt-2">
                      {student.gender?.toLowerCase() === "male" && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          🚹 Male
                        </span>
                      )}
                      {student.gender?.toLowerCase() === "female" && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                          🚺 Female
                        </span>
                      )}
                      {(!student.gender || student.gender?.toLowerCase() === "other") && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                          ⚪ Other
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex justify-center gap-3">
                      <button
                        onClick={() =>
                          router.push(`/admin-dashboard/students/update/${student._id}`)
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                      {isDeleted ? (
                        null
                      ) : (
                        <button
                          onClick={() => handleSoftDelete(student._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )
                      }
                    </div>
                  </div>

                ))}
              </div>
            </div>
          ) : null
        )
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
