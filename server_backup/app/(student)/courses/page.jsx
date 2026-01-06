// src/(student)/courses/page.jsx
import { Suspense } from "react";
import CoursesClient from "./CoursesClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading courses...</div>}>
      <CoursesClient />
    </Suspense>
  );
}
