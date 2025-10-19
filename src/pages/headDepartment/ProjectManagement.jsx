import { useEffect, useState } from "react";
import HeadDepartmentSidebar from "../../components/layout/HeadDepartmentSidebar";
import {
  getAllProject,
  getAllSubject,
  getAllLecturer,
} from "../../services/userService";

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [lecturerOptions, setLecturerOptions] = useState([]);

  // Pagination
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  // Fetch Projects
  const fetchProjects = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getAllProject(params);
      setProjects(data.list);
      setPageCount(data.pageCount || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProjects({ pageNum });
  }, [pageNum]);

  // Dropdown load
  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const [subjects, lecturers] = await Promise.all([
          getAllSubject(),
          getAllLecturer(),
        ]);
        setSubjectOptions(subjects);
        setLecturerOptions(lecturers.list);
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    };
    fetchDropdown();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPageNum(1); 
    const params = {
      descriptors: search || undefined,
      subjectIds: subjectId ? [Number(subjectId)] : undefined,
      lecturerIds: lecturerId ? [Number(lecturerId)] : undefined,
      pageNum: 1,
    };
    fetchProjects(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      const params = {
        Descriptors: search || undefined,
        SubjectIds: subjectId ? [Number(subjectId)] : undefined,
        LecturerIds: lecturerId ? [Number(lecturerId)] : undefined,
        pageNum: newPage,
      };
      setPageNum(newPage);
      fetchProjects(params);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HeadDepartmentSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Project Management
        </h1>

        {/* Search & Filter */}
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow"
        >
          <input
            type="text"
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {/* Subject Select */}
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-56 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjectOptions.map((subj) => (
              <option key={subj.subjectId} value={subj.subjectId}>
                {subj.subjectName}
              </option>
            ))}
          </select>

          {/* Lecturer Select */}
          <select
            value={lecturerId}
            onChange={(e) => setLecturerId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-56 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Lecturers</option>
            {lecturerOptions.map((lec) => (
              <option key={lec.uId} value={lec.uId}>
                {lec.fullname}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* Loading / Error */}
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {/* Projects List */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <div className="text-gray-500 col-span-full">
                  No projects found
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.projectId}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                  >
                    <h2 className="text-lg font-bold text-blue-700 mb-1">
                      {project.projectName}
                    </h2>
                    <p className="text-gray-600 mb-2">{project.description}</p>

                    <div className="text-sm text-gray-500 mb-3">
                      <div>
                        📘 Subject: {project.subjectName} ({project.subjectCode})
                      </div>
                      <div>👨‍🏫 Lecturer: {project.lecturerName}</div>
                    </div>

                    {/* Objectives */}
                    {project.objectives && project.objectives.length > 0 ? (
                      <div className="border-t pt-2 mt-2">
                        <p className="font-medium text-gray-700 mb-1">
                          Objectives:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                          {project.objectives.map((obj) => (
                            <li key={obj.objectiveId}>
                              <span className="font-medium">
                                {obj.description}
                              </span>{" "}
                              –{" "}
                              <span className="italic text-gray-500">
                                {obj.priority}
                              </span>
                              {obj.objectiveMilestones.length > 0 && (
                                <ul className="list-decimal list-inside ml-4 text-gray-500 text-xs mt-1">
                                  {obj.objectiveMilestones.map((ms) => (
                                    <li key={ms.objectiveMilestoneId}>
                                      {ms.title} ({ms.startDate} → {ms.endDate})
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No objectives
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={pageNum === 1}
                onClick={() => handlePageChange(pageNum - 1)}
                className={`px-4 py-2 rounded-md border ${
                  pageNum === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "hover:bg-blue-50 text-blue-600 border-blue-200"
                }`}
              >
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Page {pageNum} / {pageCount}
              </span>

              <button
                disabled={pageNum === pageCount}
                onClick={() => handlePageChange(pageNum + 1)}
                className={`px-4 py-2 rounded-md border ${
                  pageNum === pageCount
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "hover:bg-blue-50 text-blue-600 border-blue-200"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
