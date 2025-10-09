import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Send,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { createMultipleSubjects } from '../../services/userService';
import { toast } from 'react-toastify';

const CreateMultipleSubjectForm = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');

  // Tải file Excel mẫu
  const downloadTemplate = () => {
    const template = [
      {
        SubjectCode: 'CS101',
        SubjectName: 'Introduction to Computer Science',
        IsActive: true,
        SyllabusName: 'CS Syllabus 2024',
        Description: 'Basic concepts of computer science',
        NoCredit: 3,
        SubjectOutcomes: `Make a Product\nLearn how to\nPresent final`,
        SubjectGradeComponents: `Product:25\nLearning:25\nPresentation:50`,
      },
    ];

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(template);

    // Bật wrap text và căn chỉnh
    Object.keys(ws).forEach(cell => {
      if (cell.startsWith('A')) return; // Bỏ qua header row
      if (cell.startsWith('G') || cell.startsWith('H')) {
        ws[cell].s = {
          alignment: { wrapText: true, vertical: 'top' },
        };
      }
    });

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subject Template');

    // Xuất file
    XLSX.writeFile(wb, 'subject_template.xlsx');
  };

  // Đọc file Excel
  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('processing');
    setErrors([]);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        // Validate dữ liệu
        const validationErrors = [];
        parsedData.forEach((subject, index) => {
          const rowErrors = [];
          if (!subject.SubjectCode?.trim()) rowErrors.push('Thiếu SubjectCode');
          if (!subject.SubjectName?.trim()) rowErrors.push('Thiếu SubjectName');
          if (subject.NoCredit && isNaN(subject.NoCredit)) {
            rowErrors.push('NoCredit phải là số');
          }

          if (rowErrors.length > 0) {
            validationErrors.push({
              row: index + 2,
              name:
                subject.SubjectCode || subject.SubjectName || 'Không có tên',
              errors: rowErrors,
            });
          }
        });

        setErrors(validationErrors);
        setSubjects(parsedData);
        setUploadStatus(parsedData.length > 0 ? 'success' : 'empty');
      } catch (error) {
        console.error('Error reading file:', error);
        setUploadStatus('error');
        setErrors([
          { general: 'Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.' },
        ]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit dữ liệu lên server
  const handleSubmit = async () => {
    if (subjects.length === 0) {
      alert('Vui lòng tải lên file Excel trước!');
      return;
    }

    try {
      setLoading(true);
      const fileInput = document.getElementById('file-upload');
      const file = fileInput.files[0];

      const response = await createMultipleSubjects(file);
      if (response.isSuccess) {
        toast.success('Tạo môn học thành công!');
        resetForm();
      }
    } catch (error) {
      console.error('Error creating subjects:', error);
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        const combinedMessage = errorData.errorList
          ?.map(err => `${err.field}: ${err.message}`)
          .join('\n');

        setMessage(
          combinedMessage || errorData.message || 'Lỗi dữ liệu đầu vào'
        );
        toast.error(combinedMessage || 'Lỗi khi tạo môn học');
      } else {
        // ✅ Các lỗi khác (500, network,...)
        toast.error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubjects([]);
    setUploadStatus('idle');
    setFileName('');
    setErrors([]);
  };

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <BookOpen className='w-7 h-7' />
            Tạo nhiều môn học từ Excel
          </h2>
          <p className='text-indigo-100 mt-1 text-sm'>
            Tải lên file Excel để tạo nhiều môn học cùng lúc
          </p>
        </div>

        <div className='p-6'>
          {/* Download Template Section */}
          <div className='mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <Download className='w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <h3 className='font-semibold text-gray-800 mb-1'>
                  Bước 1: Tải file mẫu
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Tải xuống file Excel mẫu và điền thông tin môn học theo định
                  dạng
                </p>
                <button
                  onClick={downloadTemplate}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm'
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
                className='flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors'
              >
                <FileSpreadsheet className='w-6 h-6 text-gray-400' />
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

          {/* Success - Subject List */}
          {uploadStatus === 'success' && subjects.length > 0 && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <h3 className='font-semibold text-gray-800'>
                    Danh sách môn học đã tải ({subjects.length} môn)
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
                <div className='max-h-96 overflow-auto'>
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-100 sticky top-0'>
                      <tr>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap'>
                          STT
                        </th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap'>
                          Mã môn
                        </th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap'>
                          Tên môn học
                        </th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap'>
                          Số tín chỉ
                        </th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap'>
                          Giáo trình
                        </th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap'>
                          Trạng thái
                        </th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                          Mô tả
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject, idx) => (
                        <tr
                          key={idx}
                          className='border-t border-gray-200 hover:bg-gray-50'
                        >
                          <td className='px-3 py-2 text-gray-600'>{idx + 1}</td>
                          <td className='px-3 py-2 font-medium text-indigo-600'>
                            {subject.SubjectCode}
                          </td>
                          <td className='px-3 py-2 font-medium text-gray-800'>
                            {subject.SubjectName}
                          </td>
                          <td className='px-3 py-2 text-gray-600 text-center'>
                            {subject.NoCredit}
                          </td>
                          <td className='px-3 py-2 text-gray-600'>
                            {subject.SyllabusName}
                          </td>
                          <td className='px-3 py-2'>
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                subject.IsActive === true ||
                                subject.IsActive === 'true'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {subject.IsActive === true ||
                              subject.IsActive === 'true'
                                ? 'Hoạt động'
                                : 'Không hoạt động'}
                            </span>
                          </td>
                          <td
                            className='px-3 py-2 text-gray-600 max-w-xs truncate'
                            title={subject.Description}
                          >
                            {subject.Description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expandable Details */}
              <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Lưu ý:</strong> Các trường SubjectOutcomes và
                  SubjectGradeComponents sẽ được xử lý khi gửi lên server. Kiểm
                  tra kỹ dữ liệu trước khi submit.
                </p>
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
          {subjects.length > 0 && errors.length === 0 && (
            <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>
                Sẵn sàng tạo{' '}
                <span className='font-semibold text-gray-800'>
                  {subjects.length}
                </span>{' '}
                môn học
              </p>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' />
                    Gửi lên server
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMultipleSubjectForm;
