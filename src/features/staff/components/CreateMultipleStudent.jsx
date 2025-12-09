import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Users,
  Send,
  X,
  FileSpreadsheet,
  FileX,
  AlertTriangle,
} from 'lucide-react';
import { importStudentList } from '../../../services/userService';
import { toast } from 'sonner';
import {
  validateExcelStructure,
  validateDataWithRules,
  generateTemplate,
  STUDENT_TEMPLATE,
} from '../../../context/excelValidator';
import { handleImportResponse } from '../../../context/responseMessageParser';

const CreateMultipleStudentForm = ({ onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [structureErrors, setStructureErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Download template
  const downloadTemplate = () => {
    const template = generateTemplate(
      STUDENT_TEMPLATE.requiredColumns,
      STUDENT_TEMPLATE.sampleData
    );
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Template');
    XLSX.writeFile(wb, 'student_accounts_template.xlsx');
  };

  // Validate file structure - use utility
  const validateFileStructure = (parsedData) => {
    return validateExcelStructure(parsedData, STUDENT_TEMPLATE.requiredColumns);
  };

  // Validate data - use utility
  const validateData = (data) => {
    return validateDataWithRules(data, STUDENT_TEMPLATE.validationRules);
  };

  // Check file type
  const isValidExcelFile = (file) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrors([]);
    setStructureErrors([]);

    // Validate file type
    if (!isValidExcelFile(file)) {
      setUploadStatus('error');
      setFileName('');
      setStructureErrors([
        {
          type: 'structure',
          message: '❌ Invalid file format!',
          details: 'Only Excel files (.xlsx, .xls) are accepted',
        },
      ]);
      toast.error('Invalid file format! Please select an Excel file.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus('error');
      setFileName('');
      setStructureErrors([
        {
          type: 'structure',
          message: '❌ File too large!',
          details: 'Maximum file size is 10MB',
        },
      ]);
      toast.error('File too large! Maximum size is 10MB.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFileName(file.name);
    setUploadStatus('processing');

    const reader = new FileReader();

    reader.onerror = () => {
      setUploadStatus('error');
      setFileName('');
      setStructureErrors([
        {
          type: 'structure',
          message: '❌ Cannot read file!',
          details: 'File may be corrupted or invalid.',
        },
      ]);
      toast.error('Cannot read file. Please check the file.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('File has no data sheet');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error('Data sheet is empty');
        }

        const parsedData = XLSX.utils.sheet_to_json(sheet);

        if (!parsedData || parsedData.length === 0) {
          setUploadStatus('empty');
          setStructureErrors([
            {
              type: 'structure',
              message: '❌ File has no data!',
              details: 'Please add data to the Excel file.',
            },
          ]);
          toast.warning('File has no data');

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // ✅ VALIDATE FILE STRUCTURE
        const structureValidation = validateFileStructure(parsedData);

        if (!structureValidation.isValid) {
          setUploadStatus('error');
          // Format errors for UI
          const formattedErrors = structureValidation.errors.map(err => ({
            type: 'structure',
            message: `❌ File format INCORRECT! ${err}`,
            details: `Standard file must have ${STUDENT_TEMPLATE.requiredColumns.length} columns: ${STUDENT_TEMPLATE.requiredColumns.join(', ')}`,
          }));
          setStructureErrors(formattedErrors);
          setStudents([]);
          toast.error('Invalid file structure! Please download the template.');

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Show warnings if any
        if (structureValidation.warnings && structureValidation.warnings.length > 0) {
          structureValidation.warnings.forEach(warning => {
            toast.warning(warning);
            setStructureErrors(prev => [...prev, {
              type: 'warning',
              message: `⚠️ ${warning}`,
              details: 'These columns will be ignored during import.',
            }]);
          });
        }

        // ✅ VALIDATE DATA
        const dataErrors = validateData(parsedData);

        setErrors(dataErrors);
        setStudents(parsedData);
        setUploadStatus('success');

        if (dataErrors.length === 0) {
          toast.success(`✅ Loaded ${parsedData.length} students from file`);
        } else {
          toast.warning(`⚠️ Found ${dataErrors.length} errors in file`);
        }

      } catch (error) {
        console.error('Error reading file:', error);
        setUploadStatus('error');
        setFileName('');
        setStructureErrors([
          {
            type: 'structure',
            message: '❌ Error reading file!',
            details: error.message || 'Please check the file format.',
          },
        ]);
        toast.error('Error reading file. Please check the file.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (students.length === 0) {
      toast.warning('Please upload Excel file first!');
      return;
    }

    if (errors.length > 0) {
      toast.error('Please fix errors in file before submitting!');
      return;
    }

    try {
      setLoading(true);

      // Create file from data
      const ws = XLSX.utils.json_to_sheet(students);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const file = new File([blob], 'students.xlsx', { type: blob.type });

      const response = await importStudentList(file);
      
      // Use response parser to handle message
      const isSuccess = handleImportResponse(response, toast, 'students');
      
      if (isSuccess) {
        resetForm();
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000); // Give time to read messages
      }
    } catch (error) {
      console.error('Error creating students:', error);
      
      const errorData = error?.response?.data;
      
      if (errorData?.errorList && errorData.errorList.length > 0) {
        errorData.errorList.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else if (errorData?.message) {
        // Try to parse error message
        const isSuccess = handleImportResponse(errorData, toast, 'students');
        if (!isSuccess && errorData.message) {
          toast.error(errorData.message);
        }
      } else {
        toast.error('An error occurred while creating accounts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudents([]);
    setUploadStatus('idle');
    setFileName('');
    setErrors([]);
    setStructureErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <Users className='w-7 h-7' />
            Create Multiple Student Accounts
          </h2>
          <p className='text-blue-100 mt-1 text-sm'>
            Upload Excel file to create multiple student accounts at once
          </p>
        </div>

        <div className='p-6'>
          {/* Download Template */}
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <Download className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <h3 className='font-semibold text-gray-800 mb-1'>
                  Step 1: Download Standard Template
                </h3>
                <button
                  onClick={downloadTemplate}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm'
                >
                  <Download className='w-4 h-4' />
                  Download Template
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
                  Step 2: Upload Excel File (only .xlsx, .xls)
                </h3>
                <p className='text-sm text-gray-600'>
                  File must have the same structure as template, maximum 10MB
                </p>
              </div>
            </div>

            <div className='relative'>
              <input
                ref={fileInputRef}
                type='file'
                id='file-upload'
                accept='.xlsx,.xls'
                onChange={handleFileUpload}
                className='hidden'
              />
              <label
                htmlFor='file-upload'
                className='flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors'
              >
                <FileSpreadsheet className='w-6 h-6 text-gray-400' />
                <span className='text-gray-600'>
                  {fileName || 'Click to select Excel file'}
                </span>
              </label>
            </div>
          </div>

          {/* Processing */}
          {uploadStatus === 'processing' && (
            <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600'></div>
              <span className='text-yellow-800 font-medium'>Processing file...</span>
            </div>
          )}

          {/* Structure Errors */}
          {structureErrors.length > 0 && (
            <div className='mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-lg'>
              <div className='flex items-start gap-3'>
                <FileX className='w-6 h-6 text-red-600 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='font-bold text-red-900 mb-3 text-lg'>
                    ⛔ INVALID FILE STRUCTURE!
                  </h4>
                  {structureErrors.map((err, idx) => (
                    <div key={idx} className='mb-3 last:mb-0'>
                      <p className='text-red-800 font-semibold mb-1'>
                        {err.message}
                      </p>
                      <p className='text-red-700 text-sm bg-red-100 p-2 rounded'>
                        {err.details}
                      </p>
                    </div>
                  ))}
                  <div className='mt-4 pt-3 border-t border-red-200'>
                    <p className='text-sm text-red-800 font-medium mb-2'>
                      ✅ How to fix:
                    </p>
                    <ol className='list-decimal list-inside text-sm text-red-700 space-y-1'>
                      <li>Download the standard template above</li>
                      <li>Copy your data into the template file</li>
                      <li>DO NOT add/remove/rename columns</li>
                      <li>Upload the corrected file</li>
                    </ol>
                  </div>
                  <button
                    onClick={resetForm}
                    className='mt-4 text-sm text-red-700 hover:text-red-800 font-medium underline'
                  >
                    Upload different file
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Errors */}
          {errors.length > 0 && (
            <div className='mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='font-semibold text-orange-900 mb-2'>
                    Data validation errors found ({errors.length} errors)
                  </h4>
                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {errors.map((err, idx) => (
                      <div key={idx} className='text-sm bg-white p-2 rounded border border-orange-200'>
                        <p className='text-orange-800'>
                          <span className='font-medium'>Row {err.row}:</span> {err.name}
                        </p>
                        <p className='text-orange-700 ml-4'>
                          • {err.errors.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={resetForm}
                    className='mt-3 text-sm text-orange-700 hover:text-orange-800 font-medium underline'
                  >
                    Fix file and upload again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success - Student List */}
          {uploadStatus === 'success' && students.length > 0 && errors.length === 0 && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <h3 className='font-semibold text-gray-800'>
                    ✅ Valid file! ({students.length} students)
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className='text-gray-500 hover:text-gray-700 p-1'
                  title='Clear and upload again'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              <div className='bg-gray-50 rounded-lg border border-gray-200 overflow-hidden'>
                <div className='max-h-96 overflow-auto'>
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-100 sticky top-0'>
                      <tr>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>No.</th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>Email</th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>Full Name</th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>Student Code</th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>Major</th>
                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>School</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={idx} className='border-t border-gray-200 hover:bg-gray-50'>
                          <td className='px-3 py-2 text-gray-600'>{idx + 1}</td>
                          <td className='px-3 py-2 text-blue-600'>{student.Email}</td>
                          <td className='px-3 py-2 font-medium'>{student.Fullname}</td>
                          <td className='px-3 py-2'>{student.StudentCode}</td>
                          <td className='px-3 py-2'>{student.Major}</td>
                          <td className='px-3 py-2'>{student.School}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {students.length > 0 && errors.length === 0 && (
            <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>
                Ready to create <span className='font-semibold text-gray-800'>{students.length}</span> accounts
              </p>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' />
                    Submit to Server
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

export default CreateMultipleStudentForm;