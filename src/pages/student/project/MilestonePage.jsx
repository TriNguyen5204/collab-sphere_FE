import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import MilestoneTimeline from '../../../components/student/milestone/MilestoneTimeline';
import MilestoneHeader from '../../../components/student/milestone/MilestoneHeader';
import MilestoneQuestions from '../../../components/student/milestone/MilestoneQuestions';

const MilestonePage = () => {
  const { id, projectName } = useParams();
  
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: "Project Initialization",
      description: "Set up project repository, team structure, and initial documentation",
      dueDate: "2025-09-15",
      status: "completed",
      completedDate: "2025-09-14",
      completedBy: "Alice Johnson (Leader)",
      questions: [
        {
          id: 1,
          question: "What is your team's Git repository URL?",
          answer: "https://github.com/team-alpha/collab-sphere",
          answeredBy: "Alice Johnson",
          answeredAt: "2025-09-12",
          type: "text"
        },
        {
          id: 2,
          question: "How many team members are actively participating?",
          answer: "4",
          answeredBy: "Alice Johnson",
          answeredAt: "2025-09-12",
          type: "number"
        },
        {
          id: 3,
          question: "Have you completed the team roles assignment?",
          answer: "Yes",
          answeredBy: "Alice Johnson",
          answeredAt: "2025-09-13",
          type: "boolean"
        }
      ],
      progress: 100,
      requiredAnswers: 3,
      completedAnswers: 3
    },
    {
      id: 2,
      title: "Requirements & Design",
      description: "Complete system requirements analysis and design documentation",
      dueDate: "2025-09-30",
      status: "in-progress",
      completedDate: null,
      completedBy: null,
      questions: [
        {
          id: 4,
          question: "Describe your system architecture in detail",
          answer: "We are using a microservices architecture with React frontend, NestJS backend, and PostgreSQL database...",
          answeredBy: "Bob Smith",
          answeredAt: "2025-09-25",
          type: "textarea"
        },
        {
          id: 5,
          question: "What are the main functional requirements?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "textarea"
        },
        {
          id: 6,
          question: "Have you created wireframes for all main screens?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "boolean"
        },
        {
          id: 7,
          question: "What design patterns will you implement?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "text"
        }
      ],
      progress: 25,
      requiredAnswers: 4,
      completedAnswers: 1
    },
    {
      id: 3,
      title: "Core Development Phase 1",
      description: "Implement basic functionality and database structure",
      dueDate: "2025-10-15",
      status: "pending",
      completedDate: null,
      completedBy: null,
      questions: [
        {
          id: 8,
          question: "What percentage of core features are implemented?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "number"
        },
        {
          id: 9,
          question: "Describe any technical challenges faced",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "textarea"
        },
        {
          id: 10,
          question: "Have you implemented unit tests?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "boolean"
        }
      ],
      progress: 0,
      requiredAnswers: 3,
      completedAnswers: 0
    },
    {
      id: 4,
      title: "Integration & Testing",
      description: "Complete system integration and comprehensive testing",
      dueDate: "2025-10-30",
      status: "locked",
      completedDate: null,
      completedBy: null,
      questions: [
        {
          id: 11,
          question: "What types of testing have you performed?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "textarea"
        },
        {
          id: 12,
          question: "What is your test coverage percentage?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "number"
        }
      ],
      progress: 0,
      requiredAnswers: 2,
      completedAnswers: 0
    }
  ]);

  const [selectedMilestone, setSelectedMilestone] = useState(milestones[1]);
  const [answers, setAnswers] = useState({});
  const [isLeader, setIsLeader] = useState(true);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSaveAnswer = (questionId) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === selectedMilestone.id) {
        const updatedQuestions = milestone.questions.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answer: answers[questionId] || q.answer,
              answeredBy: "Current User",
              answeredAt: new Date().toISOString()
            };
          }
          return q;
        });
        
        const completedAnswers = updatedQuestions.filter(q => q.answer && q.answer !== "").length;
        const progress = Math.round((completedAnswers / milestone.requiredAnswers) * 100);
        
        return {
          ...milestone,
          questions: updatedQuestions,
          completedAnswers,
          progress
        };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    setSelectedMilestone(updatedMilestones.find(m => m.id === selectedMilestone.id));
    setAnswers({ ...answers, [questionId]: "" });
  };

  const handleCompleteMilestone = () => {
    if (!isLeader) {
      alert("Only team leader can mark milestones as complete");
      return;
    }
    
    if (selectedMilestone.completedAnswers < selectedMilestone.requiredAnswers) {
      alert("Please answer all questions before completing the milestone");
      return;
    }
    
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === selectedMilestone.id) {
        return {
          ...milestone,
          status: "completed",
          completedDate: new Date().toISOString(),
          completedBy: "Alice Johnson (Leader)",
          progress: 100
        };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    setSelectedMilestone(updatedMilestones.find(m => m.id === selectedMilestone.id));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      
      <main className="p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Milestones</h1>
          <p className="text-gray-600 mt-1">Track and complete project milestones with your team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar - Milestone Timeline */}
          <MilestoneTimeline
            milestones={milestones}
            selectedMilestone={selectedMilestone}
            onSelectMilestone={setSelectedMilestone}
          />

          {/* Main Content - Milestone Details */}
          <div className="lg:col-span-2 space-y-6">
            <MilestoneHeader
              milestone={selectedMilestone}
              isLeader={isLeader}
              onComplete={handleCompleteMilestone}
            />

            <MilestoneQuestions
              milestone={selectedMilestone}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onSaveAnswer={handleSaveAnswer}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MilestonePage;