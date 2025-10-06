import React, { useState } from 'react';
import { Star, Send, AlertCircle } from 'lucide-react';

const PeerEvaluationForm = ({ teamMembers }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [milestone, setMilestone] = useState('');
  const [ratings, setRatings] = useState({
    contribution: 0,
    communication: 0,
    technical: 0,
    collaboration: 0,
    reliability: 0
  });
  const [comments, setComments] = useState('');
  const [hoveredRating, setHoveredRating] = useState({ category: null, value: 0 });

  const milestones = [
    'Project Initialization',
    'Requirements & Design',
    'Core Development Phase 1',
    'Integration & Testing'
  ];

  const ratingCategories = [
    { id: 'contribution', label: 'Contribution to Project', description: 'Quality and quantity of work delivered' },
    { id: 'communication', label: 'Communication', description: 'Responsiveness and clarity in team discussions' },
    { id: 'technical', label: 'Technical Skills', description: 'Proficiency in required technologies' },
    { id: 'collaboration', label: 'Collaboration', description: 'Teamwork and willingness to help others' },
    { id: 'reliability', label: 'Reliability', description: 'Meeting deadlines and commitments' }
  ];

  const handleRatingChange = (category, value) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMember || !milestone) {
      alert('Please select a team member and milestone');
      return;
    }

    const hasAllRatings = Object.values(ratings).every(r => r > 0);
    if (!hasAllRatings) {
      alert('Please provide ratings for all categories');
      return;
    }

    if (!comments.trim()) {
      alert('Please provide comments');
      return;
    }

    console.log('Submitting evaluation:', {
      selectedMember,
      milestone,
      ratings,
      comments
    });

    // Reset form
    setSelectedMember(null);
    setMilestone('');
    setRatings({
      contribution: 0,
      communication: 0,
      technical: 0,
      collaboration: 0,
      reliability: 0
    });
    setComments('');
    
    alert('Evaluation submitted successfully!');
  };

  const renderStars = (category, currentRating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(category, star)}
            onMouseEnter={() => setHoveredRating({ category, value: star })}
            onMouseLeave={() => setHoveredRating({ category: null, value: 0 })}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={`${
                star <= (hoveredRating.category === category ? hoveredRating.value : currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : 'Not rated'}
        </span>
      </div>
    );
  };

  const evaluableMembers = teamMembers.filter(m => !m.isCurrentUser);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Evaluate Team Member</h2>

      {evaluableMembers.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No team members available to evaluate</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team Member *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluableMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                    selectedMember?.id === member.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {member.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestone *
            </label>
            <select
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a milestone</option>
              {milestones.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Rating Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Performance</h3>
            <div className="space-y-6">
              {ratingCategories.map(({ id, label, description }) => (
                <div key={id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {renderStars(id, ratings[id])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments & Feedback *
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed feedback about your teammate's performance..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Be constructive and specific in your feedback
            </p>
          </div>

          {/* Average Rating Display */}
          {Object.values(ratings).some(r => r > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Average Rating</p>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-blue-600">
                  {(Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)}
                </div>
                <div className="text-gray-600">/ 5.0</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setSelectedMember(null);
                setMilestone('');
                setRatings({
                  contribution: 0,
                  communication: 0,
                  technical: 0,
                  collaboration: 0,
                  reliability: 0
                });
                setComments('');
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Send size={18} />
              Submit Evaluation
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PeerEvaluationForm;