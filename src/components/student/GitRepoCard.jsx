import React from 'react';
import { GitBranch, Settings, ExternalLink } from 'lucide-react';

const GitRepoCard = ({ gitRepo, onConfigClick }) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <GitBranch size={20} />
        Git Repository
      </h2>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-600 mb-1">Repository</p>
          <a 
            href={gitRepo.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline text-sm break-all flex items-center gap-1"
          >
            {gitRepo.url}
            <ExternalLink size={12} />
          </a>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">Branch</p>
            <p className="font-semibold text-sm">{gitRepo.branch}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">Commits</p>
            <p className="font-semibold text-sm">{gitRepo.commits}</p>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-600">Last Commit</p>
          <p className="text-sm">{new Date(gitRepo.lastCommit).toLocaleString()}</p>
        </div>
        
        <button 
          onClick={onConfigClick}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
        >
          <Settings size={16} />
          Configure Repository
        </button>
      </div>
    </>
  );
};

export default GitRepoCard;