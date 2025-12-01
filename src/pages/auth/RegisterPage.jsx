import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  IdentificationIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { KeyRound, Loader2, Sparkles } from 'lucide-react';
import { sendOtp, register } from '../../services/authService';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    otpCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    address: '',
    phoneNumber: '',
    yob: 0,
    school: '',
    studentCode: '',
    major: '',
  });
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const checkPasswordStrength = password => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.otpCode) {
      newErrors.otpCode = 'OTP code is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.address) {
      newErrors.address = 'Please enter your address';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber =
        'Phone number must start with 0 and have exactly 10 digits';
    }
    if (!formData.yob) {
      newErrors.yob = 'Year of birth is required';
    }
    if (!formData.school) {
      newErrors.school = 'School is required';
    }
    if (!formData.studentCode) {
      newErrors.studentCode = 'Student code is required';
    }
    if (!formData.major) {
      newErrors.major = 'Major is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleOtp = async email => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      setIsSendingOtp(true);
      const response = await sendOtp(email);
      if (response) {
        toast.success('OTP has been sent to your email');
        setStep(2);
      } else {
        toast.error('Failed to send OTP');
      }
    } catch (error) {
      toast.error('An error occurred while sending OTP');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const response = await register(formData);
    if (response.item1 === true) {
      toast.success('Register successfully');
      navigate('/login');
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  // Custom Input Component for the Glass Theme
  const GlassInput = ({ label, error, icon: Icon, rightElement, ...props }) => (
    <div className="group relative mb-6">
      <div className="relative">
        {Icon && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-orange-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-transparent border-b-2 py-3 text-white placeholder-white/30 transition-all focus:outline-none focus:border-orange-400 focus:shadow-[0_10px_20px_-10px_rgba(249,115,22,0.3)] ${
            Icon ? 'pl-8' : ''
          } ${
            error ? 'border-rose-400' : 'border-white/20'
          } ${props.className || ''}`}
        />
        {rightElement && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {label && (
        <label className="absolute -top-5 left-0 text-xs font-medium text-orange-200/80 uppercase tracking-wider">
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a0b05] text-white selection:bg-orange-500/30">
      {/* Atmospheric Aurora Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#4a1d08_0%,_#1a0b05_100%)]" />
      
      {/* Floating 3D Spheres / Parallax Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-orange-600/30 to-red-600/30 blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-600/20 blur-3xl"
      />
      
      {/* Abstract Learning Icons (Simulated with shapes for now) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 opacity-20"
      >
        <div className="h-20 w-20 border-4 border-white/10 rounded-xl transform rotate-45" />
      </motion.div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        {/* Glass Panel HUD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          {/* Glowing Timeline Step Indicator */}
          <div className="relative h-1 w-full bg-white/10">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              className="absolute left-0 top-0 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
            />
          </div>

          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="mb-10 text-center">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                {step === 1 ? 'Verify your email' : 'Complete Profile'}
              </motion.h1>
              <p className="mt-2 text-white/60">
                {step === 1 
                  ? 'Enter your email to begin the journey' 
                  : 'Tell us a bit more about yourself'}
              </p>
            </div>

            {step === 1 ? (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-8"
              >
                <GlassInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@university.edu"
                  error={errors.email}
                  autoComplete="email"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => handleOtp(formData.email)}
                  disabled={isSendingOtp}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-600 p-[1px] transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] disabled:opacity-70"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-xl bg-[#1a0b05]/80 px-4 py-3.5 transition-all group-hover:bg-transparent">
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        <span className="font-semibold text-white">Sending...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-white">Send OTP Code</span>
                        <Sparkles className="h-4 w-4 text-orange-300" />
                      </>
                    )}
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <GlassInput
                    label="OTP Code"
                    name="otpCode"
                    value={formData.otpCode}
                    onChange={handleChange}
                    error={errors.otpCode}
                    icon={KeyRound}
                  />
                  <GlassInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    icon={UserIcon}
                  />
                </div>

                <GlassInput
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <GlassInput
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    icon={LockClosedIcon}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/50 hover:text-white"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    }
                  />
                  <GlassInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    icon={LockClosedIcon}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-white/50 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    }
                  />
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2 -mt-4 mb-4">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-colors ${
                            level <= passwordStrength ? getPasswordStrengthColor() : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${passwordStrength >= 3 ? 'text-emerald-400' : 'text-white/50'}`}>
                      Strength: {getPasswordStrengthText()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <GlassInput
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    icon={MapPinIcon}
                  />
                  <GlassInput
                    label="Phone"
                    name="phoneNumber"
                    type="number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber}
                    icon={PhoneIcon}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <GlassInput
                    label="Year of Birth"
                    name="yob"
                    type="number"
                    value={formData.yob}
                    onChange={handleChange}
                    error={errors.yob}
                    icon={CalendarIcon}
                  />
                  <GlassInput
                    label="School"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    error={errors.school}
                    icon={BuildingLibraryIcon}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <GlassInput
                    label="Student Code"
                    name="studentCode"
                    value={formData.studentCode}
                    onChange={handleChange}
                    error={errors.studentCode}
                    icon={IdentificationIcon}
                  />
                  <GlassInput
                    label="Major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    error={errors.major}
                    icon={AcademicCapIcon}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-600 p-[1px] transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] disabled:opacity-70"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-xl bg-[#1a0b05]/80 px-4 py-3.5 transition-all group-hover:bg-transparent">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        <span className="font-semibold text-white">Creating Account...</span>
                      </>
                    ) : (
                      <span className="font-semibold text-white">Create Account</span>
                    )}
                  </div>
                </button>
              </motion.form>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
