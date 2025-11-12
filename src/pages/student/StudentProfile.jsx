import React, { useEffect, useState } from "react";
import ProfileInformation from "../../components/student/ProfileInformation";
import AccountSettings from "../../components/student/AccountSettings";
import { User, Settings } from "lucide-react";
import StudentLayout from "../../components/layout/StudentLayout";
import {
  getUserProfile,
  getAvatarByPublicId,
  postUploadUserAvatar,
  putUpdateUserProfile,
} from "../../services/studentApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publicId, setPublicId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const userId = useSelector((state) => state.user.userId);

  // Call api to get user profile
  const fetchUserProfile = async (targetUserId, { withLoader = true } = {}) => {
    if (!targetUserId) return;
    try {
      if (withLoader) {
        setLoading(true);
      }
      const profileData = await getUserProfile(targetUserId);
      setUserProfile(profileData.user);
      const avatarImgId = profileData.user?.avatarImg || null;
      setPublicId(avatarImgId);
      if (!avatarImgId) {
        setAvatar(profileData.user?.avatarUrl || null);
      }
      console.log("User data:", profileData.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchAvatar = async (publicId) => {
    try {
      const avatarData = await getAvatarByPublicId(publicId);
      setAvatar(avatarData.data);
      console.log("Avatar data:", avatarData.data);
    } catch (error) {
      console.error("Failed to fetch avatar:", error);
    }
  };

  useEffect(() => {
    if (publicId) {
      fetchAvatar(publicId);
    } else if (userProfile?.avatarUrl) {
      setAvatar(userProfile.avatarUrl);
    }
  }, [publicId, userProfile?.avatarUrl]);

  const refreshProfile = async () => {
    await fetchUserProfile(userId, { withLoader: false });
  };

  const buildProfilePayload = (overrides = {}) => {
    const base = userProfile || {};
    const resolvedFullName =
      overrides.fullName ??
      base.fullName ??
      base.fullname ??
      base.full_name ??
      "";

    const payload = {
      userId: Number(overrides.userId ?? base.userId ?? userId ?? 0),
      isTeacher:
        overrides.isTeacher ??
        (base.isTeacher !== undefined ? base.isTeacher : false),
      fullName: resolvedFullName,
      address: overrides.address ?? base.address ?? "",
      phoneNumber: overrides.phoneNumber ?? base.phoneNumber ?? "",
      yob: Number(overrides.yob ?? base.yob ?? 0),
      school: overrides.school ?? base.school ?? "",
      code: overrides.code ?? base.code ?? "",
      major: overrides.major ?? base.major ?? "",
      isActive:
        overrides.isActive ??
        (base.isActive !== undefined ? base.isActive : true),
    };

    const emailValue = overrides.email ?? base.email;
    if (emailValue !== undefined) {
      payload.email = emailValue;
    }

    Object.entries(overrides).forEach(([key, value]) => {
      if (value !== undefined) {
        payload[key] = value;
      }
    });

    // Some backend variants expect both camelCase and lowercase variants.
    payload.fullname = payload.fullName ?? payload.fullname;

    return payload;
  };

  const handleProfileUpdate = async (updates) => {
    if (!userId || !userProfile) return;
    try {
      setIsSavingProfile(true);
      const payload = buildProfilePayload({
        address: updates.address,
        phoneNumber: updates.phoneNumber,
        email: updates.email,
      });
      const response = await putUpdateUserProfile(userId, payload);
      const message = response?.message || "Profile updated successfully.";
      toast.success(message);
      await refreshProfile();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile.";
      toast.error(message);
      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file || !userId) return;
    const formData = new FormData();
    formData.append("imageFile", file);
    formData.append("File", file);
    formData.append("file", file);
    formData.append("userId", String(userId));
    try {
      setIsUploadingAvatar(true);
      const response = await postUploadUserAvatar(formData);
      const message = response?.message || "Avatar updated successfully.";
      toast.success(message);
      await refreshProfile();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload avatar.";
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (payload) => {
    if (!userId || !userProfile) return;
    try {
      setIsSavingPassword(true);
      const requestPayload = buildProfilePayload({
        oldPassword: payload.oldPassword,
        newPassword: payload.newPassword,
        confirmNewPassword: payload.confirmNewPassword,
      });
      const response = await putUpdateUserProfile(userId, requestPayload);
      const message = response?.message || "Password updated successfully.";
      toast.success(message);
      await refreshProfile();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update password.";
      toast.error(message);
      throw error;
    } finally {
      setIsSavingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="text-gray-500">Loading profile...</div>;
    }
    if (!userProfile) {
      return <div className="text-gray-500">No profile data available.</div>;
    }
    switch (activeTab) {
      case "profile":
        return (
          <ProfileInformation
            user={userProfile}
            avatar={avatar}
            onUpdateProfile={handleProfileUpdate}
            isSaving={isSavingProfile}
            onUploadAvatar={handleAvatarUpload}
            isUploadingAvatar={isUploadingAvatar}
          />
        );
      case "settings":
        return (
          <AccountSettings
            onChangePassword={handlePasswordChange}
            isSaving={isSavingPassword}
          />
        );
      default:
        return (
          <ProfileInformation
            user={userProfile}
            avatar={avatar}
            onUpdateProfile={handleProfileUpdate}
            isSaving={isSavingProfile}
            onUploadAvatar={handleAvatarUpload}
            isUploadingAvatar={isUploadingAvatar}
          />
        );
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                        activeTab === tab.id
                          ? "border-brand-600 text-brand-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;