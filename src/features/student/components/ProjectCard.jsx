import React from 'react';
import { Users, User } from 'lucide-react';
import { useAvatar } from '../../../hooks/useAvatar';

const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const ProjectCardGradient = ({ project, onClick }) => {
  const name = project?.projectName || project?.teamName || "Unnamed Project";
  const className = project?.className || "Unknown Class";
  const teamName = project?.teamName || "Unknown Team";
  const lecturerName = project?.lecturerName || "Unknown Lecturer";
  const teamImage = project?.teamImage;
  const progress = clamp(project?.progress);
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(teamName, teamImage);
  const showImage = !!shouldShowImage;

  return (
    <button
      onClick={onClick}
      // ADDED: h-[26rem] to force a fixed height for all cards
      className="group relative flex h-[20rem] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      {/* 1. Background Image Layer */}
      {/* Because the parent has h-[26rem], this absolute layer will fill it exactly */}
      <div className="absolute inset-0 z-0 h-full w-full">
        {showImage ? (
          <img
            src={teamImage}
            alt={teamName}
            onError={() => setImageError(true)}
            // object-cover ensures the image fills the 26rem height without distortion
            className="h-full w-full object-cover transition duration-700 ease-in-out"
          />
        ) : (
          <div className={`h-full w-full ${colorClass}`} />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-white/60 to-white/95" />
      </div>

      {/* 2. Content Layer */}
      {/* justify-between pushes the semester to top and text to bottom */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-5">
        
        {/* --- TOP SECTION --- */}
        <div className="flex justify-between items-start">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md">
                {project?.semesterName}
            </span>
            {!showImage && <span className="text-4xl font-bold text-white/30 select-none">{initials}</span>}
        </div>

        {/* --- BOTTOM SECTION --- */}
        {/* We remove the fixed mt-20 spacer and just let justify-between handle the spacing */}
        <div className="w-full"> 
            
            {/* Class Name */}
            <p className="text-xs font-bold uppercase tracking-wider text-orangeFpt-600 mb-1">
                {className}
            </p>

            {/* Project Name (Fixed Height Wrapper) */}
            <div className="h-[3.5rem] w-full flex items-center"> 
                <h2 
                    title={name}
                    className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 text-left"
                >
                    {name}
                </h2>
            </div>

            {/* Details */}
            <div className="mt-3 mb-4 space-y-1 border-l-2 border-orangeFpt-200 pl-3">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium" title={`Lecturer: ${lecturerName}`}>
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" /> 
                    <span className="truncate">{lecturerName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500" title={`Team: ${teamName}`}>
                    <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" /> 
                    <span className="truncate">{teamName}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-auto">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                    <div 
                        className="h-full bg-gradient-to-r from-orangeFpt-400 to-orangeFpt-600 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            </div>
        </div>
      </div>
    </button>
  );
};

export default ProjectCardGradient;