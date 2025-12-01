import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import logo from '../../assets/logov1.png';
import { login } from '../../services/authService';
import apiClient from '../../services/apiClient';
import { useDispatch, useSelector } from 'react-redux';
import { setUserRedux } from '../../store/slices/userSlice';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { getRoleLandingRoute } from '../../constants/roleRoutes';

const SpatialInput = ({ label, type, name, value, onChange, icon: Icon, error, rightElement }) => (
  <div className="group relative mb-6">
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-orangeFpt-500 text-sm font-semibold mb-1">
        {Icon && <Icon className="h-5 w-5 text-orangeFpt-500" />}
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`peer w-full bg-transparent py-3 pr-10 text-white border-b-2 border-orangeFpt-400 focus:border-orangeFpt-500 placeholder:text-orangeFpt-200/60 focus:outline-none`}
          placeholder={label}
        />
        {rightElement && <div className="absolute right-0">{rightElement}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roleName, accessToken } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roleName && accessToken) {
      const targetRoute = getRoleLandingRoute(roleName);
      navigate(targetRoute, { replace: true });
    }
  }, [roleName, accessToken, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 5) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login response:', response);
      if (response?.userId != null) {
        const normalizedUser = {
          ...response,
          userId: Number(response.userId),
        };

        dispatch(setUserRedux(normalizedUser));
        Cookies.set('user', JSON.stringify(normalizedUser), { expires: 7 });
        if (response.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
        }
        toast.success('Login successful!');
        const targetRoute = getRoleLandingRoute(response.roleName);
        navigate(targetRoute, { replace: true });
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Unable to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1207]">
      {/* Aurora Background (now orange themed) */}
      <div className="absolute inset-0">
        <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[70%] rounded-full bg-orangeFpt-400/40 blur-[120px] animate-[pulse_8s_infinite]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-orangeFpt-500/30 blur-[120px] animate-[pulse_10s_infinite]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[60%] w-[60%] rounded-full bg-orangeFpt-300/30 blur-[120px] animate-[pulse_12s_infinite]" />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-3">
        
        {/* Left Hero Section (2/3) */}
        <div className="relative hidden flex-col justify-center p-12 lg:col-span-2 lg:flex">
           {/* Giant Watermark */}
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <img src={logo} className="h-[800px] w-[800px] animate-[spin_60s_linear_infinite]" alt="" />
           </div>
           
           <div className="relative z-10 ml-12 max-w-2xl">
             <h1 className="text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
               Collaborate <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orangeFpt-400 to-orangeFpt-500">Beyond Limits</span>
             </h1>
            <p className="mt-6 text-xl text-orangeFpt-100/80 backdrop-blur-sm">
               The spatial workspace for modern academia.
             </p>
           </div>
        </div>

        {/* Right Login Pane (1/3) */}
        <div className="flex flex-col justify-center border-l border-orangeFpt-200/30 bg-white/10 backdrop-blur-[20px] p-8 shadow-2xl lg:p-12">
          
          {/* Floating Logo */}
           <div className="mb-12 flex justify-center lg:justify-start items-center gap-4">
             <div className="relative group">
               <div className="absolute inset-0 animate-pulse blur-xl bg-orangeFpt-400/30 rounded-full group-hover:bg-orangeFpt-500/50 transition-colors duration-500"></div>
               <img src={logo} alt="Logo" className="relative h-16 w-16 drop-shadow-2xl transform hover:scale-110 transition-transform duration-500" />
             </div>
             <span className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">CollabSphere</span>
           </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Welcome Back</h2>
            <p className="mt-2 text-orangeFpt-200/80">Enter your coordinates to access the sphere.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
             <SpatialInput 
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={EnvelopeIcon}
                error={errors.email}
             />
             <SpatialInput 
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                icon={LockClosedIcon}
                error={errors.password}
                rightElement={(
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-orangeFpt-300/50 hover:text-orangeFpt-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
             />
             
             {/* Remember Me & Forgot Password */}
             <div className="flex items-center justify-between text-sm mb-8 mt-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/30 bg-transparent transition-all checked:border-orangeFpt-400 checked:bg-orangeFpt-400 hover:border-orangeFpt-300"
                    />
                    <CheckBadgeIcon className="pointer-events-none absolute h-3 w-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" />
                  </div>
                  <span className="text-orangeFpt-100/60 group-hover:text-orangeFpt-100 transition-colors">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-semibold text-orangeFpt-400 hover:text-orangeFpt-300 hover:drop-shadow-[0_0_5px_rgba(234,121,45,0.5)] transition-all"
                >
                  Forgot password?
                </Link>
             </div>

             {/* Crystal Button */}
             <button
               type="submit"
               disabled={isLoading}
               className="group relative w-full overflow-hidden rounded-xl border border-orangeFpt-400/40 bg-orangeFpt-500/10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[inset_0_0_20px_rgba(255,140,0,0.1)] backdrop-blur-md transition-all hover:bg-orangeFpt-400/20 hover:shadow-[0_0_30px_rgba(234,121,45,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <span className="relative z-10 flex items-center justify-center gap-2">
                 {isLoading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating...</span>
                    </>
                 ) : (
                    'Sign In'
                 )}
               </span>
               {/* Shine effect */}
               {!isLoading && (
                 <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-orangeFpt-200/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
               )}
             </button>
          </form>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-orangeFpt-200/60">
              New to the sphere?{' '}
              <Link
                to="/register"
                className="font-bold text-orangeFpt-400 hover:text-orangeFpt-500 hover:underline decoration-orangeFpt-400/50 underline-offset-4 transition-all"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Inline styles for custom animations if not in tailwind config */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
