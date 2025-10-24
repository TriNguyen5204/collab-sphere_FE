import React, { useEffect, useState } from "react";
import { GraduationCap, BookOpen, Award, TrendingUp, Edit2, Save } from "lucide-react";

const AcademicInformation = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [academicData, setAcademicData] = useState({
    studentId: user?.code || "",
    program: user?.major || "",
    year: "",
    semester: "",
    gpa: "",
    major: user?.major || "",
    minor: "",
    expectedGraduation: "",
    academicAdvisor: "",
    school: user?.school || "",
  });

  useEffect(() => {
    setAcademicData((prev) => ({
      ...prev,
      studentId: user?.code || "",
      program: user?.major || "",
      major: user?.major || "",
      school: user?.school || "",
    }));
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAcademicData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // API call to save academic data
  };

  const courses = [];

  const achievements = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Academic Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            <Edit2 size={16} />
            Edit Information
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Academic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Current GPA</p>
              <p className="text-3xl font-bold text-blue-700">{academicData.gpa || "—"}</p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">School</p>
              <p className="text-xl font-bold text-purple-700">{academicData.school || "—"}</p>
            </div>
            <BookOpen className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Achievements</p>
              <p className="text-3xl font-bold text-green-700">{achievements.length}</p>
            </div>
            <Award className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Year Level</p>
              <p className="text-2xl font-bold text-orange-700">{academicData.year || "—"}</p>
            </div>
            <GraduationCap className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Academic Details Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Code</label>
            <input
              type="text"
              name="studentId"
              value={academicData.studentId}
              disabled
              className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <input
              type="text"
              name="program"
              value={academicData.program}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing ? "border-gray-300 focus:border-brand-500" : "border-gray-200 bg-white"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
            <input
              type="text"
              name="major"
              value={academicData.major}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing ? "border-gray-300 focus:border-brand-500" : "border-gray-200 bg-white"
              }`}
            />
          </div>

          {/* Minor removed as it's not provided by backend */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
            <input
              type="text"
              name="semester"
              value={academicData.semester}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing ? "border-gray-300 focus:border-brand-500" : "border-gray-200 bg-white"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation</label>
            <input
              type="month"
              name="expectedGraduation"
              value={academicData.expectedGraduation}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing ? "border-gray-300 focus:border-brand-500" : "border-gray-200 bg-white"
              }`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Advisor</label>
            <input
              type="text"
              name="academicAdvisor"
              value={academicData.academicAdvisor}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing ? "border-gray-300 focus:border-brand-500" : "border-gray-200 bg-white"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Current Courses */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Courses</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{course.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.credits}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {course.grade}
                    </span>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-6 text-sm text-gray-500 text-center">No courses to display</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Awards</h3>
        {achievements.length === 0 ? (
          <p className="text-sm text-gray-500">No achievements to display</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-200 p-2 rounded-lg">
                      <Icon className="text-yellow-700" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.date}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicInformation;