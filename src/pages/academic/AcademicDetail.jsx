import React from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import { Book, Hash, Clock, FileText, CheckCircle2, XCircle, Target, Percent } from "lucide-react";

export default function AcademicDetail() {
  const { id } = useParams();
  const location = useLocation();

  const subject = location.state?.subject ?? {
    SubjectId: id,
    SubjectCode: id?.replace("sub_", "XX") ?? "UNK",
    SyllabusName: "Subject name placeholder",
    Description: "This is a placeholder subject. Replace with API call later.",
    NoCredit: 3,
    IsActive: true,
    GradeComponents: [
      { ComponentName: "Assignments", ReferencePercentage: 30 },
      { ComponentName: "Final Exam", ReferencePercentage: 70 }
    ],
    Outcomes: [
      { OutcomeDetail: "Understand fundamentals of subject." }
    ],
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-400" />
            {subject.SubjectCode} — {subject.SyllabusName}
          </h1>
          <p className="text-gray-600 mt-1">{subject.Description}</p>
        </div>

        {/* Overview */}
        <section className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Book className="w-4 h-4 text-gray-500" /> Overview
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 text-xs">Credits</dt>
              <dd>{subject.NoCredit}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs">Status</dt>
              <dd className={subject.IsActive ? "text-green-600" : "text-red-600"}>
                {subject.IsActive ? "Active" : "Inactive"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Grade Components */}
        <section className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-500" /> Grade Components
          </h2>
          {subject.GradeComponents?.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-2">Component</th>
                  <th className="py-2">% Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subject.GradeComponents.map((gc, i) => (
                  <tr key={i}>
                    <td className="py-2">{gc.ComponentName}</td>
                    <td className="py-2">{gc.ReferencePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No grade components defined.</p>
          )}
        </section>

        {/* Outcomes */}
        <section className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" /> Learning Outcomes
          </h2>
          {subject.Outcomes?.length > 0 ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {subject.Outcomes.map((o, i) => (
                <li key={i}>{o.OutcomeDetail}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No outcomes defined.</p>
          )}
        </section>

      </div>
    </main>
  );
}
