import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  CheckCircle2,
  Target,
  BookOpen,
  Flag,
  User,
  ChevronDown,
  LayoutDashboard
} from "lucide-react";
import { getSemester } from "../../services/userService";
import { getClassesByStudentId, getDetailOfTeamByTeamId, getListOfTeamsByStudentId } from "../../services/studentApi";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import useTeam from "../../context/useTeam";
import { useAvatar } from "../../hooks/useAvatar";
import TeamProjectsCarousel from "../../features/student/components/TeamProjectsCarousel";

// --- SKELETON COMPONENT (New) ---
const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 lg:px-10 h-[200px] flex flex-col justify-center">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 w-full max-w-lg">
            <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
            <div className="h-10 w-3/4 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded-full"></div>
          </div>
          <div className="w-full max-w-xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 h-20 flex flex-col justify-between">
                  <div className="h-3 w-12 bg-slate-200 rounded self-end"></div>
                  <div className="h-6 w-8 bg-slate-200 rounded self-end"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 h-48 flex justify-between items-start">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="h-3 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="h-10 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
            </div>
            {/* Circle Placeholder for the Charts */}
            <div className="w-[70px] h-[70px] rounded-full border-4 border-slate-100 shrink-0"></div>
          </div>
        ))}
      </div>

      {/* Projects Carousel Skeleton */}
      <div className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 border border-slate-200"></div>
            ))}
         </div>
      </div>
    </div>
  );
};

// --- Components ---

