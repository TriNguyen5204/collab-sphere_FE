import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  KeyIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { Mail, KeyRound, Loader2 } from 'lucide-react';
import AuthInput from '../../components/ui/AuthInput';
import logo from '../../assets/logov1.png';
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
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#fdf2ff]'>
      <div className='absolute inset-0 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50' />
      <div className='absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(192,38,211,0.22),_transparent_60%)]' />
      <div className='absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.25),_transparent_55%)]' />
      <div className='absolute -left-32 -top-28 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-fuchsia-300/35 via-pink-200/25 to-transparent blur-3xl animate-[spin_48s_linear_infinite]' />
      <div className='absolute -right-36 -bottom-40 h-[36rem] w-[36rem] rounded-full bg-gradient-to-tr from-purple-400/35 via-fuchsia-200/20 to-transparent blur-3xl animate-[spin_70s_linear_infinite]' />
      <div className='absolute inset-0 pointer-events-none opacity-35 [mask-image:radial-gradient(circle_at_center,white,transparent_72%)]'>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(236,72,153,0.08)_1px,transparent_1px)] bg-[size:56px_56px]' />
        <div className='absolute inset-0 bg-[linear-gradient(to_bottom,rgba(192,38,211,0.08)_1px,transparent_1px)] bg-[size:56px_56px]' />
      </div>
      <div className='absolute inset-0 pointer-events-none opacity-30 bg-[conic-gradient(at_30%_30%,rgba(236,72,153,0.35),rgba(147,51,234,0.2),rgba(236,72,153,0.35))] blur-2xl' />

      <div className='relative z-10 flex min-h-screen items-center justify-center px-6 py-16 lg:px-10'>
        <div className='w-full max-w-5xl'>
          <div className='relative grid overflow-hidden rounded-[36px] border border-white/40 bg-white/82 shadow-[0_44px_100px_-42px_rgba(190,24,93,0.38)] backdrop-blur-2xl lg:grid-cols-[1.05fr_1fr]'>
            <div className='absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent' />
            <div className='absolute -left-24 top-24 hidden h-36 w-36 rounded-full bg-gradient-to-br from-fuchsia-200/35 to-transparent blur-2xl lg:block' />
            <div className='absolute -right-24 bottom-16 hidden h-32 w-32 rounded-full bg-gradient-to-br from-purple-200/35 to-transparent blur-2xl lg:block' />

            <aside className='relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-fuchsia-600 via-purple-600 to-pink-600 px-12 py-12 text-white lg:flex'>
              <div className='absolute inset-0 opacity-60'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),transparent_70%)]' />
                <div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(236,72,153,0.18)_0%,transparent_45%,rgba(147,51,234,0.2)_80%,transparent_100%)]' />
              </div>
              <div className='relative'>
                <div className='inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2 backdrop-blur-xl'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20'>
                    <img src={logo} alt='CollabSphere' className='h-8 w-8' />
                  </div>
                  <span className='text-sm font-semibold tracking-wide text-pink-50/90 uppercase'>
                    Empower learning
                  </span>
                </div>
                <h2 className='mt-8 text-4xl font-semibold leading-tight tracking-tight'>
                  Shape collaborative cohorts with confidence.
                </h2>
                <p className='mt-4 max-w-sm text-base text-pink-100/90'>
                  Create lecturer and student accounts, distribute projects, and
                  automate onboarding in minutes.
                </p>
              </div>
              <ul className='relative mt-10 space-y-4'>
                {[
                  {
                    icon: AcademicCapIcon,
                    title: 'Curriculum-aligned projects',
                    desc: 'Map objectives to learning outcomes and maintain accreditation readiness.',
                  },
                  {
                    icon: UsersIcon,
                    title: 'Dynamic team formation',
                    desc: 'Balance skills, roles, and availability with intelligent grouping suggestions.',
                  },
                  {
                    icon: ArrowTrendingUpIcon,
                    title: 'Progressive analytics',
                    desc: 'Track momentum and flag interventions before deadlines slip.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className='flex gap-4'>
                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white/90 backdrop-blur-sm'>
                      <Icon className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-sm font-semibold text-pink-50/95'>
                        {title}
                      </p>
                      <p className='text-sm text-pink-100/80'>{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
            <div className='relative'>
              <div className='px-8 py-10 sm:px-10 lg:px-12 lg:py-12'>
                <div className='mb-8 flex items-center justify-center gap-3 lg:justify-start'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-50/90 via-white/60 to-pink-50/80 text-purple-600 shadow-inner shadow-fuchsia-900/10'>
                    <img src={logo} alt='CollabSphere' className='h-8 w-8' />
                  </div>
                  <div className='text-center lg:text-left'>
                    <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-400'>
                      {step === 1 ? 'Verify your email' : 'Register'}
                    </p>
                    <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
                      {step === 1
                        ? 'Enter your email to recieve OTP code'
                        : 'Create your account'}
                    </h1>
                    <p className='text-sm text-slate-500'>
                      Unlock collaborative tooling for your cohort
                    </p>
                  </div>
                </div>
                {step === 1 ? (
                  <div className='mt-4'>
                    <label
                      htmlFor='email'
                      className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'
                    >
                      <Mail className='w-4 h-4 text-blue-600' />
                      Email Address
                    </label>
                    <div className='relative'>
                      <input
                        id='email'
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400'
                        placeholder='example@email.com'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => handleOtp(formData.email)}
                      disabled={isSendingOtp} // trạng thái loading
                      className={`w-full mt-3 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200
                      ${
                        isSendingOtp
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                      } text-white shadow-md`}
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className='w-5 h-5 animate-spin' />
                          Sending...
                        </>
                      ) : (
                        <>
                          <KeyRound className='w-5 h-5' />
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className='space-y-7 lg:space-y-8'
                  >
                    <AuthInput
                      label='OTP'
                      name='otpCode'
                      type='text'
                      value={formData.otpCode}
                      onChange={handleChange}
                      icon={KeyIcon}
                      error={errors.otpCode}
                      variant='purple'
                      autoComplete='OTP'
                    />
                    <AuthInput
                      label='Full Name'
                      name='fullName'
                      type='text'
                      value={formData.fullName}
                      onChange={handleChange}
                      icon={UserIcon}
                      error={errors.fullName}
                      variant='purple'
                      autoComplete='name'
                    />

                    <AuthInput
                      label='Email Address'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleChange}
                      icon={EnvelopeIcon}
                      error={errors.email}
                      variant='purple'
                      autoComplete='email'
                      disabled
                    />

                    <AuthInput
                      label='Password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      icon={LockClosedIcon}
                      error={errors.password}
                      variant='purple'
                      autoComplete='new-password'
                      rightElement={
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-50/70 via-white/40 to-pink-50/70 text-purple-500 transition-all duration-200 hover:scale-105 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        >
                          {showPassword ? (
                            <EyeSlashIcon className='h-5 w-5' />
                          ) : (
                            <EyeIcon className='h-5 w-5' />
                          )}
                        </button>
                      }
                    >
                      {formData.password && (
                        <div className='space-y-2'>
                          <div className='flex gap-1'>
                            {[1, 2, 3, 4].map(level => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  level <= passwordStrength
                                    ? getPasswordStrengthColor()
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs font-medium ${
                              passwordStrength >= 3
                                ? 'text-emerald-600'
                                : 'text-slate-500'
                            }`}
                          >
                            Password strength: {getPasswordStrengthText()}
                          </p>
                        </div>
                      )}
                    </AuthInput>

                    <AuthInput
                      label='Confirm Password'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      icon={LockClosedIcon}
                      error={errors.confirmPassword}
                      variant='purple'
                      autoComplete='new-password'
                      rightElement={
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-50/70 via-white/40 to-pink-50/70 text-purple-500 transition-all duration-200 hover:scale-105 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className='h-5 w-5' />
                          ) : (
                            <EyeIcon className='h-5 w-5' />
                          )}
                        </button>
                      }
                    >
                      {formData.confirmPassword &&
                        formData.password === formData.confirmPassword && (
                          <div className='flex items-center text-xs font-medium text-emerald-600'>
                            <CheckCircleIcon className='mr-1 h-4 w-4' />
                            Passwords match
                          </div>
                        )}
                    </AuthInput>
                    <AuthInput
                      label='Address'
                      name='address'
                      type='text'
                      value={formData.address}
                      onChange={handleChange}
                      icon={MapPinIcon}
                      error={errors.address}
                      variant='purple'
                      autoComplete='Address'
                    />
                    <AuthInput
                      label='Phone number'
                      name='phoneNumber'
                      type='number'
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      icon={PhoneIcon}
                      error={errors.phoneNumber}
                      variant='purple'
                      autoComplete='Phone number'
                    />
                    <AuthInput
                      label='Year of birth'
                      name='yob'
                      type='number'
                      value={formData.yob}
                      onChange={handleChange}
                      icon={CalendarIcon}
                      error={errors.yob}
                      variant='purple'
                      autoComplete='Year of birth'
                    />
                    <AuthInput
                      label='School'
                      name='school'
                      type='text'
                      value={formData.school}
                      onChange={handleChange}
                      icon={BuildingLibraryIcon}
                      error={errors.school}
                      variant='purple'
                      autoComplete='School'
                    />
                    <AuthInput
                      label='Student code'
                      name='studentCode'
                      type='text'
                      value={formData.studentCode}
                      onChange={handleChange}
                      icon={IdentificationIcon}
                      error={errors.studentCode}
                      variant='purple'
                      autoComplete='Student code'
                    />
                    <AuthInput
                      label='Major'
                      name='major'
                      type='text'
                      value={formData.major}
                      onChange={handleChange}
                      icon={AcademicCapIcon}
                      error={errors.major}
                      variant='purple'
                      autoComplete='Major'
                    />

                    {/* <div>
                      <label className='flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-fuchsia-200/60 hover:bg-white/60'>
                        <input
                          type='checkbox'
                          name='agreeToTerms'
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          className='mt-1 h-4 w-4 cursor-pointer rounded-md border-2 border-fuchsia-300 bg-white text-fuchsia-600 transition-all duration-200 focus:ring-0 focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        />
                        <span className='text-sm text-slate-600'>
                          I agree to the{' '}
                          <Link
                            to='/terms'
                            className='font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600'
                          >
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link
                            to='/privacy'
                            className='font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600'
                          >
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className='mt-2 text-sm text-rose-500'>
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div> */}

                    <button
                      type='submit'
                      disabled={isLoading}
                      className='group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_26px_55px_-24px_rgba(192,38,211,0.55)] transition-all duration-300 hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      <span className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_65%)]' />
                      <span className='relative flex items-center gap-2'>
                        {isLoading ? (
                          <>
                            <svg
                              className='h-5 w-5 animate-spin text-white'
                              fill='none'
                              viewBox='0 0 24 24'
                            >
                              <circle
                                className='opacity-30'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                              />
                              <path
                                className='opacity-80'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              />
                            </svg>
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <span>Create Account</span>
                        )}
                      </span>
                    </button>

                    <div className='relative pt-8'>
                      <div className='absolute inset-0 flex items-center'>
                        <span className='w-full border-t border-slate-200' />
                      </div>
                      <div className='relative flex justify-center'>
                        <span className='rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 shadow-sm'>
                          OR
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <button
                        type='button'
                        className='group flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3.5 text-sm font-medium text-slate-600 shadow-[0_14px_32px_-24px_rgba(76,29,149,0.35)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                      >
                        <svg className='h-5 w-5' viewBox='0 0 24 24'>
                          <path
                            fill='#4285F4'
                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                          />
                          <path
                            fill='#34A853'
                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                          />
                          <path
                            fill='#FBBC05'
                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                          />
                          <path
                            fill='#EA4335'
                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                          />
                        </svg>
                        Google
                      </button>
                      <button
                        type='button'
                        className='group flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-[0_14px_32px_-24px_rgba(76,29,149,0.35)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                      >
                        <svg
                          className='h-5 w-5'
                          fill='#1877F2'
                          viewBox='0 0 24 24'
                        >
                          <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className='bg-slate-50/70 px-8 py-6 text-center lg:px-12 lg:py-7'>
                <p className='text-sm text-slate-600'>
                  Already have an account?{' '}
                  <Link
                    to='/login'
                    className='font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 hover:brightness-110'
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
