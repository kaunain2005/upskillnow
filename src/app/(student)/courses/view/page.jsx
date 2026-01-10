// src/app/(student)/courses/[courseId]/page.jsx
import CourseViewClient from "./CourseViewClient";

// 🔴 REQUIRED FOR STATIC EXPORT + RUNTIME IDS
export const dynamicParams = true;

// REQUIRED for output: 'export'
export async function generateStaticParams() {
  return []; // allow runtime Firebase IDs
}

export default function Page({ params }) {
  return <CourseViewClient courseId={params.courseId} />;
}
