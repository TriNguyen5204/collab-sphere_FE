import React, { useEffect, useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";

const PAGE_SIZE = 4;
const SCROLL_COOLDOWN = 500; // ms to wait between page turns

const TeamProjectsCarousel = ({ projects = [], onCardClick }) => {
  const [page, setPage] = useState(0);
  
  // 1. REF FOR TIMING: Tracks the last time a scroll happened
  const lastScrollTime = useRef(0);

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [projects.length]);

  const visibleProjects = useMemo(() => {
    const start = page * PAGE_SIZE;
    return projects.slice(start, start + PAGE_SIZE);
  }, [projects, page]);

  // 2. SCROLL HANDLER: Handles the wheel event
  const handleWheel = (e) => {
    const now = Date.now();
    
    // Check Cooldown: If less than 500ms since last turn, ignore this event
    if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;

    // Check Threshold: Ignore tiny accidental scrolls (trackpad jitters)
    if (Math.abs(e.deltaY) < 20 && Math.abs(e.deltaX) < 20) return;

    // Determine Direction
    // deltaY > 0 means scrolling DOWN (Next Page)
    // deltaY < 0 means scrolling UP (Prev Page)
    if ((e.deltaY > 0 || e.deltaX > 0) && page < totalPages - 1) {
      setPage((p) => p + 1);
      lastScrollTime.current = now; // Reset timer
    } else if ((e.deltaY < 0 || e.deltaX < 0) && page > 0) {
      setPage((p) => p - 1);
      lastScrollTime.current = now; // Reset timer
    }
  };

  return (
    <div className="w-full mx-auto px-10">
      <div 
        onWheel={handleWheel}
        className="flex flex-col"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {visibleProjects.map((project) => (
            <div key={project.teamId || project.projectId} className="w-full flex justify-center">
              <ProjectCard
                project={project}
                onClick={() => onCardClick?.(project)}
              />
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No teams available.
          </div>
        )}

        {/* Pagination Controls */}
        {projects.length > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    page === idx ? "w-8 bg-orangeFpt-500" : "w-2 bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProjectsCarousel;