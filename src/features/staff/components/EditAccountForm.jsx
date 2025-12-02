import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../../../services/userService';
import {
  putUpdateUserProfile,
  postUploadUserAvatar,
} from '../../../services/studentApi';

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

  // --- Load user data ---
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

  // --- Handle form change ---
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Handle submit ---
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if(avatarForm.imageFile){
        await handleUploadAvatar();
      }
      const payload = { ...form };
      const response = await putUpdateUserProfile(id, payload);
      if (response) {
        onClose();
      }
      setMessage(response?.message || 'Update success!');
    } catch (err) {
      console.error(err);
      setMessage('Update failed!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-1'>Edit Account</h2>
            <p className='text-blue-100 text-sm'>
              Update your profile information
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 p-2 rounded-full transition-colors'
              aria-label='Close'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mx-8 mt-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('Update success')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          } animate-fade-in`}
        >
          <div className='flex items-center gap-2'>
            {message.includes('success') ||
            message.includes('Update success') ? (
              <svg
                className='w-5 h-5 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            ) : (
              <svg
                className='w-5 h-5 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            )}
            <span className='font-medium'>{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='p-8'>
        {/* Avatar Section */}
        <div className='mb-8 text-center'>
          <div className='inline-block relative'>
            {avatarImg ? (
              <img
                src={avatarImg}
                alt='avatar preview'
                className='w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg'
              />
            ) : (
              <div className='w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-blue-100 shadow-lg'>
                <svg
                  className='w-16 h-16 text-white'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            )}
            <div className='absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            </div>
          </div>
          {/* UPLOAD AVATAR INPUT */}
          <input
            type='file'
            accept='image/*'
            className='hidden'
            id='avatarUpload'
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;

              setAvatarForm({
                imageFile: file,
                userId: id,
                isTeacher: form.isTeacher,
              });

              // preview ảnh
              const imagePreview = URL.createObjectURL(file);
              setAvartarImg(imagePreview);
            }}
          />

          <label
            htmlFor='avatarUpload'
            className='cursor-pointer mt-2 inline-block text-blue-600 hover:underline'
          >
            Change Avatar
          </label>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* EMAIL */}
          <div className='form-group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
              Email Address
            </label>
            <input
              name='email'
              type='email'
              value={form.email}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='your.email@example.com'
            />
          </div>

          {/* FULL NAME */}
          <div className='form-group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              Full Name
            </label>
            <input
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='John Doe'
            />
          </div>

          {/* PHONE */}
          <div className='form-group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
              Phone Number
            </label>
            <input
              name='phoneNumber'
              type='tel'
              value={form.phoneNumber}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='+1 234 567 8900'
            />
          </div>

          {/* YOB */}
          <div className='form-group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Year of Birth
            </label>
            <input
              name='yob'
              type='number'
              value={form.yob}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='1990'
            />
          </div>

          {/* SCHOOL */}
          <div className='form-group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 14l9-5-9-5-9 5 9 5z' />
                <path d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222'
                />
              </svg>
              School
            </label>
            <input
              name='school'
              value={form.school}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='University Name'
            />
          </div>

          {/* CODE */}
          <div className='form-group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 20l4-16m2 16l4-16M6 9h14M4 15h14'
                />
              </svg>
              Student Code
            </label>
            <input
              name='code'
              value={form.code}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='STU123456'
            />
          </div>

          {/* MAJOR */}
          <div className='form-group md:col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                />
              </svg>
              Major
            </label>
            <input
              name='major'
              value={form.major}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='Computer Science'
            />
          </div>

          {/* ADDRESS */}
          <div className='form-group md:col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              <svg
                className='w-4 h-4 inline mr-1.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              Address
            </label>
            <input
              name='address'
              value={form.address}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none hover:border-blue-400'
              placeholder='123 Main Street, City, Country'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
          )}
          <button
            type='submit'
            disabled={saving}
            className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {saving ? (
              <>
                <svg
                  className='w-5 h-5 animate-spin'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
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
