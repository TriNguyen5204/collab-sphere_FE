import React from 'react';
import { Users, User, School, TrendingUp } from 'lucide-react';
import { useAvatar } from '../../../hooks/useAvatar';

const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const ProjectCard = ({ project, onClick }) => {
  const name = project?.projectName || project?.teamName || "Unnamed Project";
  const className = project?.className || "Unknown Class";
  const teamName = project?.teamName || "Unknown Team";
  const lecturerName = project?.lecturerName || "Unknown Lecturer";
  const teamImage = project?.teamImage;
  const progress = clamp(project?.progress);
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(teamName, teamImage);
  const showImage = !!shouldShowImage;
  const phase = project?.status || (progress >= 100 ? 'Completed' : 'In progress');

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-orangeFpt-50 bg-white/95 text-left shadow-md backdrop-blur transition hover:-translate-y-1.5 hover:border-orangeFpt-200 hover:shadow-2xl hover:shadow-orangeFpt-200/40"
    >
      <div className="relative h-36 overflow-hidden">
        {showImage ? (
          <img
            src={teamImage}
            alt={`${teamName} banner`}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-4xl font-bold text-white ${colorClass}`}>
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-orangeFpt-600">
          {project?.semesterName || 'Semester'}
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-orangeFpt-500/90 px-3 py-1 text-xs font-semibold text-white">
          {phase}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {className}
          </p>
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900">{name}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-slate-400" />
            <span>{project?.subjectName || "Academic Project"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span>{lecturerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{teamName}</span>
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-orangeFpt-100 bg-orangeFpt-50/60 p-3">
          <div className="flex items-center justify-between text-xs text-orangeFpt-700">
            <div className="inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-orangeFpt-500" />
              <span>Progress</span>
            </div>
            <span className="font-semibold text-orangeFpt-700">{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orangeFpt-300 via-orangeFpt-500 to-amber-300 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProjectCard;
