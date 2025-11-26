import { useState } from "react";
import { createAccount } from "../../services/userService";
import { toast } from "sonner";
import { Mail, Lock, UserCircle, Shield, Users } from "lucide-react";

const CreateAccountForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStaff, setIsStaff] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        onClose();
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
      className="w-full max-w-md space-y-6"
    >
      {/* Header */}
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <UserCircle size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create New Account</h2>
        <p className="text-sm text-gray-500 mt-2">Fill in the details below to create a new user account</p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Mail size={16} className="text-gray-500" />
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 font-medium"
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Lock size={16} className="text-gray-500" />
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 font-medium"
            placeholder="Enter secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
          />
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-1">Minimum 6 characters</p>
      </div>

      {/* Account Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Shield size={16} className="text-gray-500" />
          Account Type
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Staff Option */}
          <label
            className={`relative cursor-pointer transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
            <div className="p-4 border-2 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 transition-all duration-200 peer-checked:ring-4 peer-checked:ring-blue-100">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isStaff === true 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <Users size={24} />
                </div>
                <span className={`font-semibold text-sm transition-colors duration-200 ${
                  isStaff === true ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  Staff
                </span>
                <span className="text-xs text-gray-500 text-center">Regular user access</span>
              </div>
            </div>
          </label>

          {/* Head Department Option */}
          <label
            className={`relative cursor-pointer transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
            <div className="p-4 border-2 rounded-xl peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:border-purple-300 transition-all duration-200 peer-checked:ring-4 peer-checked:ring-purple-100">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isStaff === false 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <Shield size={24} />
                </div>
                <span className={`font-semibold text-sm transition-colors duration-200 ${
                  isStaff === false ? 'text-purple-700' : 'text-gray-600'
                }`}>
                  Head Dept
                </span>
                <span className="text-xs text-gray-500 text-center">Admin privileges</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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