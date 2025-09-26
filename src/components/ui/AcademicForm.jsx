import React, { useState } from "react";
import {
  Book, Hash, FileText, Clock, CheckCircle2, XCircle,
  PlusCircle, Trash2, Percent, Target
} from "lucide-react";

export default function AcademicForm({ initialValues = {}, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    SubjectCode: "",
    SyllabusName: "",
    Description: "",
    NoCredit: 0,
    IsActive: true,
    GradeComponents: [],
    Outcomes: [],
    ...initialValues,
  });

  // General field update
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // GradeComponents handlers
  function addGradeComponent() {
    setValues((prev) => ({
      ...prev,
      GradeComponents: [...prev.GradeComponents, { ComponentName: "", ReferencePercentage: 0 }],
    }));
  }

  function updateGradeComponent(index, field, val) {
    setValues((prev) => {
      const arr = [...prev.GradeComponents];
      arr[index][field] = val;
      return { ...prev, GradeComponents: arr };
    });
  }

  function removeGradeComponent(index) {
    setValues((prev) => ({
      ...prev,
      GradeComponents: prev.GradeComponents.filter((_, i) => i !== index),
    }));
  }

  // Outcomes handlers
  function addOutcome() {
    setValues((prev) => ({
      ...prev,
      Outcomes: [...prev.Outcomes, { OutcomeDetail: "" }],
    }));
  }

  function updateOutcome(index, val) {
    setValues((prev) => {
      const arr = [...prev.Outcomes];
      arr[index].OutcomeDetail = val;
      return { ...prev, Outcomes: arr };
    });
  }

  function removeOutcome(index) {
    setValues((prev) => ({
      ...prev,
      Outcomes: prev.Outcomes.filter((_, i) => i !== index),
    }));
  }

  // Submit
  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      SubjectCode: values.SubjectCode || `SUB${Date.now()}`,
      SyllabusName: values.SyllabusName || "Untitled Subject",
      Description: values.Description || "No description provided.",
      NoCredit: Number(values.NoCredit) || 0,
      IsActive: values.IsActive ?? true,
      GradeComponents: values.GradeComponents || [],
      Outcomes: values.Outcomes || [],
    };
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border shadow p-6">
      {/* Subject Info */}
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" /> Subject Code *
        </label>
        <input
          type="text"
          name="SubjectCode"
          value={values.SubjectCode}
          onChange={handleChange}
          placeholder="e.g. SE101"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Book className="w-4 h-4 text-gray-400" /> Syllabus Name *
        </label>
        <input
          type="text"
          name="SyllabusName"
          value={values.SyllabusName}
          onChange={handleChange}
          placeholder="e.g. Introduction to Software Engineering"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" /> Description
        </label>
        <textarea
          name="Description"
          value={values.Description}
          onChange={handleChange}
          placeholder="Enter short description…"
          rows={3}
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Number of Credits
        </label>
        <input
          type="number"
          name="NoCredit"
          value={values.NoCredit}
          onChange={handleChange}
          placeholder="0"
          min="0"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="IsActive"
          type="checkbox"
          name="IsActive"
          checked={values.IsActive}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label htmlFor="IsActive" className="text-sm font-medium">Active</label>
      </div>

      {/* Grade Components */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-400" /> Grade Components
          </label>
          <button type="button" onClick={addGradeComponent}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            <PlusCircle className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {values.GradeComponents.map((gc, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={gc.ComponentName}
                onChange={(e) => updateGradeComponent(i, "ComponentName", e.target.value)}
                placeholder="Component name (e.g. Midterm)"
                className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={gc.ReferencePercentage}
                onChange={(e) => updateGradeComponent(i, "ReferencePercentage", e.target.value)}
                placeholder="%"
                className="w-24 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => removeGradeComponent(i)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Outcomes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-400" /> Outcomes
          </label>
          <button type="button" onClick={addOutcome}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            <PlusCircle className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {values.Outcomes.map((o, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={o.OutcomeDetail}
                onChange={(e) => updateOutcome(i, e.target.value)}
                placeholder="Outcome detail"
                className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => removeOutcome(i)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
        >
          <XCircle className="w-4 h-4" /> Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          <CheckCircle2 className="w-4 h-4" /> Create
        </button>
      </div>
    </form>
  );
}
