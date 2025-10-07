import React, { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { updateSubject, getSyllabusBySubjectId } from "../../services/userService";
import { toast } from "react-toastify";

const UpdateSubjectForm = ({ subject, onClose }) => {
  const [form, setForm] = useState({
    subjectName: subject.subjectName,
    subjectCode: subject.subjectCode,
    isActive: subject.isActive,
    subjectSyllabus: null,
  });

  const [syllabus, setSyllabus] = useState(null);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch syllabus details
  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const data = await getSyllabusBySubjectId(subject.subjectId);
        if (data && data.subjectSyllabus) {
          setSyllabus(data.subjectSyllabus);
          setForm((prev) => ({
            ...prev,
            subjectSyllabus: data.subjectSyllabus,
          }));
        }
      } catch (error) {
        console.error("Error fetching syllabus:", error);
        toast.error("Failed to fetch syllabus");
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [subject.subjectId]);

  // 📝 Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 💾 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedSubject = {
        subjectId: subject.subjectId,
        ...form,
      };
      const response = await updateSubject(updatedSubject);
      if (response.isSuccess === true) {
        toast.success("Subject updated successfully");
        onClose();
      } else {
        toast.error("Failed to update subject");
      }
    } catch (error) {
      toast.error("Error updating subject");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Update Subject
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Subject Name
            </label>
            <input
              type="text"
              name="subjectName"
              value={form.subjectName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* Subject Code */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Subject Code
            </label>
            <input
              type="text"
              name="subjectCode"
              value={form.subjectCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Toggle Syllabus */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowSyllabus(!showSyllabus)}
              className="flex items-center justify-between w-full bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
            >
              <span className="font-medium">
                {showSyllabus ? "Hide Syllabus Details" : "Show Syllabus Details"}
              </span>
              {showSyllabus ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showSyllabus && (
              <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                {loading ? (
                  <p className="text-gray-500 text-sm">Loading syllabus...</p>
                ) : syllabus ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {syllabus.syllabusName}
                    </h3>
                    <p className="text-sm text-gray-600 italic">
                      {syllabus.description}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>No. of Credits:</strong> {syllabus.noCredit}
                    </p>

                    {/* Outcomes */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        Learning Outcomes:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {syllabus.subjectOutcomes?.map((o) => (
                          <li key={o.subjectOutcomeId}>{o.outcomeDetail}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Grade Components */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        Grade Components:
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {syllabus.subjectGradeComponents?.map((c) => (
                          <li
                            key={c.subjectGradeComponentId}
                            className="flex justify-between border-b border-gray-200 pb-1"
                          >
                            <span>{c.componentName}</span>
                            <span>{c.referencePercentage}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No syllabus found.</p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSubjectForm;
