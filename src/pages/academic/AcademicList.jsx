import React, { useState, useEffect } from "react";
import AcademicTable from "../../components/ui/AcademicTable";
import AcademicCard from "../../components/ui/AcademicCard";
import AcademicForm from "../../components/ui/AcademicForm";
import ProjectApprovalList from "../../components/ui/ProjectApprovalList";
import Header from "../../components/layout/Header";
import { Search } from "lucide-react";
import { Table } from "lucide-react";
import { LayoutGrid } from "lucide-react";

const sampleSubjects = [
	{
		"SyllabusId": 101,
		"SyllabusName": "Introduction to Software Engineering",
		"Description": "Basics of software engineering processes, requirements, and lifecycle.",
		"SubjectCode": "SE101",
		"SubjectId": 1,
		"NoCredit": 3,
		"CreatedDate": "2024-09-01T08:30:00Z",
		"IsActive": true,
		"GradeComponents": [
			{
				"SubjectGradeComponentId": 1001,
				"SubjectId": 1,
				"SyllabusId": 101,
				"ComponentName": "Assignments",
				"ReferencePercentage": 30.0
			},
			{
				"SubjectGradeComponentId": 1002,
				"SubjectId": 1,
				"SyllabusId": 101,
				"ComponentName": "Midterm Exam",
				"ReferencePercentage": 25.0
			},
			{
				"SubjectGradeComponentId": 1003,
				"SubjectId": 1,
				"SyllabusId": 101,
				"ComponentName": "Final Exam",
				"ReferencePercentage": 35.0
			},
			{
				"SubjectGradeComponentId": 1004,
				"SubjectId": 1,
				"SyllabusId": 101,
				"ComponentName": "Class Participation",
				"ReferencePercentage": 10.0
			}
		],
		"Outcomes": [
			{
				"SubjectOutcomeId": 5001,
				"SyllabusId": 101,
				"OutcomeDetail": "Understand software development life cycles and methodologies."
			},
			{
				"SubjectOutcomeId": 5002,
				"SyllabusId": 101,
				"OutcomeDetail": "Apply basic requirement elicitation and specification techniques."
			},
			{
				"SubjectOutcomeId": 5003,
				"SyllabusId": 101,
				"OutcomeDetail": "Demonstrate teamwork and communication skills in small projects."
			}
		]
	},
	{
		"SyllabusId": 102,
		"SyllabusName": "Data Structures and Algorithms",
		"Description": "Fundamentals of data structures, algorithm analysis and problem solving.",
		"SubjectCode": "DSA201",
		"SubjectId": 2,
		"NoCredit": 4,
		"CreatedDate": "2024-09-02T09:00:00Z",
		"IsActive": true,
		"GradeComponents": [
			{
				"SubjectGradeComponentId": 1101,
				"SubjectId": 2,
				"SyllabusId": 102,
				"ComponentName": "Labs / Coding Assignments",
				"ReferencePercentage": 40.0
			},
			{
				"SubjectGradeComponentId": 1102,
				"SubjectId": 2,
				"SyllabusId": 102,
				"ComponentName": "Quizzes",
				"ReferencePercentage": 10.0
			},
			{
				"SubjectGradeComponentId": 1103,
				"SubjectId": 2,
				"SyllabusId": 102,
				"ComponentName": "Midterm",
				"ReferencePercentage": 20.0
			},
			{
				"SubjectGradeComponentId": 1104,
				"SubjectId": 2,
				"SyllabusId": 102,
				"ComponentName": "Final Exam",
				"ReferencePercentage": 30.0
			}
		],
		"Outcomes": [
			{
				"SubjectOutcomeId": 5101,
				"SyllabusId": 102,
				"OutcomeDetail": "Select and implement appropriate data structures for a given problem."
			},
			{
				"SubjectOutcomeId": 5102,
				"SyllabusId": 102,
				"OutcomeDetail": "Analyze algorithmic complexity using Big-O notation."
			}
		]
	},
	{
		"SyllabusId": 103,
		"SyllabusName": "Database Systems",
		"Description": "Relational databases, SQL, normalization, and basic transactions.",
		"SubjectCode": "DBS301",
		"SubjectId": 3,
		"NoCredit": 3,
		"CreatedDate": "2024-09-03T10:15:00Z",
		"IsActive": true,
		"GradeComponents": [
			{
				"SubjectGradeComponentId": 1201,
				"SubjectId": 3,
				"SyllabusId": 103,
				"ComponentName": "Practical Labs",
				"ReferencePercentage": 35.0
			},
			{
				"SubjectGradeComponentId": 1202,
				"SubjectId": 3,
				"SyllabusId": 103,
				"ComponentName": "Assignments",
				"ReferencePercentage": 25.0
			},
			{
				"SubjectGradeComponentId": 1203,
				"SubjectId": 3,
				"SyllabusId": 103,
				"ComponentName": "Final Project",
				"ReferencePercentage": 30.0
			},
			{
				"SubjectGradeComponentId": 1204,
				"SubjectId": 3,
				"SyllabusId": 103,
				"ComponentName": "Final Exam",
				"ReferencePercentage": 10.0
			}
		],
		"Outcomes": [
			{
				"SubjectOutcomeId": 5201,
				"SyllabusId": 103,
				"OutcomeDetail": "Design normalized relational schemas for given requirements."
			},
			{
				"SubjectOutcomeId": 5202,
				"SyllabusId": 103,
				"OutcomeDetail": "Write advanced SQL queries including joins, aggregates and subqueries."
			},
			{
				"SubjectOutcomeId": 5203,
				"SyllabusId": 103,
				"OutcomeDetail": "Understand transaction isolation and concurrency basics."
			}
		]
	},
	{
		"SyllabusId": 104,
		"SyllabusName": "Web Development",
		"Description": "HTML, CSS, JavaScript and basic backend integration for web apps.",
		"SubjectCode": "WD102",
		"SubjectId": 4,
		"NoCredit": 2,
		"CreatedDate": "2024-09-04T14:00:00Z",
		"IsActive": true,
		"GradeComponents": [
			{
				"SubjectGradeComponentId": 1301,
				"SubjectId": 4,
				"SyllabusId": 104,
				"ComponentName": "Projects",
				"ReferencePercentage": 50.0
			},
			{
				"SubjectGradeComponentId": 1302,
				"SubjectId": 4,
				"SyllabusId": 104,
				"ComponentName": "Quizzes",
				"ReferencePercentage": 20.0
			},
			{
				"SubjectGradeComponentId": 1303,
				"SubjectId": 4,
				"SyllabusId": 104,
				"ComponentName": "Participation",
				"ReferencePercentage": 10.0
			},
			{
				"SubjectGradeComponentId": 1304,
				"SubjectId": 4,
				"SyllabusId": 104,
				"ComponentName": "Final Demo",
				"ReferencePercentage": 20.0
			}
		],
		"Outcomes": [
			{
				"SubjectOutcomeId": 5301,
				"SyllabusId": 104,
				"OutcomeDetail": "Build responsive front-end pages using HTML/CSS and JavaScript."
			},
			{
				"SubjectOutcomeId": 5302,
				"SyllabusId": 104,
				"OutcomeDetail": "Integrate frontend with a simple backend API."
			}
		]
	},
	{
		"SyllabusId": 105,
		"SyllabusName": "Software Testing & QA",
		"Description": "Principles of software testing, unit/integration testing, and quality assurance.",
		"SubjectCode": "QA410",
		"SubjectId": 5,
		"NoCredit": 2,
		"CreatedDate": "2024-09-05T11:20:00Z",
		"IsActive": false,
		"GradeComponents": [
			{
				"SubjectGradeComponentId": 1401,
				"SubjectId": 5,
				"SyllabusId": 105,
				"ComponentName": "Test Cases / Labs",
				"ReferencePercentage": 40.0
			},
			{
				"SubjectGradeComponentId": 1402,
				"SubjectId": 5,
				"SyllabusId": 105,
				"ComponentName": "Project",
				"ReferencePercentage": 40.0
			},
			{
				"SubjectGradeComponentId": 1403,
				"SubjectId": 5,
				"SyllabusId": 105,
				"ComponentName": "Final Exam",
				"ReferencePercentage": 20.0
			}
		],
		"Outcomes": [
			{
				"SubjectOutcomeId": 5401,
				"SyllabusId": 105,
				"OutcomeDetail": "Design and write unit and integration tests for code modules."
			},
			{
				"SubjectOutcomeId": 5402,
				"SyllabusId": 105,
				"OutcomeDetail": "Explain fundamentals of test automation and CI integration."
			}
		]
	}
]

