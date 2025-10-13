import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import ProjectFilters from "../../components/student/ProjectFilters";
import ProjectSection from "../../components/student/ProjectSection";
import { History, Star } from "lucide-react";

const sampleProjects = [
  { 
    ProjectId: 1, 
    ProjectName: "CollabSphere", 
    Description: "A collaborative platform for students.", 
    Status: "Processing",
    ClassCode: "CS301",
    ClassName: "Software Engineering",
    TeamName: "Team Alpha",
    TeamMembers: 4,
    AssignedDate: "2025-09-01",
    DueDate: "2025-10-15",
    Progress: 65
  },
  { 
    ProjectId: 2, 
    ProjectName: "Glamping", 
    Description: "A luxurious camping experience.", 
    Status: "Completed",
    ClassCode: "CS301",
    ClassName: "Software Engineering",
    TeamName: "Team Beta",
    TeamMembers: 5,
    AssignedDate: "2025-08-15",
    DueDate: "2025-09-30",
    Progress: 100
  },
  { 
    ProjectId: 3, 
    ProjectName: "Diamond", 
    Description: "A precious gemstone project.", 
    Status: "Completed",
    ClassCode: "CS402",
    ClassName: "Database Systems",
    TeamName: "Team Gamma",
    TeamMembers: 4,
    AssignedDate: "2025-08-20",
    DueDate: "2025-09-25",
    Progress: 100
  },
  { 
    ProjectId: 4, 
    ProjectName: "EcoTracker", 
    Description: "Environmental monitoring system.", 
    Status: "Processing",
    ClassCode: "CS402",
    ClassName: "Database Systems",
    TeamName: "Team Delta",
    TeamMembers: 5,
    AssignedDate: "2025-09-10",
    DueDate: "2025-10-20",
    Progress: 40
  },
];

const StudentProjectPage = () => {
  const [starred, setStarred] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // Get unique classes using useMemo
  const classes = useMemo(() => {
    const uniqueClasses = new Map();
    sampleProjects.forEach(p => {
      if (!uniqueClasses.has(p.ClassCode)) {
        uniqueClasses.set(p.ClassCode, { code: p.ClassCode, name: p.ClassName });
      }
    });
    return Array.from(uniqueClasses.values());
  }, []);

  // Filter projects using useMemo
  const filteredProjects = useMemo(() => {
    return sampleProjects.filter(project => {
      const matchesClass = selectedClass === "all" || project.ClassCode === selectedClass;
      const matchesSearch = project.ProjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.Description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.Status === statusFilter;
      return matchesClass && matchesSearch && matchesStatus;
    });
  }, [selectedClass, searchQuery, statusFilter]);

  // Get starred projects
  const starredProjects = useMemo(() => {
    return sampleProjects.filter(p => starred.includes(p.ProjectId));
  }, [starred]);

  return (
    <StudentLayout>
      <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Projects</h1>
            
            {/* Filters */}
            <ProjectFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              classes={classes}
            />
          </div>

          {/* Starred Projects Section */}
          {starredProjects.length > 0 && (
            <ProjectSection
              title="Starred Projects"
              icon={Star}
              projects={starredProjects}
              starred={starred}
              onToggleStar={toggleStar}
              onCardClick={handleCardClick}
            />
          )}

          {/* All Projects */}
          <ProjectSection
            title={selectedClass === "all" ? "All Projects" : `${selectedClass} Projects`}
            icon={History}
            projects={filteredProjects}
            starred={starred}
            onToggleStar={toggleStar}
            onCardClick={handleCardClick}
            emptyMessage={{
              title: "No Projects Found",
              description: "Try adjusting your filters or search query"
            }}
          />
      </div>
    </StudentLayout>
  );
};

export default StudentProjectPage;