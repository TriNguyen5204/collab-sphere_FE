import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  TrendingUp,
  CheckCircle2,
  Target,
  BookOpen,
  Flag,
  MoreHorizontal,
  Calendar,
  Zap,
  Users,
  User
} from "lucide-react";
import { getSemester } from "../../services/userService";
import { getClassesByStudentId, getListOfTeamsByStudentId, getDetailOfTeamByTeamId } from "../../services/studentApi";
import { useSelector } from "react-redux";

// --- Soft Minimalism Components ---

const StatCard = ({ title, value, subtitle, icon: Icon, isPrimary }) => (
  <div className={`rounded-2xl p-6 border transition-all duration-300 ${isPrimary
      ? "bg-white border-orangeFpt-500/30 shadow-md shadow-orangeFpt-500/10"
      : "bg-white border-gray-100 shadow-sm hover:shadow-md"
    }`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className={`text-3xl font-bold tracking-tight ${isPrimary ? "text-orangeFpt-500" : "text-gray-800"}`}>
          {value}
        </h3>
        {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${isPrimary ? "bg-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-500/30" : "bg-gray-50 text-gray-400"
        }`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const AvatarStack = ({ members }) => {
  if (!members || members.length === 0) return null;
  const displayMembers = members.slice(0, 4);
  const remaining = members.length - 4;

  return (
    <div className="flex -space-x-3">
      {displayMembers.map((member, idx) => (
        <img
          key={member.studentId || idx}
          className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-200"
          src={member.avatar || `https://ui-avatars.com/api/?name=${member.studentName}&background=random`}
          alt={member.studentName}
          title={`${member.studentName} (${member.teamRole === 1 ? 'Leader' : 'Member'})`}
        />
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
          +{remaining}
        </div>
      )}
    </div>
  );
};

