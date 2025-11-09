import React, { useState } from 'react';
import { createStudent } from '../../services/userService';
import {
  User,
  Mail,
  Lock,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Upload,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const CreateStudentForm = ({ onClose }) => {
  const [student, setStudent] = useState({
    fullName: '',
    email: '',
    password: '',
    studentCode: '',
    address: '',
    phoneNumber: '',
    yearOfBirth: new Date().getFullYear() - 18,
    school: '',
    major: '',
    // avatar_img: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // handle input change
  const handleChange = e => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  // handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // chuẩn bị FormData (nếu backend nhận file upload)
      const formData = new FormData();
      formData.append('email', student.email);
      formData.append('password', student.password);
      formData.append('fullName', student.fullName);
      formData.append('address', student.address);
      formData.append('phoneNumber', student.phoneNumber);
      formData.append('yob', Number(student.yearOfBirth));
      formData.append('school', student.school);
      formData.append('studentCode', student.studentCode);
      formData.append('major', student.major);
      // if (student.avatar_img) formData.append("avatar_img", student.avatar_img);

      const response = await createStudent(formData);
      if (response) {
        setMessage('✅ Student created successfully!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
    } catch (error) {
      setLoading(false)
      setMessage('❌ Failed to create student.');
      const errorMsg =
        error?.response?.data?.item2 ||
        error?.message ||
        'Unknown error occurred.';

      toast.error(errorMsg);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header Card */}
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden mb-6'>
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                <GraduationCap className='w-8 h-8 text-white' />
              </div>
              <div>
                <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                  Create New Student
                </h2>
                <p className='text-blue-100'>
                  Fill in the information to register a new student
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='p-8'>
            {/* Form Grid */}
            <div className='grid md:grid-cols-2 gap-6'>
              {/* Full Name */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Full Name
                </label>
                <div className='relative'>
                  <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    name='fullName'
                    value={student.fullName}
                    onChange={handleChange}
                    placeholder='Enter full name'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='email'
                    name='email'
                    value={student.email}
                    onChange={handleChange}
                    placeholder='student@example.com'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='password'
                    name='password'
                    value={student.password}
                    onChange={handleChange}
                    placeholder='••••••••'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Student Code */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Student Code
                </label>
                <div className='relative'>
                  <CreditCard className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    name='studentCode'
                    value={student.studentCode}
                    onChange={handleChange}
                    placeholder='STU-12345'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Phone Number
                </label>
                <div className='relative'>
                  <Phone className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    name='phoneNumber'
                    value={student.phoneNumber}
                    onChange={handleChange}
                    placeholder='+84 123 456 789'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Address
                </label>
                <div className='relative'>
                  <MapPin className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    name='address'
                    value={student.address}
                    onChange={handleChange}
                    placeholder='Enter full address'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Year of Birth */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Year of Birth
                </label>
                <div className='relative'>
                  <Calendar className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='number'
                    name='yearOfBirth'
                    value={student.yearOfBirth}
                    onChange={handleChange}
                    placeholder='2000'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* School */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  School
                </label>
                <div className='relative'>
                  <GraduationCap className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    name='school'
                    value={student.school}
                    onChange={handleChange}
                    placeholder='School name'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              {/* Major */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Major
                </label>
                <div className='relative'>
                  <BookOpen className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    name='major'
                    value={student.major}
                    onChange={handleChange}
                    placeholder='Computer Science, Engineering, etc.'
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='mt-8'>
              <button
                type='submit'
                disabled={loading}
                className='w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3'
              >
                {loading ? (
                  <>
                    <Loader2 className='w-6 h-6 animate-spin' />
                    Creating Student...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-6 h-6' />
                    Create Student
                  </>
                )}
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.includes('✅')
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                {message.includes('✅') ? (
                  <CheckCircle className='w-6 h-6 text-green-600 flex-shrink-0' />
                ) : (
                  <XCircle className='w-6 h-6 text-red-600 flex-shrink-0' />
                )}
                <p
                  className={`font-semibold ${
                    message.includes('✅') ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentForm;
