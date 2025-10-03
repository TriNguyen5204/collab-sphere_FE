import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import StudentSidebar from "../../components/layout/StudentSidebar";
import { History, Star } from "lucide-react";

const sampleProjects = [
  { ProjectId: 1, ProjectName: "CollabSphere", Description: "A collaborative platform for students.", Status: "Processing" },
  { ProjectId: 2, ProjectName: "Glamping", Description: "A luxurious camping experience.", Status: "Completed" },
  { ProjectId: 3, ProjectName: "Diamond", Description: "A precious gemstone project.", Status: "Completed" },
];

const statusColors = (status) => {
  switch (status) {
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const StudentHomePage = () => {
  const [starred, setStarred] = useState([]);
  const navigate = useNavigate();

  const handleCardClick = (project) => {
    navigate(`/student/project/${project.ProjectId}/${encodeURIComponent(project.ProjectName)}`);
  };

  const toggleStar = (e, projectId) => {
    e.stopPropagation();
    setStarred((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const renderProjectCard = (project) => {
    const isStarred = starred.includes(project.ProjectId);

    return (
      <div
        key={project.ProjectId}
        className="bg-white rounded-lg shadow-md w-80 relative group hover:ring-2 hover:ring-brand-500 hover:shadow-lg transition cursor-pointer"
        onClick={() => handleCardClick(project)}
      >
        <button
          onClick={(e) => toggleStar(e, project.ProjectId)}
          className="absolute top-2 right-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition z-10"
        >
          <div className="relative group/star">
            <Star
              className={`h-6 w-6 transform transition-transform duration-200 ${
                isStarred
                  ? "text-yellow-500 scale-100"
                  : "text-gray-400 group-hover/star:scale-110 hover:text-gray-600"
              }`}
              fill={isStarred ? "currentColor" : "none"}
            />
            <span className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/star:opacity-100 transition duration-300 delay-500 pointer-events-none whitespace-nowrap">
              {isStarred
                ? `Click to unstar ${project.ProjectName}. It will be removed from your starred list.`
                : `Click to star ${project.ProjectName}. It will be added to your starred list.`}
            </span>
          </div>
        </button>

        <div className={`flex justify-end rounded-t-lg w-full h-24 ${statusColors(project.Status)}`} />
        <div className="p-4 flex">
          <h2 className="text-xl font-semibold">{project.ProjectName}</h2>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
        <StudentSidebar />

        <main className="flex-1 p-6 space-y-8">
          {/* Starred Projects Section */}
          {starred.length > 0 && (
            <div>
              <h1 className="flex items-center text-2xl font-bold mb-4">
                <Star className="inline-block mr-3 h-7 w-7" />
                Starred Projects
              </h1>
              <div className="flex flex-wrap gap-6">
                {sampleProjects
                  .filter((p) => starred.includes(p.ProjectId))
                  .map(renderProjectCard)}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          <div>
            <h1 className="flex items-center text-2xl font-bold mb-4">
              <History className="inline-block mr-3 h-7 w-7" />
              Recently Viewed
            </h1>
            <div className="flex flex-wrap gap-6">
              {sampleProjects.map(renderProjectCard)}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StudentHomePage;
