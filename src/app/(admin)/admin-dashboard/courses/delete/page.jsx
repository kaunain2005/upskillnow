// src/app/(admin)/admin-dashboard/courses/delete/page.jsx

import AdminCourseList from "@/components/admin/AdminCourseList";

export default function DeletePage() {
   return(
      <div className="p-5 bg-[var(--background)] h-full">
         <AdminCourseList mode="delete" />
      </div>
   );
}