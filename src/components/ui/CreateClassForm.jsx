import React, { useState } from "react";
import { BookOpen, Users, Calendar, Key, Hash, CheckCircle, User, Plus, X, Save, AlertCircle, Search, Filter } from "lucide-react";

// Giả lập danh sách học sinh để thêm
const additionalStudents = [
  { 
    id: 1, 
    name: "Jane Cooper", 
    email: "jane.cooper@university.edu",
    studentId: "SE20001",
    avatar: "https://i.pravatar.cc/40?img=1",
    major: "Computer Science",
    year: "Junior"
  },
  { 
    id: 2, 
    name: "Robert Fox", 
    email: "robert.fox@university.edu",
    studentId: "SE20002",
    avatar: "https://i.pravatar.cc/40?img=2",
    major: "Software Engineering",
    year: "Senior"
  },
  { 
    id: 3, 
    name: "Courtney Henry", 
    email: "courtney.henry@university.edu",
    studentId: "SE20003",
    avatar: "https://i.pravatar.cc/40?img=3",
    major: "Information Technology",
    year: "Sophomore"
  },
  { 
    id: 4, 
    name: "Devon Lane", 
    email: "devon.lane@university.edu",
    studentId: "SE20004",
    avatar: "https://i.pravatar.cc/40?img=4",
    major: "Computer Science",
    year: "Freshman"
  },
  { 
    id: 5, 
    name: "Eleanor Pena", 
    email: "eleanor.pena@university.edu",
    studentId: "SE20005",
    avatar: "https://i.pravatar.cc/40?img=5",
    major: "Data Science",
    year: "Junior"
  },
];

const subjects = [
  "Computer Science",
  "Mathematics", 
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Business Administration",
  "Psychology",
  "Literature",
  "History"
];

export default function ImprovedCreateClassForm() {
  const [form, setForm] = useState({
    name: "",
    subjects: "",
    enrollKey: "",
    groupCount: 1,
    createdDate: new Date().toISOString().split("T")[0],
    status: "active",
    students: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleStudent = (student) => {
    setForm((prev) => {
      const exists = prev.students.find((s) => s.id === student.id);
      return {
        ...prev,
        students: exists
          ? prev.students.filter((s) => s.id !== student.id)
          : [...prev.students, student],
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Class name is required";
    if (!form.subjects.trim()) newErrors.subjects = "Subject is required";
    if (!form.enrollKey.trim()) newErrors.enrollKey = "Enrollment key is required";
    if (form.groupCount < 1) newErrors.groupCount = "Must have at least 1 group";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1); // Go back to first step if validation fails
      return;
    }
    
    setIsSubmitting(true);
    
    const dataToSend = {
      ...form,
      studentCount: form.students.length,
    };
    
    // Simulate API call
    setTimeout(() => {
      console.log("Create Class Data:", dataToSend);
      setIsSubmitting(false);
      alert("Class created successfully! Check console for data.");
    }, 2000);
  };

  const generateEnrollKey = () => {
    const key = Math.random().toString(36).substring(2, 10).toUpperCase();
    setForm(prev => ({ ...prev, enrollKey: key }));
  };

  const selectAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    setForm(prev => ({ ...prev, students: [...filteredStudents] }));
  };

  const clearAllStudents = () => {
    setForm(prev => ({ ...prev, students: [] }));
  };

  const getFilteredStudents = () => {
    return additionalStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === "all" || student.year.toLowerCase() === yearFilter.toLowerCase();
      return matchesSearch && matchesYear;
    });
  };

  const filteredStudents = getFilteredStudents();
  const uniqueYears = [...new Set(additionalStudents.map(s => s.year))];

  const steps = [
    { id: 1, title: "Basic Information", icon: BookOpen },
    { id: 2, title: "Select Students", icon: Users },
    { id: 3, title: "Review & Create", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Class</h1>
          <p className="text-gray-600">Set up your class and invite students to join</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Step {step.id}
                    </p>
                    <p className={`text-sm ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Details</h2>
                  <p className="text-gray-600">Enter the basic information for your class</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4" />
                      Class Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter class name"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4" />
                      Subject *
                    </label>
                    <select
                      name="subjects"
                      value={form.subjects}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.subjects ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    {errors.subjects && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subjects}
                    </p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Key className="w-4 h-4" />
                      Enrollment Key *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="enrollKey"
                        value={form.enrollKey}
                        onChange={handleChange}
                        placeholder="Enter enrollment key"
                        className={`flex-1 px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.enrollKey ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={generateEnrollKey}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        title="Generate random key"
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.enrollKey && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.enrollKey}
                    </p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4" />
                      Number of Groups
                    </label>
                    <input
                      type="number"
                      name="groupCount"
                      value={form.groupCount}
                      min={1}
                      max={20}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.groupCount ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                      }`}
                    />
                    {errors.groupCount && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.groupCount}
                    </p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Created Date
                    </label>
                    <input
                      type="date"
                      name="createdDate"
                      value={form.createdDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Students */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Students</h2>
                  <p className="text-gray-600">Select students to enroll in this class</p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {form.students.length} of {filteredStudents.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllStudents}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        form.students.some(s => s.id === student.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {form.students.some(s => s.id === student.id) && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.studentId}</p>
                          <p className="text-xs text-gray-500">{student.major} • {student.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Create */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Class Details</h2>
                  <p className="text-gray-600">Please review all information before creating the class</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Class Name</label>
                      <p className="text-lg font-semibold text-gray-900">{form.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Subject</label>
                      <p className="text-lg font-semibold text-gray-900">{form.subjects}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Enrollment Key</label>
                      <p className="text-lg font-mono font-semibold text-gray-900">{form.enrollKey}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Groups</label>
                      <p className="text-lg font-semibold text-gray-900">{form.groupCount}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created Date</label>
                      <p className="text-lg font-semibold text-gray-900">{form.createdDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Students</label>
                      <p className="text-lg font-semibold text-gray-900">{form.students.length} selected</p>
                    </div>
                  </div>
                </div>

                {form.students.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Students</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {form.students.map((student) => (
                        <div key={student.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.studentId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1) {
                    if (validateForm()) {
                      setCurrentStep(prev => prev + 1);
                    }
                  } else {
                    setCurrentStep(prev => prev + 1);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Class...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Class
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}