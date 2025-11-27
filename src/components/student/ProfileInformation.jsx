import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { useAvatar } from "../../hooks/useAvatar";
import { toast } from "sonner";
const ProfileInformation = ({
  user,
  avatar,
  onUpdateProfile,
  isSaving,
  onUploadAvatar,
  isUploadingAvatar,
  readOnly = false,
}) => {
  const fileInputRef = useRef(null);
  const resolvedFullname = useMemo(
    () => user?.fullname || user?.fullName || user?.full_name || "",
    [user]
  );

  const computeInitialState = useCallback(() => ({
    fullname: resolvedFullname,
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    address: user?.address || "",
    avatar,
    code: user?.code || user?.studentCode || user?.lecturerCode || "",
    major: user?.major || "",
    school: user?.school || "",
  }), [avatar, resolvedFullname, user]);

  const [profileData, setProfileData] = useState(computeInitialState);

  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      ...computeInitialState(),
    }));
  }, [computeInitialState]);

  const initialEditable = useMemo(
    () => ({
      phone: user?.phoneNumber || "",
      address: user?.address || "",
    }),
    [user]
  );

  const isDirty = useMemo(() => {
    return (
      profileData.phone !== initialEditable.phone ||
      profileData.address !== initialEditable.address
    );
  }, [profileData, initialEditable]);

  const canEdit = !readOnly;

  const handleInputChange = (event) => {
    if (!canEdit) return;
    const { name, value } = event.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (!canEdit) return;
    setProfileData((prev) => ({
      ...prev,
      phone: initialEditable.phone,
      address: initialEditable.address,
    }));
  };

  const handleSave = async () => {
    if (!onUpdateProfile || !canEdit) return;
    try {
      await onUpdateProfile({
        phoneNumber: profileData.phone,
        address: profileData.address,
      });
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while updating profile."
      );
    }
  };

  const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(profileData.fullname, profileData.avatar);

  const triggerAvatarUpload = () => {
    if (isUploadingAvatar || !canEdit) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadAvatar || !canEdit) {
      event.target.value = "";
      return;
    }
    try {
      await onUploadAvatar(file);
    } finally {
      event.target.value = "";
    }
  };

  const editableFieldClasses = "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
  const readOnlyFieldClasses = "border-gray-200 bg-gray-50";
  const appliedEditableClasses = canEdit ? editableFieldClasses : readOnlyFieldClasses;
  const isTeacher = Boolean(user?.isTeacher ?? user?.isTeachers);
  const idLabel = isTeacher ? "Lecturer ID" : "Student ID";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        {canEdit && isDirty && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orangeFpt-500 text-white transition hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          {shouldShowImage ? (
            <img
              src={profileData.avatar}
              alt="Profile"
              onError={() => setImageError(true)}
              className="h-32 w-32 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className={`h-32 w-32 rounded-full flex items-center justify-center text-2xl font-semibold ${colorClass}`}>
              {initials}
            </div>
          )}
          {canEdit && (
            <>
              <button
                type="button"
                onClick={triggerAvatarUpload}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Edit2 className="h-6 w-6" />
                )}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profileData.fullname || "—"}</h3>
          <p className="text-gray-600">{idLabel}: {profileData.code || "—"}</p>
          {isTeacher ? (
            <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 text-sm font-semibold text-orangeFpt-600 bg-orangeFpt-50 border border-orangeFpt-200 rounded-full">
              Lecturer
            </span>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-500">Major: {profileData.major || "—"}</p>
              <p className="mt-1 text-sm text-gray-500">School: {profileData.school || "—"}</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={profileData.fullname}
            disabled
            className={`w-full px-4 py-2 border rounded-lg transition ${readOnlyFieldClasses}`}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            disabled
            className={`w-full px-4 py-2 border rounded-lg transition ${readOnlyFieldClasses}`}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleInputChange}
            disabled={!canEdit}
            className={`w-full px-4 py-2 border rounded-lg transition ${appliedEditableClasses}`}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">School</label>
          <input
            type="text"
            name="school"
            value={profileData.school}
            disabled
            className={`w-full px-4 py-2 border rounded-lg transition ${readOnlyFieldClasses}`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            disabled={!canEdit}
            className={`w-full px-4 py-2 border rounded-lg transition ${appliedEditableClasses}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;