const StudentHomePage = () => {
  const studentId = useSelector((state) => state.user.userId);

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

      const currentSemesterClasses = await getClassesByStudentId(studentId, { semesterId: currentSemester?.semesterId });
      const currentSemesterTeams = await getListOfTeamsByStudentId(studentId, { semesterId: currentSemester?.semesterId });

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


  const handleAssignedTeamClick = async (team) => {
    const teamId = team?.teamId;
    const projectId = team?.projectId;
    if (!teamId || !projectId) return;
    const normalizedTeamId = Number(teamId);
    if (!Number.isFinite(normalizedTeamId)) return;
    try {
      await queryClient.prefetchQuery({
        queryKey: ['team-detail', normalizedTeamId],
        queryFn: () => getDetailOfTeamByTeamId(normalizedTeamId),
      });
    } catch (error) {
      console.error('Failed to prefetch team details:', error);
    }
    navigate('/student/project/team-workspace');
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
      <div className="space-y-8 mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, here's your semester overview.</p>
          </div>
          <span className="px-4 py-2 bg-orangeFpt-500/10 text-orangeFpt-500 rounded-full text-sm font-medium border border-orangeFpt-500/20 flex items-center gap-2">
            <Calendar size={16} /> Current Semester
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Teams"
            value={dashboardData.stats.activeProjectsCount}
            subtitle="Current Semester"
            icon={Target}
            isPrimary={true}
          />
          <StatCard
            title="Milestones"
            value={`${dashboardData.stats.completedMilestones}/${dashboardData.stats.totalMilestones}`}
            subtitle={`${dashboardData.stats.milestoneProgress}% Completion`}
            icon={Flag}
          />
          <StatCard
            title="Checkpoints"
            value={`${dashboardData.stats.completedCheckpoints}/${dashboardData.stats.totalCheckpoints}`}
            subtitle={`${dashboardData.stats.checkpointProgress}% Completion`}
            icon={CheckCircle2}
          />
          <StatCard
            title="Classes"
            value={dashboardData.classes.length || 0}
            subtitle="Enrolled Subjects"
            icon={BookOpen}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Team Projects */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="text-orangeFpt-500" size={20} />
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
              dashboardData.teams.map((team, index) => {
                // Extracting Data from new JSON structure
                const progress = team.teamProgress || {};
                const project = team.projectInfo || {};
                const classInfo = team.classInfo || {};
                const members = team.memberInfo?.members || [];
                const lecturer = team.lecturerInfo || {};

                return (
                  <div key={team.teamId || index} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-orangeFpt-500/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden">

                    {/* Top Row: Team Name & Class Badge */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-start gap-4">
                        {/* Optional: Team Avatar/Image Placeholder */}
                        <div className="w-12 h-12 rounded-xl bg-orangeFpt-500/10 flex items-center justify-center text-orangeFpt-500 shrink-0">
                          {team.teamImage && team.teamImage.length > 50 ? ( // Simple check for broken/short URLs
                            <img src={team.teamImage} alt={team.teamName} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none' }} />
                          ) : (
                            <Users size={20} />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orangeFpt-500 transition-colors">
                            {team.teamName || "Unnamed Team"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                              <BookOpen size={10} /> {classInfo.className || "Class N/A"}
                            </span>
                            {lecturer.lecturerName && (
                              <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border border-gray-100">
                                <User size={10} /> {lecturer.lecturerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="text-gray-300 hover:text-orangeFpt-500 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>

                    {/* Middle Row: Project Info & Members */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4 relative z-10">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Project</p>
                        <p className="text-sm text-gray-700 font-medium line-clamp-1" title={project.projectName}>
                          {project.projectName || "Topic Pending Selection"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 md:text-right">Team Members</p>
                        <AvatarStack members={members} />
                      </div>
                    </div>

                    {/* Bottom Row: Detailed Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {/* Milestones */}
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-500 font-medium flex items-center gap-1">
                            <Flag size={12} className="text-orangeFpt-500" /> Milestones
                          </span>
                          <span className="text-gray-900 font-bold">
                            {progress.milestonesComplete || 0}/{progress.totalMilestones || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-orangeFpt-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(242,111,33,0.3)]"
                            style={{ width: `${progress.milestonesProgress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Checkpoints */}
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-500 font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-gray-400" /> Checkpoints
                          </span>
                          <span className="text-gray-900 font-bold">
                            {progress.checkpointsComplete || 0}/{progress.totalCheckpoints || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gray-800 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress.checkPointProgress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Classes & Summary (Same as before) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="text-gray-400" size={20} />
                My Classes
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {dashboardData.classes.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No classes enrolled.</div>
              ) : (
                dashboardData.classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-4 border-b border-gray-50 last:border-0 hover:bg-orangeFpt-500/5 transition-colors flex items-center gap-4 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gray-100 group-hover:bg-white group-hover:text-orangeFpt-500 group-hover:shadow-sm flex items-center justify-center text-gray-500 font-bold text-sm transition-all">
                      {cls.classCode ? cls.classCode.substring(0, 2) : "CL"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{cls.classCode}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{cls.subjectName || "Subject Details"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Overall Summary Box */}
            <div className="bg-gradient-to-br from-orangeFpt-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-orangeFpt-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-lg mb-1 relative z-10">Total Progress</h3>
              <p className="text-orange-100 text-sm mb-6 relative z-10">Aggregated performance across all teams.</p>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-xs mb-2 text-orange-50 font-medium">
                    <span>Milestones Completed</span>
                    <span>{dashboardData.stats.milestoneProgress}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2 backdrop-blur-sm">
                    <div className="bg-white h-2 rounded-full shadow-sm" style={{ width: `${dashboardData.stats.milestoneProgress}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2 text-orange-50 font-medium">
                    <span>Checkpoints Verified</span>
                    <span>{dashboardData.stats.checkpointProgress}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2 backdrop-blur-sm">
                    <div className="bg-white/80 h-2 rounded-full" style={{ width: `${dashboardData.stats.checkpointProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentHomePage;