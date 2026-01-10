"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

export default function CourseViewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setError("Missing courseId");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const snap = await getDoc(doc(db, "courses", courseId));

        if (!snap.exists()) {
          throw new Error("Course not found");
        }

        setCourse({ id: snap.id, ...snap.data() });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <div className="p-20 text-center">Loading…</div>;
  if (error) return <div className="p-20 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <button onClick={() => router.back()} className="mb-4 text-blue-600">
        ← Back
      </button>

      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="text-gray-500">{course.description}</p>
    </div>
  );
}
