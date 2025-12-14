import React, { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { createMultipleClasses } from '../../../services/userService';

const CreateMultipleClassForm = ({ onClose }) => {
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [apiErrors, setApiErrors] = useState([]);

  const downloadTemplate = () => {
    // Download file template có sẵn
    const link = document.createElement('a');
    link.href = '/templates/class_template.xlsx';
    link.download = 'class_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template downloaded successfully!');
  };

  const handleFileUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

    setErrors([]);
    setApiErrors([]);

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
          row => row.ClassName && row.SubjectCode
        );

        const validationErrors = [];
        filteredData.forEach((cls, index) => {
          const rowErrors = [];
          if (!cls.ClassName?.trim()) rowErrors.push('Missing ClassName');
          if (!cls.SubjectCode?.trim()) rowErrors.push('Missing SubjectCode');
          if (!cls.SemesterCode?.trim()) rowErrors.push('Missing SemesterCode');
          if (!cls.LecturerCode?.trim()) rowErrors.push('Missing LecturerCode');

          if (
            cls.StudentCodes &&
            typeof cls.StudentCodes === 'string' &&
            !/^[A-Za-z0-9,;\s]+$/.test(cls.StudentCodes)
          ) {
            rowErrors.push('Invalid StudentCodes');
          }

          if (
            cls.IsActive !== true &&
            cls.IsActive !== false &&
            cls.IsActive !== 'true' &&
            cls.IsActive !== 'false'
          ) {
            rowErrors.push('IsActive must be true/false');
          }

          if (rowErrors.length > 0) {
            validationErrors.push({
              row: index + 2,
              name: cls.ClassName || 'No class name',
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
          { general: 'Error reading file. Please check the file format.' },
        ]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (!fileName) {
      toast.error('Please upload an Excel file before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      const fileInput = document.getElementById('file-upload');
      const file = fileInput.files[0];

      const response = await createMultipleClasses(file);
      if (response.isSuccess) {
        toast.success('Classes created successfully!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }

      resetForm();
    } catch (error) {
      resetForm();
      const apiErrorList = error?.response?.data?.errorList || [];
      setApiErrors(apiErrorList);

      if (!apiErrorList.length) {
        toast.error(error.message || 'An error occurred during import');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setClasses([]);
    setErrors([]);
    setUploadStatus('idle');
    setFileName('');
    setApiErrors([]);
  };

  return (
    <div className='max-w-5xl mx-auto p-2'>
      <div className=''>
        <div className='grid grid-cols-2 gap-6'>
          {/* Download Template Card */}
          <div className='mb-6 p-5 bg-gradient-to-br from-orangeFpt-50 to-orange-50 border-2 border-orangeFpt-200 rounded-xl'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-white rounded-lg shadow-sm'>
                <Download className='w-6 h-6 text-orangeFpt-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-slate-800 mb-2 text-lg'>
                  Step 1: Download Template
                </h3>
                <p className='text-sm text-slate-600 mb-4 leading-relaxed'>
                  Download the Excel template and fill in the class information
                  according to the format
                </p>
                <button
                  onClick={downloadTemplate}
                  className='inline-flex items-center gap-2 mt-5 px-5 py-3 bg-orangeFpt-600 hover:bg-orangeFpt-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-orangeFpt-200 hover:shadow-xl active:scale-95'
                >
                  <Download className='w-4 h-4' />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className='mb-6 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl'>
            <div className='flex items-start gap-4 mb-4'>
              <div className='p-3 bg-white rounded-lg shadow-sm'>
                <Upload className='w-6 h-6 text-orangeFpt-600' />
              </div>
              <div>
                <h3 className='font-bold text-slate-800 text-lg mb-1'>
                  Step 2: Upload Excel File
                </h3>
                <p className='text-sm text-slate-600'>
                  Select the filled Excel file to upload
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
                className='flex flex-col items-center justify-center gap-3 px-6 py-2 border-3 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-orangeFpt-400 hover:bg-orangeFpt-50/50 transition-all bg-white'
              >
                <div className='p-4 bg-orangeFpt-50 rounded-full'>
                  <Upload className='w-8 h-8 text-orangeFpt-500' />
                </div>
                <div className='text-center'>
                  <span className='text-slate-700 font-semibold block mb-1'>
                    {fileName || 'Click to select file or drag and drop here'}
                  </span>
                  <span className='text-xs text-slate-500'>
                    Supports .xlsx, .xls files
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
        {/* Processing Status */}
        {uploadStatus === 'processing' && (
          <div className='mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center gap-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-3 border-amber-500 border-t-transparent'></div>
            <span className='text-amber-800 font-semibold'>
              Processing file...
            </span>
          </div>
        )}

        {/* Success - Class List */}
        {uploadStatus === 'success' && classes.length > 0 && (
          <div className='mb-6'>
            <div className='bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm '>
              <div className='max-h-80 overflow-y-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-orangeFpt-50 sticky top-0 z-10'>
                    <tr>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        No.
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Class Name
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Subject Code
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Lecturer
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls, idx) => (
                      <tr
                        key={idx}
                        className='border-b border-slate-100 hover:bg-orangeFpt-50/30 transition-colors'
                      >
                        <td className='px-4 py-3 text-slate-600 font-medium'>
                          {idx + 1}
                        </td>
                        <td className='px-4 py-3 font-bold text-slate-800'>
                          {cls.ClassName}
                        </td>
                        <td className='px-4 py-3 text-slate-600'>
                          <span className='px-2 py-1 bg-orangeFpt-100 text-orangeFpt-700 rounded-md font-mono text-xs font-semibold'>
                            {cls.SubjectCode}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-slate-600 font-medium'>
                          {cls.LecturerCode}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              cls.IsActive === true || cls.IsActive === 'true'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {cls.IsActive === true || cls.IsActive === 'true'
                              ? 'Active'
                              : 'Inactive'}
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
          <div className='mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl'>
            <div className='flex items-start gap-4'>
              <div className='p-2 bg-red-100 rounded-lg'>
                <AlertCircle className='w-6 h-6 text-red-600' />
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-red-800 mb-3 text-lg'>
                  Data Errors Detected ({errors.length} errors)
                </h4>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {errors.map((err, idx) => (
                    <div
                      key={idx}
                      className='p-3 bg-white rounded-lg border border-red-100'
                    >
                      {err.general ? (
                        <p className='text-red-700 font-medium'>
                          {err.general}
                        </p>
                      ) : (
                        <p className='text-sm'>
                          <span className='font-bold text-red-800'>
                            Row {err.row}
                          </span>
                          <span className='text-slate-600'>
                            {' '}
                            ({err.name}):{' '}
                          </span>
                          <span className='text-red-600 font-medium'>
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
          <div className='mb-6 p-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-center'>
            <div className='inline-flex p-4 bg-slate-100 rounded-full mb-3'>
              <FileSpreadsheet className='w-8 h-8 text-slate-400' />
            </div>
            <p className='text-slate-600 font-semibold'>
              No valid data found in file
            </p>
            <p className='text-sm text-slate-500 mt-1'>
              Please check the file format and try again
            </p>
          </div>
        )}

        {/* Submit Button */}
        {classes.length > 0 && errors.length === 0 && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-emerald-50 rounded-lg'>
                <CheckCircle className='w-6 h-6 text-emerald-600' />
              </div>
              <div>
                <p className='text-sm text-slate-600'>Ready to create</p>
                <p className='font-bold text-slate-800 text-lg'>
                  {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={onClose}
                disabled={isLoading}
                className={`px-6 py-2.5 ${
                  isLoading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                } rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-200 hover:shadow-xl active:scale-95'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Classes'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* API Errors */}
      {apiErrors.length > 0 && (
        <div className='mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <AlertCircle className='w-6 h-6 text-red-600' />
            </div>
            <h3 className='font-bold text-red-800 text-lg'>Import Failed</h3>
          </div>
          <ul className='space-y-2'>
            {apiErrors.map((err, index) => (
              <li
                key={index}
                className='flex items-start gap-2 p-3 bg-white rounded-lg border border-red-100'
              >
                <span className='text-red-500 mt-0.5'>•</span>
                <span className='text-red-700 text-sm font-medium flex-1'>
                  {err.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreateMultipleClassForm;
