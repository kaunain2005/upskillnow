// src/app/(admin)/admin-dashboard/courses/update/page.jsx

import AdminCourseList from "@/components/admin/AdminCourseList";

export default function UpdatePage() {
   return(
      <div className="p-5 bg-[var(--background)] h-full">
         <AdminCourseList mode="update" />
      </div>
   );
}