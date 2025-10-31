import React, { useEffect, useState } from "react";
import ProfileInformation from "../../components/student/ProfileInformation";
import AccountSettings from "../../components/student/AccountSettings";
import AcademicInformation from "../../components/student/AcademicInformation";
import { User, Settings, GraduationCap } from "lucide-react";
import StudentLayout from "../../components/layout/StudentLayout";
import { getUserProfile, getAvatarByPublicId } from "../../services/userService";
import { useSelector } from "react-redux";
const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publicId, setPublicId] = useState(null);
  const userId = useSelector((state) => state.user.userId);

  // Call api to get user profile
  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const profileData = await getUserProfile(userId);
      setUserProfile(profileData.user);
      setPublicId(profileData.user.avatarImg);
      console.log("User data:", profileData.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  // Call api to get avatar image
  const [avatar, setAvatar] = useState(null);

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
    }
  }, [publicId]);

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "academic", label: "Academic Information", icon: GraduationCap },
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
        return <ProfileInformation user={userProfile} avatar={avatar} />;
      case "academic":
        return <AcademicInformation user={userProfile} />;
      case "settings":
        return <AccountSettings />;
      default:
        return <ProfileInformation user={userProfile} />;
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