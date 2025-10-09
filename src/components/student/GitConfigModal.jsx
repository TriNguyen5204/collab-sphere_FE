import React, { useState } from 'react';
import { X, GitBranch, Key, Users, Shield, CheckCircle, AlertCircle, Loader, Eye, EyeOff, RefreshCw } from 'lucide-react';

const GitConfigModal = ({ isOpen, onClose, currentConfig, onSave }) => {
  const [config, setConfig] = useState({
    repoUrl: currentConfig?.url || '',
    branch: currentConfig?.branch || 'main',
    accessToken: '',
    webhookUrl: '',
    autoSync: true,
    syncInterval: 15, // minutes
    enablePR: true,
    enableIssues: true,
    protectedBranches: ['main', 'production'],
    requiredReviewers: 1,
  });

  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const handleTestConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionStatus({
        success: true,
        message: 'Successfully connected to repository!',
        details: {
          owner: 'team-alpha',
          repo: 'collab-sphere',
          lastCommit: new Date().toISOString(),
          branches: 5,
          contributors: 4,
        }
      });
    }, 2000);
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const addProtectedBranch = () => {
    const branchName = prompt('Enter branch name:');
    if (branchName && !config.protectedBranches.includes(branchName)) {
      setConfig({
        ...config,
        protectedBranches: [...config.protectedBranches, branchName]
      });
    }
  };

  const removeProtectedBranch = (branch) => {
    setConfig({
      ...config,
      protectedBranches: config.protectedBranches.filter(b => b !== branch)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <GitBranch size={28} />
                Git Repository Configuration
              </h2>
              <p className="text-white/90 mt-1">Configure your project's Git integration and settings</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-4">
            {['general', 'security', 'automation', 'permissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium border-b-2 transition capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository URL *
                </label>
                <input
                  type="text"
                  value={config.repoUrl}
                  onChange={(e) => setConfig({ ...config, repoUrl: e.target.value })}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the HTTPS URL of your Git repository
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Branch
                  </label>
                  <input
                    type="text"
                    value={config.branch}
                    onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                    placeholder="main"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://api.collabsphere.com/webhook"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={handleTestConnection}
                  disabled={isConnecting || !config.repoUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Test Connection
                    </>
                  )}
                </button>
              </div>

              {connectionStatus && (
                <div className={`p-4 rounded-lg border ${
                  connectionStatus.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {connectionStatus.success ? (
                      <CheckCircle className="text-green-600 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 mt-0.5" size={20} />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        connectionStatus.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {connectionStatus.message}
                      </p>
                      {connectionStatus.details && (
                        <div className="mt-2 space-y-1 text-sm text-gray-700">
                          <p>Repository: {connectionStatus.details.owner}/{connectionStatus.details.repo}</p>
                          <p>Branches: {connectionStatus.details.branches}</p>
                          <p>Contributors: {connectionStatus.details.contributors}</p>
                          <p>Last Activity: {new Date(connectionStatus.details.lastCommit).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline mr-2" size={16} />
                  Personal Access Token *
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.accessToken}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for private repositories. Generate token from GitHub Settings → Developer settings → Personal access tokens
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Security Best Practices
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Use tokens with minimal required permissions</li>
                  <li>• Rotate tokens regularly (recommended: every 90 days)</li>
                  <li>• Never share your access token with others</li>
                  <li>• Enable 2FA on your GitHub account</li>
                  <li>• Use fine-grained tokens for better security</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Protected Branches</h4>
                <div className="space-y-2">
                  {config.protectedBranches.map((branch) => (
                    <div key={branch} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <GitBranch size={16} className="text-gray-600" />
                        <span className="font-medium">{branch}</span>
                      </div>
                      <button
                        onClick={() => removeProtectedBranch(branch)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addProtectedBranch}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition"
                  >
                    + Add Protected Branch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Auto-Sync</h4>
                  <p className="text-sm text-gray-600">Automatically sync changes from repository</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoSync}
                    onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {config.autoSync && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.syncInterval}
                    onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) })}
                    min="5"
                    max="60"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: 5 minutes, Maximum: 60 minutes
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Enable Features</h4>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">Pull Request Integration</h5>
                    <p className="text-sm text-gray-600">Track and manage PRs within the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enablePR}
                      onChange={(e) => setConfig({ ...config, enablePR: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">Issue Tracking</h5>
                    <p className="text-sm text-gray-600">Sync GitHub issues with tasks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableIssues}
                      onChange={(e) => setConfig({ ...config, enableIssues: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Reviewers for Pull Requests
                </label>
                <input
                  type="number"
                  value={config.requiredReviewers}
                  onChange={(e) => setConfig({ ...config, requiredReviewers: parseInt(e.target.value) })}
                  min="0"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of team members required to approve a PR before merging
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  Team Member Permissions
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded">
                    <span className="text-sm">Can create branches</span>
                    <span className="text-sm font-medium text-green-600">✓ All Members</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded">
                    <span className="text-sm">Can merge to main</span>
                    <span className="text-sm font-medium text-orange-600">⚠ Leader Only</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded">
                    <span className="text-sm">Can force push</span>
                    <span className="text-sm font-medium text-red-600">✗ Disabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded">
                    <span className="text-sm">Can delete branches</span>
                    <span className="text-sm font-medium text-orange-600">⚠ Leader Only</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitConfigModal;