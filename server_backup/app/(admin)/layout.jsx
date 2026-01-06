// src/app/(admin)/layout.jsx
"use client";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <main className="flex-1 bg-[var(--dashboard-background)]">{children}</main>
    </div>
  );
}
