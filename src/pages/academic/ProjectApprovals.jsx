import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProjectApprovalList from "../../components/ui/ProjectApprovalList";

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
];

// Sample subjects data for outcome details
const sampleSubjects = [
    {
        "SyllabusId": 101,
        "SyllabusName": "Introduction to Software Engineering",
        "Description": "Basics of software engineering processes, requirements, and lifecycle.",
        "SubjectCode": "SE101",
        "SubjectId": 1,
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
    }
];

export default function ProjectApprovals() {
    const [projects, setProjects] = useState(sampleProjects);
    const [subjects] = useState(sampleSubjects);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Calculate pending projects count
        setPendingCount(projects.filter(p => p.status === "pending").length);
    }, [projects]);

    function handleApproveProject(projectId, approved, feedback = "") {
        setProjects(prev => 
            prev.map(p => 
                p.projectId === projectId 
                    ? { ...p, status: approved ? "approved" : "rejected", feedback } 
                    : p
            )
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <Link 
                                        to="/academic" 
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </Link>
                                    <h1 className="text-2xl font-bold text-gray-900">Project Approvals</h1>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">Review and approve project proposals from lecturers</p>
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
            </div>
        </main>
    );
}