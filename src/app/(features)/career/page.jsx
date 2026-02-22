"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CareerForm() {
  const router = useRouter();

  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [interest, setInterest] = useState("");

  const handleSubmit = () => {
    if (!year || !branch || !interest) {
      alert("Please select all fields");
      return;
    }

    // ✅ THIS IS THE FIX
    router.push(
      `/career/result?year=${year}&branch=${branch}&interest=${interest}`
    );
  };

  return (
    <div className="page mt-15" >
      <h1 className="title ">Career Guidance System</h1>
      <p className="subtitle">
        Personalized roadmap based on your profile
      </p>

      <div className="card">
        <label>Academic Year</label>
        <select onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="FY">First Year</option>
          <option value="SY">Second Year</option>
          <option value="TY">Third Year</option>
        </select>

        <label>Branch</label>
        <select onChange={(e) => setBranch(e.target.value)}>
          <option value="">Select Branch</option>
          <option value="CS">Computer Science</option>
          <option value="IT">Information Technology</option>
          <option value="DS">Data Science</option>
        </select>

        <label>Interest Area</label>
        <select onChange={(e) => setInterest(e.target.value)}>
          <option value="">Select Interest</option>
          <option value="software-development">Programming / Software Development</option>
          <option value="data-analytics">Data Analytics & Business Intelligence</option>
          <option value="ai-ml">Artificial Intelligence & Machine Learning</option>
           <option value="web-ui-ux">Web & UI/UX Design</option>
            <option value="cyber">Cyber Security & Ethical Hacking</option>
             <option value="cloud-devops">Cloud Computing & DevOps</option>
              <option value="networking">Networking & System Administration</option>
               <option value="product-management">Product, Management & Tech Leadership</option>
                <option value="startup-freelancing">Startup, Freelancing & Entrepreneurship</option>

        </select>

        <button className="primary-btn" onClick={handleSubmit}>
          Generate My Career Plan →
        </button>
      </div>
    </div>
  );
}
