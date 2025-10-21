import React, { useEffect, useMemo, useState } from "react";
import { Camera, Mail, Phone, MapPin, Calendar, Save, Edit2 } from "lucide-react";

const ProfileInformation = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);

  const fallbackAvatar = useMemo(() => {
    const name = user?.fullname?.trim() || "Student";
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=E5E7EB&color=111827`;
  }, [user?.fullname]);

  const resolveAvatar = (avatarImg) => {
    if (!avatarImg) return fallbackAvatar;
    // Accept only full http/https URLs; otherwise, use name-based fallback
    if (typeof avatarImg === "string" && /^(https?:)\/\//i.test(avatarImg)) {
      return avatarImg;
    }
    return fallbackAvatar;
  };

  const [profileData, setProfileData] = useState({
    fullName: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    // Use yob (year of birth) if available; map to a date input friendly format
    dateOfBirth: user?.yob ? `${user.yob}-01-01` : "",
    address: user?.address || "",
    bio: "",
    avatar: resolveAvatar(user?.avatarImg),
    code: user?.code || "",
  });

  useEffect(() => {
    // Keep local state in sync if parent user changes
    setProfileData((prev) => ({
      ...prev,
      fullName: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      dateOfBirth: user?.yob ? `${user.yob}-01-01` : "",
      address: user?.address || "",
      avatar: resolveAvatar(user?.avatarImg),
      code: user?.code || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // API call to save profile data
    setIsEditing(false);
    // Show success message
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit/Save Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={profileData.avatar}
            alt="Profile"
            onError={() => setProfileData((prev) => ({ ...prev, avatar: fallbackAvatar }))}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition shadow-lg">
              <Camera size={20} />
            </button>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profileData.fullName || "—"}</h3>
          <p className="text-gray-600">Student ID: {profileData.code || "—"}</p>
          {/* Member since unknown with current data */}
          <p className="text-sm text-gray-500 mt-1">Member since: —</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={profileData.fullName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${
              isEditing
                ? "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                : "border-gray-200 bg-gray-50"
            } transition`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
            <Mail size={16} />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${
              isEditing
                ? "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                : "border-gray-200 bg-gray-50"
            } transition`}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
            <Phone size={16} />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${
              isEditing
                ? "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                : "border-gray-200 bg-gray-50"
            } transition`}
          />
        </div>

        {/* Year of Birth (mapped from yob) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
            <Calendar size={16} />
            Year of Birth
          </label>
          <input
            type="number"
            name="yob"
            value={profileData.dateOfBirth ? profileData.dateOfBirth.slice(0, 4) : ""}
            onChange={(e) => {
              const year = e.target.value;
              setProfileData((prev) => ({ ...prev, dateOfBirth: year ? `${year}-01-01` : "" }));
            }}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${
              isEditing
                ? "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                : "border-gray-200 bg-gray-50"
            } transition`}
          />
        </div>

        {/* Address - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
            <MapPin size={16} />
            Address
          </label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${
              isEditing
                ? "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                : "border-gray-200 bg-gray-50"
            } transition`}
          />
        </div>

        {/* Bio removed for now as backend does not provide it */}
      </div>
    </div>
  );
};

export default ProfileInformation;