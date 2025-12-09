import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Camera, Phone, MapPin, Upload } from "lucide-react";
import { useAvatar } from "../../../hooks/useAvatar";

const ProfileInformation = ({ user, avatar, onUpdateProfile, isSaving, onUploadAvatar, isUploadingAvatar, readOnly }) => {
  const fileInputRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

  const resolvedFullname = useMemo(() => user?.fullname || user?.fullName || "", [user]);
  const computeInitialState = useCallback(() => ({
    fullname: resolvedFullname,
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    address: user?.address || "",
    avatar,
    code: user?.code || "",
    major: user?.major || "",
    school: user?.school || "",
  }), [avatar, resolvedFullname, user]);

  const [profileData, setProfileData] = useState(computeInitialState);
  useEffect(() => { setProfileData(prev => ({ ...prev, ...computeInitialState() })); }, [computeInitialState]);
  
  const initialEditable = useMemo(() => ({ phone: user?.phoneNumber || "", address: user?.address || "" }), [user]);
  const isDirty = useMemo(() => (profileData.phone !== initialEditable.phone || profileData.address !== initialEditable.address), [profileData, initialEditable]);
  const canEdit = !readOnly;

  const handleInputChange = (event) => {
    if (!canEdit) return;
    const { name, value } = event.target;

    if (name === "phone") {
      if (!/^[0-9]*$/.test(value)) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500); 
        return;
      }
    }
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
      if(onUpdateProfile) await onUpdateProfile({ phoneNumber: profileData.phone, address: profileData.address });
  };
  
  const handleCancel = () => {
    setProfileData(prev => ({ ...prev, phone: initialEditable.phone, address: initialEditable.address }));
  };

  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(profileData.fullname, profileData.avatar);
  const triggerAvatarUpload = () => { if (!isUploadingAvatar && canEdit) fileInputRef.current?.click(); };
  const handleAvatarChange = async (e) => {
      if(e.target.files?.[0]) await onUploadAvatar(e.target.files[0]);
      e.target.value = "";
  };

  const glassCard = "w-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl rounded-3xl p-8";
  const glassInputReadOnly = "w-full bg-white/30 border border-white/20 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed font-medium shadow-inner";
  const glassInputEditable = "w-full bg-white/80 border border-white/60 text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orangeFpt-400 focus:bg-white transition-all shadow-sm font-semibold placeholder-gray-400";
  const labelStyle = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className={glassCard}>
      <style>{`
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; border-color: #ef4444 !important; background-color: #fef2f2 !important; }
      `}</style>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-gray-200/50">
        <div className="relative group">
            <div className={`w-40 h-40 rounded-full ring-4 ring-white/50 shadow-lg flex items-center justify-center overflow-hidden ${shouldShowImage ? '' : colorClass}`}>
                {shouldShowImage ? (
                    <img src={profileData.avatar} onError={() => setImageError(true)} className="w-full h-full object-cover" alt="Avatar" />
                ) : ( <span className="text-3xl font-bold text-white">{initials}</span> )}
            </div>
            {canEdit && (
                <button onClick={triggerAvatarUpload} className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
                     {isUploadingAvatar ? <Loader2 className="animate-spin text-white" /> : <Upload size={16} className="text-white"/>}
                </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>
        <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 p-1">{profileData.fullname}</h2>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="p-1 bg-white/50 rounded-lg text-sm font-medium text-gray-600 border border-white/40 shadow-sm">{profileData.code}</span>
                <span className="p-1 bg-orangeFpt-50 rounded-lg text-sm font-bold text-orangeFpt-600 border border-orangeFpt-100 shadow-sm">
                    {user?.isTeacher ? "Lecturer" : "Student"}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Read Only Fields */}
        <div><label className={labelStyle}>Full Name</label><input value={profileData.fullname} disabled className={glassInputReadOnly} /></div>
        <div><label className={labelStyle}>Email</label><input value={profileData.email} disabled className={glassInputReadOnly} /></div>
        <div><label className={labelStyle}>School</label><input value={profileData.school} disabled className={glassInputReadOnly} /></div>
        <div><label className={labelStyle}>Major</label><input value={profileData.major} disabled className={glassInputReadOnly} /></div>
        
        {/* Editable Fields Section Header */}
        <div className="md:col-span-2 lg:col-span-4 pt-4">
             <div className="flex items-center gap-2 mb-2">
                 <div className="h-px flex-1 bg-gray-200/50"></div>
                 <span className="text-xs font-bold text-orangeFpt-500 bg-orangeFpt-50 px-2 py-1 rounded">EDITABLE INFO</span>
                 <div className="h-px flex-1 bg-gray-200/50"></div>
             </div>
        </div>

        {/* PHONE NUMBER */}
        <div className="relative lg:col-span-2">
            <label className={`${labelStyle} text-orangeFpt-600`}>Phone Number</label>
            <div className="relative">
                <input
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    placeholder="Enter phone number"
                    className={`${glassInputEditable} ${isShaking ? 'animate-shake text-red-500 ring-2 ring-red-200' : ''}`}
                />
                <Phone className={`absolute right-4 top-3 w-5 h-5 ${isShaking ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            {isShaking && <span className="absolute -bottom-5 left-0 text-xs text-red-500 font-bold animate-pulse">Numbers only!</span>}
        </div>

        {/* ADDRESS */}
        <div className="lg:col-span-2">
            <label className={`${labelStyle} text-orangeFpt-600`}>Address</label>
            <div className="relative">
                <input 
                name="address" 
                value={profileData.address} 
                onChange={handleInputChange} 
                disabled={!canEdit} 
                className={glassInputEditable} 
                placeholder="Enter your address"
                />
                <MapPin className="absolute right-4 top-3 w-5 h-5 text-gray-400" />
            </div>
        </div>
      </div>

      {canEdit && isDirty && (
         <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200/50">
            <button onClick={handleCancel} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-white/50 transition font-medium">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="px-8 py-2 bg-orangeFpt-500 text-white rounded-xl shadow-lg shadow-orangeFpt-500/40 hover:bg-orangeFpt-600 transition font-bold flex items-center gap-2">
                {isSaving && <Loader2 className="animate-spin w-4 h-4" />} Save
            </button>
         </div>
      )}
    </div>
  );
};

export default ProfileInformation;