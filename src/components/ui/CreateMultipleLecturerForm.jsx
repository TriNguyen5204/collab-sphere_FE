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
  Building,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { importLecturerList } from '../../services/userService';

const ImprovedLecturerCreation = () => {
  const [lecturers, setLecturers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Download template function
  const downloadTemplate = () => {
    const template = [
      {
        Email: 'nguyenvana@university.edu.vn',
        Password: '12345',
        FullName: 'Nguyễn Văn A',
        Address: '123 Đường ABC, Quận 1, TP.HCM',
        PhoneNumber: '84123456789',
        YOB: 1980,
        School: 'FPT University',
        LecturerCode: 'SE184727',
        Major: 'Computer Science',
      },
    ];

    // Sheet chính chứa dữ liệu mẫu
    const wsData = XLSX.utils.json_to_sheet(template);

    // Tạo thêm 1 sheet cho hướng dẫn
    const instructionData = [
      ['HƯỚNG DẪN:'],
      ['- FullName: Họ và tên đầy đủ (bắt buộc)'],
      ['- Address: Địa chỉ chi tiết (bắt buộc)'],
      ['- PhoneNumber: Số điện thoại (10-11 số)'],
      ['- Major: Ngành học (bắt buộc)'],
      ['- Email: Email công việc (Bắt buộc)'],
      ['- Password: Mật khẩu (mặc định là 12345, nên đổi sau khi đăng nhập)'],
      ['- YOB: Năm sinh (bắt buộc)'],
      ['- School: Trường (bắt buộc)'],
    ];
    const wsInstruction = XLSX.utils.aoa_to_sheet(instructionData);

    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, 'Lecturer Template');
    XLSX.utils.book_append_sheet(wb, wsInstruction, 'Instructions');

    // Xuất file
    XLSX.writeFile(wb, 'lecturer_accounts_template.xlsx');
  };

  // Handle file upload
  const handleFileUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadStatus('processing');
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Chỉ đọc sheet dữ liệu chính
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Lọc bỏ row trống
        const filteredData = jsonData.filter(
          row => row.FullName && row.FullName.trim() !== ''
        );

        // Validate
        const validationErrors = [];
        filteredData.forEach((lecturer, index) => {
          const rowErrors = [];
          if (!lecturer.FullName?.trim()) rowErrors.push('Thiếu họ tên');
          if (!lecturer.Address?.trim()) rowErrors.push('Thiếu địa chỉ');
          if (!lecturer.PhoneNumber?.toString().trim())
            rowErrors.push('Thiếu số điện thoại');
          if (!lecturer.Major?.trim()) rowErrors.push('Thiếu ngành học');

          if (
            lecturer.PhoneNumber &&
            !/^[0-9]{10,11}$/.test(
              lecturer.PhoneNumber.toString().replace(/\s/g, '')
            )
          ) {
            rowErrors.push('Số điện thoại không hợp lệ');
          }

          if (rowErrors.length > 0) {
            validationErrors.push({
              row: index + 2, // +2 vì excel có header ở dòng 1
              name: lecturer.FullName || 'Không có tên',
              errors: rowErrors,
            });
          }
        });

        setErrors(validationErrors);
        setLecturers(filteredData);
        setUploadStatus(filteredData.length > 0 ? 'success' : 'empty');
      } catch (error) {
        console.error('File read error:', error);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(true);
      setIsLoading(false);

      const response = await importLecturerList(uploadedFile);
      if (response.isSuccess === true) {
        setIsSubmitting(true);
        setIsLoading(false);
        setTimeout(() => {
          setIsSubmitting(false);
          setLecturers([]);
          setUploadStatus('');
        }, 3000);
      }
    } catch (error) {
      setIsLoading(false);
      alert('Có lỗi xảy ra khi tạo tài khoản');
    }
  };

  return (
    <div className='max-w-5xl mx-auto p-6 bg-white'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <Users className='w-6 h-6 text-blue-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Create Multiple Lecturer Accounts
          </h2>
        </div>
        <p className='text-gray-600'>
          Upload Excel file to create multiple lecturer accounts at once
        </p>
      </div>

      {/* Step indicator */}
      <div className='mb-8'>
        <div className='flex items-center justify-between text-sm'>
          <div
            className={`flex items-center gap-2 ${uploadStatus ? 'text-green-600' : 'text-blue-600'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStatus ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}
            >
              {uploadStatus ? <Check size={16} /> : '1'}
            </div>
            <span className='font-medium'>Download & Fill Template</span>
          </div>
          <div
            className={`flex-1 h-px mx-4 ${uploadStatus ? 'bg-green-200' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center gap-2 ${lecturers.length > 0 ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${lecturers.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {lecturers.length > 0 ? <Check size={16} /> : '2'}
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
            Download the Excel template with sample data and instructions
          </p>
          <button
            onClick={downloadTemplate}
            className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium'
          >
            <Download size={18} />
            Download Template
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
            Upload your completed Excel file with lecturer information
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
              Template Requirements:
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-800'>
              <div>
                • <strong>FullName:</strong> Full lecturer name (required)
              </div>
              <div>
                • <strong>Address:</strong> Complete address (required)
              </div>
              <div>
                • <strong>Phone:</strong> Phone number 10-11 digits (required)
              </div>
              <div>
                • <strong>Department:</strong> Faculty/Department (required)
              </div>
              <div>
                • <strong>Email:</strong> Work email (optional)
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
      {lecturers.length > 0 && (
        <div className='bg-white border border-gray-200 rounded-xl overflow-hidden mb-6'>
          <div className='bg-gray-50 px-6 py-4 border-b'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                <Users size={20} />
                Preview ({lecturers.length} lecturers)
              </h3>
              <div className='flex items-center gap-2 text-sm'>
                <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                <span className='text-gray-600'>Ready to create</span>
              </div>
            </div>
          </div>

          <div className='max-h-96 overflow-y-auto'>
            <div className='divide-y divide-gray-100'>
              {lecturers.map((lecturer, idx) => (
                <div
                  key={idx}
                  className='p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                          <User size={16} className='text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            {lecturer.FullName}
                          </h4>
                          <div className='flex items-center gap-4 text-sm text-gray-600 mt-1'>
                            <div className='flex items-center gap-1'>
                              <Building size={14} />
                              <span>{lecturer.Major}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Phone size={14} />
                              <span>{lecturer.PhoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-start gap-1 text-sm text-gray-600 ml-11'>
                        <MapPin size={14} className='mt-0.5 flex-shrink-0' />
                        <span>{lecturer.Address}</span>
                      </div>
                      {lecturer.Email && (
                        <div className='ml-11 text-sm text-gray-600 mt-1'>
                          📧 {lecturer.Email}
                        </div>
                      )}
                    </div>
                    <div className='text-xs text-gray-400'>#{idx + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {lecturers.length > 0 && !isSubmitting && (
        <div className='flex justify-center'>
          <button
            onClick={handleConfirm}
            disabled={isLoading || errors.length > 0}
            className='px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center gap-3 min-w-64 justify-center'
          >
            {isLoading ? (
              <>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Creating Accounts...
              </>
            ) : (
              <>
                <Check size={20} />
                Confirm & Create {lecturers.length} Accounts
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Message */}
      {isSubmitting && (
        <div className='text-center py-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
            <Check className='w-8 h-8 text-green-600' />
          </div>
          <h3 className='text-xl font-semibold text-green-900 mb-2'>
            Success!
          </h3>
          <p className='text-green-700'>
            All {lecturers.length} lecturer accounts have been created
            successfully!
          </p>
          <div className='mt-4 text-sm text-green-600'>
            Login credentials will be sent to their email addresses.
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedLecturerCreation;
