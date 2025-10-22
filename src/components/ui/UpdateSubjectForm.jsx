import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  Plus,
  Trash2,
} from "lucide-react";
import { updateSubject, getSyllabusBySubjectId } from "../../services/userService";
import { toast } from "sonner";

const UpdateSubjectForm = ({ subject, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    subjectName: subject.subjectName,
    subjectCode: subject.subjectCode,
    isActive: subject.isActive,
    subjectSyllabus: null,
  });

  const [loading, setLoading] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const data = await getSyllabusBySubjectId(subject.subjectId);
        if (data?.subjectSyllabus) {
          setForm((prev) => ({
            ...prev,
            subjectSyllabus: data.subjectSyllabus,
          }));
        }
      } catch (error) {
        toast.error("Failed to fetch syllabus");
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [subject.subjectId]);

  // ✅ Handle main subject fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle syllabus fields
  const handleSyllabusChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        [name]: value,
      },
    }));
  };

  // ✅ Learning outcomes
  const handleOutcomeChange = (index, value) => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    updated[index].outcomeDetail = value;
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

  const addOutcome = () => {
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectOutcomes: [
          ...(prev.subjectSyllabus.subjectOutcomes || []),
          { subjectOutcomeId: 0, outcomeDetail: "" },
        ],
      },
    }));
  };

  const removeOutcome = (index) => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    updated.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

  // ✅ Grade components
  const handleGradeChange = (index, field, value) => {
    const updated = [...form.subjectSyllabus.subjectGradeComponents];
    updated[index][field] = value;
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectGradeComponents: updated,
      },
    }));
  };

  const addGradeComponent = () => {
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectGradeComponents: [
          ...(prev.subjectSyllabus.subjectGradeComponents || []),
          { subjectGradeComponentId: 0, componentName: "", referencePercentage: 0 },
        ],
      },
    }));
  };

  const removeGradeComponent = (index) => {
    const updated = [...form.subjectSyllabus.subjectGradeComponents];
    updated.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectGradeComponents: updated,
      },
    }));
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateSubject({
        subjectId: subject.subjectId,
        ...form,
      });
      if (response.isSuccess === true) {
        toast.success("Subject and syllabus updated successfully");
        onSuccess?.();
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating subject");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Fields */}
      <div>
        <label className="font-semibold text-gray-700">Subject Name</label>
        <input
          name="subjectName"
          value={form.subjectName}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700">Subject Code</label>
        <input
          name="subjectCode"
          value={form.subjectCode}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        <span>Active</span>
      </div>

      {/* Syllabus */}
      <button
        type="button"
        onClick={() => setShowSyllabus(!showSyllabus)}
        className="w-full bg-blue-50 py-3 rounded-lg text-blue-700 font-semibold flex justify-between items-center px-4"
      >
        Syllabus Details
        {showSyllabus ? <ChevronUp /> : <ChevronDown />}
      </button>

      {showSyllabus && form.subjectSyllabus && (
        <div className="p-4 border rounded-xl bg-gray-50 space-y-4">
          {/* Syllabus Info */}
          <input
            name="syllabusName"
            value={form.subjectSyllabus.syllabusName || ""}
            onChange={handleSyllabusChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Syllabus Name"
          />
          <textarea
            name="description"
            value={form.subjectSyllabus.description || ""}
            onChange={handleSyllabusChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Description"
          />
          <input
            name="noCredit"
            type="number"
            value={form.subjectSyllabus.noCredit || 0}
            onChange={handleSyllabusChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Credits"
          />

          {/* Outcomes */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Target className="text-green-600" /> Learning Outcomes
            </h4>
            {form.subjectSyllabus.subjectOutcomes?.map((o, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  value={o.outcomeDetail}
                  onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button type="button" onClick={() => removeOutcome(idx)}>
                  <Trash2 className="text-red-500" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOutcome}
              className="text-blue-600 flex items-center gap-1 mt-2"
            >
              <Plus size={16} /> Add Outcome
            </button>
          </div>

          {/* Grade Components */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <BarChart3 className="text-blue-600" /> Grade Components
            </h4>
            {form.subjectSyllabus.subjectGradeComponents?.map((c, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  value={c.componentName}
                  onChange={(e) =>
                    handleGradeChange(idx, "componentName", e.target.value)
                  }
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Component Name"
                />
                <input
                  type="number"
                  value={c.referencePercentage}
                  onChange={(e) =>
                    handleGradeChange(idx, "referencePercentage", e.target.value)
                  }
                  className="w-20 border rounded-lg px-2 py-2 text-right"
                  placeholder="%"
                />
                <button type="button" onClick={() => removeGradeComponent(idx)}>
                  <Trash2 className="text-red-500" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGradeComponent}
              className="text-blue-600 flex items-center gap-1 mt-2"
            >
              <Plus size={16} /> Add Component
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-70"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default UpdateSubjectForm;
