"use client";
import { useRouter } from "next/navigation";
import "./careerCard.css";

export default function CareerCard({ career }) {
  const router = useRouter();

  return (
    <div
      className="career-card"
      onClick={() => router.push(`/career/roadmap/${career.id}`)}
    >
      <div className="career-card-header">
        <h4 className="career-title">{career.title}</h4>
        <span className="career-badge">Recommended</span>
      </div>

      <p className="career-desc">{career.description}</p>

      <div className="career-footer">
        <span className="career-link">View Roadmap</span>
        <span className="career-arrow">➜</span>
      </div>
    </div>
  );
}
