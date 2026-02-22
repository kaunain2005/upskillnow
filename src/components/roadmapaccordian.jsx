"use client";
import { useState } from "react";

export default function RoadmapAccordion({ roadmap }) {
  const [open, setOpen] = useState(null);

  const Section = ({ title, content, id }) => (
    <div>
      <button onClick={() => setOpen(open === id ? null : id)}>
        {title}
      </button>
      {open === id && <p>{content}</p>}
    </div>
  );

  return (
    <div>
      <Section title="Skills" content={roadmap.skills.join(", ")} id="skills" />
      <Section title="Tools" content={roadmap.tools.join(", ")} id="tools" />
      <Section title="FY Guidance" content={roadmap.fy} id="fy" />
      <Section title="SY Guidance" content={roadmap.sy} id="sy" />
      <Section title="TY Guidance" content={roadmap.ty} id="ty" />
    </div>
  );
}
