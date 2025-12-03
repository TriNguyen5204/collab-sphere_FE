import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  CheckCircle2,
  Target,
  BookOpen,
  Flag,
  Zap,
  Users,
  User,
  ChevronDown
} from "lucide-react";
import { getSemester } from "../../services/userService";
import { getClassesByStudentId, getDetailOfTeamByTeamId, getListOfTeamsByStudentId } from "../../services/studentApi";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import useTeam from "../../context/useTeam";
import { useAvatar } from "../../hooks/useAvatar";
import TeamProjectsCarousel from "../../features/student/components/TeamProjectsCarousel";

// New Component: Team Image Stack
const TeamStackAvatar = ({ team }) => {
  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(team?.teamName, team?.teamImage);

  return (
    <div
      className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-sm"
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
  const displayTeams = teams.slice(0, 3); // Show top 3
  const remaining = teams.length - 3;

  return (
    <div className="flex -space-x-3">
      {displayTeams.map((team, idx) => (
        <TeamStackAvatar key={team.teamId || idx} team={team} />
      ))}
      {remaining > 0 && (
        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
          +{remaining}
        </div>
      )}
    </div>
  );
};

// Updated StatCard: Added 'customIcon' prop
const StatCard = ({ title, value, subtitle, icon: Icon, isPrimary, children, customIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const toggleOpen = () => {
    if (isOpen) {
      handleMouseLeave();
    } else {
      handleMouseEnter();
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${isPrimary
        ? "bg-white border-orangeFpt-500/30 shadow-md shadow-orangeFpt-500/10"
        : "bg-white border-gray-100 shadow-sm hover:shadow-md"
        } ${children ? "z-20 hover:border-orangeFpt-500/50" : ""}`}
      onMouseEnter={children ? handleMouseEnter : undefined}
      onMouseLeave={children ? handleMouseLeave : undefined}
      onClick={children ? toggleOpen : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-1">
            {title}
            {children && <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />}
          </p>
          <h3 className={`text-3xl font-bold tracking-tight ${isPrimary ? "text-orangeFpt-500" : "text-gray-800"}`}>
            {value}
          </h3>
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>

        {customIcon ? (
          <div className="pl-2">
            {customIcon}
          </div>
        ) : (
          <div className={`p-3 rounded-xl ${isPrimary ? "bg-orangeFpt-500 text-white shadow-lg" : "bg-gray-50 text-gray-400"}`}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {/* Dropdown Content */}
      {children && isOpen && (
        <div
          className="absolute top-full left-0 w-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-200"
          onMouseEnter={handleMouseEnter}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const CircleProgress = ({ percentage, color = "text-orangeFpt-500", size = 48, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG rotated -90deg so progress starts at the top */}
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Track */}
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Line */}
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
      {/* Centered Percentage Text */}
      <span className={`absolute text-[10px] font-bold ${color}`}>
        {percentage}%
      </span>
    </div>
  );
};

const StudentHomePage = () => {
  const navigate = useNavigate();
  const studentId = useSelector((state) => state.user.userId);
  const [currentSemester, setCurrentSemester] = useState();
  const queryClient = useQueryClient();
  const { setTeam } = useTeam();

  // State for API Data
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
      setCurrentSemester(currentSemester?.semesterName || "Semester");

      const currentSemesterClasses = await getClassesByStudentId(studentId, { semesterId: currentSemester?.semesterId });
      const currentSemesterTeams = await getListOfTeamsByStudentId(studentId, { semesterId: currentSemester?.semesterId });
      console.log("Fetched Classes:", currentSemesterTeams);
      const listTeamIds = [];
      const rawTeamsList = currentSemesterTeams?.paginatedTeams?.list || [];

      rawTeamsList.forEach(team => {
        if (!listTeamIds.includes(team.teamId)) {
          listTeamIds.push(team.teamId);
        }
      });

      // Fetch detailed team data matching your JSON structure
      const teamDetailsPromises = listTeamIds.map(teamId => getDetailOfTeamByTeamId(teamId));
      const teamDetails = await Promise.all(teamDetailsPromises);
      console.log("Fetched Team Details:", teamDetails);

      // Aggregating Stats from your new structure
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
    console.log("Dashboard Teams Data:", dashboardData.teams);
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


  if (loading) {
    return (
      <StudentLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orangeFpt-500"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex flex-col mx-auto h-full space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, here's your semester <span className="text-orangeFpt-500 font-bold">{currentSemester}</span> overview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Teams Card (Kept the TeamStack from previous step) */}
          <StatCard
            title="Active Teams"
            value={dashboardData.stats.activeProjectsCount}
            subtitle="Current Semester"
            icon={Target}
            isPrimary={true}
            customIcon={<TeamStack teams={dashboardData.teams} />}
          />

          {/* Milestones Card with Team Details Dropdown */}
          <StatCard
            title="Milestones"
            value={`${dashboardData.stats.completedMilestones}/${dashboardData.stats.totalMilestones}`}
            subtitle="Total Completion"
            icon={Flag}
            customIcon={
              <CircleProgress 
                percentage={dashboardData.stats.milestoneProgress} 
                color="text-orangeFpt-500" 
              />
            }
          >
            {/* Milestones Dropdown Content */}
            <div className="py-2">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Team Progress
              </div>
              {dashboardData.teams.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No active teams.</div>
              ) : (
                dashboardData.teams.map((team, idx) => {
                  const current = team.teamProgress?.milestonesComplete || 0;
                  const total = team.teamProgress?.totalMilestones || 0;
                  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
                  
                  return (
                    <div key={idx} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-orangeFpt-50/50 transition-colors">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[70%]">
                          {team.teamName}
                        </span>
                        <span className="text-xs font-medium text-orangeFpt-600 bg-orangeFpt-50 px-1.5 py-0.5 rounded">
                          {current}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
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

          {/* Checkpoints Card with Team Details Dropdown */}
          <StatCard
            title="Checkpoints"
            value={`${dashboardData.stats.completedCheckpoints}/${dashboardData.stats.totalCheckpoints}`}
            subtitle="Verified Progress"
            icon={CheckCircle2}
            customIcon={
              <CircleProgress 
                percentage={dashboardData.stats.checkpointProgress} 
                color="text-gray-800" 
              />
            }
          >
             {/* Checkpoints Dropdown Content */}
             <div className="py-2">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Team Progress
              </div>
              {dashboardData.teams.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No active teams.</div>
              ) : (
                dashboardData.teams.map((team, idx) => {
                  const current = team.teamProgress?.checkpointsComplete || 0;
                  const total = team.teamProgress?.totalCheckpoints || 0;
                  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

                  return (
                    <div key={idx} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[70%]">
                          {team.teamName}
                        </span>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {current}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gray-800 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </StatCard>

          {/* Classes Card with Redesigned Dropdown */}
          <StatCard
            title="Classes"
            value={dashboardData.classes.length || 0}
            subtitle="Enrolled Subjects"
            icon={BookOpen}
          >
            {/* Redesigned Dropdown Menu Content */}
            <div className="py-2">
              {dashboardData.classes.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No classes enrolled.</div>
              ) : (
                dashboardData.classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-orangeFpt-50 border-b border-gray-50 last:border-0 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-start gap-3">

                      {/* Right: Info */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Subject Code & Class Name Badge */}
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-orangeFpt-600 transition-colors">
                            {cls.className || "Class N/A"}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 group-hover:bg-orangeFpt-100 group-hover:text-orangeFpt-600 group-hover:border-orangeFpt-200 transition-colors">
                            {cls.subjectCode || "Unknown Subject"}
                          </span>
                        </div>

                        {/* Row 2: Lecturer Name */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User size={12} className="text-gray-400 group-hover:text-orangeFpt-400" />
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

          {/* Team Projects */}
          <div className=" space-y-6 w-full">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              My Teams
            </h2>

            {dashboardData.teams.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-gray-300" size={32} />
                </div>
                <h3 className="text-gray-900 font-medium">No Active Teams</h3>
                <p className="text-gray-500 text-sm mt-1">You haven't joined any teams for this semester yet.</p>
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