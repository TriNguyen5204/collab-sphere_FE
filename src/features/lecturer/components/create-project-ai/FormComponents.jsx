import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Plus, Minus, X, Link, Globe } from 'lucide-react';
import { COMPLEXITY_OPTIONS, SUGGESTED_TECH } from './constants';

/**
 * Info Tooltip Component for field explanations
 */
export const InfoTooltip = ({ text, example }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="ml-1.5 text-slate-400 hover:text-[#e75710] transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl"
          >
            <p className="leading-relaxed">{text}</p>
            {example && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <span className="text-slate-400">Example: </span>
                <span className="text-[#fb8239] font-medium">{example}</span>
              </div>
            )}
            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-slate-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Complexity Slider Component (1-5 scale)
 */
export const ComplexitySlider = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {COMPLEXITY_OPTIONS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              value >= level.value ? level.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-500">
          {COMPLEXITY_OPTIONS.find(l => l.value === value)?.label}
        </span>
        <span className="text-[10px] text-slate-400">
          {COMPLEXITY_OPTIONS.find(l => l.value === value)?.description}
        </span>
      </div>
    </div>
  );
};

/**
 * Team Size Segmented Control
 */
export const TeamSizeSelector = ({ value, onChange }) => {
  const sizes = [3, 4, 5, 6];

  return (
    <div className="flex gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            value === size
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
              : 'bg-slate-50 text-slate-500 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] hover:bg-slate-100'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

/**
 * Duration Weeks Selector with +/- buttons
 */
export const DurationSelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.03)]">
      <button
        onClick={() => onChange(Math.max(4, value - 1))}
        className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(4, Math.min(52, parseInt(e.target.value) || 10)))}
        className="flex-1 bg-transparent text-center text-lg font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={4}
        max={52}
      />
      <button
        onClick={() => onChange(Math.min(52, value + 1))}
        className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

/**
 * Tech Stack Selector (multiple choice with chips)
 */
export const TechStackSelector = ({ selected, onChange }) => {
  const [input, setInput] = useState('');
  const [showAll, setShowAll] = useState(false);

  const toggleTech = (tech) => {
    if (selected.includes(tech)) {
      onChange(selected.filter(t => t !== tech));
    } else {
      onChange([...selected, tech]);
    }
  };

  const addCustomTech = () => {
    if (input.trim() && !selected.includes(input.trim())) {
      onChange([...selected, input.trim()]);
      setInput('');
    }
  };

  const filteredSuggestions = SUGGESTED_TECH.filter(
    t => t.toLowerCase().includes(input.toLowerCase())
  );

  const displayedTech = showAll ? filteredSuggestions : filteredSuggestions.slice(0, 12);

  return (
    <div className="space-y-3">
      {/* Custom Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTech())}
          placeholder="Search or add custom tech..."
          className="flex-1 bg-slate-50 border-none shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#fcd8b6] focus:bg-white transition-all"
        />
        {input && !SUGGESTED_TECH.some(t => t.toLowerCase() === input.toLowerCase()) && (
          <button
            onClick={addCustomTech}
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Tech Chips - Multiple Choice */}
      <div className="flex flex-wrap gap-1.5">
        {displayedTech.map((tech) => {
          const isSelected = selected.includes(tech);
          return (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-[#fcd8b6]/50'
              }`}
            >
              {isSelected && <span className="mr-1">✓</span>}
              {tech}
            </button>
          );
        })}
      </div>

      {/* Show More/Less */}
      {filteredSuggestions.length > 12 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-[#e75710] font-medium hover:text-[#a51200] transition-colors"
        >
          {showAll ? '← Show Less' : `Show All (${filteredSuggestions.length - 12} more)`}
        </button>
      )}

      {/* Selected Count */}
      {selected.length > 0 && (
        <div className="text-xs text-slate-500">
          {selected.length} selected
          {selected.some(t => !SUGGESTED_TECH.includes(t)) && (
            <span className="ml-2 text-[#e75710]">
              (includes custom: {selected.filter(t => !SUGGESTED_TECH.includes(t)).join(', ')})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Reference URLs Input Component
 */
export const ReferenceUrlsInput = ({ urls, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="space-y-2">
      {urls.map((url, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="url"
              value={url}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder="https://example.com/reference..."
              className="w-full bg-slate-50 border-none shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-[#fcd8b6] focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => onRemove(index)}
            className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {urls.length < 5 && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-xs font-medium text-[#e75710] hover:text-[#a51200] transition-colors"
        >
          <Plus size={14} />
          Add another URL
        </button>
      )}
    </div>
  );
};

/**
 * Priority Selector Dropdown
 */
export const PrioritySelector = ({ priority, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'High', label: 'High Priority', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    { value: 'Medium', label: 'Medium Priority', color: 'bg-orangeFpt-50 text-orangeFpt-700 border-orangeFpt-200', dot: 'bg-orangeFpt-500' },
    { value: 'Low', label: 'Low Priority', color: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500' }
  ];

  const currentOption = options.find(o => o.value === priority) || options[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all border ${currentOption.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentOption.dot}`} />
        {currentOption.label}
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20"
          >
            <div className="p-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-all
                    ${priority === opt.value ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default {
  InfoTooltip,
  ComplexitySlider,
  TeamSizeSelector,
  DurationSelector,
  TechStackSelector,
  ReferenceUrlsInput,
  PrioritySelector,
};