// Sample projects pending approval
const sampleProjects = [
	{
		projectId: "proj_101",
		title: "Student Management System",
		description: "A comprehensive web-based system to manage student records, course enrollments, and academic progress tracking.",
		subjectId: 1,
		subjectCode: "SE101",
		syllabusName: "Introduction to Software Engineering",
		lecturer: "Dr. Jane Smith",
		submissionDate: "2025-09-15T10:30:00Z",
		status: "pending",
		learningOutcomeAlignment: [
			{ outcomeId: 5001, alignmentDescription: "Project follows SDLC with documentation of each phase" },
			{ outcomeId: 5002, alignmentDescription: "Includes complete requirements specification document" },
			{ outcomeId: 5003, alignmentDescription: "Designed for team implementation with defined roles" }
		]
	},
	{
		projectId: "proj_102",
		title: "Algorithm Visualization Tool",
		description: "Interactive web application that visualizes common data structures and algorithms to help students understand their operation.",
		subjectId: 2,
		subjectCode: "DSA201",
		syllabusName: "Data Structures and Algorithms",
		lecturer: "Prof. Robert Chen",
		submissionDate: "2025-09-12T14:45:00Z",
		status: "pending",
		learningOutcomeAlignment: [
			{ outcomeId: 5101, alignmentDescription: "Implements and demonstrates various data structures" },
			{ outcomeId: 5102, alignmentDescription: "Shows time complexity analysis for each algorithm" }
		]
	},
	{
		projectId: "proj_103",
		title: "E-Commerce Database Design",
		description: "Complete database design project for an e-commerce platform including schema design, normalization, and sample queries.",
		subjectId: 3,
		subjectCode: "DBS301",
		syllabusName: "Database Systems",
		lecturer: "Dr. Maria Garcia",
		submissionDate: "2025-09-10T09:15:00Z",
		status: "pending",
		learningOutcomeAlignment: [
			{ outcomeId: 5201, alignmentDescription: "Implements 3NF database design with documentation" },
			{ outcomeId: 5202, alignmentDescription: "Includes complex query examples with optimization notes" },
			{ outcomeId: 5203, alignmentDescription: "Covers transaction scenarios with isolation level requirements" }
		]
	},
	{
		projectId: "proj_104",
		title: "Personal Portfolio Website Project",
		description: "Students will create personal portfolio websites showcasing their skills and projects with responsive design.",
		subjectId: 4,
		subjectCode: "WD102",
		syllabusName: "Web Development",
		lecturer: "Prof. David Johnson",
		submissionDate: "2025-09-08T11:00:00Z",
		status: "pending",
		learningOutcomeAlignment: [
			{ outcomeId: 5301, alignmentDescription: "Focuses on responsive design principles and modern CSS" },
			{ outcomeId: 5302, alignmentDescription: "Includes project showcase section with backend API integration" }
		]
	},
]

