import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../../services/userService";
import {
  BookOpen,
  User,
  Calendar,
  Flag,
  Target,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  TrendingUp
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProjectById(id);
        setProject(res);
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-medium">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex justify-center items-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Not Found</h2>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Flag className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {project.projectName}
                </h1>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Lecturer Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Lecturer</p>
                    <h3 className="text-xl font-bold text-gray-800">{project.lecturerName}</h3>
                  </div>
                </div>
              </div>

              {/* Subject Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Subject</p>
                    <h3 className="text-lg font-bold text-gray-800">{project.subjectName}</h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white rounded-lg font-mono text-sm font-bold">
                      {project.subjectCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className="text-lg font-bold text-blue-600 uppercase">{project.statusString}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Updated</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Project Objectives</h2>
                <p className="text-red-100 text-sm">{project.objectives.length} objectives defined</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {project.objectives.map((obj, index) => (
                <div
                  key={obj.objectiveId}
                  className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-xl"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold flex-1">
                          {obj.description}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Award className="w-4 h-4" />
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            obj.priority === "High"
                              ? "bg-red-500 text-white"
                              : obj.priority === "Medium"
                              ? "bg-yellow-400 text-gray-800"
                              : "bg-green-400 text-gray-800"
                          }`}
                        >
                          {obj.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50">
                    {obj.objectiveMilestones.length > 0 ? (
                      <>
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-500" />
                          Milestones ({obj.objectiveMilestones.length})
                        </h4>
                        <div className="space-y-4">
                          {obj.objectiveMilestones.map((ms, msIndex) => (
                            <div
                              key={ms.objectiveMilestoneId}
                              className="bg-white rounded-xl p-5 border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                  <span className="text-indigo-600 font-bold text-sm">{msIndex + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 text-lg mb-2">
                                    {ms.title}
                                  </h4>
                                  <p className="text-gray-600 leading-relaxed mb-3">
                                    {ms.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span className="text-gray-500 font-medium">
                                      {ms.startDate}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-gray-500 font-medium">
                                      {ms.endDate}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 italic">No milestones available for this objective</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;