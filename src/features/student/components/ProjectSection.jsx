import React, { useCallback, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';

const ProjectSection = ({ 
  title, 
  icon: Icon, 
  projects = [], 
  onCardClick,
  emptyMessage,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  resetSignal,
  filtersContent,
}) => {
  // Generate a stable unique key for each project card
  const getProjectKey = (p, index) => {
    // Prefer lowercase API fields; fall back to possible PascalCase variants
    const projectId = p?.projectId ?? p?.ProjectId;
    const teamId = p?.teamId ?? p?.TeamId;
    const classId = p?.classId ?? p?.ClassId;

    const composed = [classId, teamId, projectId].filter(Boolean).join("-");
    if (composed) return composed;

    // As a last resort, build a key from names plus index to avoid collisions
    const nameKey = [p?.className, p?.teamName, p?.projectName]
      .filter(Boolean)
      .join("|");
    return nameKey ? `${nameKey}:${index}` : `idx-${index}`;
  };

  const scrollRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !onLoadMore || !hasMore || isLoadingMore) return;
    const node = scrollRef.current;
    const threshold = 120;
    if (node.scrollTop + node.clientHeight >= node.scrollHeight - threshold) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const listener = () => handleScroll();
    node.addEventListener('scroll', listener);
    return () => node.removeEventListener('scroll', listener);
  }, [handleScroll, projects.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0 });
    }
  }, [resetSignal]);

  return (
    <div className="relative rounded-3xl border border-orangeFpt-100 bg-white/95 p-6 shadow-xl shadow-orangeFpt-100/60 backdrop-blur">
      <div className="flex flex-col gap-5 border-b border-orangeFpt-50 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-slate-900">
          {Icon ? <Icon className="h-7 w-7 text-orangeFpt-500" /> : null}
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            {projects.length > 0 && (
              <p className="text-sm text-slate-500">{projects.length} project{projects.length === 1 ? '' : 's'} available</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          {filtersContent ? (
            <div className="w-full lg:min-w-[360px]">
              {filtersContent}
            </div>
          ) : null}
          {onLoadMore && hasMore && (
            <span className="text-xs font-semibold uppercase tracking-wide text-orangeFpt-500 text-center lg:text-right">
              Scroll to explore
            </span>
          )}
        </div>
      </div>

      {projects.length > 0 ? (
        <div
          ref={scrollRef}
          className="mt-6 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, idx) => (
              <ProjectCard
                key={getProjectKey(project, idx)}
                project={project}
                onClick={() => onCardClick(project)}
              />
            ))}
          </div>
          <div className="py-6 text-center text-sm text-slate-500">
            {isLoadingMore && <div className="animate-pulse text-orangeFpt-500">Loading more projects...</div>}
            {!isLoadingMore && hasMore && onLoadMore && (
              <div className="text-xs uppercase tracking-wide text-orangeFpt-400">Keep scrolling to load more</div>
            )}
            {!hasMore && !isLoadingMore && (
              <div className="text-xs text-slate-400">You have reached the end of the list</div>
            )}
          </div>
        </div>
      ) : (
        emptyMessage && (
          <div className="mt-8 rounded-2xl border border-dashed border-orangeFpt-200 bg-orangeFpt-50/60 p-12 text-center">
            {Icon ? <Icon className="mx-auto mb-6 h-12 w-12 text-orangeFpt-300" /> : null}
            <h3 className="text-xl font-medium text-slate-900 mb-2">{emptyMessage.title}</h3>
            <p className="text-slate-500">{emptyMessage.description}</p>
          </div>
        )
      )}
    </div>
  );
};

export default ProjectSection;
