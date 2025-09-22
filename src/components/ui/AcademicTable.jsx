import React from "react";
import { Link } from "react-router-dom";

export default function AcademicTable({ rows = [], onEdit = () => {}, onDelete = () => {} }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border">
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="p-3">Code</th>
            <th className="p-3">Name (VI / EN)</th>
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
          {rows.map((r) => (
            <tr key={r.subjectId || r.id}>
              <td className="p-3 font-medium">{r.subjectCode}</td>
              <td className="p-3">
                <div className="font-medium">{r.subjectName || r.nameVi}</div>
                <div className="text-xs text-gray-400">{r.nameEn || r.subjectNameEn}</div>
              </td>
              <td className="p-3">{r.noCredit ?? r.credits ?? "-"}</td>
              <td className="p-3">{r.isActive ? "✅" : "—"}</td>
              <td className="p-3 flex gap-2">
                <Link to={`/academic/${r.subjectId || r.id}`} className="px-2 py-1 rounded border text-sm">Open</Link>
                <button onClick={() => onEdit(r)} className="px-2 py-1 rounded border text-sm">Edit</button>
                <button onClick={() => onDelete(r.subjectId || r.id)} className="px-2 py-1 rounded border text-sm text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
