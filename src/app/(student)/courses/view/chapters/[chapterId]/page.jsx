// src/app/(student)/courses/[courseId]/chapters/[chapterId]/page.jsx
import ChapterDetailClient from "./ChapterDetailClient";

// REQUIRED for output: 'export'
export async function generateStaticParams() {
  return [];
}

export default function Page({ params }) {
  return (
    <ChapterDetailClient
      courseId={params.courseId}
      chapterId={params.chapterId}
    />
  );
}