const TeamStackAvatar = ({ team }) => {
  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(team?.teamName, team?.teamImage);

  return (
    <div
      className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-sm ring-1 ring-slate-100"
      title={team?.teamName}
    >
      {shouldShowImage ? (
        <img
          src={team?.teamImage}
          alt={team?.teamName || "Team avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${colorClass}`}>
          {initials}
        </div>
      )}
    </div>
  );
};

const TeamStack = ({ teams }) => {
  if (!teams || teams.length === 0) return null;
  const displayTeams = teams.slice(0, 3);
  const remaining = teams.length - 3;

  return (
    <div className="flex -space-x-3">
      {displayTeams.map((team, idx) => (
        <TeamStackAvatar key={team.teamId || idx} team={team} />
      ))}
      {remaining > 0 && (
        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
          +{remaining}
        </div>
      )}
    </div>
  );
};

const CircleProgress = ({ percentage, color = "text-orangeFpt-500", size = 70, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-slate-300"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className={`absolute text-xl font-bold ${color}`}>
        {percentage}%
      </span>
    </div>
  );
};

// Redesigned StatCard to match Project/Class page aesthetics
const StatCard = ({ title, value, subtitle, icon: Icon, isPrimary, children, customIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const toggleOpen = () => {
    if (isOpen) handleMouseLeave();
    else handleMouseEnter();
  };

  return (
    <div
      className={`relative group rounded-3xl border p-6 transition-all duration-300 ${
        isPrimary
          ? "rounded-2xl border border-orangeFpt-100 bg-white shadow-md shadow-orangeFpt-100/60 backdrop-blur"
          : "border-slate-200 bg-white shadow-md shadow-orangeFpt-100/60 backdrop-blur hover:border-orangeFpt-200 hover:shadow-orangeFpt-100/20 "
      } ${children ? "z-20 cursor-pointer" : ""}`}
      onMouseEnter={children ? handleMouseEnter : undefined}
      onMouseLeave={children ? handleMouseLeave : undefined}
      onClick={children ? toggleOpen : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`p-1.5 rounded-lg ${isPrimary ? 'bg-orangeFpt-100 text-orangeFpt-600' : 'bg-slate-100 text-slate-500 group-hover:bg-orangeFpt-50 group-hover:text-orangeFpt-500'} transition-colors`}>
               <Icon size={16} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 group-hover:text-orangeFpt-500 transition-colors">
              {title}
            </p>
             {children && <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-orangeFpt-500" : ""}`} />}
          </div>
          
          <h3 className={`text-3xl font-bold tracking-tight ${isPrimary ? "text-orangeFpt-600" : "text-slate-900"}`}>
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>

        {customIcon && (
          <div className="pl-2 pt-1">
            {customIcon}
          </div>
        )}
      </div>

      {/* Dropdown Content */}
      {children && isOpen && (
        <div
          className="absolute top-[90%] left-0 w-full pt-4 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
          onMouseEnter={handleMouseEnter}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden max-h-64 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

const StudentHomePage = () => {
  const navigate = useNavigate();
  const studentId = useSelector((state) => state.user.userId);
  const studentName = useSelector((state) => state.user.fullName);
  const [currentSemester, setCurrentSemester] = useState();
  const queryClient = useQueryClient();
  const { setTeam } = useTeam();

  const [dashboardData, setDashboardData] = useState({
    classes: [],
    teams: [],
    stats: {
      totalMilestones: 0,
      completedMilestones: 0,
      milestoneProgress: 0,
      totalCheckpoints: 0,
      completedCheckpoints: 0,
      checkpointProgress: 0,
      activeProjectsCount: 0
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const allSemesters = await getSemester();
      const currentDate = new Date();

      const currentSemester = allSemesters.find((sem) => {
        const startDate = new Date(sem.startDate);
        const endDate = new Date(sem.endDate);
        endDate.setHours(23, 59, 59, 999);
        return currentDate >= startDate && currentDate <= endDate;
      });
      setCurrentSemester(currentSemester?.semesterName || "Current Semester");

      const currentSemesterClasses = await getClassesByStudentId(studentId, { semesterId: currentSemester?.semesterId });
      const currentSemesterTeams = await getListOfTeamsByStudentId(studentId, { semesterId: currentSemester?.semesterId });
      
      const listTeamIds = [];
      const rawTeamsList = currentSemesterTeams?.paginatedTeams?.list || [];

      rawTeamsList.forEach(team => {
        if (!listTeamIds.includes(team.teamId)) {
          listTeamIds.push(team.teamId);
        }
      });

      const teamDetailsPromises = listTeamIds.map(teamId => getDetailOfTeamByTeamId(teamId));
      const teamDetails = await Promise.all(teamDetailsPromises);

      const totalMilestones = teamDetails.reduce((acc, team) => acc + (team.teamProgress?.totalMilestones || 0), 0);
      const completedMilestones = teamDetails.reduce((acc, team) => acc + (team.teamProgress?.milestonesComplete || 0), 0);
      const overallMilestoneProgress = totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);

      const totalCheckpoints = teamDetails.reduce((acc, team) => acc + (team.teamProgress?.totalCheckpoints || 0), 0);
      const completedCheckpoints = teamDetails.reduce((acc, team) => acc + (team.teamProgress?.checkpointsComplete || 0), 0);
      const overallCheckpointProgress = totalCheckpoints === 0 ? 0 : Math.round((completedCheckpoints / totalCheckpoints) * 100);

      setDashboardData({
        classes: currentSemesterClasses || [],
        teams: teamDetails,
        stats: {
          totalMilestones,
          completedMilestones,
          milestoneProgress: overallMilestoneProgress,
          totalCheckpoints,
          completedCheckpoints,
          checkpointProgress: overallCheckpointProgress,
          activeProjectsCount: teamDetails.length
        }
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const teamProjectCards = useMemo(() => {
    return dashboardData.teams.map((team) => ({
      teamId: team.teamId,
      projectId: team.projectInfo?.projectId,
      projectName: team.projectInfo?.projectName || team.teamName,
      teamName: team.teamName,
      className: team.classInfo?.className || team.classInfo?.classCode || "Class N/A",
      lecturerName: team.lecturerInfo?.lecturerName || "Lecturer info N/A",
      semesterName: team.semesterInfo?.semesterName || currentSemester || "Semester",
      teamImage: team.teamImage,
      progress: team.teamProgress.overallProgress,
    }));
  }, [dashboardData.teams, currentSemester]);

  // Quick Stats for the Header
  const quickStats = useMemo(() => {
    return [
      { label: "Active Teams", value: dashboardData.stats.activeProjectsCount },
      { label: "Milestones", value: `${dashboardData.stats.milestoneProgress}%` },
      { label: "Checkpoints", value: `${dashboardData.stats.checkpointProgress}%` },
      { label: "Classes", value: dashboardData.classes.length },
    ];
  }, [dashboardData]);

  const handleProjectCardClick = async (team) => {
    if (!team?.teamId) {
      setTeam(null);
      return;
    }
    const numericId = Number(team.teamId);
    try {
      if (Number.isFinite(numericId)) {
        await queryClient.prefetchQuery({
          queryKey: ["team-detail", numericId],
          queryFn: () => getDetailOfTeamByTeamId(numericId),
        });
        setTeam(numericId);
      } else {
        setTeam(null);
      }
    } catch (error) {
      console.error("Failed to fetch team details:", error);
      setTeam(null);
    }
    navigate("/student/project/team-workspace");
  };

  // --- UPDATED LOADING STATE ---
  if (loading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* --- Hero Header (Synchronized Design) --- */}
        <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
          <div className="relative z-10 px-6 py-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                  Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  Welcome back, <span className="text-orangeFpt-500 font-bold">{studentName}</span>
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Here's your overview for <span className="font-semibold text-slate-800">{currentSemester}</span>. Check your progress and active teams.
                </p>
              </div>
              <div className="w-full max-w-xl">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-orangeFpt-100 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white px-4 py-3 shadow-sm shadow-orangeFpt-100/60 backdrop-blur"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 flex justify-end">{stat.label}</p>
                      <p className="mt-1 text-xl font-semibold text-orangeFpt-500 flex justify-end">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Interactive Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Active Teams Card */}
          <StatCard
            title="Active Teams"
            value={dashboardData.stats.activeProjectsCount}
            subtitle="Current Semester"
            icon={Target}
            isPrimary={true}
            customIcon={<TeamStack teams={dashboardData.teams} />}
          />

          {/* Milestones Card */}
          <StatCard
            title="Milestones"
            value={`${dashboardData.stats.completedMilestones}/${dashboardData.stats.totalMilestones}`}
            subtitle="Total Completion"
            icon={Flag}
            customIcon={
              <CircleProgress 
                percentage={dashboardData.stats.milestoneProgress} 
                color="text-orangeFpt-500" 
                size={70}
              />
            }
          >
            {/* Dropdown */}
            <div className="py-2">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Team Progress
              </div>
              {dashboardData.teams.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No active teams.</div>
              ) : (
                dashboardData.teams.map((team, idx) => {
                  const current = team.teamProgress?.milestonesComplete || 0;
                  const total = team.teamProgress?.totalMilestones || 0;
                  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
                  
                  return (
                    <div key={idx} className="px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-orangeFpt-50/30 transition-colors">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-slate-700 line-clamp-1 max-w-[70%]">
                          {team.teamName}
                        </span>
                        <span className="text-xs font-medium text-orangeFpt-600 bg-orangeFpt-50 px-1.5 py-0.5 rounded">
                          {current}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-orangeFpt-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </StatCard>

          {/* Checkpoints Card */}
          <StatCard
            title="Checkpoints"
            value={`${dashboardData.stats.completedCheckpoints}/${dashboardData.stats.totalCheckpoints}`}
            subtitle="Verified Progress"
            icon={CheckCircle2}
            customIcon={
              <CircleProgress 
                percentage={dashboardData.stats.checkpointProgress} 
                color="text-slate-800" 
                size={70}
              />
            }
          >
             {/* Dropdown */}
             <div className="py-2">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Team Progress
              </div>
              {dashboardData.teams.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No active teams.</div>
              ) : (
                dashboardData.teams.map((team, idx) => {
                  const current = team.teamProgress?.checkpointsComplete || 0;
                  const total = team.teamProgress?.totalCheckpoints || 0;
                  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

                  return (
                    <div key={idx} className="px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-slate-700 line-clamp-1 max-w-[70%]">
                          {team.teamName}
                        </span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {current}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-slate-800 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </StatCard>

          {/* Classes Card */}
          <StatCard
            title="Classes"
            value={dashboardData.classes.length || 0}
            subtitle="Enrolled Subjects"
            icon={BookOpen}
          >
            {/* Dropdown */}
            <div className="py-2">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Class List
              </div>
              {dashboardData.classes.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No classes enrolled.</div>
              ) : (
                dashboardData.classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-orangeFpt-50 border-b border-slate-50 last:border-0 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-orangeFpt-600 transition-colors">
                            {cls.className || "Class N/A"}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-orangeFpt-100 group-hover:text-orangeFpt-600 group-hover:border-orangeFpt-200 transition-colors">
                            {cls.subjectCode || "SUB"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <User size={12} className="text-slate-400 group-hover:text-orangeFpt-400" />
                          <span className="truncate">{cls.lectureName || cls.lecturerName || "Lecturer info N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </StatCard>
        </div>

        {/* --- Team Projects Section --- */}
        <div className="">
          {dashboardData.teams.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <Target className="text-slate-300" size={32} />
              </div>
              <h3 className="text-slate-900 font-medium">No Active Teams</h3>
              <p className="text-slate-500 text-sm mt-1">You haven't joined any teams for this semester yet.</p>
            </div>
          ) : (
            <TeamProjectsCarousel
              projects={teamProjectCards}
              onCardClick={handleProjectCardClick}
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentHomePage;