"use client";
import { useSearchParams } from "next/navigation";
import { careerRules } from "src/lib/data/careerRules";
import "@/app/globals.css";

export default function CareerResult() {
  const params = useSearchParams();
  const year = params.get("year");
  const branch = params.get("branch");
  const interest = params.get("interest");

  const matchedCareers = careerRules.filter(
    (c) => c.interest === interest && c.branch.includes(branch)
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Your Personalized Career Plan
          </h1>
          <p className="text-gray-500 mt-2">
            Based on your interest, branch & academic year
          </p>
        </div>

        {matchedCareers.map((career) => (
          <div
            key={career.id}
            className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          >
            {/* Career Title */}
            <div>
              <h2 className="text-2xl font-semibold text-indigo-600">
                {career.title}
              </h2>
              <p className="text-gray-600 mt-2">
                {career.overview}
              </p>
            </div>

            {/* WHY + INDUSTRY */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-2">
                  Why This Career?
                </h3>
                <p className="text-gray-700">
                  {career.whyThisCareer}
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-2">
                  Industry Reality
                </h3>
                <p className="text-gray-700">
                  {career.industryReality}
                </p>
              </div>
            </div>

            {/* YEAR GUIDANCE */}
            <div className="border-l-4 border-indigo-500 bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-3">
                {year} Year Focus & Roadmap
              </h3>

              <p className="mb-2">
                <span className="font-medium">🎯 Focus:</span>{" "}
                {career.roadmap[year].focus}
              </p>

              <p className="mb-2">
                <span className="font-medium">🧠 Skills:</span>{" "}
                {career.roadmap[year].skills.join(", ")}
              </p>

              <p>
                <span className="font-medium">🚀 Projects:</span>{" "}
                {career.roadmap[year].projects.join(", ")}
              </p>
            </div>

            {/* TOOLS + CERTS + ROLES */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">🛠 Tools</h3>
                <p className="text-gray-600">
                  {career.tools.join(", ")}
                </p>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">📜 Certifications</h3>
                <p className="text-gray-600">
                  {career.certifications.join(", ")}
                </p>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">💼 Job Roles</h3>
                <p className="text-gray-600">
                  {career.careers.join(", ")}
                </p>
              </div>
            </div>
          </div>
        ))}

        {matchedCareers.length === 0 && (
          <div className="text-center text-gray-500">
            No career found matching your profile.
          </div>
        )}

      </div>
    </div>
  );
}
