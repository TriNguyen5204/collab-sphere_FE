import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Edit3,
  Check,
  Users,
  Zap,
  Target,
  UserCircle,
  ChevronRight,
  CheckCircle,
  X,
  Trash2,
  Save,
  Loader2,
  Eye,
  Package,
  CheckSquare,
  Square,
  RefreshCw,
  Layers
} from 'lucide-react';
import { COMPLEXITY_OPTIONS } from './constants';

/**
 * Compact Idea Card for Multi-Select Grid
 */
const IdeaCard = ({
  idea,
  index,
  isSelected,
  teamSize,
  complexity,
  onToggleSelect,
  onEdit,
  onDelete,
  isCreating
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group relative transition-all duration-300 ${
        isSelected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
      } ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Glass Card */}
      <div className={`relative h-full rounded-2xl border-2 p-5 transition-all duration-300 backdrop-blur-xl ${
        isSelected
          ? 'bg-gradient-to-br from-emerald-50/95 to-teal-50/90 border-emerald-300 shadow-lg shadow-emerald-100'
          : 'bg-white/80 border-slate-200/60 hover:border-indigo-300 shadow-md hover:shadow-lg'
      }`}>
        
        {/* Selection Checkbox - Top Left */}
        <button
          onClick={() => onToggleSelect(idea.id)}
          className={`absolute -top-2 -left-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all z-10 ${
            isSelected
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'bg-white border-2 border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500'
          }`}
        >
          {isSelected ? <Check size={14} strokeWidth={3} /> : <Square size={14} />}
        </button>

        {/* Action Buttons - Top Right */}
        <div className="absolute -top-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(idea.id);
            }}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center transition-all shadow-sm"
            title="Edit"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(idea.id);
            }}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-all shadow-sm"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Card Content */}
        <div className="pt-2">
          {/* Project Name */}
          <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-2 mb-2 group-hover:text-indigo-700 transition-colors">
            {idea.projectName || 'Untitled Project'}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-semibold">
              <Users size={10} />
              {teamSize}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              complexity <= 2 ? 'bg-emerald-100 text-emerald-700' :
              complexity <= 3 ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              <Zap size={10} />
              {COMPLEXITY_OPTIONS.find(c => c.value === complexity)?.label || 'Intermediate'}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
            {idea.description || 'No description provided.'}
          </p>

          {/* Actors Preview */}
          {idea.actors && (
            <div className="flex flex-wrap gap-1 mb-3">
              {idea.actors.split(',').slice(0, 3).map((actor, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                  <UserCircle size={8} />
                  {actor.trim()}
                </span>
              ))}
              {idea.actors.split(',').length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  +{idea.actors.split(',').length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Select Button */}
          <button
            onClick={() => onToggleSelect(idea.id)}
            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isSelected
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700'
            }`}
          >
            {isSelected ? (
              <>
                <CheckSquare size={14} />
                Selected
              </>
            ) : (
              <>
                <Square size={14} />
                Select
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}/**
 * Edit Idea Modal
 */
const EditIdeaModal = ({ idea, onSave, onClose }) => {
  const [editedIdea, setEditedIdea] = useState({ ...idea });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Project Concept</h2>
            <p className="text-xs text-slate-500">Customize the AI-generated details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Project Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Project Name
            </label>
            <input
              type="text"
              value={editedIdea.projectName || ''}
              onChange={(e) => setEditedIdea({ ...editedIdea, projectName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              placeholder="Enter project name..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Description
            </label>
            <textarea
              value={editedIdea.description || ''}
              onChange={(e) => setEditedIdea({ ...editedIdea, description: e.target.value })}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"
              placeholder="Describe the project concept..."
            />
          </div>

          {/* Business Rules */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Business Rules
            </label>
            <textarea
              value={editedIdea.businessRules || ''}
              onChange={(e) => setEditedIdea({ ...editedIdea, businessRules: e.target.value })}
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"
              placeholder="- Rule 1&#10;- Rule 2&#10;- Rule 3"
            />
            <p className="text-xs text-slate-400 mt-1">Start each rule with a dash (-)</p>
          </div>

          {/* Actors */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Actors
            </label>
            <input
              type="text"
              value={editedIdea.actors || ''}
              onChange={(e) => setEditedIdea({ ...editedIdea, actors: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              placeholder="Admin, User, Manager (comma separated)"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedIdea)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Creating Projects Progress Modal
 */
const CreatingProgressModal = ({ 
  selectedIdeas, 
  creatingIndex, 
  completedIds,
  onClose 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Package size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Creating Projects</h2>
            <p className="text-sm text-slate-500 mt-1">
              {completedIds.length} of {selectedIdeas.length} completed
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(completedIds.length / selectedIdeas.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Projects List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedIdeas.map((idea, idx) => {
              const isCompleted = completedIds.includes(idea.id);
              const isCurrent = idx === creatingIndex;
              
              return (
                <div
                  key={idea.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCompleted 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : isCurrent 
                      ? 'bg-indigo-50 border border-indigo-200' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-slate-300 text-white'
                  }`}>
                    {isCompleted ? (
                      <Check size={14} strokeWidth={3} />
                    ) : isCurrent ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-700' : 'text-slate-600'
                    }`}>
                      {idea.projectName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isCompleted ? 'Created successfully' : isCurrent ? 'Creating...' : 'Waiting...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Aurora Background Effect
 */
const AuroraBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/40 via-indigo-200/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-teal-200/40 via-cyan-200/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-rose-200/20 via-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
  </div>
);

/**
 * Empty State Component
 */
const EmptyState = ({ onGenerateMore }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <Layers size={32} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">No concepts remaining</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
      You've reviewed all the AI-generated concepts. Generate more to continue exploring ideas.
    </p>
    <button
      onClick={onGenerateMore}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all"
    >
      <Plus size={18} />
      Generate More Concepts
    </button>
  </motion.div>
);

/**
 * Main Idea Selection Screen Component - Multi-select with delete and generate more
 */
const IdeaSelectionScreen = ({
  ideas,
  selectedIdeaIds = [],
  topicDomain,
  teamSize,
  complexity,
  isGeneratingMore,
  isCreatingProjects,
  creatingIndex,
  completedProjectIds = [],
  onToggleSelectIdea,
  onSelectAll,
  onDeselectAll,
  onEditIdea,
  onSaveIdea,
  onDeleteIdea,
  onCreateSelectedProjects,
  onGenerateMore,
  onBackToConfig
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);

  // Calculate selected ideas for progress modal
  const selectedIdeas = useMemo(() => 
    ideas.filter(idea => selectedIdeaIds.includes(idea.id)),
    [ideas, selectedIdeaIds]
  );

  const handleEditClick = (ideaId) => {
    setEditingIdeaId(ideaId);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (editedIdea) => {
    onSaveIdea(editedIdea);
    setEditModalOpen(false);
    setEditingIdeaId(null);
  };

  const editingIdea = ideas.find(i => i.id === editingIdeaId);

  return (
    <div className="relative min-h-[80vh] animate-in fade-in duration-700">
      <AuroraBackground />

      {/* Header Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200/50 mb-4">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">AI Generated Concepts</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {ideas.length} Concepts for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{topicDomain || 'Your Project'}</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Select multiple concepts to save, remove ones you don't like, or generate more ideas.
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onBackToConfig}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          {ideas.length > 0 && (
            <button
              onClick={selectedIdeaIds.length === ideas.length ? onDeselectAll : onSelectAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              {selectedIdeaIds.length === ideas.length ? (
                <>
                  <Square size={16} />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare size={16} />
                  Select All ({ideas.length})
                </>
              )}
            </button>
          )}
          
          <button
            onClick={onGenerateMore}
            disabled={isGeneratingMore}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all shadow-sm disabled:opacity-50"
          >
            {isGeneratingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Generate More
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      {ideas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto px-4">
          <AnimatePresence mode="popLayout">
            {ideas.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                isSelected={selectedIdeaIds.includes(idea.id)}
                teamSize={teamSize}
                complexity={complexity}
                onToggleSelect={onToggleSelectIdea}
                onEdit={handleEditClick}
                onDelete={onDeleteIdea}
                isCreating={isCreatingProjects}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState onGenerateMore={onGenerateMore} />
      )}

      {/* Floating Bottom Bar - Selection Summary */}
      <AnimatePresence>
        {selectedIdeaIds.length > 0 && !isCreatingProjects && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-4 px-6 py-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedIdeaIds.length} project{selectedIdeaIds.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-slate-500">
                    Ready to create
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onDeselectAll}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={onCreateSelectedProjects}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all"
                >
                  <Save size={16} />
                  Create {selectedIdeaIds.length > 1 ? 'Projects' : 'Project'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && editingIdea && (
          <EditIdeaModal
            idea={editingIdea}
            onSave={handleSaveEdit}
            onClose={() => {
              setEditModalOpen(false);
              setEditingIdeaId(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Creating Progress Modal */}
      <AnimatePresence>
        {isCreatingProjects && (
          <CreatingProgressModal
            selectedIdeas={selectedIdeas}
            creatingIndex={creatingIndex}
            completedIds={completedProjectIds}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaSelectionScreen;
