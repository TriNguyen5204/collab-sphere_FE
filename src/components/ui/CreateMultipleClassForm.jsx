import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Send,
  X,
} from 'lucide-react';
import { createMultipleClasses } from '../../services/userService';

const CreateMultipleClassForm = () => {
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState('');

  const downloadTemplate = () => {
    const template = [
      {
        ClassName: 'SE1234',
        EnrolKey: 'ENR123',
        SubjectCode: 'CS101',
        LecturerCode: 'GV001',
        StudentCodes: 'SV001,SV002,SV003',
        IsActive: true,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Class Template');
    XLSX.writeFile(wb, 'class_template.xlsx');
  };

  const handleFileUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

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

        const filteredData = jsonData.filter(
          row => row.ClassName && row.EnrolKey && row.SubjectCode
        );

        const validationErrors = [];
        filteredData.forEach((cls, index) => {
          const rowErrors = [];
          if (!cls.ClassName?.trim()) rowErrors.push('Thiếu ClassName');
          if (!cls.EnrolKey?.trim()) rowErrors.push('Thiếu EnrolKey');
          if (!cls.SubjectCode?.trim()) rowErrors.push('Thiếu SubjectCode');
          if (!cls.LecturerCode?.trim()) rowErrors.push('Thiếu LecturerCode');

          if (
            cls.StudentCodes &&
            typeof cls.StudentCodes === 'string' &&
            !/^[A-Za-z0-9,;\s]+$/.test(cls.StudentCodes)
          ) {
            rowErrors.push('StudentCodes không hợp lệ');
          }

          if (
            cls.IsActive !== true &&
            cls.IsActive !== false &&
            cls.IsActive !== 'true' &&
            cls.IsActive !== 'false'
          ) {
            rowErrors.push('IsActive phải là true/false');
          }

          if (rowErrors.length > 0) {
            validationErrors.push({
              row: index + 2,
              name: cls.ClassName || 'Không có tên lớp',
              errors: rowErrors,
            });
          }
        });

        setErrors(validationErrors);
        setClasses(filteredData);
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

  const handleSubmit = async () => {
    if (!fileName) {
      alert('Vui lòng tải lên file Excel trước khi gửi.');
      return;
    }

    try {
      const fileInput = document.getElementById('file-upload');
      const file = fileInput.files[0];

      await createMultipleClasses(file);

      alert('Tạo lớp thành công!');
      resetForm();
    } catch (err) {
      console.error('Error:', err);
      alert('Có lỗi khi tạo lớp.');
    }
  };

  const resetForm = () => {
    setClasses([]);
    setErrors([]);
    setUploadStatus('idle');
    setFileName('');
  };

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <FileSpreadsheet className='w-7 h-7' />
            Tạo nhiều lớp học từ Excel
          </h2>
          <p className='text-blue-100 mt-1 text-sm'>
            Tải lên file Excel để tạo nhiều lớp học cùng lúc
          </p>
        </div>

        <div className='p-6'>
          {/* Download Template Section */}
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <Download className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <h3 className='font-semibold text-gray-800 mb-1'>
                  Bước 1: Tải file mẫu
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Tải xuống file Excel mẫu và điền thông tin lớp học theo định
                  dạng
                </p>
                <button
                  onClick={downloadTemplate}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm'
                >
                  <Download className='w-4 h-4' />
                  Tải file mẫu
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className='mb-6'>
            <div className='flex items-start gap-3 mb-3'>
              <Upload className='w-5 h-5 text-gray-600 mt-0.5' />
              <div>
                <h3 className='font-semibold text-gray-800 mb-1'>
                  Bước 2: Tải lên file Excel
                </h3>
                <p className='text-sm text-gray-600'>
                  Chọn file Excel đã điền thông tin để tải lên
                </p>
              </div>
            </div>

            <div className='relative'>
              <input
                type='file'
                accept='.xlsx, .xls'
                onChange={handleFileUpload}
                className='hidden'
                id='file-upload'
              />
              <label
                htmlFor='file-upload'
                className='flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors'
              >
                <Upload className='w-6 h-6 text-gray-400' />
                <span className='text-gray-600'>
                  {fileName || 'Nhấn để chọn file hoặc kéo thả file vào đây'}
                </span>
              </label>
            </div>
          </div>

          {/* Processing Status */}
          {uploadStatus === 'processing' && (
            <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600'></div>
              <span className='text-yellow-800 font-medium'>
                Đang xử lý file...
              </span>
            </div>
          )}

          {/* Success - Class List */}
          {uploadStatus === 'success' && classes.length > 0 && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <h3 className='font-semibold text-gray-800'>
                    Danh sách lớp đã tải ({classes.length} lớp)
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className='text-gray-500 hover:text-gray-700 p-1'
                  title='Xóa và tải lại'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              <div className='bg-gray-50 rounded-lg border border-gray-200 overflow-hidden'>
                <div className='max-h-64 overflow-y-auto'>
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-100 sticky top-0'>
                      <tr>
                        <th className='px-4 py-2 text-left font-semibold text-gray-700'>
                          STT
                        </th>
                        <th className='px-4 py-2 text-left font-semibold text-gray-700'>
                          Tên lớp
                        </th>
                        <th className='px-4 py-2 text-left font-semibold text-gray-700'>
                          Mã môn học
                        </th>
                        <th className='px-4 py-2 text-left font-semibold text-gray-700'>
                          Giảng viên
                        </th>
                        <th className='px-4 py-2 text-left font-semibold text-gray-700'>
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls, idx) => (
                        <tr
                          key={idx}
                          className='border-t border-gray-200 hover:bg-gray-50'
                        >
                          <td className='px-4 py-2 text-gray-600'>{idx + 1}</td>
                          <td className='px-4 py-2 font-medium text-gray-800'>
                            {cls.ClassName}
                          </td>
                          <td className='px-4 py-2 text-gray-600'>
                            {cls.SubjectCode}
                          </td>
                          <td className='px-4 py-2 text-gray-600'>
                            {cls.LecturerCode}
                          </td>
                          <td className='px-4 py-2'>
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                cls.IsActive === true || cls.IsActive === 'true'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {cls.IsActive === true || cls.IsActive === 'true'
                                ? 'Hoạt động'
                                : 'Không hoạt động'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='font-semibold text-red-800 mb-2'>
                    Phát hiện lỗi dữ liệu ({errors.length} lỗi)
                  </h4>
                  <div className='space-y-2'>
                    {errors.map((err, idx) => (
                      <div key={idx} className='text-sm'>
                        {err.general ? (
                          <p className='text-red-700'>{err.general}</p>
                        ) : (
                          <p className='text-red-700'>
                            <span className='font-medium'>Dòng {err.row}</span>{' '}
                            ({err.name}):{' '}
                            <span className='text-red-600'>
                              {err.errors.join(', ')}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {uploadStatus === 'empty' && (
            <div className='mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center'>
              <p className='text-gray-600'>
                Không tìm thấy dữ liệu hợp lệ trong file
              </p>
            </div>
          )}

          {/* Submit Button */}
          {classes.length > 0 && errors.length === 0 && (
            <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>
                Sẵn sàng tạo{' '}
                <span className='font-semibold text-gray-800'>
                  {classes.length}
                </span>{' '}
                lớp học
              </p>
              <button
                onClick={handleSubmit}
                className='inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm'
              >
                <Send className='w-4 h-4' />
                Gửi lên server
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMultipleClassForm;
