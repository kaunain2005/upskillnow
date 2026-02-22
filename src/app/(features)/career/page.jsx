// src/app/(features)/career/page.jsx
"use client";
import { useState } from "react";
import { careerRules } from "src/lib/data/careerRules";
import "@/app/globals.css";

export default function CareerGuidance() {
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [interest, setInterest] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (!year || !branch || !interest) {
      alert("Please select all fields");
      return;
    }
    setShowResult(true);
  };

  const matchedCareers = careerRules.filter(
    (c) => c.interest === interest && c.branch.includes(branch)
  );

  const handleBack = () => {
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">

      {/* ---------------- FORM SECTION ---------------- */}
      {!showResult && (
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6  mt-24 space-y-4">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Career Guidance System
          </h1>
          <p className="text-center text-gray-500">
            Personalized roadmap based on your profile
          </p>

          <div>
            <label className="block font-medium mb-1">Academic Year</label>
            <select
              className="w-full border rounded-lg p-2"
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="FY">First Year</option>
              <option value="SY">Second Year</option>
              <option value="TY">Third Year</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Branch</label>
            <select
              className="w-full border rounded-lg p-2"
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">Select Branch</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="DS">Data Science</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Interest Area</label>
            <select
              className="w-full border rounded-lg p-2"
              onChange={(e) => setInterest(e.target.value)}
            >
              <option value="">Select Interest</option>
              <option value="software-development">Programming / Software Development</option>
              <option value="data-analytics">Data Analytics</option>
              <option value="ai-ml">AI & ML</option>
              <option value="web-ui-ux">Web & UI/UX</option>
              <option value="cyber">Cyber Security</option>
              <option value="cloud-devops">Cloud & DevOps</option>
              <option value="networking">Networking</option>
              <option value="product-management">Product & Management</option>
              <option value="startup-freelancing">Startup & Freelancing</option>
            </select>
          </div>

          <button
            className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-4"
            onClick={handleSubmit}
          >
            Generate Career Plan
          </button>
        </div>
      )}

      {/* ---------------- RESULT SECTION ---------------- */}
      {showResult && (
        <div className="max-w-5xl mx-auto space-y-8">

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
              <h2 className="text-2xl font-semibold text-indigo-600">
                {career.title}
              </h2>
              <p className="text-gray-600">{career.overview}</p>

              <div className="border-l-4 border-indigo-500 bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold mb-3">
                  {year} Year Roadmap
                </h3>

                <p>
                  <b>🎯 Focus:</b> {career.roadmap[year].focus}
                </p>
                <p>
                  <b>🧠 Skills:</b> {career.roadmap[year].skills.join(", ")}
                </p>
                <p>
                  <b>🚀 Projects:</b> {career.roadmap[year].projects.join(", ")}
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <b>🛠 Tools:</b> {career.tools.join(", ")}
                </div>
                <div>
                  <b>📜 Certifications:</b> {career.certifications.join(", ")}
                </div>
                <div>
                  <b>💼 Job Roles:</b> {career.careers.join(", ")}
                </div>
              </div>
            </div>
          ))}

          {matchedCareers.length === 0 && (
            <div className="text-center text-gray-500">
              No career found matching your profile.
            </div>
          )}

          <div className="text-center">
            <button
              className="mt-4 bg-gray-800 text-white px-6 py-2 rounded-lg"
              onClick={handleBack}
            >
              ← Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}