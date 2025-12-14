import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getSyllabusOfSubjectBySubjectId } from '../../services/studentApi';
import { ClassDetailsSkeleton } from '../../features/student/components/skeletons/StudentSkeletons';
import { BookOpen, Target, Award, Calendar, Clock } from 'lucide-react';

const StudentClassSyllabusPage = () => {
  const { classSlug } = useParams();
  const { state } = useLocation();
  const details = state?.details || null;

  const [loading, setLoading] = useState(false);
  const [syllabusData, setSyllabusData] = useState(null);

  const subjectId = details?.subjectId || details?.subject?.subjectId || null;

  useEffect(() => {
    (async () => {
      if (!subjectId) return;
      try {
        setLoading(true);
        const data = await getSyllabusOfSubjectBySubjectId(subjectId);
        setSyllabusData(data);
      } catch (err) {
        console.error('Failed to load syllabus', err);
        toast.error('Failed to load syllabus');
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId]);

  const syllabus = syllabusData?.subjectSyllabus || null;

  if (!details) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link to="/student/classes" className="text-blue-600 hover:underline">
            ← Back to classes
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-2">{classSlug || 'Class'}</h1>
        <p className="text-gray-600">No data available. Please open this page from the Class view.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      {/* Back Navigation */}
      <div className="mb-6 max-w-6xl mx-auto">
        <Link 
          to="/student/classes" 
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          ← Back to classes
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fb8239] to-[#fcd8b6] rounded-3xl p-8 mb-8 shadow-xl border-2 border-orange-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-white" size={32} />
                <h1 className="text-3xl font-bold text-white leading-tight">
                  {details.subjectName || details.className || classSlug}
                </h1>
              </div>
              <p className="text-white text-sm font-medium">Subject Code: {details.subjectCode}</p>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${details.isActive ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-gray-100 text-gray-700 border-2 border-gray-200'}`}>
              {details.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {loading && !syllabus ? (
          <ClassDetailsSkeleton />
        ) : syllabus ? (
          <div className="space-y-6">
            {/* Syllabus Overview */}
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#fcd8b6] to-[#fb8239] rounded-2xl border-2 border-orange-200">
                  <Target className="text-[#a51200]" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{syllabus.syllabusName}</h2>
              </div>
              
              {syllabus.description && (
                <p className="text-gray-700 mb-6 leading-relaxed">{syllabus.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                  <p className="text-xs font-medium text-orange-600 mb-1">Subject Code</p>
                  <p className="text-lg font-bold text-gray-700">{syllabus.subjectCode ?? details.subjectCode}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                  <p className="text-xs font-medium text-orange-600 mb-1">Credits</p>
                  <p className="text-lg font-bold text-gray-700">{syllabus.noCredit ?? '-'}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                  <p className="text-xs font-medium text-orange-600 mb-1">Created Date</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {syllabus.createdDate ? new Date(syllabus.createdDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                  <p className="text-xs font-medium text-orange-600 mb-1">Status</p>
                  <p className={`text-lg font-bold ${syllabus.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {syllabus.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Grade Components */}
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#fcd8b6] to-[#fb8239] rounded-2xl border-2 border-orange-200">
                  <Award className="text-[#a51200]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Grade Components</h3>
              </div>
              
              <div className="overflow-hidden rounded-2xl border border-orange-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#fcd8b6] to-[#fb8239] border-b-2 border-orange-200">
                      <th className="text-left px-6 py-4 font-semibold text-gray-800">Component</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-800">Percentage (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(syllabus.subjectGradeComponents) && syllabus.subjectGradeComponents.length ? (
                      syllabus.subjectGradeComponents.map((g, idx) => (
                        <tr 
                          key={g.subjectGradeComponentId} 
                          className={`border-t border-orange-100 hover:bg-orange-50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/30'
                          }`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">{g.componentName}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#fb8239] to-[#fcd8b6] text-gray-800 font-bold rounded-full border-2 border-orange-200">
                              {g.referencePercentage}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-orange-100">
                        <td colSpan={2} className="px-6 py-4 text-gray-500 text-center">No grade components.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#fcd8b6] to-[#fb8239] rounded-2xl border-2 border-orange-200">
                  <Target className="text-[#a51200]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Learning Outcomes</h3>
              </div>
              
              {Array.isArray(syllabus.subjectOutcomes) && syllabus.subjectOutcomes.length ? (
                <div className="space-y-3">
                  {syllabus.subjectOutcomes.map((o, idx) => (
                    <div 
                      key={o.subjectOutcomeId}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#fb8239] to-[#fcd8b6] border-2 border-orange-200 flex items-center justify-center text-gray-800 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="flex-1 text-gray-700 leading-relaxed pt-0.5">{o.outcomeDetail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No learning outcomes provided.</p>
              )}
            </div>

            {/* Milestones Timeline */}
            {Array.isArray(syllabus.syllabusMilestones) && syllabus.syllabusMilestones.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#fcd8b6] to-[#fb8239] rounded-2xl border-2 border-orange-200">
                    <Calendar className="text-[#a51200]" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Course Milestones</h3>
                </div>

                <div className="space-y-4">
                  {syllabus.syllabusMilestones
                    .sort((a, b) => a.startWeek - b.startWeek)
                    .map((milestone, idx) => {
                      const outcomeMatch = syllabus.subjectOutcomes?.find(
                        (o) => o.subjectOutcomeId === milestone.subjectOutcomeId
                      );
                      
                      return (
                        <div
                          key={milestone.syllabusMilestoneId}
                          className="relative pl-8 pb-6 border-l-2 border-orange-300 last:border-transparent last:pb-0"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-[#fb8239] to-[#fcd8b6] border-2 border-white shadow-lg"></div>
                          
                          {/* Milestone Card */}
                          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <h4 className="text-lg font-bold text-gray-800 flex-1">
                                {milestone.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-orange-200">
                                  <Clock size={14} className="text-orange-500" />
                                  <span className="font-semibold text-gray-700">
                                    Week {milestone.startWeek}
                                  </span>
                                </div>
                                <div className="px-3 py-1 bg-gradient-to-r from-[#fb8239] to-[#fcd8b6] text-gray-800 border-2 border-orange-200 rounded-full font-semibold">
                                  {milestone.duration} {milestone.duration === 1 ? 'week' : 'weeks'}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">
                              {milestone.description}
                            </p>
                            
                            {outcomeMatch && (
                              <div className="flex items-start gap-2 pt-3 border-t border-orange-200">
                                <Target size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600 italic">
                                  <span className="font-semibold text-orange-700">Related Outcome:</span> {outcomeMatch.outcomeDetail}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 shadow-lg text-center">
            <p className="text-gray-600">No syllabus found for this subject.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassSyllabusPage;
