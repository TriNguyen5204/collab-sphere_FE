import React from "react";

export default function AcademicCard({ subject, onEdit = () => {}, onDelete = () => {} }) {
  if (!subject) return null;
  return (
    <article className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-semibold">{subject.subjectCode} — {subject.subjectName || subject.nameVi}</h3>
        <p className="text-xs text-gray-500 mt-1">{subject.syllabus?.syllabusName ?? subject.syllabusName ?? ""}</p>
        <p className="text-sm text-gray-600 mt-3">{subject.description ?? ""}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">{subject.noCredit ?? "-"} credits</div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(subject)} className="text-sm px-2 py-1 rounded border">Edit</button>
          <button onClick={() => onDelete(subject.subjectId || subject.id)} className="text-sm px-2 py-1 rounded border text-red-600">Delete</button>
        </div>
      </div>
    </article>
  );
}
