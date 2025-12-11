import { useState } from "react";
import { createAccount } from "../../../services/userService";
import { toast } from "sonner";
import { Mail, Lock, UserCircle, Shield, Users } from "lucide-react";

const CreateAccountForm = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStaff, setIsStaff] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailShake, setEmailShake] = useState(false);
  const [passwordShake, setPasswordShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    let hasError = false;
    if (!email || !email.includes('@')) {
      setEmailError(true);
      setEmailShake(true);
      hasError = true;
      setTimeout(() => setEmailShake(false), 600);
    }
    if (!password || password.length < 5) {
      setPasswordError(true);
      setPasswordShake(true);
      hasError = true;
      setTimeout(() => setPasswordShake(false), 600);
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        isStaff,
      };

      const response = await createAccount(payload);

      if (response) {
        toast.success("Account created successfully!");
        // Reset form
        setEmail("");
        setPassword("");
        setIsStaff(true);
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-3"
    >
      {/* Header */}
      {/* <div className="text-center pb-4 border-b border-slate-200">
        <div className="w-16 h-16 bg-gradient-to-br from-orangeFpt-400 to-orangeFpt-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orangeFpt-500/30">
          <UserCircle size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Create New Account</h2>
        <p className="text-sm text-slate-600 mt-2">Fill in the details below to create a new user account</p>
      </div> */}

      {/* Account Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Shield size={16} className="text-slate-500" />
          Account Type
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Staff Option */}
          <label
            className={`relative cursor-pointer transition-all duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <input
              type="radio"
              name="role"
              value="staff"
              checked={isStaff === true}
              onChange={() => setIsStaff(true)}
              disabled={isLoading}
              className="sr-only peer"
            />
            <div className="p-4 border-2 rounded-xl peer-checked:border-orangeFpt-500 peer-checked:bg-orangeFpt-50 hover:border-orangeFpt-300 transition-all duration-200 peer-checked:ring-4 peer-checked:ring-orangeFpt-100">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isStaff === true
                    ? 'bg-orangeFpt-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                  }`}>
                  <Users size={24} />
                </div>
                <span className={`font-semibold text-sm transition-colors duration-200 ${isStaff === true ? 'text-orangeFpt-700' : 'text-slate-600'
                  }`}>
                  Staff
                </span>
              </div>
            </div>
          </label>

          {/* Head Department Option */}
          <label
            className={`relative cursor-pointer transition-all duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <input
              type="radio"
              name="role"
              value="head_department"
              checked={isStaff === false}
              onChange={() => setIsStaff(false)}
              disabled={isLoading}
              className="sr-only peer"
            />
            <div className="p-4 border-2 rounded-xl peer-checked:border-orangeFpt-500 peer-checked:bg-orangeFpt-50 hover:border-orangeFpt-300 transition-all duration-200 peer-checked:ring-4 peer-checked:ring-orangeFpt-100">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isStaff === false
                    ? 'bg-orangeFpt-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                  }`}>
                  <Shield size={24} />
                </div>
                <span className={`font-semibold text-sm transition-colors duration-200 ${isStaff === false ? 'text-orangeFpt-700' : 'text-slate-600'
                  }`}>
                  Head Dept
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Mail size={16} className="text-slate-500" />
          Email Address
        </label>
        <div className="relative">
          <input
            type="text"
            className={`w-full border-2 rounded-xl px-4 py-3 pl-11 outline-none transition-all duration-200 text-slate-800 font-medium ${emailError
                ? `border-red-500 ring-4 ring-red-100 ${emailShake ? 'animate-shake' : ''}`
                : 'border-slate-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
              }`}
            placeholder="example@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            disabled={isLoading}
          />
          <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${emailError ? 'text-red-500' : 'text-slate-400'}`} />
        </div>
        <div className="h-5">
          {emailError && (
            <p className="text-xs text-red-600 font-medium ml-1">
              Please enter a valid email address
            </p>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Lock size={16} className="text-slate-500" />
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            className={`w-full border-2 rounded-xl px-4 py-3 pl-11 outline-none transition-all duration-200 text-slate-800 font-medium ${passwordError
                ? `border-red-500 ring-4 ring-red-100 ${passwordShake ? 'animate-shake' : ''}`
                : 'border-slate-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
              }`}
            placeholder="Enter secure password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            disabled={isLoading}
          />
          <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${passwordError ? 'text-red-500' : 'text-slate-400'}`} />
        </div>
        <div className="h-5">
          {passwordError && (
            <p className="text-xs text-red-600 font-medium ml-1">
              Password must be at least 5 characters long
            </p>
          )}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200 border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 hover:from-orangeFpt-600 hover:to-orangeFpt-700 text-white rounded-xl font-semibold shadow-lg shadow-orangeFpt-500/30 hover:shadow-xl hover:shadow-orangeFpt-500/40 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateAccountForm;
