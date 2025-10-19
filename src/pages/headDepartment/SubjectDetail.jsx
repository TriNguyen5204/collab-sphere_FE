import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubjectById } from "../../services/userService";
import { BookOpen, Award, BarChart3, Calendar, CreditCard, CheckCircle, XCircle } from "lucide-react";

const SubjectDetail = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const res = await getSubjectById(Number(id));
        setSubject(res);
      } catch (err) {
        console.error("Error fetching subject:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subject Not Found</h2>
          <p className="text-gray-600">The subject you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const syllabus = subject.subjectSyllabus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {subject.subjectName}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-mono text-lg font-medium">
                    {subject.subjectCode}
                  </span>
                  <div className="flex items-center gap-2">
                    {subject.isActive ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span className="bg-green-400 text-green-900 px-4 py-2 rounded-full font-semibold text-sm">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-300" />
                        <span className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus Info */}
          <div className="p-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {syllabus.syllabusName}
                </h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                {syllabus.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Credits</p>
                      <p className="text-2xl font-bold text-gray-800">{syllabus.noCredit}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Created Date</p>
                      <p className="text-lg font-bold text-gray-800">
                        {new Date(syllabus.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Outcomes Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Subject Outcomes</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="grid gap-4">
              {syllabus.subjectOutcomes.map((o, index) => (
                <div
                  key={o.subjectOutcomeId}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-l-4 border-green-500 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed flex-1 text-lg">
                      {o.outcomeDetail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Components Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Grade Components</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="overflow-hidden rounded-2xl border-2 border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <th className="p-4 text-left font-bold w-20">#</th>
                    <th className="p-4 text-left font-bold">Component Name</th>
                    <th className="p-4 text-center font-bold w-32">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabus.subjectGradeComponents.map((c, index) => (
                    <tr
                      key={c.subjectGradeComponentId}
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="p-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-purple-700 font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-800 font-medium text-lg">
                        {c.componentName}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-lg">
                          {c.referencePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold">
                  {syllabus.subjectGradeComponents.reduce(
                    (sum, c) => sum + c.referencePercentage,
                    0
                  )}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetail;