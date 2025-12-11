import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Calendar,
  Save,
  X,
  GraduationCap,
  BookOpen,
  CreditCard,
} from 'lucide-react';
import { createStudent } from '../../../services/userService';
import { toast } from 'sonner';

const CreateStudentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    studentCode: '',
    address: '',
    phoneNumber: '',
    yearOfBirth: '',
    school: '',
    major: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newShakes = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      newShakes.fullName = true;
    }
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
    if (!formData.studentCode.trim()) {
      newErrors.studentCode = 'Student code is required';
      newShakes.studentCode = true;
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      newShakes.address = true;
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone is required';
      newShakes.phoneNumber = true;
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone format';
      newShakes.phoneNumber = true;
    }
    if (!formData.yearOfBirth) {
      newErrors.yearOfBirth = 'Year of birth is required';
      newShakes.yearOfBirth = true;
    } else {
      const birthYear = parseInt(formData.yearOfBirth, 10);
      const currentYear = new Date().getFullYear();
      if (birthYear < 1950) {
        newErrors.yearOfBirth = 'Year of birth must be 1950 or later';
        newShakes.yearOfBirth = true;
      } else if (birthYear > currentYear) {
        newErrors.yearOfBirth = `Year of birth cannot exceed ${currentYear}`;
        newShakes.yearOfBirth = true;
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
      const response = await createStudent({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        yearOfBirth: Number(formData.yearOfBirth),
        school: formData.school,
        studentCode: formData.studentCode,
        major: formData.major,
      });
      if (response) {
        toast.success('Student created successfully!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
      setFormData({
        fullName: '',
        email: '',
        password: '',
        studentCode: '',
        address: '',
        phoneNumber: '',
        yearOfBirth: '',
        school: '',
        major: '',
      });
    } catch (error) {
      console.error('Error creating student:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
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
      fullName: '',
      email: '',
      password: '',
      studentCode: '',
      address: '',
      phoneNumber: '',
      yearOfBirth: '',
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
            {/* Full Name Field */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <User className='w-4 h-4' />
                Full Name *
              </label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter student's full name"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                  errors.fullName
                    ? `border-red-500 ring-4 ring-red-100 ${shakeFields.fullName ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                }`}
              />
              <div className='h-5'>
                {errors.fullName && (
                  <p className='text-red-500 text-xs mt-1'>{errors.fullName}</p>
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
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder='+84 123 456 789'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                  errors.phoneNumber
                    ? `border-red-500 ring-4 ring-red-100 ${shakeFields.phoneNumber ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                }`}
              />
              <div className='h-5'>
                {errors.phoneNumber && (
                  <p className='text-red-500 text-xs mt-1'>{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Year of Birth Field */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <Calendar className='w-4 h-4' />
                Year of Birth *
              </label>
              <input
                type='number'
                name='yearOfBirth'
                value={formData.yearOfBirth}
                onChange={handleInputChange}
                placeholder='2000'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                  errors.yearOfBirth
                    ? `border-red-500 ring-4 ring-red-100 ${shakeFields.yearOfBirth ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                }`}
              />
              <div className='h-5'>
                {errors.yearOfBirth && (
                  <p className='text-red-500 text-xs mt-1'>{errors.yearOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Email Field */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <Mail className='w-4 h-4' />
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
                <Lock className='w-4 h-4' />
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

            {/* Student Code Field */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <CreditCard className='w-4 h-4' />
                Student Code *
              </label>
              <input
                type='text'
                name='studentCode'
                value={formData.studentCode}
                onChange={handleInputChange}
                placeholder='Enter student code'
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none ${
                  errors.studentCode
                    ? `border-red-500 ring-4 ring-red-100 ${shakeFields.studentCode ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                }`}
              />
              <div className='h-5'>
                {errors.studentCode && (
                  <p className='text-red-500 text-xs mt-1'>{errors.studentCode}</p>
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
        <div className='px-4 py-2'>
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
                  Create Student
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateStudentForm;
