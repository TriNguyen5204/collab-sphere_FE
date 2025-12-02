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

  const handleInputChange = e => {
    const { name, value } = e.target;

    // Nếu là trường ngày sinh -> chỉ lấy năm
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

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.lecturerCode.trim())
      newErrors.lecturerCode = 'Lecturer code is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone))
      newErrors.phone = 'Invalid phone format';
    if (!formData.birth) newErrors.birth = 'Birth year is required';
    if (!formData.school.trim()) newErrors.school = 'School is required';
    if (!formData.major.trim()) newErrors.major = 'Major is required';

    setErrors(newErrors);
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

        // Hiển thị tất cả lỗi
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
      <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
        <div className='p-8'>
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
                  Year of Birth *
                </label>
                <input
                  type='date'
                  name='birth'
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.birth
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {formData.birth && (
                  <p className='text-sm text-gray-600 mt-1'>
                    Selected year: <strong>{formData.birth}</strong>
                  </p>
                )}
                {errors.birth && (
                  <p className='text-red-500 text-sm mt-1'>{errors.birth}</p>
                )}
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                )}
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.password && (
                  <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
                )}
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lecturerCode
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.lecturerCode && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.lecturerCode}
                  </p>
                )}
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
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.school
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
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
                <input
                  type='text'
                  name='major'
                  value={formData.major}
                  onChange={handleInputChange}
                  placeholder='Enter major or department'
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.major
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-300'
                  }`}
                />
                {errors.major && (
                  <p className='text-red-500 text-sm mt-1'>{errors.major}</p>
                )}
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  Additional Information
                </h3>
                <ul className='text-sm text-blue-700 space-y-1'>
                  <li>• All fields marked with * are required</li>
                  <li>• Birth date will be saved as year only</li>
                  <li>• Phone number should include country code</li>
                  <li>• Double-check all information before submitting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
