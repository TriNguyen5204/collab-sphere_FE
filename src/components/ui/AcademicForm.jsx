import React, { useState, useEffect } from "react";

export default function AcademicForm({ defaultValues = {}, onSubmit, onCancel = () => {}, submitting = false }) {
  const [form, setForm] = useState({
    subjectCode: "",
    subjectName: "",
    nameEn: "",
    noCredit: 3,
    description: "",
    isActive: true,
    ...defaultValues
  });

  useEffect(() => setForm((s) => ({ ...s, ...defaultValues })), [defaultValues]);

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit?.(form); }}
      className="bg-white rounded-xl p-4 border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Subject Code</label>
          <input value={form.subjectCode} onChange={e => setField("subjectCode", e.target.value)} className="input w-full" placeholder="e.g. SWP391" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Credits</label>
          <input type="number" value={form.noCredit} onChange={e => setField("noCredit", Number(e.target.value))} className="input w-full" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Name (VI)</label>
          <input value={form.subjectName} onChange={e => setField("subjectName", e.target.value)} className="input w-full" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Name (EN)</label>
          <input value={form.nameEn} onChange={e => setField("nameEn", e.target.value)} className="input w-full" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Short description</label>
          <textarea value={form.description} onChange={e => setField("description", e.target.value)} className="input w-full h-24" />
        </div>

        <div className="flex items-center gap-2">
          <input id="active" type="checkbox" checked={form.isActive} onChange={e => setField("isActive", e.target.checked)} />
          <label htmlFor="active" className="text-sm">Active</label>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button type="submit" disabled={submitting} className="px-3 py-2 rounded bg-indigo-600 text-white">
          {submitting ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded border">Cancel</button>
      </div>
    </form>
  );
}
