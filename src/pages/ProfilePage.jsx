import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { User, Settings, ChevronLeft, ShieldCheck } from "lucide-react";
import StudentLayout from "../components/layout/StudentLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProfileInformation from "../features/student/components/ProfileInformation";
import AccountSettings from "../features/student/components/AccountSettings";
import {
  getUserProfile,
  getAvatarByPublicId,
  postUploadUserAvatar,
  putUpdateUserProfile,
} from "../services/studentApi";
import { toast } from "sonner";

const layoutByRole = {
  STUDENT: StudentLayout,
  LECTURER: DashboardLayout,
};

const ProfilePage = () => {
  const { userId: routeUserId } = useParams();
  const { userId: authUserId, roleName } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publicId, setPublicId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const effectiveUserId = routeUserId ?? (authUserId ? String(authUserId) : undefined);
  const isOwnProfile = Boolean(
    authUserId && effectiveUserId && String(authUserId) === String(effectiveUserId)
  );

  // --- Fetch and Update Logic (Kept mostly same) ---
  const fetchUserProfile = useCallback(async (targetUserId, { withLoader = true } = {}) => {
    if (!targetUserId) return;
    try {
      if (withLoader) setLoading(true);
      const profileData = await getUserProfile(targetUserId);
      const nextUser = profileData?.user ?? null;
      setUserProfile(nextUser);
      setPublicId(nextUser?.avatarImg || null);
      if (!nextUser?.avatarImg) setAvatar(nextUser?.avatarUrl || null);
    } catch (error) {
      toast.error("Unable to load profile.");
    } finally {
      if (withLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (effectiveUserId) fetchUserProfile(effectiveUserId);
  }, [effectiveUserId, fetchUserProfile]);

  const fetchAvatar = useCallback(async (publicIdValue) => {
    if (!publicIdValue) return;
    try {
      const avatarData = await getAvatarByPublicId(publicIdValue);
      setAvatar(avatarData?.data ?? null);
    } catch (error) { console.error(error); }
  }, []);

  useEffect(() => {
    if (publicId) fetchAvatar(publicId);
    else if (userProfile?.avatarUrl) setAvatar(userProfile.avatarUrl);
  }, [publicId, userProfile?.avatarUrl, fetchAvatar]);

  const refreshProfile = useCallback(async () => {
    if (effectiveUserId) await fetchUserProfile(effectiveUserId, { withLoader: false });
  }, [effectiveUserId, fetchUserProfile]);

  const buildProfilePayload = useCallback((overrides = {}) => {
    const base = userProfile || {};
    const resolvedFullName = overrides.fullName ?? base.fullName ?? base.fullname ?? "";
    return {
      userId: Number(overrides.userId ?? base.userId ?? authUserId ?? effectiveUserId ?? 0),
      isTeacher: overrides.isTeacher ?? base.isTeacher ?? false,
      fullName: resolvedFullName,
      fullname: resolvedFullName,
      address: overrides.address ?? base.address ?? "",
      phoneNumber: overrides.phoneNumber ?? base.phoneNumber ?? "",
      yob: Number(overrides.yob ?? base.yob ?? 0),
      school: overrides.school ?? base.school ?? "",
      code: overrides.code ?? base.code ?? "",
      major: overrides.major ?? base.major ?? "",
      isActive: overrides.isActive ?? base.isActive ?? true,
      email: overrides.email ?? base.email,
      ...overrides
    };
  }, [authUserId, effectiveUserId, userProfile]);

  const handleProfileUpdate = useCallback(async (updates) => {
    if (!isOwnProfile) return;
    try {
      setIsSavingProfile(true);
      const payload = buildProfilePayload(updates);
      await putUpdateUserProfile(effectiveUserId, payload);
      toast.success("Profile updated successfully.");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }, [buildProfilePayload, effectiveUserId, isOwnProfile, refreshProfile]);

  const handleAvatarUpload = useCallback(async (file) => {
    if (!file || !isOwnProfile) return;
    const formData = new FormData();
    formData.append("imageFile", file);
    formData.append("userId", String(effectiveUserId));
    try {
      setIsUploadingAvatar(true);
      await postUploadUserAvatar(formData);
      toast.success("Avatar updated.");
      await refreshProfile();
    } catch (error) {
      toast.error("Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [effectiveUserId, isOwnProfile, refreshProfile]);

  const handlePasswordChange = useCallback(async (payload) => {
    if (!isOwnProfile) return;
    try {
      setIsSavingPassword(true);
      const requestPayload = buildProfilePayload(payload);
      await putUpdateUserProfile(effectiveUserId, requestPayload);
      toast.success("Password updated.");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  }, [buildProfilePayload, effectiveUserId, isOwnProfile, refreshProfile]);

  const tabs = useMemo(() => {
    const base = [{ id: "profile", label: "General Info", icon: User }];
    if (isOwnProfile) base.push({ id: "settings", label: "Security", icon: ShieldCheck });
    return base;
  }, [isOwnProfile]);

  const renderContent = () => {
    if (loading) return <div className="text-center py-20 text-white font-medium animate-pulse">Loading...</div>;
    if (!userProfile) return <div className="text-center py-20 text-white/70">No profile data available.</div>;

    switch (activeTab) {
      case "profile":
        return (
          <ProfileInformation
            user={userProfile}
            avatar={avatar}
            onUpdateProfile={isOwnProfile ? handleProfileUpdate : undefined}
            isSaving={isSavingProfile}
            onUploadAvatar={isOwnProfile ? handleAvatarUpload : undefined}
            isUploadingAvatar={isUploadingAvatar}
            readOnly={!isOwnProfile}
          />
        );
      case "settings":
        return isOwnProfile ? (
          <AccountSettings onChangePassword={handlePasswordChange} isSaving={isSavingPassword} />
        ) : null;
      default:
        return null;
    }
  };

  const navigate = useNavigate();
  const LayoutComponent = layoutByRole[String(roleName).toUpperCase()] ?? React.Fragment;

  const pageContent = (
    // Changed: w-full and min-h-screen to ensure full coverage
    <div className="relative min-h-screen w-full p-4 md:p-8">
      {/* Background: Widespread blobs for full screen effect */}
      <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 bg-gradient-to-br from-orangeFpt-50 via-orange-50 to-white">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orangeFpt-300/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-orange-400/20 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-pink-300/20 rounded-full blur-[100px]" />
      </div>

      {/* Changed: Removed max-w-4xl, using w-full */}
      <div className="w-full space-y-6 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-orangeFpt-600 transition-colors px-4 py-2 rounded-xl hover:bg-white/40">
            <ChevronLeft size={20} /> <span className="font-semibold">Back</span>
          </button>
          
          {/* Glass Tab Navigation - Centered or Right aligned as preferred */}
          <div className="flex gap-2 p-1 bg-white/30 backdrop-blur-md rounded-2xl w-fit border border-white/40 shadow-sm self-start md:self-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-500/30"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area - Full Width */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );

  if (LayoutComponent === React.Fragment) return pageContent;
  return <>{pageContent}</>;
};

export default ProfilePage;