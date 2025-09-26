import { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Upload,
  GraduationCap,
  BookOpen,
  Save,
  X,
  Camera,
  Check,
} from 'lucide-react';

const CreateLecturerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    birth: '',
    avatar: null,
    school: '',
    major: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const schools = [
    'Harvard University',
    'Stanford University',
    'MIT - Massachusetts Institute of Technology',
    'University of California, Berkeley',
    'Oxford University',
    'Cambridge University',
    'Yale University',
    'Princeton University',
    'Columbia University',
    'University of Chicago',
  ];

  const majors = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Economics',
    'Psychology',
    'Literature',
    'History',
    'Philosophy',
    'Business Administration',
  ];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = e => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone))
      newErrors.phone = 'Invalid phone format';
    if (!formData.birth) newErrors.birth = 'Birth date is required';
    if (!formData.school) newErrors.school = 'School is required';
    if (!formData.major) newErrors.major = 'Major is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Lecturer created:', formData);
      setIsSubmitting(false);
      // Reset form or redirect
      alert('Lecturer created successfully!');
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      birth: '',
      avatar: null,
      school: '',
      major: '',
    });
    setAvatarPreview(null);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form */}
      <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
        <div className='p-8'>
          {/* Avatar Upload Section */}
          <div className='flex flex-col items-center mb-8'>
            <div className='relative group'>
              <div className='w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg'>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt='Avatar preview'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <Camera className='w-12 h-12 text-gray-400' />
                )}
              </div>
              <label className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
                <Upload className='w-6 h-6 text-white' />
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                />
              </label>
            </div>
            <p className='text-sm text-gray-500 mt-2'>
              Click to upload avatar (optional)
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left Column */}
            <div className='space-y-6'>
              {/* Name Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <User className='w-4 h-4' />
                  Full Name *
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter lecturer's full name"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.name && (
                  <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <MapPin className='w-4 h-4' />
                  Address *
                </label>
                <textarea
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder='Enter complete address'
                  rows='3'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.address
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.address && (
                  <p className='text-red-500 text-sm mt-1'>{errors.address}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <Phone className='w-4 h-4' />
                  Phone Number *
                </label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='+1 (555) 123-4567'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.phone && (
                  <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>
                )}
              </div>

              {/* Birth Date Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <Calendar className='w-4 h-4' />
                  Date of Birth *
                </label>
                <input
                  type='date'
                  name='birth'
                  value={formData.birth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.birth
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.birth && (
                  <p className='text-red-500 text-sm mt-1'>{errors.birth}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* School Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <GraduationCap className='w-4 h-4' />
                  School/University *
                </label>
                <select
                  name='school'
                  value={formData.school}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.school
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                >
                  <option value=''>Select a school</option>
                  {schools.map((school, index) => (
                    <option key={index} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
                {errors.school && (
                  <p className='text-red-500 text-sm mt-1'>{errors.school}</p>
                )}
              </div>

              {/* Major Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <BookOpen className='w-4 h-4' />
                  Major/Department *
                </label>
                <select
                  name='major'
                  value={formData.major}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.major
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                >
                  <option value=''>Select a major</option>
                  {majors.map((major, index) => (
                    <option key={index} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
                {errors.major && (
                  <p className='text-red-500 text-sm mt-1'>{errors.major}</p>
                )}
              </div>

              {/* Additional Info */}
              <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  Additional Information
                </h3>
                <ul className='text-sm text-blue-700 space-y-1'>
                  <li>• All fields marked with * are required</li>
                  <li>• Avatar image should be less than 5MB</li>
                  <li>• Phone number should include country code</li>
                  <li>• Double-check all information before submitting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className='bg-gray-50 px-8 py-6 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={handleReset}
              className='flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all'
            >
              <X className='w-4 h-4' />
              Reset Form
            </button>

            <button
              type='submit'
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4' />
                  Create Lecturer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
export default CreateLecturerForm;
