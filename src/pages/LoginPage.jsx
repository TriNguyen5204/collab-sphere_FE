import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
// Import icons from react-icons
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple, FaTwitter, FaGithub } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";

export default function ImprovedLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!email.includes('@')) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setLoginAttempts(prev => prev + 1);
    console.log("Login attempted with:", { email, password, rememberMe });
  };

  const isFormValid = email.includes('@') && password.length >= 6;

  const socialProviders = [
    {
      name: "Google",
      icon: <FcGoogle className="w-5 h-5" />,
      color: "hover:bg-gray-50/10 border-gray-300/30"
    },
    {
      name: "Facebook",
      icon: <FaFacebook className="w-5 h-5 text-[#1877F2]" />,
      color: "hover:bg-blue-50/10 border-blue-300/30"
    },
    {
      name: "Apple",
      icon: <FaApple className="w-5 h-5 text-white" />,
      color: "hover:bg-gray-50/10 border-gray-300/30"
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="w-5 h-5 text-[#1DA1F2]" />,
      color: "hover:bg-blue-50/10 border-blue-300/30"
    },
    {
      name: "GitHub",
      icon: <FaGithub className="w-5 h-5 text-white" />,
      color: "hover:bg-gray-50/10 border-gray-300/30"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-bounce"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-blue-300/30 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-purple-300/40 rounded-full animate-bounce delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 relative">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl"></div>
          
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-100">Sign in to continue to your account</p>
            {loginAttempts > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-300">
                <CheckCircle className="w-4 h-4" />
                Previous login: {loginAttempts} attempt{loginAttempts > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="space-y-6 relative z-10">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-400 bg-red-500/10' : 'border-white/20'
                  }`}
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-400 bg-red-500/10' : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-blue-100">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-300 hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-blue-200">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 relative z-10">
            {/* Main social providers */}
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.slice(0, 2).map((provider) => (
                <button
                  key={provider.name}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200 bg-white/5 backdrop-blur-sm text-white ${provider.color}`}
                >
                  {provider.icon}
                  <span className="font-medium text-sm">{provider.name}</span>
                </button>
              ))}
            </div>
            
            {/* Secondary providers */}
            <div className="grid grid-cols-3 gap-2">
              {socialProviders.slice(2, 5).map((provider) => (
                <button
                  key={provider.name}
                  className={`flex items-center justify-center gap-1 py-2.5 px-3 rounded-lg border transition-all duration-200 bg-white/5 backdrop-blur-sm text-white ${provider.color}`}
                  title={`Continue with ${provider.name}`}
                >
                  {provider.icon}
                  <span className="font-medium text-xs hidden sm:inline">{provider.name}</span>
                </button>
              ))}
            </div>

            {/* Additional providers */}
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.slice(5).map((provider) => (
                <button
                  key={provider.name}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border transition-all duration-200 bg-white/5 backdrop-blur-sm text-white ${provider.color}`}
                >
                  {provider.icon}
                  <span className="font-medium text-sm">{provider.name}</span>
                </button>
              ))}
            </div>
            
            {/* Phone option */}
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border transition-all duration-200 bg-white/5 backdrop-blur-sm text-white hover:bg-green-50/10 border-green-300/30">
              <Smartphone className="w-5 h-5 text-green-400" />
              <span className="font-medium">Continue with Phone</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8 relative z-10">
            <p className="text-blue-100">
              Don't have an account?{' '}
              <a href="#" className="font-semibold text-blue-300 hover:text-white transition-colors">
                Sign up here
              </a>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-400/20 relative z-10">
            <p className="text-xs text-blue-200 text-center">
              🔒 Your connection is secure and encrypted
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="text-xs text-blue-200">Need help?</span>
            <a href="#" className="text-xs text-blue-300 hover:text-white transition-colors">Support</a>
            <span className="text-blue-300">|</span>
            <a href="#" className="text-xs text-blue-300 hover:text-white transition-colors">Privacy</a>
            <span className="text-blue-300">|</span>
            <a href="#" className="text-xs text-blue-300 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}