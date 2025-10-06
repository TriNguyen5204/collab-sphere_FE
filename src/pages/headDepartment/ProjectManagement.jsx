import { useEffect, useState } from "react";
import HeadDepartmentSidebar from "../../components/layout/HeadDepartmentSidebar";
import { getAllProject } from "../../services/userService";

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [lecturerId, setLecturerId] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getAllProject(params);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {
      Descriptors: search || undefined,
      SubjectIds: subjectId ? [subjectId] : undefined,
      LecturerIds: lecturerId ? [lecturerId] : undefined,
    };
    fetchProjects(params);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HeadDepartmentSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Project Management</h1>

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

          <input
            type="number"
            placeholder="Subject ID"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <input
            type="number"
            placeholder="Lecturer ID"
            value={lecturerId}
            onChange={(e) => setLecturerId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="text-gray-500 col-span-full">No projects found</div>
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
                    <div>📘 Subject: {project.subjectName} ({project.subjectCode})</div>
                    <div>👨‍🏫 Lecturer: {project.lecturerName}</div>
                  </div>

                  {/* Objectives */}
                  {project.objectives && project.objectives.length > 0 ? (
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium text-gray-700 mb-1">Objectives:</p>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        {project.objectives.map((obj) => (
                          <li key={obj.objectiveId}>
                            <span className="font-medium">{obj.description}</span> –{" "}
                            <span className="italic text-gray-500">{obj.priority}</span>
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
                    <p className="text-sm text-gray-500 italic">No objectives</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
