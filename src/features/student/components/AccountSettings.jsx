import React, { useMemo, useState } from "react";
import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

const AccountSettings = ({ onChangePassword, isSaving }) => {
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [data, setData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleData = (e) => setData({ ...data, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });
  
  const handleSubmit = async () => {
    if (data.newPassword !== data.confirmPassword) return toast.error("Passwords do not match.");
    try {
      if(onChangePassword) await onChangePassword({ oldPassword: data.currentPassword, newPassword: data.newPassword, confirmNewPassword: data.confirmPassword });
      setData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {}
  };

  const isDirty = useMemo(() => Object.values(data).some(v => v !== ""), [data]);
  const isValid = useMemo(() => data.currentPassword && data.newPassword && data.confirmPassword && data.newPassword === data.confirmPassword, [data]);

  // STYLES
  // Changed: Removed max-w-2xl, added w-full
  const glassCard = "w-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl rounded-3xl p-8";
  const glassInput = "w-full bg-white/80 border border-white/60 text-gray-900 rounded-xl pl-10 pr-12 py-3 focus:ring-2 focus:ring-orangeFpt-400 focus:bg-white transition-all shadow-sm outline-none";

  const renderInput = (label, name, key, placeholder) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type={show[key] ? "text" : "password"}
                name={name}
                value={data[name]}
                onChange={handleData}
                placeholder={placeholder}
                className={glassInput}
            />
            <button type="button" onClick={() => toggleShow(key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orangeFpt-500 transition">
                {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
  );

  return (
    <div className={glassCard}>
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200/50">
        <div className="w-12 h-12 rounded-2xl bg-orangeFpt-100 flex items-center justify-center text-orangeFpt-600 shadow-inner">
            <KeyRound size={24} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
            <p className="text-sm text-gray-500">Ensure your account is using a long, random password.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Current Password */}
        <div className="lg:border-r lg:border-gray-200/50 lg:pr-8">
            {renderInput("Current Password", "currentPassword", "current", "••••••••")}
        </div>

        {/* Right Col: New Passwords */}
        <div className="space-y-5">
            {renderInput("New Password", "newPassword", "new", "New Password")}
            {renderInput("Confirm Password", "confirmPassword", "confirm", "Confirm Password")}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200/50">
        <button
            onClick={() => setData({ currentPassword: "", newPassword: "", confirmPassword: "" })}
            disabled={!isDirty || isSaving}
            className="px-6 py-2 rounded-xl text-gray-600 hover:bg-white/50 transition font-medium disabled:opacity-50"
        >
            Clear
        </button>
        <button
            onClick={handleSubmit}
            disabled={!isValid || isSaving}
            className="px-8 py-2 bg-orangeFpt-500 text-white rounded-xl shadow-lg shadow-orangeFpt-500/40 hover:bg-orangeFpt-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;