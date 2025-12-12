import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

/**
 * Analyzing Screen Component - Shows AI processing animation
 */
const AnalyzingScreen = ({ progressLogs }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto">
      <div className="relative mb-10">
        {/* Outer pulsing rings */}
        <div className="absolute inset-0 rounded-full border-4 border-orangeFpt-100 animate-[ping_3s_linear_infinite]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-orangeFpt-200 animate-[ping_3s_linear_infinite_0.5s]"></div>

        {/* Central Spinner */}
        <div className="relative w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
          <Loader2 size={40} className="text-orangeFpt-500 animate-spin" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Architect is Working</h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        Analyzing your configuration to generate optimal project concepts.
      </p>

      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-1">
        <div className="max-h-[200px] overflow-y-auto space-y-1 p-4 custom-scrollbar">
          {progressLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm animate-in slide-in-from-bottom-2 duration-300">
              <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 
                   ${idx === progressLogs.length - 1 ? 'bg-orangeFpt-100 text-orangeFpt-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {idx === progressLogs.length - 1 ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
              </div>
              <span className={idx === progressLogs.length - 1 ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyzingScreen;