export default function AcademicList() {
	const [subjects, setSubjects] = useState(sampleSubjects);
	const [projects, setProjects] = useState(sampleProjects);
	const [editing, setEditing] = useState(null);
	const [viewMode, setViewMode] = useState("table"); // or 'grid'
	const [q, setQ] = useState("");
	const [pendingCount, setPendingCount] = useState(0);

	useEffect(() => {
		// Calculate pending projects count
		setPendingCount(projects.filter(p => p.status === "pending").length);
	}, [projects]);

	function handleCreateOrUpdate(data) {
		if (data.SubjectId) {
			// update - keep the existing format 
			setSubjects(prev => prev.map(s => (s.SubjectId === data.SubjectId ? { ...s, ...data } : s)));
		} else {
			// create with the complete data structure format
			const id = Math.max(...subjects.map(s => s.SubjectId)) + 1;
			const syllabusId = Math.max(...subjects.map(s => s.SyllabusId || 0)) + 1;

			const newSubject = {
				SubjectId: id,
				SyllabusId: syllabusId,
				SyllabusName: data.SyllabusName || "",
				Description: data.Description || "",
				SubjectCode: data.SubjectCode || "",
				NoCredit: data.NoCredit || 3,
				CreatedDate: new Date().toISOString(),
				IsActive: true,
				GradeComponents: data.GradeComponents || [],
				Outcomes: data.Outcomes || []
			};

			setSubjects(prev => [newSubject, ...prev]);
		}
		setEditing(null);
	}

	function handleToggle(id) {
		setSubjects(prev =>
			prev.map(s => s.SubjectId === id ? { ...s, IsActive: !s.IsActive } : s)
		);
	}


	function handleApproveProject(projectId, approved, feedback = "") {
		setProjects(prev =>
			prev.map(p =>
				p.projectId === projectId
					? { ...p, status: approved ? "approved" : "rejected", feedback }
					: p
			)
		);
	}

	const filtered = subjects.filter(s =>
		!q ||
		s.SubjectCode.toLowerCase().includes(q.toLowerCase()) ||
		(s.SyllabusName && s.SyllabusName.toLowerCase().includes(q.toLowerCase()))
	);

	return (
		<main className=" min-h-screen" style={{ backgroundColor: '#D5DADF' }}>
			<Header />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Subjects Section */}
				<div className="bg-white shadow rounded-lg overflow-hidden mb-8">
					<div className="p-6 border-b border-gray-200">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
								<p className="mt-1 text-sm text-gray-500">Manage academic subjects and syllabus</p>
							</div>

							<div className="flex items-center gap-2">
								<div className="relative">
									<input
										value={q}
										onChange={e => setQ(e.target.value)}
										placeholder="Search code or name…"
										className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									/>
									<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								</div>

								<button
									onClick={() => setEditing({})}
									className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								>
									New Subject
								</button>

								<div className="hidden md:flex ml-2 border rounded-md overflow-hidden">
									<button
										onClick={() => setViewMode("table")}
										className={`px-3 py-2 ${viewMode === "table" ? "bg-indigo-50 text-indigo-700" : "text-gray-500"}`}
									>
										<Table className="h-5 w-5" />
									</button>
									<button
										onClick={() => setViewMode("grid")}
										className={`px-3 py-2 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-700" : "text-gray-500"}`}
									>
										<LayoutGrid className="h-5 w-5" />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="p-6">
						{viewMode === "table" ? (
							<AcademicTable rows={filtered} onEdit={setEditing} onToggle={handleToggle} />
						) : (
							<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filtered.map(s => (
									<AcademicCard
										key={s.SubjectId}
										subject={s}
										onEdit={() => setEditing(s)}
										onToggle={handleToggle}
									/>
								))}
								{filtered.length === 0 && (
									<div className="col-span-full text-center py-10 text-gray-500">
										No subjects found matching your search.
									</div>
								)}
							</div>
						)}

						{filtered.length === 0 && q && (
							<div className="text-center py-10">
								<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p className="mt-2 text-gray-500">No subjects found matching "{q}"</p>
								<button
									onClick={() => setQ("")}
									className="mt-3 text-indigo-600 hover:text-indigo-500"
								>
									Clear search
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Project Approval Section */}
				<div className="bg-white shadow rounded-lg overflow-hidden">
					<div className="p-6 border-b border-gray-200">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Project Approvals</h1>
								<p className="mt-1 text-sm text-gray-500">Manage project proposals from lecturers</p>
							</div>
							{pendingCount > 0 && (
								<div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-red-100 text-red-800">
									<svg className="mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
										<circle cx="4" cy="4" r="3" />
									</svg>
									<span className="font-medium">{pendingCount} pending approvals</span>
								</div>
							)}
						</div>
					</div>

					<div className="p-6">
						<ProjectApprovalList
							projects={projects}
							subjects={subjects}
							onApprove={(id, feedback) => handleApproveProject(id, true, feedback)}
							onReject={(id, feedback) => handleApproveProject(id, false, feedback)}
						/>
					</div>
				</div>

				{editing !== null && (
					<div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 overflow-y-auto">
						<div className="bg-white w-full max-w-3xl rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h3 className="text-xl font-semibold text-gray-900">{editing.SubjectId ? "Edit Subject" : "New Subject"}</h3>
									<button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-500">
										<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-6">
								<AcademicForm
									defaultValues={editing}
									onCancel={() => setEditing(null)}
									onSubmit={handleCreateOrUpdate}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
