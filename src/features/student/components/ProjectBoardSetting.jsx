import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
  RefreshCw,
  MessageSquareWarning
} from "lucide-react";
import { toast } from "sonner";
import useTeam from "../../../context/useTeam";
import { putUpdateTeamByTeamId, postAvatarOfTeam } from "../../../services/studentApi";
import ReportSystemModal from "./ReportSystemModal";
import { useAvatar } from "../../../hooks/useAvatar";

const ProjectBoardSetting = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const menuRef = useRef(null);
  const { projectName } = useParams();
  const userId = useSelector((state) => state.user.userId);
  const { team, updateTeam } = useTeam();
  
  // Check if current user is the leader (teamRole: 1)
  const isLeader = team?.memberInfo?.members?.some(
    (member) => member.studentId === userId && member.teamRole === 1
  ) ?? false;

  const getErrorMessage = (error, fallbackMessage) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    return message || fallbackMessage;
  };

  const extractTeamPayload = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }

    if (data.teamDetail && typeof data.teamDetail === 'object') {
      return data.teamDetail;
    }

    if (data.team && typeof data.team === 'object') {
      return data.team;
    }

    return data;
  };

  const performAvatarUpload = async (imageFile) => {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    formData.append('teamId', String(team.teamId));
    formData.append('requesterId', String(userId));

    const response = await postAvatarOfTeam(formData);
    const nextTeam = extractTeamPayload(response);
    const avatarUrl =
      nextTeam?.teamImage ||
      response?.teamImageUrl ||
      response?.teamImage ||
      response?.imageUrl ||
      response?.data?.teamImage ||
      response?.data?.imageUrl;

    return { nextTeam, avatarUrl };
  };

  const handleSaveTeamSettings = async (values, avatarFile) => {
    if (!team?.teamId) {
      toast.error('Missing team context. Please refresh the page and try again.');
      return false;
    }

    const payload = {
      teamId: team.teamId,
      teamName: values?.teamName?.trim() || '',
      description: values?.description?.trim() || '',
      gitLink: values?.gitLink?.trim() || '',
    };

    if (!payload.teamName) {
      toast.error('Team name is required.');
      return false;
    }

    setIsSavingSettings(true);
    try {
      const updateResponse = await putUpdateTeamByTeamId(team.teamId, payload);
      const infoTeam = extractTeamPayload(updateResponse);
      let mergedTeam = {
        ...team,
        ...(infoTeam ?? {}),
        teamName: payload.teamName,
        description: payload.description,
        gitLink: payload.gitLink,
      };

      let avatarUploadError = null;
      if (avatarFile) {
        if (!userId) {
          await updateTeam(mergedTeam, { refresh: false });
          toast.error('Missing user context. Please sign in again.');
          return false;
        }

        try {
          const { nextTeam, avatarUrl } = await performAvatarUpload(avatarFile);
          if (nextTeam) {
            mergedTeam = { ...mergedTeam, ...nextTeam };
          } else if (avatarUrl) {
            mergedTeam = { ...mergedTeam, teamImage: avatarUrl };
          }
        } catch (error) {
          avatarUploadError = error;
        }
      }

      await updateTeam(mergedTeam, { refresh: true, teamId: payload.teamId });

      if (avatarUploadError) {
        toast.error(getErrorMessage(avatarUploadError, 'Failed to update team avatar.'));
        return false;
      }

      toast.success('Team settings saved successfully.');
      setShowModal(null);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.errors?.TeamName?.[0] || 'Failed to save team settings.');
      return false;
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAvatarUpload = async (imageFile) => {
    if (!team?.teamId) {
      toast.error('Missing team context. Please refresh the page and try again.');
      return;
    }
    if (!userId) {
      toast.error('Missing user context. Please sign in again.');
      return;
    }
    if (!imageFile) {
      toast.error('Please choose an image before uploading.');
      return;
    }

    const currentTeamId = team.teamId;

    setIsUploadingAvatar(true);
    try {
      const { nextTeam, avatarUrl } = await performAvatarUpload(imageFile);

      if (nextTeam) {
        await updateTeam(nextTeam, { refresh: true, teamId: currentTeamId });
      } else if (avatarUrl) {
        await updateTeam({ teamImage: avatarUrl }, { refresh: true, teamId: currentTeamId });
      }

      toast.success('Team avatar updated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update team avatar.'));
      throw error;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
      section: "Team Management",
      items: [
        {
          icon: Shield,
          label: "Team Settings",
          action: () => {
            setShowModal('settings');
            setIsOpen(false);
          },
          description: "Configure team preferences"
        },
      ]
    },
    {
      section: "Report System",
      items: [
        {
          icon: MessageSquareWarning,
          label: "Report System",
          action: () => {
            setShowModal('report');
            setIsOpen(false);
          },
          description: "Report system issues or bugs"
        },
      ]
    }
  ];


  return (
    <div className="relative">
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
          <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Project Settings</h3>
            </div>

            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={item.action}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-start gap-3 ${item.className || ''}`}
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
                  <div className="border-t border-gray-100 " />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectSettingsModal
        isOpen={showModal === 'settings'}
        onClose={() => setShowModal(null)}
        team={team}
        onSave={handleSaveTeamSettings}
        onAvatarUpload={handleAvatarUpload}
        isSaving={isSavingSettings}
        isUploading={isUploadingAvatar}
        isLeader={isLeader}
      />
      <ReportSystemModal
        isOpen={showModal === 'report'}
        onClose={() => setShowModal(null)}
        userId={userId}
      />
    </div>
  );
};


const ProjectSettingsModal = ({
  isOpen,
  onClose,
  team,
  onSave,
  onAvatarUpload,
  isSaving,
  isUploading,
  isLeader,
}) => {
  const [formValues, setFormValues] = useState({
    teamName: "",
    description: "",
    gitLink: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const currentAvatar = avatarPreview || team?.teamImage;
  const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(formValues.teamName || "Team", currentAvatar);

  useEffect(() => {
    if (!isOpen) return;
    setFormValues({
      teamName: team?.teamName ?? "",
      description: team?.description ?? "",
      gitLink: team?.gitLink ?? "",
    });
  }, [isOpen, team]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (isOpen) return;
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setSelectedFile(null);
  }, [isOpen, avatarPreview]);

  if (!isOpen) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onSave) return;
    const success = await onSave(formValues, selectedFile);
    if (success) {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      setSelectedFile(null);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    if (!file) {
      setSelectedFile(null);
      setAvatarPreview(null);
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadClick = async () => {
    if (!onAvatarUpload) return;
    if (!selectedFile) {
      toast.error('Please choose an image before uploading.');
      return;
    }

    try {
      await onAvatarUpload(selectedFile);
      setSelectedFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
    } catch {

    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-900 border border-gray-200 rounded-lg w-full max-w-3xl shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Team Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Update your team avatar and basic information.</p>
          {!isLeader && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-800">View Only Access</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Only the team leader can modify team settings. You can view the current configuration but cannot make changes.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            <div className=" grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Team Avatar</label>
                  <div
                    className={`w-64 h-64 sm:w-56 sm:h-56 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 relative ${isLeader ? 'cursor-pointer group' : 'cursor-default'}`}
                    onClick={() => isLeader && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={isLeader ? 0 : -1}
                    onKeyDown={(event) => {
                      if (isLeader && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label={isLeader ? "Change team avatar" : "Team avatar"}
                  >
                    {shouldShowImage ? (
                      <img
                        src={currentAvatar}
                        alt="Team avatar preview"
                        className={`w-full h-full object-cover rounded-full ${isLeader ? 'transition-opacity group-hover:opacity-80' : ''}`}
                        title={isLeader ? "Upload" : "Team Avatar"}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${colorClass}`}>
                        {initials}
                      </div>
                    )}

                    {isLeader && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
                          <Upload size={16} className="text-white" />
                        </span>
                      </span>
                    )}

                    <input
                      id="team-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={!isLeader}
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Team Name</label>
                  <input
                    type="text"
                    value={formValues.teamName}
                    onChange={handleChange('teamName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-orangeFpt-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter team name"
                    disabled={!isLeader}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                  <textarea
                    value={formValues.description}
                    onChange={handleChange('description')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-orangeFpt-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    rows={3}
                    placeholder="Describe your team"
                    disabled={!isLeader}
                  />
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                {isLeader ? 'Cancel' : 'Close'}
              </button>
              {isLeader && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-300"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectBoardSetting;
