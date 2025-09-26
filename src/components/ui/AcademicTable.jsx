import React from "react";
import { Link } from "react-router-dom";
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";

export default function AcademicTable({ rows = [], onEdit = () => {}, onToggle = () => {} }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border">
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="p-3">Code</th>
            <th className="p-3">Name</th>
            <th className="p-3">Credits</th>
            <th className="p-3">Active</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && (
            <tr>
              <td colSpan="5" className="p-6 text-center text-gray-500">No subjects yet</td>
            </tr>
          )}
          {rows?.map((r, index) => (
            <tr key={r.SubjectId || `row-${index}`}>
              <td className="p-3 font-medium">{r.SubjectCode}</td>
              <td className="p-3">
                <div className="font-medium">{r.SyllabusName}</div>
                <div className="text-xs text-gray-400">{r.Description}</div>
              </td>
              <td className="p-3">{r.NoCredit ?? "-"}</td>
              <td className="p-3">{r.IsActive ? "✅" : "❌"}</td>
              <td className="p-3 flex gap-2">
                <Link to={`/academic/${r.SubjectId}`} className="px-2 py-1 rounded border text-sm">Open</Link>
                <button
                  onClick={() => onEdit(r)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border text-sm hover:bg-indigo-50"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => onToggle(r.SubjectId)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-sm ${
                    r.IsActive ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"
                  }`}
                >
                  {r.IsActive ? <><ToggleLeft className="w-4 h-4" /> Disable</> : <><ToggleRight className="w-4 h-4" /> Activate</>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
