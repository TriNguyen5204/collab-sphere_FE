import React from 'react';
import TrelloBoard from '../components/student/board/TrelloBoard';

const TestKanbanBoard = () => {
  return (
    <div className="min-h-screen bg-slate-100 py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <header className="mb-10 space-y-3 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Feature Lab · Student workspace preview
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold md:text-4xl">Project Board</h1>
              <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                Organize student tasks, drag cards between lists, and preview the drag-and-drop experience used across the
                CollabSphere workspace.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600"
            >
              All roles
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-900/[0.04] backdrop-blur">
          <div className="overflow-x-auto">
            <TrelloBoard />
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestKanbanBoard;
