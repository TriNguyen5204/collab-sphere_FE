import React, { useState } from 'react';
import {
  Download,
  Upload,
  Users,
  Check,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Phone,
  Calendar,
  GraduationCap,
  Building2,
  BookOpen,
  Image,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { importStudentList } from '../../services/userService';
import { toast } from 'sonner';

const ImprovedStudentCreation = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [apiErrors, setApiErrors] = useState([]);

  // Download template function
  const downloadTemplate = () => {
    const template = [
      {
        Email: 'nguyenvana@university.edu.vn',
        Password: '12345',
        Fullname: 'Nguyễn Văn A',
        Address: '123 Đường ABC, Quận 1, TP.HCM',
        PhoneNumber: '84123456789',
        YOB: 1980,
        School: 'FPT University',
        StudentCode: 'SE184727',
        Major: 'Computer Science',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    const instructionData = [
      ['HƯỚNG DẪN:'],
      ['- Fullname: Họ và tên đầy đủ (bắt buộc)'],
      ['- Address: Địa chỉ chi tiết (bắt buộc)'],
      ['- PhoneNumber: Số điện thoại (10-11 số)'],
      ['- Major: Ngành học (bắt buộc)'],
      ['- Email: Email công việc (Bắt buộc)'],
      ['- StudentCode: Mã sinh viên (bắt buộc)'],
      ['- Password: Mật khẩu (mặc định là 12345, nên đổi sau khi đăng nhập)'],
      ['- YOB: Năm sinh (bắt buộc)'],
      ['- School: Trường (bắt buộc)'],
    ];
    const wsInstruction = XLSX.utils.aoa_to_sheet(instructionData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Template');
    XLSX.utils.book_append_sheet(wb, wsInstruction, 'Instructions');
    XLSX.writeFile(wb, 'student_accounts_template.xlsx');
  };

  // Handle file upload
  const handleFileUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setFileName(file.name);
    setUploadStatus('processing');
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Filter out empty rows and instruction rows
        const filteredData = jsonData.filter(
          row =>
            row.Fullname &&
            row.Fullname !== 'HƯỚNG DẪN:' &&
            !row.Fullname.toString().startsWith('-')
        );

        // Process data to match expected format
        const processedData = filteredData.map(row => ({
          fullname: row.Fullname || '',
          address: row.Address || '',
          phone: row.PhoneNumber?.toString() || '',
          yearOfBirth: row['YOB']?.toString() || '',
          studentCode: row.StudentCode || '',
          email: row.Email || '',
          password: row.Password || '12345',
          school: row.School || '',
          major: row.Major || '',
        }));

        // Validate data
        const validationErrors = [];
        processedData.forEach((student, index) => {
          const rowErrors = [];
          if (!student.fullname?.trim()) rowErrors.push('Thiếu họ tên');
          if (!student.address?.trim()) rowErrors.push('Thiếu địa chỉ');
          if (!student.phone?.trim()) rowErrors.push('Thiếu số điện thoại');
          if (!student.school?.trim()) rowErrors.push('Thiếu trường học');
          if (!student.major?.trim()) rowErrors.push('Thiếu chuyên ngành');
          if (!student.yearOfBirth?.trim()) rowErrors.push('Thiếu năm sinh');
          if (!student.email?.trim()) rowErrors.push('Thiếu email');
          if (!student.studentCode?.trim())
            rowErrors.push('Thiếu mã sinh viên');

          if (
            student.phone &&
            !/^[0-9]{10,11}$/.test(student.phone.replace(/\s/g, ''))
          ) {
            rowErrors.push('Số điện thoại không hợp lệ');
          }

          if (student.yearOfBirth && !/^\d{4}$/.test(student.yearOfBirth)) {
            rowErrors.push('Năm sinh không hợp lệ');
          }

          if (rowErrors.length > 0) {
            validationErrors.push({
              row: index + 1,
              name: student.fullname || 'Không có tên',
              errors: rowErrors,
            });
          }
        });

        setErrors(validationErrors);
        setStudents(processedData);
        setUploadStatus(processedData.length > 0 ? 'success' : 'empty');
      } catch (error) {
        setUploadStatus('error');
        setErrors([
          { general: 'Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.' },
        ]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (errors.length > 0) {
      alert('Vui lòng sửa các lỗi trước khi tạo tài khoản');
      return;
    }

    setIsLoading(true);
    try {
      setIsSubmitting(true);
      setIsLoading(false);

      const response = await importStudentList(uploadedFile);

      if (response.isSuccess === true) {
        setUploadStatus('success');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else if (response.errorList?.length) {
        setApiErrors(response.errorList);
      }
    } catch (error) {
      setIsLoading(false);
      const apiErrorList = error?.response?.data?.errorList || [];
      setApiErrors(apiErrorList);

      if (!apiErrorList.length) {
        toast.error(error.message || 'Đã xảy ra lỗi khi import');
      }
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-6 bg-white'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='p-2 bg-green-100 rounded-lg'>
            <GraduationCap className='w-6 h-6 text-green-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Create Multiple Student Accounts
          </h2>
        </div>
        <p className='text-gray-600'>
          Upload Excel file to create multiple student accounts at once
        </p>
      </div>

      {/* Step indicator */}
      <div className='mb-8'>
        <div className='flex items-center justify-between text-sm'>
          <div
            className={`flex items-center gap-2 ${uploadStatus ? 'text-green-600' : 'text-green-600'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStatus ? 'bg-green-100 text-green-600' : 'bg-green-100 text-green-600'}`}
            >
              {uploadStatus ? <Check size={16} /> : '1'}
            </div>
            <span className='font-medium'>Download & Fill Template</span>
          </div>
          <div
            className={`flex-1 h-px mx-4 ${uploadStatus ? 'bg-green-200' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center gap-2 ${students.length > 0 ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${students.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {students.length > 0 ? <Check size={16} /> : '2'}
            </div>
            <span className='font-medium'>Upload & Review</span>
          </div>
          <div
            className={`flex-1 h-px mx-4 ${isSubmitting ? 'bg-green-200' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center gap-2 ${isSubmitting ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${isSubmitting ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {isSubmitting ? <Check size={16} /> : '3'}
            </div>
            <span className='font-medium'>Create Accounts</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        {/* Download Template Card */}
        <div className='bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <Download className='w-5 h-5 text-green-600' />
            </div>
            <h3 className='font-semibold text-green-900'>
              Step 1: Download Template
            </h3>
          </div>
          <p className='text-green-700 text-sm mb-4'>
            Download the Excel template with sample student data and
            instructions
          </p>
          <button
            onClick={downloadTemplate}
            className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium'
          >
            <Download size={18} />
            Download Student Template
          </button>
        </div>

        {/* Upload File Card */}
        <div className='bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Upload className='w-5 h-5 text-blue-600' />
            </div>
            <h3 className='font-semibold text-blue-900'>Step 2: Upload File</h3>
          </div>
          <p className='text-blue-700 text-sm mb-4'>
            Upload your completed Excel file with student information
          </p>
          <div className='relative'>
            <input
              type='file'
              accept='.xlsx,.xls,.csv'
              onChange={handleFileUpload}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            />
            <div className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'>
              <Upload size={18} />
              Choose File to Upload
            </div>
          </div>
          {fileName && (
            <div className='mt-2 text-blue-700 text-sm flex items-center gap-1'>
              <FileText size={14} />
              Selected: {fileName}
            </div>
          )}
          {uploadStatus === 'processing' && (
            <div className='mt-2 text-blue-600 text-sm'>Processing file...</div>
          )}
        </div>
      </div>

      {/* Template Info */}
      <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8'>
        <div className='flex items-start gap-3'>
          <FileText className='w-5 h-5 text-amber-600 mt-0.5' />
          <div>
            <h4 className='font-medium text-amber-900 mb-2'>
              Student Template Requirements:
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-800'>
              <div>
                • <strong>Fullname:</strong> Full student name (required)
              </div>
              <div>
                • <strong>Address:</strong> Complete address (required)
              </div>
              <div>
                • <strong>Phone:</strong> Phone number 10-11 digits (required)
              </div>
              <div>
                • <strong>Year of Birth:</strong> Birth year YYYY format
                (optional)
              </div>
              <div>
                • <strong>Avatar:</strong> Avatar image URL (optional)
              </div>
              <div>
                • <strong>School:</strong> School name (required)
              </div>
              <div>
                • <strong>Major:</strong> Field of study (required)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-4 mb-6'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-600 mt-0.5' />
            <div className='flex-1'>
              <h4 className='font-medium text-red-900 mb-2'>
                Please fix the following errors:
              </h4>
              <div className='space-y-1'>
                {errors.map((error, idx) => (
                  <div key={idx} className='text-sm text-red-700'>
                    {error.general ? (
                      <span>{error.general}</span>
                    ) : (
                      <span>
                        <strong>Row {error.row}:</strong> {error.name} -{' '}
                        {error.errors.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {students.length > 0 && (
        <div className='bg-white border border-gray-200 rounded-xl overflow-hidden mb-6'>
          <div className='bg-gray-50 px-6 py-4 border-b'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                <Users size={20} />
                Student Preview ({students.length} students)
              </h3>
              <div className='flex items-center gap-2 text-sm'>
                <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                <span className='text-gray-600'>Ready to create</span>
              </div>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                    Student Info
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                    Contact
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                    Academic
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                    Avatar
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {students.map((student, idx) => (
                  <tr key={idx} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                          <User size={16} className='text-green-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            {student.fullname}
                          </h4>
                          <div className='flex items-center gap-1 text-sm text-gray-600 mt-1'>
                            <Calendar size={12} />
                            <span>{student.yearOfBirth || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='space-y-1'>
                        <div className='flex items-start gap-1 text-sm text-gray-600'>
                          <MapPin size={14} className='mt-0.5 flex-shrink-0' />
                          <span className='line-clamp-2'>
                            {student.address}
                          </span>
                        </div>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <Phone size={12} />
                          <span>{student.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-1 text-sm font-medium text-gray-900'>
                          <Building2 size={12} />
                          <span className='line-clamp-1'>{student.school}</span>
                        </div>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <BookOpen size={12} />
                          <span className='line-clamp-1'>{student.major}</span>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      {student.avatar_img ? (
                        <img
                          src={student.avatar_img}
                          alt='avatar'
                          className='w-10 h-10 rounded-full object-cover border-2 border-gray-200'
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                          <Image size={16} className='text-gray-400' />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Button */}
      {students.length > 0 && !isSubmitting && (
        <div className='flex justify-center'>
          <button
            onClick={handleConfirm}
            disabled={isLoading || errors.length > 0}
            className='px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center gap-3 min-w-64 justify-center'
          >
            {isLoading ? (
              <>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Creating Student Accounts...
              </>
            ) : (
              <>
                <Check size={20} />
                Confirm & Create {students.length} Student Accounts
              </>
            )}
          </button>
        </div>
      )}
      {apiErrors.length > 0 && (
        <div className='mt-4 p-4 bg-red-50 border border-red-300 rounded-md'>
          <h3 className='text-red-600 font-semibold mb-2'>Danh sách lỗi:</h3>
          <ul className='list-disc list-inside text-red-700'>
            {apiErrors.map((err, index) => (
              <li key={index}>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImprovedStudentCreation;
