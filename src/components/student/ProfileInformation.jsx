import React, { useEffect, useMemo, useState } from "react";
import { Camera, Edit2 } from "lucide-react";
import { generateAvatarFromName } from "../../utils/avatar";

const ProfileInformation = ({ user, avatar}) => {
  const [isEditing, setIsEditing] = useState(false);


  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    dateOfBirth: user?.yob ? `${user.yob}-01-01` : "",
    address: user?.address || "",
    bio: "",
    avatar: avatar,
    code: user?.code || "",
    major: user?.major || "",
  });

  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      fullname: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      dateOfBirth: user?.yob ? `${user.yob}-01-01` : "",
      address: user?.address || "",
      avatar: avatar,
      code: user?.code || "",
      major: user?.major || "",
    }));
  }, [user, avatar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const fallbackAvatar = useMemo(() => generateAvatarFromName(profileData.fullname), [profileData.fullname]);

  return (
    <div className="space-y-6">
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
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={profileData.avatar || fallbackAvatar}
            alt="Profile"
            onError={() =>
              setProfileData((prev) =>
                prev.avatar === fallbackAvatar ? prev : { ...prev, avatar: fallbackAvatar }
              )
            }
            className="w-32 h-32 rounded-full object-cover border-black"
          />
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition shadow-lg">
              <Camera size={20} />
            </button>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profileData.fullname || "—"}</h3>
          <p className="text-gray-600">Student ID: {profileData.code || "—"}</p>
          <p className="text-sm text-gray-500 mt-1">Major: {profileData.major || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            value={profileData.fullname}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg ${
              isEditing
                ? "border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                : "border-gray-200 bg-gray-50"
            } transition`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
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
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
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
      </div>
    </div>
  );
};

export default ProfileInformation;