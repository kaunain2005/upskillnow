// src/app/(admin)/admin-dashboard/courses/list/page.jsx

import AdminCourseList from "@/components/admin/AdminCourseList";


export default function CourseListPage() {
   return(
      <div className="p-5 bg-[var(--background)] h-full">
         <AdminCourseList mode="list" />
      </div>
   );
}