"use client";
import { useEffect, useState } from "react";
import { getResumeById } from "@/firebase/resumeService";
import ResumePreview from "@/components/resume/ResumePreview";

export default function ShareResume({ params }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getResumeById(params.id).then(setData);
  }, [params.id]);

  if (!data) return <p>Loading...</p>;

  return <ResumePreview data={data} template={data.template} />;
}
