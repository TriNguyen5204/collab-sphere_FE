import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Layers,
  BookOpen,
  FileText,
  List,
  MessageSquare,
  Send
} from 'lucide-react';
import { COMPLEXITY_OPTIONS } from './constants';

/**
 * Refinement Modal - Allows user to provide feedback for generating more ideas
 */
const RefinementModal = ({ isOpen, onClose, onGenerate }) => {
  const [refinementText, setRefinementText] = useState('');

  const handleSubmit = () => {
    onGenerate(refinementText);
    setRefinementText('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e75710] to-[#fb8239]" />
          <div className="relative px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Refine Generation</h2>
              <p className="text-white/80 text-sm">Guide the AI to generate better ideas</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Not satisfied with the current ideas? Provide specific instructions to help the AI understand what you're looking for.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Instructions (Optional)
            </label>
            <textarea
              value={refinementText}
              onChange={(e) => setRefinementText(e.target.value)}
              placeholder="e.g., Focus more on manufacturing processes instead of sales. I want students to learn about supply chain management."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-4 focus:ring-[#fcd8b6] focus:border-[#fb8239] focus:bg-white transition-all outline-none resize-none"
            />
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
            <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              The AI will prioritize your instructions over the initial configuration for the next batch of ideas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#e75710] to-[#fb8239] hover:from-[#d64d0e] hover:to-[#e75710] rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw size={16} />
            Generate With Refinement
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

/**
 * Confirmation Modal for Back to Config - Elegant Soft Design
 */
const ConfirmBackModal = ({ onConfirm, onCancel, ideasCount }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header - Softer gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-400" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
          <div className="relative px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Discard Generated Concepts?</h2>
              <p className="text-white/80 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200/60 rounded-xl mb-4">
            <AlertCircle size={20} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-700">
                You have {ideasCount} AI-generated concept{ideasCount > 1 ? 's' : ''} that will be lost.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to go back? You'll need to regenerate concepts if you return.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <Trash2 size={16} />
            Discard & Go Back
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

/**
 * Enhanced Idea Card - Elegant Soft Design with Business Rules Preview
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
  const complexityOption = COMPLEXITY_OPTIONS.find(c => c.value === complexity);
  
  // Parse business rules for preview (show first 2-3)
  const businessRulesPreview = useMemo(() => {
    if (!idea.businessRules) return [];
    const rules = idea.businessRules
      .split('\n')
      .filter(r => r.trim().startsWith('-') || r.trim().startsWith('•'))
      .map(r => r.replace(/^[-•]\s*/, '').trim())
      .filter(r => r.length > 0)
      .slice(0, 3);
    return rules;
  }, [idea.businessRules]);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group relative ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Main Card Container - Elegant soft design */}
      <div 
        onClick={() => onToggleSelect(idea.id)}
        className={`relative h-full rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
          isSelected
            ? 'bg-white border-orange-300 shadow-lg shadow-orange-100/50 ring-1 ring-orange-200'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100/50'
        }`}
      >
        {/* Top Gradient Bar - Subtle */}
        <div className={`h-1 w-full ${
          isSelected 
            ? 'bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300' 
            : 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 group-hover:from-orange-100 group-hover:via-orange-50 group-hover:to-amber-100'
        } transition-all duration-300`} />
        
        <div className="p-5">
          {/* Card Header */}
          <div className="flex items-start justify-between mb-4">
            {/* Number Badge - Softer */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
              isSelected
                ? 'bg-orange-100 text-orange-600 border border-orange-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:border-orange-200'
            }`}>
              {index + 1}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(idea.id);
                  }}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all"
                  title="Remove concept"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              
              {/* Selection Indicator - Softer */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                isSelected
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-slate-200 text-slate-300 group-hover:border-orange-200 group-hover:text-orange-400'
              }`}>
                {isSelected ? <Check size={14} strokeWidth={3} /> : <Square size={12} />}
              </div>
            </div>
          </div>

          {/* Project Name - Softer */}
          <h3 className={`text-lg font-semibold leading-snug mb-3 transition-colors ${
            isSelected ? 'text-slate-800' : 'text-slate-700 group-hover:text-slate-800'
          }`}>
            {idea.projectName || 'Untitled Project'}
          </h3>

          {/* Meta Tags - Softer */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              isSelected ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}>
              <Users size={11} />
              {teamSize} members
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
              complexity <= 2 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
              complexity <= 3 ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              <Zap size={11} />
              {complexityOption?.label || 'Intermediate'}
            </span>
          </div>

          {/* Description */}
          <p className={`text-sm leading-relaxed mb-4 ${
            isSelected ? 'text-slate-600' : 'text-slate-500'
          }`}>
            {idea.description?.length > 150 
              ? `${idea.description.substring(0, 150)}...` 
              : idea.description || 'No description provided.'}
          </p>

          {/* Business Rules Preview - Softer */}
          {businessRulesPreview.length > 0 && (
            <div className={`mb-4 p-3 rounded-lg border transition-all ${
              isSelected ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/80 border-slate-100 group-hover:bg-orange-50/30 group-hover:border-orange-100/50'
            }`}>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isSelected ? 'text-orange-600' : 'text-slate-400'
              }`}>
                <BookOpen size={10} />
                Business Rules
              </p>
              <ul className="space-y-1">
                {businessRulesPreview.map((rule, idx) => (
                  <li key={idx} className={`text-xs flex items-start gap-2 ${
                    isSelected ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${
                      isSelected ? 'bg-orange-400' : 'bg-slate-300'
                    }`} />
                    <span className="line-clamp-1">{rule}</span>
                  </li>
                ))}
              </ul>
              {idea.businessRules?.split('\n').filter(r => r.trim()).length > 3 && (
                <p className={`text-[10px] mt-2 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`}>
                  +{idea.businessRules.split('\n').filter(r => r.trim()).length - 3} more rules
                </p>
              )}
            </div>
          )}

          {/* Actors Preview - Softer */}
          {idea.actors && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {idea.actors.split(',').slice(0, 3).map((actor, idx) => (
                <span 
                  key={idx} 
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                    isSelected 
                      ? 'bg-orange-50 text-orange-600 border-orange-200' 
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <UserCircle size={10} />
                  {actor.trim()}
                </span>
              ))}
              {idea.actors.split(',').length > 3 && (
                <span className={`text-[11px] font-medium px-2 py-0.5 ${
                  isSelected ? 'text-orange-500' : 'text-slate-400'
                }`}>
                  +{idea.actors.split(',').length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer - Softer */}
          <div className={`pt-3 border-t flex items-center justify-between ${
            isSelected ? 'border-orange-100' : 'border-slate-100'
          }`}>
            {isSelected ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 text-orange-500"
              >
                <CheckCircle size={14} />
                <span className="text-xs font-medium">Selected</span>
              </motion.div>
            ) : (
              <span className="text-xs text-slate-400">Click to select</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(idea.id);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Eye size={12} />
              Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}/**
 * Elegant Edit Idea Modal - Balanced Color Palette with Tabs
 * Uses createPortal to render at document.body level for proper centering
 */
const EditIdeaModal = ({ idea, onSave, onClose }) => {
  const [editedIdea, setEditedIdea] = useState({ ...idea });
  const [activeTab, setActiveTab] = useState('basic');
  
  // Array-based state for business rules - handle multiple formats (-, •, or no prefix)
  const [businessRulesArray, setBusinessRulesArray] = useState(() => {
    if (!idea.businessRules) return [];
    // Split by newline, filter empty, and clean up prefixes
    const rules = idea.businessRules
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean)
      .map(r => r.replace(/^[-•*]\s*/, '').trim()); // Remove -, •, * prefixes
      
    console.log('Parsed business rules from:', idea.businessRules, 'to:', rules);
    return rules;
  });
  const [newRuleInput, setNewRuleInput] = useState('');
  
  // Array-based state for actors
  const [actorsArray, setActorsArray] = useState(() => {
    if (!idea.actors) return [];
    const actors = idea.actors.split(',').map(a => a.trim()).filter(Boolean);
    console.log('Parsed actors from:', idea.actors, 'to:', actors);
    return actors;
  });
  const [newActorInput, setNewActorInput] = useState('');
  
  // State for inline editing
  const [editingRuleIndex, setEditingRuleIndex] = useState(null);
  const [editingActorIndex, setEditingActorIndex] = useState(null);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'rules', label: 'Business Rules', icon: BookOpen },
    { id: 'actors', label: 'Actors & Roles', icon: Users },
  ];

  // Business Rules Handlers
  const handleAddRule = (rule) => {
    const trimmedRule = rule.trim();
    if (trimmedRule && !businessRulesArray.includes(trimmedRule)) {
      setBusinessRulesArray(prev => [...prev, trimmedRule]);
      setNewRuleInput('');
    }
  };

  const handleRemoveRule = (ruleToRemove) => {
    setBusinessRulesArray(prev => prev.filter(rule => rule !== ruleToRemove));
  };
  
  const handleUpdateRule = (index, newValue) => {
    const trimmedValue = newValue.trim();
    if (trimmedValue) {
      setBusinessRulesArray(prev => {
        const newArray = [...prev];
        newArray[index] = trimmedValue;
        return newArray;
      });
    }
    setEditingRuleIndex(null);
  };

  // Actors Handlers
  const handleAddActor = (actor) => {
    const trimmedActor = actor.trim();
    if (trimmedActor && !actorsArray.includes(trimmedActor)) {
      setActorsArray(prev => [...prev, trimmedActor]);
      setNewActorInput('');
    }
  };

  const handleRemoveActor = (actorToRemove) => {
    setActorsArray(prev => prev.filter(actor => actor !== actorToRemove));
  };
  
  const handleUpdateActor = (index, newValue) => {
    const trimmedValue = newValue.trim();
    if (trimmedValue) {
      setActorsArray(prev => {
        const newArray = [...prev];
        newArray[index] = trimmedValue;
        return newArray;
      });
    }
    setEditingActorIndex(null);
  };

  // Save handler - format arrays back to strings
  const handleSave = () => {
    // Format business rules: ensure each rule starts with "- " if not already
    const formattedBusinessRules = businessRulesArray
      .map(rule => rule.trim().startsWith('-') ? rule : `- ${rule}`)
      .join('\n');
      
    const formattedActors = actorsArray.join(', ');
    
    const savedIdea = {
      ...editedIdea,
      businessRules: formattedBusinessRules,
      actors: formattedActors,
    };
    
    console.log('Saving idea with:', {
      businessRulesArray,
      actorsArray,
      formattedBusinessRules,
      formattedActors,
      savedIdea
    });
    
    onSave(savedIdea);
  };

  const rulesCount = businessRulesArray.length;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header - Balanced Gradient */}
        <div className="relative overflow-hidden">
          {/* Balanced Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#a51200] via-[#e75710] to-[#fb8239]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
          
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Edit3 size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Project Concept</h2>
                <p className="text-[#fcd8b6] text-sm">Customize AI-generated details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 pt-4 border-b border-slate-100">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-all ${
                    isActive
                      ? 'bg-[#fcd8b6]/30 text-[#a51200] border-b-2 border-[#e75710]'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === 'rules' && rulesCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-[#e75710] text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {rulesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Project Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    <Target size={12} />
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editedIdea.projectName || ''}
                    onChange={(e) => setEditedIdea({ ...editedIdea, projectName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 focus:ring-4 focus:ring-[#fcd8b6] focus:border-[#fb8239] focus:bg-white transition-all outline-none"
                    placeholder="Enter project name..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    <FileText size={12} />
                    Description
                  </label>
                  <textarea
                    value={editedIdea.description || ''}
                    onChange={(e) => setEditedIdea({ ...editedIdea, description: e.target.value })}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed focus:ring-4 focus:ring-[#fcd8b6] focus:border-[#fb8239] focus:bg-white transition-all resize-none outline-none"
                    placeholder="Describe the project concept in detail..."
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    {(editedIdea.description || '').length} characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Business Rules Tab - Array Based Input */}
            {activeTab === 'rules' && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Add Rule Input */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <BookOpen size={12} />
                      Add Business Rule
                    </span>
                    <span className="text-xs text-slate-400">{rulesCount} rules defined</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e75710] font-medium">-</span>
                      <input
                        type="text"
                        value={newRuleInput}
                        onChange={(e) => setNewRuleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRule(newRuleInput);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-700 focus:ring-4 focus:ring-[#fcd8b6] focus:border-[#fb8239] focus:bg-white transition-all outline-none"
                        placeholder="Enter a business rule..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddRule(newRuleInput)}
                      disabled={!newRuleInput.trim()}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Rules List */}
                {businessRulesArray.length > 0 ? (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto p-3 rounded-xl bg-[#fcd8b6]/20 border border-[#e75710]/20">
                    {businessRulesArray.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fcd8b6] text-[#e75710] text-xs font-bold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        
                        {editingRuleIndex === index ? (
                          <input
                            type="text"
                            defaultValue={rule}
                            autoFocus
                            onBlur={(e) => handleUpdateRule(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateRule(index, e.target.value);
                              }
                            }}
                            className="flex-1 text-sm text-slate-700 leading-relaxed bg-slate-50 border border-orange-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-orange-200"
                          />
                        ) : (
                          <p 
                            className="flex-1 text-sm text-slate-700 leading-relaxed cursor-pointer hover:text-orange-800"
                            onClick={() => setEditingRuleIndex(index)}
                            title="Click to edit"
                          >
                            {rule}
                          </p>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(rule)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-400">
                    No rules added yet. Enter a rule above and press Enter or click Add.
                  </div>
                )}
                
              </motion.div>
            )}

            {/* Actors Tab - Array Based Input */}
            {activeTab === 'actors' && (
              <motion.div
                key="actors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Add Actor Input */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <Users size={12} />
                      Add System Actor
                    </span>
                    <span className="text-xs text-slate-400">{actorsArray.length} actors defined</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newActorInput}
                      onChange={(e) => setNewActorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddActor(newActorInput);
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-4 focus:ring-[#fcd8b6] focus:border-[#fb8239] focus:bg-white transition-all outline-none"
                      placeholder="Enter actor name (e.g., Admin, User, System)..."
                    />
                    <button
                      type="button"
                      onClick={() => handleAddActor(newActorInput)}
                      disabled={!newActorInput.trim()}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Actors List */}
                {actorsArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[60px]">
                    {actorsArray.map((actor, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm group hover:border-orange-200 transition-colors"
                      >
                        <UserCircle size={14} className="text-[#e75710]" />
                        
                        {editingActorIndex === idx ? (
                          <input
                            type="text"
                            defaultValue={actor}
                            autoFocus
                            onBlur={(e) => handleUpdateActor(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateActor(idx, e.target.value);
                              }
                            }}
                            style={{ width: `${Math.max(actor.length, 10) + 2}ch` }}
                            className="min-w-[80px] max-w-[200px] text-sm text-slate-700 bg-transparent border-b border-orange-300 px-0 py-0 outline-none focus:border-orange-500 p-0 m-0 h-5"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:text-orange-800"
                            onClick={() => setEditingActorIndex(idx)}
                            title="Click to edit"
                          >
                            {actor}
                          </span>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveActor(actor)}
                          className="hover:text-red-500 transition-colors ml-1"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-400">
                    No actors added. Enter an actor name above or select from suggestions below.
                  </div>
                )}
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={12} />
            AI-generated content can be customized
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={businessRulesArray.length === 0 || actorsArray.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#a51200] to-[#e75710] hover:from-[#450b00] hover:to-[#a51200] rounded-xl transition-all shadow-lg shadow-[#fcd8b6] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

/**
 * Creating Projects Progress Modal - Uses createPortal for full screen
 */
const CreatingProgressModal = ({ 
  selectedIdeas, 
  creatingIndex, 
  completedIds,
  onClose 
}) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with gradient - using balanced palette */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#a51200] via-[#e75710] to-[#fb8239]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
          <div className="relative px-6 py-5 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Package size={26} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Creating Projects</h2>
            <p className="text-[#fcd8b6] text-sm mt-1">
              {completedIds.length} of {selectedIdeas.length} completed
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Bar - using balanced gradient */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-[#a51200] via-[#e75710] to-[#fb8239]"
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
                      ? 'bg-[#fcd8b6]/30 border border-[#fb8239]/40' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                      ? 'bg-gradient-to-br from-[#a51200] to-[#e75710] text-white' 
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
                      isCompleted ? 'text-emerald-700' : isCurrent ? 'text-[#a51200]' : 'text-slate-600'
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
    </motion.div>,
    document.body
  );
};

/**
 * Empty State Component - Balanced Color Palette
 */
const EmptyState = ({ onGenerateMore }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#fcd8b6] to-[#fb8239]/30 flex items-center justify-center shadow-lg shadow-[#fcd8b6]/50">
      <Layers size={32} className="text-[#a51200]" />
    </div>
    <h3 className="text-lg font-bold text-[#450b00] mb-2">No concepts remaining</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
      You've reviewed all the AI-generated concepts. Generate more to continue exploring ideas.
    </p>
    <button
      onClick={onGenerateMore}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-[#fcd8b6] hover:from-[#a51200] hover:to-[#e75710] transition-all"
    >
      <Plus size={18} />
      Generate More Concepts
    </button>
  </motion.div>
);

/**
 * Main Idea Selection Screen Component - Multi-select with delete and generate more
 * Color Palette: #450b00, #a51200, #e75710, #fb8239, #fcd8b6
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
  const [confirmBackModalOpen, setConfirmBackModalOpen] = useState(false);
  const [refinementModalOpen, setRefinementModalOpen] = useState(false);

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
    console.log('handleSaveEdit called with:', editedIdea);
    onSaveIdea(editedIdea);
    setEditModalOpen(false);
    setEditingIdeaId(null);
  };

  // Handle back to config with confirmation
  const handleBackToConfigClick = () => {
    if (ideas.length > 0) {
      setConfirmBackModalOpen(true);
    } else {
      onBackToConfig();
    }
  };

  const handleConfirmBack = () => {
    setConfirmBackModalOpen(false);
    onBackToConfig();
  };

  const handleGenerateMoreClick = () => {
    setRefinementModalOpen(true);
  };

  const handleRefinementSubmit = (refinementText) => {
    onGenerateMore(refinementText);
  };

  const editingIdea = ideas.find(i => i.id === editingIdeaId);

  return (
    <div className="relative min-h-[80vh] animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fcd8b6]/40 to-[#fb8239]/10 rounded-full border border-[#fb8239]/30 mb-4">
            <Sparkles size={16} className="text-[#e75710]" />
            <span className="text-sm font-semibold text-[#a51200]">AI Generated Concepts</span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-[#a51200] to-[#e75710] text-white text-xs font-bold rounded-full">{ideas.length}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Choose Your Project Concepts
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto mb-2">
            <span className="font-semibold text-[#e75710]">{topicDomain || 'Your Project'}</span>
          </p>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Select multiple concepts to save, remove ones you don't like, or generate more ideas.
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={handleBackToConfigClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white backdrop-blur border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Config
          </button>
          
          {ideas.length > 0 && (
            <>
              {/* Selection Info */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#fcd8b6]/30 border border-[#fb8239]/20 rounded-xl">
                <span className="text-sm text-slate-600">
                  <span className="font-bold text-[#e75710]">{selectedIdeaIds.length}</span> of {ideas.length} selected
                </span>
              </div>
              
              <button
                onClick={selectedIdeaIds.length === ideas.length ? onDeselectAll : onSelectAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white backdrop-blur border border-slate-200 rounded-xl hover:bg-[#fcd8b6]/30 hover:border-[#fb8239]/30 hover:text-[#a51200] transition-all shadow-sm"
              >
                {selectedIdeaIds.length === ideas.length ? (
                  <>
                    <Square size={16} />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare size={16} />
                    Select All
                  </>
                )}
              </button>
            </>
          )}
          
          <button
            onClick={handleGenerateMoreClick}
            disabled={isGeneratingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#e75710] to-[#fb8239] rounded-xl hover:from-[#a51200] hover:to-[#e75710] hover:shadow-lg hover:shadow-[#fcd8b6] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100"
          >
            {isGeneratingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating more...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Generate More
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ideas Grid - 2 columns for better readability */}
      {ideas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
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
        <EmptyState onGenerateMore={handleGenerateMoreClick} />
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
            <div className="flex items-center gap-4 px-6 py-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(165,18,0,0.2)] border border-[#fb8239]/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a51200] to-[#e75710] flex items-center justify-center shadow-lg shadow-[#fcd8b6]">
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a51200] to-[#e75710] text-white rounded-xl text-sm font-bold hover:from-[#450b00] hover:to-[#a51200] hover:shadow-lg hover:shadow-[#fcd8b6] transition-all"
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

      {/* Refinement Modal */}
      <AnimatePresence>
        {refinementModalOpen && (
          <RefinementModal
            isOpen={refinementModalOpen}
            onClose={() => setRefinementModalOpen(false)}
            onGenerate={handleRefinementSubmit}
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

      {/* Confirm Back to Config Modal */}
      <AnimatePresence>
        {confirmBackModalOpen && (
          <ConfirmBackModal
            ideasCount={ideas.length}
            onConfirm={handleConfirmBack}
            onCancel={() => setConfirmBackModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaSelectionScreen;
