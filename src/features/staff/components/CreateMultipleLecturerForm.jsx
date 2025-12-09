import React, { useState, useRef } from 'react';
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
  FileSpreadsheet,
  FileX,
  AlertTriangle,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { importLecturerList } from '../../../services/userService';
import { toast } from 'sonner';
import {
  validateExcelStructure,
  validateDataWithRules,
  generateTemplate,
  LECTURER_TEMPLATE,
} from '../../../context/excelValidator';
import { handleImportResponse } from '../../../context/responseMessageParser';

const CreateMultipleLecturerForm = ({ onClose }) => {
  const [lecturers, setLecturers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [structureErrors, setStructureErrors] = useState([]);
  const [apiErrors, setApiErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Download template using utility
  const downloadTemplate = () => {
    const template = generateTemplate(
      LECTURER_TEMPLATE.requiredColumns,
      LECTURER_TEMPLATE.sampleData
    );

    const wsData = XLSX.utils.json_to_sheet(template);

    // Create instruction sheet
    const instructionData = [
      ['INSTRUCTIONS:'],
      ['- Email: Work email (required)'],
      ['- Password: Password (default 12345, should change after login)'],
      ['- FullName: Full name (required, at least 3 characters)'],
      ['- Address: Detailed address (required)'],
      ['- PhoneNumber: Phone number (required, 10-11 digits)'],
      ['- YOB: Year of birth (required, from 1950-1980)'],
      ['- School: School (required)'],
      ['- LecturerCode: Lecturer code (required)'],
      ['- Major: Major (required)'],
    ];
    const wsInstruction = XLSX.utils.aoa_to_sheet(instructionData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, 'Lecturer Template');
    XLSX.utils.book_append_sheet(wb, wsInstruction, 'Instructions');

    XLSX.writeFile(wb, 'lecturer_accounts_template.xlsx');
  };

  // Validate file structure using utility
  const validateFileStructure = parsedData => {
    return validateExcelStructure(
      parsedData,
      LECTURER_TEMPLATE.requiredColumns
    );
  };

  // Validate data using utility
  const validateData = data => {
    return validateDataWithRules(data, LECTURER_TEMPLATE.validationRules);
  };

  // Check file type
  const isValidExcelFile = file => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  // Handle file upload
  const handleFileUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

    setErrors([]);
    setStructureErrors([]);
    setApiErrors([]);

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
      toast.error('File too large! Please select a file smaller than 10MB.');

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

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('File has no data sheet');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          throw new Error('Data sheet is empty');
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
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

        // Filter out empty rows
        const filteredData = jsonData.filter(
          row => row.FullName && row.FullName.trim() !== ''
        );

        // ✅ VALIDATE FILE STRUCTURE
        const structureValidation = validateFileStructure(filteredData);

        if (!structureValidation.isValid) {
          setUploadStatus('error');
          const formattedErrors = structureValidation.errors.map(err => ({
            type: 'structure',
            message: `❌ INVALID FILE STRUCTURE! ${err}`,
            details: `Standard file must have ${LECTURER_TEMPLATE.requiredColumns.length} columns: ${LECTURER_TEMPLATE.requiredColumns.join(', ')}`,
          }));
          setStructureErrors(formattedErrors);
          setLecturers([]);
          toast.error('Invalid file structure! Please download the template.');

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Show warnings if any
        if (
          structureValidation.warnings &&
          structureValidation.warnings.length > 0
        ) {
          structureValidation.warnings.forEach(warning => {
            toast.warning(warning);
            setStructureErrors(prev => [
              ...prev,
              {
                type: 'warning',
                message: `⚠️ ${warning}`,
                details: 'These columns will be ignored during import.',
              },
            ]);
          });
        }

        // ✅ VALIDATE DATA
        const dataErrors = validateData(filteredData);

        setErrors(dataErrors);
        setLecturers(filteredData);
        setUploadStatus('success');

        if (dataErrors.length === 0) {
          toast.success(`✅ Loaded ${filteredData.length} lecturers from file`);
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

  // Handle confirm
  const handleConfirm = async () => {
    if (lecturers.length === 0) {
      toast.warning('Please upload Excel file first!');
      return;
    }

    if (errors.length > 0) {
      toast.error('Please fix errors in file before submitting!');
      return;
    }

    setIsLoading(true);
    try {
      // Create file from data
      const ws = XLSX.utils.json_to_sheet(lecturers);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lecturers');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const file = new File([blob], 'lecturers.xlsx', { type: blob.type });

      const response = await importLecturerList(file);
      console.log('Import response:', response);

      // Use response parser to handle message
      if (response.isSuccess === true) {
        toast.success('Lecturers imported successfully!');
      } else {
        const isSuccess = handleImportResponse(response, toast, 'lecturers');

        if (isSuccess) {
          setIsSubmitting(true);
          setTimeout(() => {
            if (onClose) onClose();
          }, 2000); // Give time to read messages
        } else {
          // If import failed (0 imported), show API errors if available
          if (response.errorList && response.errorList.length > 0) {
            setApiErrors(response.errorList);
          }
        }
      }
    } catch (error) {
      console.error('Error importing lecturers:', error);

      const apiErrorList = error?.response?.data?.errorList || [];
      setApiErrors(apiErrorList);

      if (apiErrorList.length > 0) {
        apiErrorList.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else if (error?.response?.data?.message) {
        // Try to parse error message
        const isSuccess = handleImportResponse(
          error.response.data,
          toast,
          'lecturers'
        );
        if (!isSuccess && error.response.data.message) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(error.message || 'An error occurred during import');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setLecturers([]);
    setUploadStatus('idle');
    setFileName('');
    setErrors([]);
    setStructureErrors([]);
    setApiErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg'>
            <Users className='w-6 h-6 text-white' />
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
            className={`flex items-center gap-2 ${uploadStatus !== 'idle' ? 'text-green-600' : 'text-blue-600'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadStatus !== 'idle' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}
            >
              {uploadStatus !== 'idle' ? <Check size={16} /> : '1'}
            </div>
            <span className='font-medium'>Download & Fill Template</span>
          </div>
          <div
            className={`flex-1 h-px mx-4 ${uploadStatus === 'success' ? 'bg-green-200' : 'bg-gray-200'}`}
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

      {/* Download & Upload Cards */}
      <div className='grid md:grid-cols-2 gap-6 mb-6'>
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
            Only Excel files (.xlsx, .xls), maximum 10MB
          </p>
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
              className='flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors'
            >
              <FileSpreadsheet className='w-6 h-6 text-blue-400' />
              <span className='text-blue-600 font-medium'>
                {fileName || 'Click to upload Excel file'}
              </span>
            </label>
          </div>
          {uploadStatus === 'processing' && (
            <div className='mt-2 text-blue-600 text-sm flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              Processing file...
            </div>
          )}
        </div>
      </div>

      {/* Structure Errors */}
      {structureErrors.length > 0 && (
        <div className='mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-lg'>
          <div className='flex items-start gap-3'>
            <FileX className='w-6 h-6 text-red-600 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h4 className='font-bold text-red-900 mb-3 text-lg'>
                ⛔ INCORRECT FILE STRUCTURE!
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
                  <div
                    key={idx}
                    className='text-sm bg-white p-2 rounded border border-orange-200'
                  >
                    <p className='text-orange-800'>
                      <span className='font-medium'>Row {err.row}:</span>{' '}
                      {err.name}
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

      {/* Preview Section */}
      {uploadStatus === 'success' &&
        lecturers.length > 0 &&
        errors.length === 0 && (
          <div className='bg-white border border-gray-200 rounded-xl overflow-hidden mb-6'>
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <Users size={20} />✅ Valid file! ({lecturers.length}{' '}
                  lecturers)
                </h3>
                <button
                  onClick={resetForm}
                  className='text-gray-500 hover:text-gray-700 p-1'
                  title='Clear and upload again'
                >
                  <X className='w-5 h-5' />
                </button>
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

      {/* API Errors */}
      {apiErrors.length > 0 && (
        <div className='mb-6 p-4 bg-red-50 border border-red-300 rounded-lg'>
          <h3 className='text-red-600 font-semibold mb-2'>
            Error list from server:
          </h3>
          <ul className='list-disc list-inside text-red-700 space-y-1'>
            {apiErrors.map((err, index) => (
              <li key={index}>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      {lecturers.length > 0 && errors.length === 0 && !isSubmitting && (
        <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-600'>
            Ready to create{' '}
            <span className='font-semibold text-gray-800'>
              {lecturers.length}
            </span>{' '}
            accounts
          </p>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className='px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold text-lg flex items-center gap-3 min-w-64 justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
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

      {/* Success State */}
      {isSubmitting && (
        <div className='text-center py-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
            <Check className='w-8 h-8 text-green-600' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            Accounts Created Successfully!
          </h3>
          <p className='text-gray-600'>
            {lecturers.length} lecturer accounts have been created.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateMultipleLecturerForm;
