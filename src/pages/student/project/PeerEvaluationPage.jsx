import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import EvaluationTabs from '../../../components/student/evaluation/EvaluationTabs';
import PeerEvaluationForm from '../../../components/student/evaluation/PeerEvaluationForm';
import EvaluationHistory from '../../../components/student/evaluation/EvaluationHistory';
import LecturerFeedback from '../../../components/student/evaluation/LecturerFeedback';
import { ClipboardList } from 'lucide-react';

const PeerEvaluationPage = () => {
  const { id, projectName } = useParams();
  
  const [activeTab, setActiveTab] = useState('evaluate'); // evaluate, history, feedback

  const [teamMembers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      role: "Team Leader",
      avatar: "AJ",
      isCurrentUser: true
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "Frontend Developer",
      avatar: "BS",
      isCurrentUser: false
    },
    {
      id: 3,
      name: "Charlie Brown",
      role: "Backend Developer",
      avatar: "CB",
      isCurrentUser: false
    },
    {
      id: 4,
      name: "Diana Prince",
      role: "UI/UX Designer",
      avatar: "DP",
      isCurrentUser: false
    }
  ]);

  const [evaluations] = useState([
    {
      id: 1,
      evaluator: "Alice Johnson",
      evaluatee: "Bob Smith",
      milestone: "Project Initialization",
      date: "2025-09-15",
      ratings: {
        contribution: 4,
        communication: 5,
        technical: 4,
        collaboration: 5,
        reliability: 4
      },
      comments: "Bob has been excellent in his role. Very communicative and delivers quality work on time.",
      status: "submitted"
    },
    {
      id: 2,
      evaluator: "Alice Johnson",
      evaluatee: "Charlie Brown",
      milestone: "Requirements & Design",
      date: "2025-10-01",
      ratings: {
        contribution: 5,
        communication: 4,
        technical: 5,
        collaboration: 4,
        reliability: 5
      },
      comments: "Charlie's technical skills are outstanding. Great problem solver and team player.",
      status: "submitted"
    }
  ]);

  const [lecturerFeedback] = useState([
    {
      id: 1,
      milestone: "Project Initialization",
      lecturer: "Dr. Sarah Chen",
      date: "2025-09-16",
      overallRating: 4.5,
      feedback: {
        strengths: [
          "Well-structured project charter",
          "Clear role distribution",
          "Good documentation practices"
        ],
        improvements: [
          "Need more detailed timeline",
          "Risk assessment could be more comprehensive"
        ],
        technicalFeedback: "Good use of Git branching strategy. Consider implementing automated testing earlier.",
        teamworkFeedback: "Team shows good collaboration. Communication channels are well established."
      },
      individualScores: [
        { member: "Alice Johnson", score: 4.5, comment: "Strong leadership skills" },
        { member: "Bob Smith", score: 4.3, comment: "Good technical implementation" },
        { member: "Charlie Brown", score: 4.7, comment: "Excellent problem-solving" },
        { member: "Diana Prince", score: 4.4, comment: "Creative design approach" }
      ]
    },
    {
      id: 2,
      milestone: "Requirements & Design",
      lecturer: "Dr. Sarah Chen",
      date: "2025-10-02",
      overallRating: 4.7,
      feedback: {
        strengths: [
          "Comprehensive system architecture",
          "Well-designed wireframes",
          "Clear functional requirements"
        ],
        improvements: [
          "Add more edge case scenarios",
          "Include performance requirements"
        ],
        technicalFeedback: "Excellent choice of tech stack. Architecture is scalable and maintainable.",
        teamworkFeedback: "Team coordination has improved significantly. Great progress!"
      },
      individualScores: [
        { member: "Alice Johnson", score: 4.8, comment: "Exceptional project management" },
        { member: "Bob Smith", score: 4.6, comment: "Solid frontend implementation" },
        { member: "Charlie Brown", score: 4.9, comment: "Outstanding backend design" },
        { member: "Diana Prince", score: 4.5, comment: "Beautiful UI/UX work" }
      ]
    }
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList size={32} />
            Peer Evaluation System
          </h1>
          <p className="text-gray-600 mt-1">Evaluate your teammates and view feedback from lecturers</p>
        </div>

        <EvaluationTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'evaluate' && (
            <PeerEvaluationForm teamMembers={teamMembers} />
          )}
          
          {activeTab === 'history' && (
            <EvaluationHistory evaluations={evaluations} />
          )}
          
          {activeTab === 'feedback' && (
            <LecturerFeedback feedbackList={lecturerFeedback} />
          )}
        </div>
      </main>
    </div>
  );
};

export default PeerEvaluationPage;