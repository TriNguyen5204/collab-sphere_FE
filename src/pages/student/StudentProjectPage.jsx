import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StudentLayout from "../../components/layout/StudentLayout";
import ProjectFilters from "../../features/student/components/ProjectFilters";
import ProjectSection from "../../features/student/components/ProjectSection";
import { History, Sparkles } from "lucide-react";
import { getListOfTeamsByStudentId, getDetailOfTeamByTeamId } from "../../services/studentApi";
import useTeam from "../../context/useTeam";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 9;

const StudentProjectPage = () => {
  const navigate = useNavigate();
  const studentId = useSelector((state) => state.user.userId);
  const { setTeam } = useTeam();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  // Data
  const [teams, setTeams] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const nextPageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isFetchingMoreRef = useRef(false);

  // Filters state
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const fetchTeams = useCallback(
    async ({ reset = false } = {}) => {
      if (!studentId) return;

      if (reset) {
        setLoading(true);
        setTeams([]);
        setHasMore(true);
        setIsFetchingMore(false);
        nextPageRef.current = 1;
        hasMoreRef.current = true;
        isFetchingMoreRef.current = false;
      } else {
        if (!hasMoreRef.current || isFetchingMoreRef.current) return;
        setIsFetchingMore(true);
        isFetchingMoreRef.current = true;
      }

      const pageToLoad = reset ? 1 : nextPageRef.current;

      try {
        const response = await getListOfTeamsByStudentId(studentId, {
          pageNum: pageToLoad,
          pageSize: PAGE_SIZE,
        });
        const container = response?.paginatedTeams ?? response ?? {};
        const list = Array.isArray(container?.list) ? container.list : [];
        console.log("Fetched teams:", list);
        setTeams((prev) => (reset ? list : [...prev, ...list]));

        const totalPages = Number(container?.totalPages);
        const currentPage = Number(container?.pageNum ?? pageToLoad);
        const loadedFullPage = list.length === PAGE_SIZE;
        const more = Number.isFinite(totalPages)
          ? currentPage < totalPages
          : loadedFullPage;

        hasMoreRef.current = more;
        setHasMore(more);
        nextPageRef.current = currentPage + 1;
      } catch (e) {
        console.error("Error fetching teams:", e);
        if (reset) {
          setTeams([]);
        }
        hasMoreRef.current = false;
        setHasMore(false);
      } finally {
        if (reset) {
          setLoading(false);
        } else {
          setIsFetchingMore(false);
          isFetchingMoreRef.current = false;
        }
      }
    },
    [studentId]
  );

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setTeams([]);
      setHasMore(false);
      return;
    }
    fetchTeams({ reset: true });
  }, [studentId, fetchTeams]);

  const handleLoadMore = useCallback(() => {
    fetchTeams({ reset: false });
  }, [fetchTeams]);

  const handleCardClick = async (team) => {
    if (team?.teamId) {
      try {
        await queryClient.prefetchQuery({
          queryKey: ['team-detail', Number(team.teamId)],
          queryFn: () => getDetailOfTeamByTeamId(team.teamId),
        });
        setTeam(team.teamId);
      } catch (e) {
        console.error("Error fetching team details:", e);
        setTeam(null);
      }
    } else {
      setTeam(null);
    }
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


  const filterResetKey = `${selectedClass}|${semesterFilter}|${searchQuery}`;

  const quickStats = useMemo(() => {
    const avgProgress = teams.length
      ? Math.round(
        teams.reduce((sum, current) => {
          const value = Number(current?.progress);
          return sum + (Number.isFinite(value) ? value : 0);
        }, 0) / teams.length
      )
      : 0;
    return [
      { label: "Total Projects", value: teams.length || 0 },
      { label: "Classes", value: classes.length || 0 },
      { label: "Semesters", value: semesters.length || 0 },
      { label: "Avg. Progress", value: `${avgProgress}%` },
    ];
  }, [teams, classes, semesters]);

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
          <div className="relative z-10 px-6 py-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Project Overview</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Navigate Every Project With Clarity</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Monitor your teams, filter by class or semester, and jump back into collaboration instantly.
                </p>
              </div>
              <div className="w-full max-w-xl">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-orangeFpt-100 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white px-4 py-3 shadow-sm shadow-orangeFpt-100/60 backdrop-blur"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-900 flex justify-end">{stat.label}</p>
                      <p className="mt-1 text-xl font-semibold text-orangeFpt-500 flex justify-end">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orangeFpt-500"></div>
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
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoadingMore={isFetchingMore}
            resetSignal={filterResetKey}
            filtersContent={
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
            }
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
