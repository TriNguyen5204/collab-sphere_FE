import React from 'react';
import { UserCheck, Inbox } from 'lucide-react';

const EvaluationTabs = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'evaluate', label: 'Evaluate Peers', icon: UserCheck },
    { id: 'received', label: 'Received Evaluations', icon: Inbox }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <div className="flex gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChangeTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EvaluationTabs;