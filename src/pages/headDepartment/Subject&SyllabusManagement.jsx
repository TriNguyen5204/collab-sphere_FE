import React, { useState } from 'react';
import { BookOpen, FileText, ListChecks, BarChart3, Search, Filter, Plus, Edit, Trash2, Award, Target, PieChart, Download, Upload, GraduationCap, BookMarked, Calendar, Users } from 'lucide-react';

export default function ImprovedSubjectManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCredits, setFilterCredits] = useState('all');

  const [subjects] = useState([
    { id: 1, name: 'Mathematics I', code: 'MATH101', credits: 3, semester: 'Fall 2024', students: 45, instructor: 'Dr. Smith' },
    { id: 2, name: 'Physics I', code: 'PHYS101', credits: 4, semester: 'Fall 2024', students: 38, instructor: 'Dr. Johnson' },
    { id: 3, name: 'Computer Science Fundamentals', code: 'CS101', credits: 3, semester: 'Spring 2025', students: 52, instructor: 'Dr. Williams' },
    { id: 4, name: 'Linear Algebra', code: 'MATH201', credits: 3, semester: 'Spring 2025', students: 30, instructor: 'Dr. Brown' },
  ]);

  const [syllabus] = useState([
    {
      subjectId: 1,
      description: 'Introduction to calculus, algebra, and geometry.',
      topics: ['Limits & Continuity', 'Derivatives', 'Integrals', 'Applications of Calculus'],
      hours: 45,
    },
    {
      subjectId: 2,
      description: 'Basic mechanics and thermodynamics.',
      topics: ['Newton\'s Laws', 'Work & Energy', 'Heat Transfer', 'Kinetic Theory'],
      hours: 60,
    },
    {
      subjectId: 3,
      description: 'Programming basics and algorithms.',
      topics: ['Data Types', 'Control Structures', 'Sorting Algorithms', 'Object-Oriented Programming'],
      hours: 45,
    },
    {
      subjectId: 4,
      description: 'Vector spaces, matrices, and linear transformations.',
      topics: ['Vector Spaces', 'Matrices', 'Eigenvalues', 'Linear Transformations'],
      hours: 45,
    },
  ]);

  const [outcomes] = useState([
    {
      subjectId: 1,
      outcomes: ['Understand calculus concepts', 'Apply algebra in real-world problems', 'Solve differential equations'],
      gradeComponents: [
        { name: 'Assignments', weight: 20 },
        { name: 'Midterm Exam', weight: 30 },
        { name: 'Final Exam', weight: 50 },
      ],
    },
    {
      subjectId: 2,
      outcomes: ['Grasp fundamentals of mechanics', 'Analyze thermal systems', 'Apply physics principles'],
      gradeComponents: [
        { name: 'Lab Work', weight: 25 },
        { name: 'Midterm Exam', weight: 25 },
        { name: 'Final Exam', weight: 50 },
      ],
    },
    {
      subjectId: 3,
      outcomes: ['Write basic programs', 'Understand algorithms', 'Debug and optimize code'],
      gradeComponents: [
        { name: 'Assignments', weight: 30 },
        { name: 'Project', weight: 20 },
        { name: 'Final Exam', weight: 50 },
      ],
    },
    {
      subjectId: 4,
      outcomes: ['Master vector operations', 'Understand matrix theory', 'Apply linear transformations'],
      gradeComponents: [
        { name: 'Assignments', weight: 25 },
        { name: 'Midterm Exam', weight: 25 },
        { name: 'Final Exam', weight: 50 },
      ],
    },
  ]);

  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
  };

  const getSyllabus = (subjectId) => syllabus.find((s) => s.subjectId === subjectId);
  const getOutcome = (subjectId) => outcomes.find((o) => o.subjectId === subjectId);

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sub.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCredits = filterCredits === 'all' || sub.credits.toString() === filterCredits;
    return matchesSearch && matchesCredits;
  });

  const totalCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);
  const totalStudents = subjects.reduce((sum, sub) => sum + sub.students, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Subject Management
            </h1>
            <p className="text-gray-500 mt-1">Manage course catalog, syllabus, and learning outcomes</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Subjects</h3>
            <p className="text-3xl font-bold text-gray-800">{subjects.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-100">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Credits</h3>
            <p className="text-3xl font-bold text-gray-800">{totalCredits}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800">{totalStudents}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-600">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-100">
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Students/Subject</h3>
            <p className="text-3xl font-bold text-gray-800">{Math.round(totalStudents / subjects.length)}</p>
          </div>
        </div>

        {/* Subject Catalog */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-blue-600" />
                Subject Catalog
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredSubjects.length} subjects)
                </span>
              </h2>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject name or code..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterCredits}
                onChange={(e) => setFilterCredits(e.target.value)}
              >
                <option value="all">All Credits</option>
                <option value="3">3 Credits</option>
                <option value="4">4 Credits</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedSubject?.id === sub.id 
                      ? 'bg-blue-50 border-blue-500 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectSubject(sub)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">{sub.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {sub.code}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                          {sub.credits} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{sub.semester}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{sub.students} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span>{sub.instructor}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Details - Only show when subject is selected */}
        {selectedSubject && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Syllabus Browser */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-green-50 to-white border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  Syllabus Browser
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {getSyllabus(selectedSubject.id)?.description}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">Course Topics</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {getSyllabus(selectedSubject.id)?.hours} hours
                    </span>
                  </div>
                  <div className="space-y-2">
                    {getSyllabus(selectedSubject.id)?.topics.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {i + 1}
                        </div>
                        <span className="text-gray-700">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outcomes & Grade Components */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Learning Outcomes & Grading
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Learning Outcomes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Learning Outcomes
                  </h3>
                  <div className="space-y-2">
                    {getOutcome(selectedSubject.id)?.outcomes.map((o, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          ✓
                        </div>
                        <span className="text-gray-700">{o}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade Components */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Grade Components
                  </h3>
                  <div className="space-y-3">
                    {getOutcome(selectedSubject.id)?.gradeComponents.map((g, i) => (
                      <div key={i} className="relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{g.name}</span>
                          <span className="text-sm font-bold text-gray-800">{g.weight}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${g.weight}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Total Weight</span>
                      <span className="text-lg font-bold text-purple-600">
                        {getOutcome(selectedSubject.id)?.gradeComponents.reduce((sum, g) => sum + g.weight, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedSubject && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Subject Selected</h3>
            <p className="text-gray-500">Select a subject from the catalog to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}