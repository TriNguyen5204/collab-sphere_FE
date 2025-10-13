import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import AuthInput from '../../components/ui/AuthInput';
import logo from '../../assets/logov1.png';
import { login } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setUserRedux } from '../../store/slices/userSlice';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
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
      if (response?.userId) {
        dispatch(setUserRedux(response));
        Cookies.set('user', JSON.stringify(response), { expires: 7 });
        toast.success('Login successful!');
        navigate('/');
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
    <div className="relative min-h-screen overflow-hidden bg-[#f4f6ff]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_bottom,_rgba(99,102,241,0.22),_transparent_55%)]" />
      <div className="absolute -left-40 -top-24 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-sky-300/35 via-sky-200/20 to-transparent blur-3xl animate-[spin_48s_linear_infinite]" />
      <div className="absolute -right-32 -bottom-40 h-[34rem] w-[34rem] rounded-full bg-gradient-to-tr from-indigo-400/35 via-blue-200/18 to-transparent blur-3xl animate-[spin_65s_linear_infinite]" />
      <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[conic-gradient(at_20%_20%,rgba(14,165,233,0.35),rgba(99,102,241,0.18),rgba(14,165,233,0.35))] blur-2xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16 lg:px-10">
        <div className="w-full max-w-5xl">
          <div className="relative grid overflow-hidden rounded-[36px] border border-white/40 bg-white/82 shadow-[0_42px_96px_-40px_rgba(37,99,235,0.38)] backdrop-blur-2xl lg:grid-cols-[1.05fr_1fr]">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="absolute -left-24 top-24 hidden h-36 w-36 rounded-full bg-gradient-to-br from-sky-200/35 to-transparent blur-2xl lg:block" />
            <div className="absolute -right-20 bottom-16 hidden h-32 w-32 rounded-full bg-gradient-to-br from-indigo-200/35 to-transparent blur-2xl lg:block" />

            <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 px-12 py-12 text-white lg:flex">
              <div className="absolute inset-0 opacity-60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.18)_0%,transparent_40%,rgba(99,102,241,0.18)_75%,transparent_100%)]" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2 backdrop-blur-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <img src={logo} alt="CollabSphere" className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-blue-50/90 uppercase">CollabSphere OS</span>
                </div>
                <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">Orchestrate collaborative excellence in one space.</h2>
                <p className="mt-4 max-w-sm text-base text-blue-100/90">
                  Manage modules, monitor student progress, and keep every milestone aligned with academic goals.
                </p>
              </div>
              <ul className="relative mt-10 space-y-4">
                {[{
                  icon: SparklesIcon,
                  title: 'AI-assisted project planning',
                  desc: 'Generate milestones, checkpoints, and rubric-ready deliverables in seconds.'
                }, {
                  icon: ChartBarIcon,
                  title: 'Real-time performance insights',
                  desc: 'Visualize class momentum with adaptive dashboards and intervention signals.'
                }, {
                  icon: CheckBadgeIcon,
                  title: 'Seamless approvals & reviews',
                  desc: 'Coordinate lecturers and heads of department with guided workflows.'
                }].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white/90 backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-blue-50/95">{title}</p>
                      <p className="text-sm text-blue-100/80">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="relative">
              <div className="px-8 py-10 sm:px-10 lg:px-12 lg:py-12">
                <div className="mb-8 flex items-center justify-center gap-3 lg:justify-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50/90 via-white/60 to-indigo-50/80 text-indigo-600 shadow-inner shadow-blue-900/10">
                    <img src={logo} alt="CollabSphere" className="h-8 w-8" />
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Login</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
                    <p className="text-sm text-slate-500">Sign in with your institutional credentials</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7 lg:space-y-8">
                  <AuthInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={EnvelopeIcon}
                    error={errors.email}
                    variant="blue"
                    autoComplete="email"
                  />

                  <AuthInput
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    icon={LockClosedIcon}
                    error={errors.password}
                    variant="blue"
                    autoComplete="current-password"
                    rightElement={(
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100/70 via-white/40 to-sky-50/70 text-indigo-500 transition-all duration-200 hover:scale-105 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <label className="inline-flex items-center gap-2">
                      <span className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="h-4 w-4 cursor-pointer rounded-md border-2 border-slate-300 bg-white text-indigo-600 transition-all duration-200 focus:ring-0 focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        />
                      </span>
                      <span className="text-sm font-medium text-slate-600">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:brightness-110"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_26px_55px_-24px_rgba(79,70,229,0.6)] transition-all duration-300 hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_65%)]" />
                    <span className="relative flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign In</span>
                      )}
                    </span>
                  </button>

                  <div className="relative pt-8">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 shadow-sm">
                        OR
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-sm font-medium text-slate-600 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-slate-50/70 px-8 py-6 text-center lg:px-12 lg:py-7">
                <p className="text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:brightness-110"
                  >
                    Create one now
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-indigo-500 hover:text-indigo-600">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-indigo-500 hover:text-indigo-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
