import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../../../services/userService';
import {
  putUpdateUserProfile,
  postUploadUserAvatar,
} from '../../../services/studentApi';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Hash, Building2, BookOpen, Upload, Save, X } from 'lucide-react';

const EditAccountForm = ({ id, onClose }) => {
  const [form, setForm] = useState({
    userId: id,
    email: '',
    fullName: '',
    address: '',
    phoneNumber: '',
    yob: '',
    avatarImg: '',
    school: '',
    code: '',
    major: '',
    isTeacher: false,
    isActive: true,
  });
  const [avatarForm, setAvatarForm] = useState({
    imageFile: '',
    userId: id,
    isTeacher: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarImg, setAvartarImg] = useState('');
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Phone must start with 0 and have 10-11 digits
    const phoneRegex = /^0\d{9,10}$/;
    return phoneRegex.test(phone);
  };

  const validateYob = (yob) => {
    const currentYear = new Date().getFullYear();
    const year = parseInt(yob);
    // Must be between 1940 and current year - 10 (at least 10 years old)
    return year >= 1940 && year <= currentYear - 10;
  };

  const validateForm = () => {
    const newErrors = {};
    const newShakes = {};

    // Full Name validation
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      newShakes.fullName = true;
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
      newShakes.fullName = true;
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      newShakes.email = true;
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
      newShakes.email = true;
    }

    // Phone validation
    if (form.phoneNumber) {
      if (!/^\d+$/.test(form.phoneNumber)) {
        newErrors.phoneNumber = 'Phone number must contain only numbers';
        newShakes.phoneNumber = true;
      } else if (!validatePhone(form.phoneNumber)) {
        newErrors.phoneNumber = 'Phone must start with 0 and have 10-11 digits';
        newShakes.phoneNumber = true;
      }
    }

    // Year of birth validation
    if (form.yob) {
      if (!validateYob(form.yob)) {
        const currentYear = new Date().getFullYear();
        newErrors.yob = `Year must be between 1940 and ${currentYear - 10}`;
        newShakes.yob = true;
      }
    }

    // Code validation
    if (!form.code.trim()) {
      newErrors.code = 'Student/Lecturer code is required';
      newShakes.code = true;
    }

    setErrors(newErrors);
    setShakeFields(newShakes);

    // Reset shake after animation
    if (Object.keys(newShakes).length > 0) {
      setTimeout(() => setShakeFields({}), 600);
    }

    return Object.keys(newErrors).length === 0;
  };

  // Load user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserProfile(id);
        if (res?.user) {
          setForm({
            userId: id,
            email: res.user.email || '',
            fullName: res.user.fullname || '',
            address: res.user.address || '',
            phoneNumber: res.user.phoneNumber || '',
            yob: res.user.yob || '',
            school: res.user.school || '',
            code: res.user.code || '',
            major: res.user.major || '',
            isTeacher: res.user.isTeacher || false,
            isActive: true,
          });
          setAvartarImg(res.user.avatarImg || '');
        }
      } catch (err) {
        console.error(err);
        setMessage('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUploadAvatar = async () => {
    if (!avatarForm.imageFile) return;

    const formData = new FormData();
    formData.append('imageFile', avatarForm.imageFile);
    formData.append('userId', id);
    formData.append('isTeacher', avatarForm.isTeacher);

    try {
      const res = await postUploadUserAvatar(formData);
      if (res?.imageUrl) {
        setAvartarImg(res.imageUrl);
        setMessage('Avatar updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload avatar!');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setMessage('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (avatarForm.imageFile) {
        await handleUploadAvatar();
      }
      const payload = { ...form };
      const response = await putUpdateUserProfile(id, payload);
      if (response) {
        setMessage('Account updated successfully!');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage('Update failed!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[500px]'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-slate-600 font-medium'>Loading account data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header with Glassmorphism */}
      <div className='bg-gradient-to-br from-blue-500/90 to-indigo-600/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold text-white mb-2 flex items-center gap-3'>
              <User className='w-8 h-8' />
              Update Account
            </h2>
            <p className='text-blue-100'>
              Manage your profile information and settings
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 p-2.5 rounded-xl transition-all backdrop-blur-sm'
              aria-label='Close'
            >
              <X className='w-6 h-6' />
            </button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl backdrop-blur-xl border ${
            message.includes('success')
              ? 'bg-emerald-50/80 border-emerald-200/50 text-emerald-800'
              : 'bg-rose-50/80 border-rose-200/50 text-rose-800'
          } animate-fade-in shadow-lg`}
        >
          <div className='flex items-center gap-3'>
            {message.includes('success') ? (
              <div className='w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
            ) : (
              <div className='w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center'>
                <X className='w-6 h-6 text-white' />
              </div>
            )}
            <span className='font-semibold text-base'>{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Avatar Section - Glassmorphism */}
        <div className='bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 mb-6'>
          <div className='flex flex-col items-center'>
            <div className='relative mb-6'>
              {avatarImg ? (
                <img
                  src={avatarImg}
                  alt='avatar preview'
                  className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100/50'
                />
              ) : (
                <div className='w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-blue-100/50'>
                  <User className='w-16 h-16 text-white' />
                </div>
              )}
              <div className='absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full shadow-lg border-2 border-white'>
                <Upload className='w-5 h-5 text-white' />
              </div>
            </div>

            <label className='cursor-pointer'>
              <input
                type='file'
                accept='image/*'
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarForm({ ...avatarForm, imageFile: file });
                    const reader = new FileReader();
                    reader.onloadend = () => setAvartarImg(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className='hidden'
              />
              <span className='inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm font-medium'>
                <Upload className='w-4 h-4' />
                Choose Photo
              </span>
            </label>
            <p className='mt-3 text-sm text-slate-500'>JPG, PNG or GIF (Max 5MB)</p>
          </div>
        </div>

        {/* Form Fields - Glassmorphism */}
        <div className='bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8'>
          <h3 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
            <User className='w-5 h-5 text-blue-500' />
            Personal Information
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Full Name */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <User className='w-4 h-4 text-blue-500' />
                Full Name <span className='text-rose-500'>*</span>
              </label>
              <input
                name='fullName'
                value={form.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                  errors.fullName ? `border-rose-400 ring-2 ring-rose-200 ${shakeFields.fullName ? 'animate-shake' : ''}` : 'border-slate-200/50'
                } rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80`}
                placeholder='John Doe'
              />
              {errors.fullName && (
                <p className='mt-1.5 text-sm text-rose-600 flex items-center gap-1'>
                  <span className='font-medium'>⚠</span> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <Mail className='w-4 h-4 text-blue-500' />
                Email Address <span className='text-rose-500'>*</span>
              </label>
              <input
                name='email'
                type='email'
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                  errors.email ? `border-rose-400 ring-2 ring-rose-200 ${shakeFields.email ? 'animate-shake' : ''}` : 'border-slate-200/50'
                } rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80`}
                placeholder='john@example.com'
              />
              {errors.email && (
                <p className='mt-1.5 text-sm text-rose-600 flex items-center gap-1'>
                  <span className='font-medium'>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <Phone className='w-4 h-4 text-blue-500' />
                Phone Number
              </label>
              <input
                name='phoneNumber'
                value={form.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                  errors.phoneNumber ? `border-rose-400 ring-2 ring-rose-200 ${shakeFields.phoneNumber ? 'animate-shake' : ''}` : 'border-slate-200/50'
                } rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80`}
                placeholder='0123456789'
                maxLength='11'
              />
              {errors.phoneNumber && (
                <p className='mt-1.5 text-sm text-rose-600 flex items-center gap-1'>
                  <span className='font-medium'>⚠</span> {errors.phoneNumber}
                </p>
              )}
              <p className='mt-1.5 text-xs text-slate-500'>Must start with 0 and have 10-11 digits</p>
            </div>

            {/* Year of Birth */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <Calendar className='w-4 h-4 text-blue-500' />
                Year of Birth
              </label>
              <input
                name='yob'
                type='number'
                value={form.yob}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                  errors.yob ? `border-rose-400 ring-2 ring-rose-200 ${shakeFields.yob ? 'animate-shake' : ''}` : 'border-slate-200/50'
                } rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80`}
                placeholder='1990'
                min='1940'
                max={new Date().getFullYear() - 10}
              />
              {errors.yob && (
                <p className='mt-1.5 text-sm text-rose-600 flex items-center gap-1'>
                  <span className='font-medium'>⚠</span> {errors.yob}
                </p>
              )}
            </div>

            {/* School */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <Building2 className='w-4 h-4 text-blue-500' />
                School
              </label>
              <input
                name='school'
                value={form.school}
                onChange={handleChange}
                className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80'
                placeholder='University Name'
              />
            </div>

            {/* Student Code */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <Hash className='w-4 h-4 text-blue-500' />
                {form.isTeacher ? 'Lecturer Code' : 'Student Code'} <span className='text-rose-500'>*</span>
              </label>
              <input
                name='code'
                value={form.code}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border ${
                  errors.code ? `border-rose-400 ring-2 ring-rose-200 ${shakeFields.code ? 'animate-shake' : ''}` : 'border-slate-200/50'
                } rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80`}
                placeholder='STU123456'
              />
              {errors.code && (
                <p className='mt-1.5 text-sm text-rose-600 flex items-center gap-1'>
                  <span className='font-medium'>⚠</span> {errors.code}
                </p>
              )}
            </div>

            {/* Major */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-slate-700 mb-2  items-center gap-2'>
                <BookOpen className='w-4 h-4 text-blue-500' />
                Major
              </label>
              <input
                name='major'
                value={form.major}
                onChange={handleChange}
                className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80'
                placeholder='Computer Science'
              />
            </div>

            {/* Address */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-slate-700 mb-2 items-center gap-2'>
                <MapPin className='w-4 h-4 text-blue-500' />
                Address
              </label>
              <input
                name='address'
                value={form.address}
                onChange={handleChange}
                className='w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all outline-none hover:bg-white/80'
                placeholder='123 Main Street, City, Country'
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4 mt-6'>
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-6 py-3.5 bg-white/70 backdrop-blur-xl border border-slate-200/50 text-slate-700 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl'
            >
              Cancel
            </button>
          )}
          <button
            type='submit'
            disabled={saving}
            className='flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-sm'
          >
            {saving ? (
              <>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Saving...
              </>
            ) : (
              <>
                <Save className='w-5 h-5' />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditAccountForm;