import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Users,
  Check,
  User,
  MapPin,
  Phone,
  Building,
  FileSpreadsheet,
  FileX,
  AlertTriangle,
  X,
  Mail,
  Save,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { importLecturerList } from '../../../services/userService';
import { toast } from 'sonner';
import {
  validateExcelStructure,
  validateDataWithRules,
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
    // Download file template có sẵn
    const link = document.createElement('a');
    link.href = '/templates/lecturer_accounts_template.xlsx';
    link.download = 'lecturer_accounts_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template downloaded successfully!');
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
          message: 'Invalid file format!',
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
          message: 'File too large!',
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
          message: 'Cannot read file!',
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
              message: 'File has no data!',
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

        // VALIDATE FILE STRUCTURE
        const structureValidation = validateFileStructure(filteredData);

        if (!structureValidation.isValid) {
          setUploadStatus('error');
          const formattedErrors = structureValidation.errors.map(err => ({
            type: 'structure',
            message: `INVALID FILE STRUCTURE! ${err}`,
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

        // VALIDATE DATA
        const dataErrors = validateData(filteredData);

        setErrors(dataErrors);
        setLecturers(filteredData);
        setUploadStatus('success');

        if (dataErrors.length === 0) {
          toast.success(`Loaded ${filteredData.length} lecturers from file`);
        } else {
          toast.warning(`Found ${dataErrors.length} errors in file`);
        }
      } catch (error) {
        console.error('Error reading file:', error);
        setUploadStatus('error');
        setFileName('');
        setStructureErrors([
          {
            type: 'structure',
            message: 'Error reading file!',
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
    <div className='space-y-6'>
      {/* Step indicator */}
      <div className='mb-6'>
        <div className='flex items-center justify-between text-sm'>
          <div
            className={`flex items-center gap-2 ${uploadStatus !== 'idle' ? 'text-green-600' : 'text-orangeFpt-600'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${uploadStatus !== 'idle' ? 'bg-green-100 text-green-600' : 'bg-orangeFpt-100 text-orangeFpt-600'}`}
            >
              {uploadStatus !== 'idle' ? <Check size={16} /> : '1'}
            </div>
            <span className='font-medium'>Download Template</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-4 rounded ${uploadStatus === 'success' ? 'bg-green-300' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center gap-2 ${lecturers.length > 0 && errors.length === 0 ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${lecturers.length > 0 && errors.length === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {lecturers.length > 0 && errors.length === 0 ? (
                <Check size={16} />
              ) : (
                '2'
              )}
            </div>
            <span className='font-medium'>Upload & Review</span>
          </div>
          <div
            className={`flex-1 h-0.5 mx-4 rounded ${isSubmitting ? 'bg-green-300' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex items-center gap-2 ${isSubmitting ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${isSubmitting ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {isSubmitting ? <Check size={16} /> : '3'}
            </div>
            <span className='font-medium'>Create Accounts</span>
          </div>
        </div>
      </div>

      {/* Download & Upload Cards */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Download Template Card */}
        <div className='bg-gradient-to-br from-orangeFpt-50 to-orange-50 border-2 border-orangeFpt-200 rounded-xl p-5'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2.5 bg-orangeFpt-100 rounded-xl'>
              <Download className='w-5 h-5 text-orangeFpt-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-800'>
                Step 1: Download Template
              </h3>
              <p className='text-sm text-gray-500'>
                Get the Excel template file
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white rounded-xl hover:from-orangeFpt-600 hover:to-orangeFpt-700 transition-all font-medium shadow-sm'
          >
            <Download size={18} />
            Download Template
          </button>
        </div>

        {/* Upload File Card */}
        <div className='bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-gray-200 rounded-xl p-5'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2.5 bg-gray-100 rounded-xl'>
              <Upload className='w-5 h-5 text-gray-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-800'>
                Step 2: Upload File
              </h3>
              <p className='text-sm text-gray-500'>
                Excel files only (.xlsx, .xls), max 10MB
              </p>
            </div>
          </div>
          <div className='relative'>
            <input
              ref={fileInputRef}
              type='file'
              id='lecturer-file-upload'
              accept='.xlsx,.xls'
              onChange={handleFileUpload}
              className='hidden'
            />
            <label
              htmlFor='lecturer-file-upload'
              className={`flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                fileName
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-orangeFpt-400 hover:bg-orangeFpt-50'
              }`}
            >
              <FileSpreadsheet
                className={`w-5 h-5 ${fileName ? 'text-green-500' : 'text-gray-400'}`}
              />
              <span
                className={`font-medium ${fileName ? 'text-green-600' : 'text-gray-500'}`}
              >
                {fileName || 'Click to upload Excel file'}
              </span>
            </label>
          </div>
          {uploadStatus === 'processing' && (
            <div className='mt-2 text-orangeFpt-600 text-sm flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-2 border-orangeFpt-600 border-t-transparent'></div>
              Processing file...
            </div>
          )}
        </div>
      </div>

      {/* Structure Errors */}
      {structureErrors.length > 0 && (
        <div className='p-4 bg-red-50 border-2 border-red-200 rounded-xl'>
          <div className='flex items-start gap-3'>
            <FileX className='w-5 h-5 text-red-500 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h4 className='font-semibold text-red-800 mb-2'>
                Invalid File Structure
              </h4>
              {structureErrors.map((err, idx) => (
                <div key={idx} className='mb-2 last:mb-0'>
                  <p className='text-red-700 text-sm font-medium'>
                    {err.message}
                  </p>
                  <p className='text-red-600 text-xs mt-1 bg-red-100 p-2 rounded-lg'>
                    {err.details}
                  </p>
                </div>
              ))}
              <div className='mt-3 pt-3 border-t border-red-200'>
                <p className='text-xs text-red-700 font-medium mb-1'>
                  How to fix:
                </p>
                <ol className='list-decimal list-inside text-xs text-red-600 space-y-0.5'>
                  <li>Download the standard template above</li>
                  <li>Copy your data into the template file</li>
                  <li>Do not add/remove/rename columns</li>
                  <li>Upload the corrected file</li>
                </ol>
              </div>
              <button
                onClick={resetForm}
                className='mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1'
              >
                <X size={14} />
                Clear and try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Errors */}
      {errors.length > 0 && (
        <div className='p-4 bg-amber-50 border-2 border-amber-200 rounded-xl'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h4 className='font-semibold text-amber-800 mb-2'>
                Data Validation Errors ({errors.length})
              </h4>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {errors.map((err, idx) => (
                  <div
                    key={idx}
                    className='text-sm bg-white p-2 rounded-lg border border-amber-200'
                  >
                    <p className='text-amber-800'>
                      <span className='font-medium'>Row {err.row}:</span>{' '}
                      {err.name}
                    </p>
                    <p className='text-amber-600 text-xs mt-0.5'>
                      • {err.errors.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={resetForm}
                className='mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1'
              >
                <X size={14} />
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
          <div className='border-2 border-gray-200 rounded-xl overflow-hidden'>
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
                  <Users size={18} className='text-green-600' />
                  <span className='text-green-600'>✓</span> Valid File -{' '}
                  {lecturers.length} Lecturers
                </h3>
                <button
                  onClick={resetForm}
                  className='text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors'
                  title='Clear and upload again'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            </div>

            <div className='max-h-72 overflow-y-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 sticky top-0'>
                  <tr>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600 w-12'>
                      #
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                      Full Name
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                      Email
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                      Lecturer Code
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                      Major
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-600'>
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {lecturers.map((lecturer, idx) => (
                    <tr
                      key={idx}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-3 py-2 text-gray-400 font-medium'>
                        {idx + 1}
                      </td>
                      <td className='px-3 py-2'>
                        <div className='flex items-center gap-2'>
                          <div className='w-7 h-7 bg-orangeFpt-100 rounded-full flex items-center justify-center'>
                            <User size={14} className='text-orangeFpt-600' />
                          </div>
                          <span className='font-medium text-gray-800'>
                            {lecturer.FullName}
                          </span>
                        </div>
                      </td>
                      <td className='px-3 py-2 text-gray-600'>
                        {lecturer.Email}
                      </td>
                      <td className='px-3 py-2'>
                        <span className='px-2 py-0.5 bg-orangeFpt-100 text-orangeFpt-700 rounded-md text-xs font-medium'>
                          {lecturer.LecturerCode}
                        </span>
                      </td>
                      <td className='px-3 py-2 text-gray-600'>
                        {lecturer.Major}
                      </td>
                      <td className='px-3 py-2 text-gray-600'>
                        {lecturer.PhoneNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* API Errors */}
      {apiErrors.length > 0 && (
        <div className='p-4 bg-red-50 border-2 border-red-200 rounded-xl'>
          <h4 className='text-red-700 font-semibold mb-2 flex items-center gap-2'>
            <AlertTriangle size={16} />
            Server Errors
          </h4>
          <ul className='space-y-1'>
            {apiErrors.map((err, index) => (
              <li key={index} className='text-sm text-red-600'>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Actions */}
      <div className='pt-4 border-t border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>
            {lecturers.length > 0 && errors.length === 0 && !isSubmitting && (
              <span>
                Ready to create{' '}
                <strong className='text-gray-700'>{lecturers.length}</strong>{' '}
                lecturer accounts
              </span>
            )}
          </div>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={resetForm}
              className='flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium'
            >
              <X className='w-4 h-4' />
              Reset
            </button>

            <button
              onClick={handleConfirm}
              disabled={
                isLoading ||
                lecturers.length === 0 ||
                errors.length > 0 ||
                isSubmitting
              }
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                isLoading ||
                lecturers.length === 0 ||
                errors.length > 0 ||
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white hover:from-orangeFpt-600 hover:to-orangeFpt-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4' />
                  Create {lecturers.length > 0 ? lecturers.length : ''}{' '}
                  Lecturers
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success State */}
      {isSubmitting && (
        <div className='text-center py-8 bg-green-50 rounded-xl border-2 border-green-200'>
          <div className='inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3'>
            <Check className='w-7 h-7 text-green-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-800 mb-1'>
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
