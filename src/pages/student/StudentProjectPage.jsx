import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StudentLayout from "../../components/layout/StudentLayout";
import ProjectFilters from "../../components/student/ProjectFilters";
import ProjectSection from "../../components/student/ProjectSection";
import { History } from "lucide-react";
import { getListOfTeamsByStudentId } from "../../services/studentApi";

const StudentProjectPage = () => {
  const navigate = useNavigate();
  const studentId = useSelector((state) => state.user.userId);

  const [loading, setLoading] = useState(true);

  // Data
  const [teams, setTeams] = useState([]);

  // Filters state
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const fetchTeams = async () => {
    if (!studentId) return;
    setLoading(true);

    try {
      const response = await getListOfTeamsByStudentId(studentId);
      const list = response?.paginatedTeams?.list ?? [];
      setTeams(list);
      console.log("Fetched teams:", list);
    } catch (e) {
      console.error("Error fetching teams:", e);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [studentId]);

  const handleCardClick = (team) => {
    const teamId = team?.teamId;
    const projectId = team?.projectId;
    const projectName = team?.projectName || 'project';
    if (!teamId || !projectId) return;
    localStorage.setItem('currentProjectContext', JSON.stringify({
      projectId,
      teamId,
      projectName
    }));
    navigate('/student/project/team-workspace');
  };

  const classes = useMemo(() => {
    const map = new Map();
    teams.forEach((t) => {
      const id = t?.classId;
      const name = t?.className ?? "Unknown Class";
      if (id == null) return;
      const key = String(id);
      if (!map.has(key)) {
        map.set(key, { code: key, name });
      }
    });
    return Array.from(map.values());
  }, [teams]);

  const semesters = useMemo(() => {
    const map = new Map();
    teams.forEach((t) => {
      const name = t?.semesterName;
      if (!name) return;
      const key = String(name);
      if (!map.has(key)) {
        map.set(key, { code: key, name });
      }
    });
    return Array.from(map.values());
  }, [teams]);

  // Filter teams (search only on available fields)
  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teams.filter((team) => {
      const matchesClass =
        selectedClass === "all" ||
        (team.classId != null && String(team.classId) === String(selectedClass));
      const matchesSemester =
        semesterFilter === "all" ||
        (team.semesterName != null && String(team.semesterName) === String(semesterFilter));
      const matchesSearch =
        q.length === 0 ||
        team.projectName?.toLowerCase().includes(q) ||
        team.teamName?.toLowerCase().includes(q) ||
        team.className?.toLowerCase().includes(q) ||
        team.lecturerName?.toLowerCase().includes(q);

      return matchesClass && matchesSemester && matchesSearch;
    });
  }, [teams, selectedClass, semesterFilter, searchQuery]);


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
            semesterFilter={semesterFilter}
            onSemesterChange={setSemesterFilter}
            classes={classes}
            semesters={semesters}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-md border p-6 animate-pulse text-sm text-gray-500">
            Loading projects...
          </div>
        )}

        {/* All Projects */}
        {!loading && (
          <ProjectSection
            title={
              selectedClass === "all"
                ? "All Projects"
                : `${classes.find((c) => c.code === selectedClass)?.name || "Class"} Projects`
            }
            icon={History}
            projects={filteredTeams}
            onCardClick={handleCardClick}
            emptyMessage={
              filteredTeams.length === 0
                ? {
                    title: "No Projects Found",
                    description: "Try adjusting your filters or search query.",
                  }
                : null
            }
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentProjectPage;