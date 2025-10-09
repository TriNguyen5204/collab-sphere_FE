import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Settings, 
  Users, 
  Bell, 
  Archive, 
  Trash2, 
  LogOut, 
  FileText,
  Download,
  Upload,
  Shield,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  RefreshCw
} from "lucide-react";

const ProjectBoardSetting = ({ archivedItems, onRestoreArchived, onDeleteArchived }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { id, projectName } = useParams();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      section: "Project Management",
      items: [
        {
          icon: Users,
          label: "Manage Members",
          action: () => setShowModal('members'),
          description: "Add or remove team members"
        },
        {
          icon: Shield,
          label: "Project Settings",
          action: () => setShowModal('settings'),
          description: "Configure project preferences"
        },
        {
          icon: Copy,
          label: "Duplicate Project",
          action: () => handleDuplicateProject(),
          description: "Create a copy of this project"
        }
      ]
    },
    {
      section: "Data & Export",
      items: [
        {
          icon: Download,
          label: "Export Project",
          action: () => handleExportProject(),
          description: "Download project data"
        },
        {
          icon: Upload,
          label: "Import Data",
          action: () => setShowModal('import'),
          description: "Import tasks or data"
        },
        {
          icon: FileText,
          label: "Generate Report",
          action: () => handleGenerateReport(),
          description: "Create project report"
        }
      ]
    },
    {
      section: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Notification Settings",
          action: () => setShowModal('notifications'),
          description: "Configure alerts and reminders"
        },
        {
          icon: Eye,
          label: "Activity Log",
          action: () => setShowModal('activity'),
          description: "View project activity"
        }
      ]
    },
    {
      section: "Advanced",
      items: [
        {
          icon: RefreshCw,
          label: "Sync Data",
          action: () => handleSyncData(),
          description: "Synchronize project data"
        },
        {
          icon: Archive,
          label: "Archived Items",
          action: () => setShowModal('archiveItems'),
          description: "View and restore archived cards/lists"
        },
        {
          icon: Archive,
          label: "Archive Project",
          action: () => setShowModal('archive'),
          description: "Archive this project",
          className: "text-orange-600 hover:bg-orange-50"
        },
        {
          icon: Trash2,
          label: "Delete Project",
          action: () => setShowModal('delete'),
          description: "Permanently delete project",
          className: "text-red-600 hover:bg-red-50"
        }
      ]
    },
    {
      section: "Other",
      items: [
        {
          icon: LogOut,
          label: "Leave Project",
          action: () => setShowModal('leave'),
          description: "Exit this project team",
          className: "text-gray-600 hover:bg-gray-50"
        }
      ]
    }
  ];

  const handleDuplicateProject = () => {
    console.log("Duplicating project...");
    alert("Project duplicated successfully!");
    setIsOpen(false);
  };

  const handleExportProject = () => {
    console.log("Exporting project data...");
    alert("Project export started. You'll receive a download link shortly.");
    setIsOpen(false);
  };

  const handleGenerateReport = () => {
    console.log("Generating report...");
    alert("Report generation started. This may take a few moments.");
    setIsOpen(false);
  };

  const handleSyncData = () => {
    console.log("Syncing data...");
    alert("Data synchronized successfully!");
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Project settings"
        >
          <Settings 
            size={20} 
            className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-2 border-b">
              <h3 className="font-semibold text-gray-900">Project Settings</h3>
              <p className="text-xs text-gray-500 mt-1">{decodeURIComponent(projectName)}</p>
            </div>

            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="px-4 py-2 mt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.section}
                  </p>
                </div>
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={item.action}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${item.className || ''}`}
                    >
                      <Icon size={18} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
                {sectionIdx < menuItems.length - 1 && (
                  <div className="border-t my-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ManageMembersModal 
        isOpen={showModal === 'members'} 
        onClose={() => setShowModal(null)} 
      />
      <ProjectSettingsModal 
        isOpen={showModal === 'settings'} 
        onClose={() => setShowModal(null)} 
      />
      <NotificationSettingsModal 
        isOpen={showModal === 'notifications'} 
        onClose={() => setShowModal(null)} 
      />
      <ActivityLogModal 
        isOpen={showModal === 'activity'} 
        onClose={() => setShowModal(null)} 
      />
      <ImportDataModal 
        isOpen={showModal === 'import'} 
        onClose={() => setShowModal(null)} 
      />
      <ArchiveProjectModal 
        isOpen={showModal === 'archive'} 
        onClose={() => setShowModal(null)} 
      />
      <DeleteProjectModal 
        isOpen={showModal === 'delete'} 
        onClose={() => setShowModal(null)} 
      />
      <LeaveProjectModal 
        isOpen={showModal === 'leave'} 
        onClose={() => setShowModal(null)} 
      />
      <ArchivedItemsModal 
        isOpen={showModal === 'archiveItems'}
        onClose={() => setShowModal(null)}
        archivedItems={archivedItems}
        onRestore={(type, id, listId) => onRestoreArchived?.(type, id, listId)}
        onDelete={(type, id) => onDeleteArchived?.(type, id)}
      />
    </>
  );
};

// Modal Components
const ManageMembersModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Manage Team Members</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Add or remove members, assign roles, and manage permissions.</p>
          {/* Add member management UI here */}
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    projectName: "",
    description: "",
    visibility: "private",
    allowInvites: true
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Project Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              value={settings.projectName}
              onChange={(e) => setSettings({...settings, projectName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Project description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <select
              value={settings.visibility}
              onChange={(e) => setSettings({...settings, visibility: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="private">Private</option>
              <option value="team">Team Only</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.allowInvites}
              onChange={(e) => setSettings({...settings, allowInvites: e.target.checked})}
              className="rounded"
            />
            <label className="text-sm">Allow team members to invite others</label>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    deadlines: true,
    milestones: true
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Notification Settings</h2>
        </div>
        <div className="p-6 space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                className="rounded"
              />
            </div>
          ))}
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityLogModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const activities = [
    { user: "Alice", action: "created task", item: "Update homepage", time: "2 hours ago" },
    { user: "Bob", action: "completed", item: "Design mockups", time: "5 hours ago" },
    { user: "Charlie", action: "commented on", item: "API integration", time: "1 day ago" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Activity Log</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                    <span className="font-semibold">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ImportDataModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Import Data</h2>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <input type="file" className="hidden" id="file-import" accept=".csv,.json" />
            <label htmlFor="file-import" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
              Choose file to import
            </label>
            <p className="text-sm text-gray-500 mt-2">CSV or JSON format</p>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

const ArchiveProjectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-orange-600">Archive Project</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700">
            Are you sure you want to archive this project? Archived projects can be restored later.
          </p>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteProjectModal = ({ isOpen, onClose }) => {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-red-600">Delete Project</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            This action cannot be undone. This will permanently delete the project and all associated data.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="DELETE"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button 
            disabled={confirmText !== "DELETE"}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
};

const LeaveProjectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Leave Project</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700">
            Are you sure you want to leave this project? You'll need to be re-invited to join again.
          </p>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Leave Project
          </button>
        </div>
      </div>
    </div>
  );
};

const ArchivedItemsModal = ({ isOpen, onClose, archivedItems, onRestore, onDelete }) => {
  const [activeTab, setActiveTab] = useState('cards');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Archived Items</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'cards'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Cards ({archivedItems?.cards?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'lists'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Lists ({archivedItems?.lists?.length || 0})
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'cards' && (
            <div className="space-y-3">
              {(!archivedItems?.cards || archivedItems.cards.length === 0) ? (
                <p className="text-gray-500 text-center py-8">No archived cards</p>
              ) : (
                archivedItems.cards.map((card) => (
                  <div key={card.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRestore('card', card.id, card.listId)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete('card', card.id, card.listId)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="space-y-3">
              {(!archivedItems?.lists || archivedItems.lists.length === 0) ? (
                <p className="text-gray-500 text-center py-8">No archived lists</p>
              ) : (
                archivedItems.lists.map((list) => (
                  <div key={list.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{list.title}</h3>
                      <p className="text-sm text-gray-600">{list.cards?.length || 0} cards</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRestore('list', list.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete('list', list.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectBoardSetting;