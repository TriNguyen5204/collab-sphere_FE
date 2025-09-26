import React from "react";
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";

export default function AcademicCard({ subject, onEdit = () => {}, onToggle = () => {} }) {
  if (!subject) return null;
  return (
    <article className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-semibold">
          {subject.SubjectCode || subject.subjectCode} — {subject.SyllabusName || subject.subjectName}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{subject.SyllabusName}</p>
        <p className="text-sm text-gray-600 mt-3">{subject.Description ?? ""}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">{subject.NoCredit ?? "-"} credits</div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(subject)}
            className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-indigo-50"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => onToggle(subject.SubjectId)}
            className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded border ${
              subject.IsActive ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"
            }`}
          >
            {subject.IsActive ? (
              <>
                <ToggleLeft className="w-4 h-4" /> Disable
              </>
            ) : (
              <>
                <ToggleRight className="w-4 h-4" /> Activate
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
