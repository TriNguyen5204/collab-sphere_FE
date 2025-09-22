import React, { useState } from "react";
import AcademicTable from "../../components/ui/AcademicTable";
import AcademicCard from "../../components/ui/AcademicCard";
import AcademicForm from "../../components/ui/AcademicForm";

const sampleSubjects = [
  {
    subjectId: "sub_SE109",
    subjectCode: "SE109",
    subjectName: "Project-Based Software Engineering",
    nameEn: "Project-Based Software Engineering",
    noCredit: 3,
    description: "Team project course",
    isActive: true,
    syllabus: { syllabusName: "SE109 - Fall 2025", outcomes: [{ code: "LO1" }] }
  },
  {
    subjectId: "sub_SE203",
    subjectCode: "SE203",
    subjectName: "AI for Education",
    nameEn: "AI for Education",
    noCredit: 3,
    description: "AI support for learning projects",
    isActive: true,
    syllabus: { syllabusName: "SE203 - Fall 2025", outcomes: [{ code: "LO1" }] }
  }
];

export default function AcademicList() {
  const [subjects, setSubjects] = useState(sampleSubjects);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // or 'grid'
  const [q, setQ] = useState("");

  function handleCreateOrUpdate(data) {
    if (data.subjectId) {
      // update
      setSubjects(prev => prev.map(s => (s.subjectId === data.subjectId ? { ...s, ...data } : s)));
    } else {
      // create (simple id)
      const id = `sub_${Date.now()}`;
      setSubjects(prev => [{ subjectId: id, ...data }, ...prev]);
    }
    setEditing(null);
  }

  function handleDelete(id) {
    if (!confirm("Delete subject?")) return;
    setSubjects(prev => prev.filter(s => s.subjectId !== id));
  }

  const filtered = subjects.filter(s =>
    !q ||
    s.subjectCode.toLowerCase().includes(q.toLowerCase()) ||
    (s.subjectName && s.subjectName.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Subjects</h2>
          <p className="text-sm text-gray-500">Manage subjects & syllabi</p>
        </div>

        <div className="flex items-center gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search code or name…" className="input" />
          <button onClick={() => setEditing({})} className="px-3 py-1.5 rounded bg-indigo-600 text-white">New Subject</button>
          <div className="ml-2">
            <button onClick={() => setViewMode("table")} className={`px-2 py-1 rounded border ${viewMode==="table" ? "bg-gray-100":""}`}>Table</button>
            <button onClick={() => setViewMode("grid")} className={`px-2 py-1 rounded border ${viewMode==="grid" ? "bg-gray-100":""}`}>Grid</button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <AcademicTable rows={filtered} onEdit={setEditing} onDelete={handleDelete} />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => <AcademicCard key={s.subjectId} subject={s} onEdit={setEditing} onDelete={handleDelete} />)}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center p-6">
          <div className="bg-white w-full max-w-3xl rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">{editing.subjectId ? "Edit Subject" : "New Subject"}</h3>
            <AcademicForm
              defaultValues={editing}
              onCancel={() => setEditing(null)}
              onSubmit={handleCreateOrUpdate}
            />
          </div>
        </div>
      )}
    </main>
  );
}
