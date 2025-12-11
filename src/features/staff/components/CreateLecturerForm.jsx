import { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Save,
  X,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { createLecturer } from '../../../services/userService';
import { toast } from 'sonner';

const CreateLecturerForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    lecturerCode: '',
    address: '',
    phone: '',
    birth: '',
    school: '',
    major: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});

  const handleInputChange = e => {
    const { name, value } = e.target;

    // If birth field -> only take year
    if (name === 'birth') {
      const year = value ? new Date(value).getFullYear().toString() : '';
      setFormData(prev => ({ ...prev, [name]: year }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newShakes = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      newShakes.email = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      newShakes.email = true;
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      newShakes.password = true;
    } else if (formData.password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
      newShakes.password = true;
    }
    if (!formData.lecturerCode.trim()) {
      newErrors.lecturerCode = 'Lecturer code is required';
      newShakes.lecturerCode = true;
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      newShakes.name = true;
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      newShakes.address = true;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
      newShakes.phone = true;
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
      newShakes.phone = true;
    }
    if (!formData.birth) {
      newErrors.birth = 'Birth year is required';
      newShakes.birth = true;
    } else {
      const birthYear = parseInt(formData.birth, 10);
      const currentYear = new Date().getFullYear();
      if (birthYear < 1950) {
        newErrors.birth = 'Birth year must be 1950 or later';
        newShakes.birth = true;
      } else if (birthYear > currentYear) {
        newErrors.birth = `Birth year cannot exceed ${currentYear}`;
        newShakes.birth = true;
      }
    }
    if (!formData.school.trim()) {
      newErrors.school = 'School is required';
      newShakes.school = true;
    }
    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
      newShakes.major = true;
    }

    setErrors(newErrors);
    setShakeFields(newShakes);
    
    // Reset shake after animation
    if (Object.keys(newShakes).length > 0) {
      setTimeout(() => setShakeFields({}), 600);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await createLecturer(formData);
      if (response) {
        toast.success('Lecturer created successfully!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
      setFormData({
        name: '',
        address: '',
        phone: '',
        birth: '',
        school: '',
        major: '',
      });
    } catch (error) {
      console.error('Error creating lecturer:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        // Display all errors
        Object.keys(errors).forEach(field => {
          errors[field].forEach(message => {
            toast.error(message);
          });
        });
      } else {
        const errorMsg =
          error?.response?.data?.item2 ||
          error?.message ||
          'Unknown error occurred.';

        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      lecturerCode: '',
      address: '',
      phone: '',
      birth: '',
      school: '',
      major: '',
    });

    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='space-y-8'>
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.name
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.name ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.name && (
                    <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
                  )}
                </div>
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none resize-none ${
                    errors.address
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.address ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.address && (
                    <p className='text-red-500 text-xs mt-1'>{errors.address}</p>
                  )}
                </div>
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.phone
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.phone ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.phone && (
                    <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Birth Date Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <Calendar className='w-4 h-4' />
                  Year of Birth *
                </label>
                <input
                  type='date'
                  name='birth'
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.birth
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.birth ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                {formData.birth && (
                  <p className='text-sm text-gray-600 mt-1'>
                    Selected year: <strong>{formData.birth}</strong>
                  </p>
                )}
                <div className='h-5'>
                  {errors.birth && (
                    <p className='text-red-500 text-xs mt-1'>{errors.birth}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* Email Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  Email *
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Enter email address'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.email
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.email ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.email && (
                    <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  Password *
                </label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='Enter password'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.password
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.password ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.password && (
                    <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Lecturer Code Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  Lecturer Code *
                </label>
                <input
                  type='text'
                  name='lecturerCode'
                  value={formData.lecturerCode}
                  onChange={handleInputChange}
                  placeholder='Enter lecturer code'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.lecturerCode
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.lecturerCode ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.lecturerCode && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.lecturerCode}
                    </p>
                  )}
                </div>
              </div>
              {/* School Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <GraduationCap className='w-4 h-4' />
                  School/University *
                </label>
                <input
                  type='text'
                  name='school'
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder='Enter school/university name'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.school
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.school ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.school && (
                    <p className='text-red-500 text-xs mt-1'>{errors.school}</p>
                  )}
                </div>
              </div>

              {/* Major Field */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <BookOpen className='w-4 h-4' />
                  Major/Department *
                </label>
                <input
                  type='text'
                  name='major'
                  value={formData.major}
                  onChange={handleInputChange}
                  placeholder='Enter major or department'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                    errors.major
                      ? `border-red-500 ring-4 ring-red-100 ${shakeFields.major ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                  }`}
                />
                <div className='h-5'>
                  {errors.major && (
                    <p className='text-red-500 text-xs mt-1'>{errors.major}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Footer */}
        <div className=' px-4 py-2'>
          <div className='flex items-center justify-end gap-4'>
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
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white hover:from-orangeFpt-600 hover:to-orangeFpt-700 shadow-lg hover:shadow-xl'
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
