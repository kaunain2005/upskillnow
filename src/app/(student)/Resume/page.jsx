"use client";
import { useState } from "react";
import ResumeForm from "@/components/resume/ResumeForm";
import ResumePreview from "@/components/resume/ResumePreview";

export default function ResumePage() {
  const [resumeData, setResumeData] = useState({});
  const [template, setTemplate] = useState("one");

  return (
   <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Resume Builder
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Form */}
        <ResumeForm
          data={resumeData}
          setData={setResumeData}
          template={template}
          setTemplate={setTemplate}
        />

        {/* Right: Live Preview */}
        <ResumePreview data={resumeData} template={template} />
      </div>
    </div>
  );
}
