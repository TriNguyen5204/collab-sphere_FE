import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

export default function AcademicDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [tab, setTab] = useState("overview");

  const subject = location.state?.subject ?? {
    subjectId: id,
    subjectCode: id?.replace("sub_", "XX") ?? "UNK",
    subjectName: "Subject name placeholder",
    nameEn: "Subject name EN",
    noCredit: 3,
    description: "This is a placeholder subject. Replace with API call later.",
    syllabus: {
      syllabusName: "Default syllabus",
      timeAllocation: "150h",
      preRequisites: "None",
      outcomes: [{ code: "LO1", desc: "Example outcome" }]
    }
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{subject.subjectCode} — {subject.subjectName}</h1>
          <p className="text-sm text-gray-500">{subject.description}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["overview","syllabus","downloads","outcomes","assessments","approvals"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded ${tab===t ? "bg-indigo-600 text-white":"border"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4">
        {tab === "overview" && (
          <div>
            <h3 className="font-semibold mb-2">Overview</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div><dt className="text-xs text-gray-500">Credits</dt><dd>{subject.noCredit}</dd></div>
              <div><dt className="text-xs text-gray-500">Syllabus</dt><dd>{subject.syllabus?.syllabusName}</dd></div>
              <div className="md:col-span-2"><dt className="text-xs text-gray-500">Description</dt><dd>{subject.description}</dd></div>
            </dl>
          </div>
        )}

        {tab === "syllabus" && (
          <div>
            <h3 className="font-semibold mb-2">Syllabus (basic)</h3>
            <p className="text-sm text-gray-600">Time allocation: {subject.syllabus?.timeAllocation}</p>
            <p className="text-sm text-gray-600">Prerequisites: {subject.syllabus?.preRequisites}</p>
          </div>
        )}

        {tab === "downloads" && (
          <div>
            <h3 className="font-semibold mb-2">Downloads</h3>
            <p className="text-sm text-gray-500">Upload area will appear here (Student Guide, Coding Standards, Git Guide)</p>
          </div>
        )}

        {tab === "outcomes" && (
          <div>
            <h3 className="font-semibold mb-2">Learning outcomes</h3>
            <ul className="list-disc pl-5 text-sm">
              {(subject.syllabus?.outcomes || []).map(o => <li key={o.outcomeId || o.code}>{o.code ?? ""} — {o.description ?? o.desc}</li>)}
            </ul>
          </div>
        )}

        {tab === "assessments" && (
          <div>
            <h3 className="font-semibold mb-2">Assessments</h3>
            <p className="text-sm text-gray-500">Assessment table will be shown here.</p>
          </div>
        )}

        {tab === "approvals" && (
          <div>
            <h3 className="font-semibold mb-2">Topic approvals</h3>
            <p className="text-sm text-gray-500">Topics pending approval will be shown here.</p>
          </div>
        )}
      </div>
    </main>
  );
}

