import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StudentLayout from "../../components/layout/StudentLayout";
import ProjectFilters from "../../components/student/ProjectFilters";
import ProjectSection from "../../components/student/ProjectSection";
import { History, Star } from "lucide-react";
import { getListOfTeamsByStudentId } from "../../services/userService";

const StudentProjectPage = () => {
  const navigate = useNavigate();
  const studentId = useSelector((state) => state.user.userId);

  // Cards state
  const [starred, setStarred] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data
  const [teams, setTeams] = useState([]);

  // Filters state
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const STAR_KEY = "studentProjectStarred";

  // Safe key for any project item 
  const getProjectKey = useCallback((p) => {
    const a = p?.projectId ?? "x";
    const b = p?.teamId ?? "x";
    const c = p?.classId ?? "x";
    return String(`${c}-${b}-${a}`);
  }, []);

  // Load persisted starred
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STAR_KEY) || "[]");
      setStarred(Array.isArray(saved) ? saved.map(String) : []);
    } catch {
      setStarred([]);
    }
  }, []);

  // Persist starred changes
  useEffect(() => {
    localStorage.setItem(STAR_KEY, JSON.stringify(starred));
  }, [starred]);

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
    const safeId = team?.projectId;
    const safeName = team?.projectName;
    if (!safeId) return;
    navigate(`/student/project/${safeId}/${encodeURIComponent(safeName)}`);
  };

  const toggleStar = (e, keyOrId) => {
    e?.stopPropagation?.();
    const key = String(keyOrId);
    setStarred((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
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

  // Filter teams (search only on available fields)
  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teams.filter((team) => {
      const matchesClass =
        selectedClass === "all" ||
        (team.classId != null && String(team.classId) === String(selectedClass));
      const matchesSearch =
        q.length === 0 ||
        team.projectName?.toLowerCase().includes(q) ||
        team.teamName?.toLowerCase().includes(q) ||
        team.className?.toLowerCase().includes(q) ||
        team.lecturerName?.toLowerCase().includes(q);

      // No Status in API, so status filter is ignored
      return matchesClass && matchesSearch;
    });
  }, [teams, selectedClass, searchQuery, statusFilter]);

  // Starred teams (support both old stored projectId values and new composite keys)
  const starredTeams = useMemo(() => {
    if (!starred?.length) return [];
    const starredSet = new Set(starred.map(String));
    return teams.filter((t) => {
      const key = getProjectKey(t);
      const legacyId = t?.projectId != null ? String(t.projectId) : null;
      return starredSet.has(key) || (legacyId && starredSet.has(legacyId));
    });
  }, [teams, starred, getProjectKey]);

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

        {/* Loading */}
        {loading && (
          <div className="rounded-md border p-6 animate-pulse text-sm text-gray-500">
            Loading projects...
          </div>
        )}

        {/* Starred Projects Section */}
        {!loading && starredTeams.length > 0 && (
          <ProjectSection
            title="Starred Projects"
            icon={Star}
            projects={starredTeams}
            starred={starred}
            onToggleStar={toggleStar}
            onCardClick={handleCardClick}
          />
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
            starred={starred}
            onToggleStar={toggleStar}
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