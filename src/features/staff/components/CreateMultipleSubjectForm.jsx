import React, { useState, useRef } from 'react';
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
  FileX,
  AlertTriangle,
} from 'lucide-react';
import { createMultipleSubjects } from '../../../services/userService';
import { toast } from 'sonner';
import {
  validateExcelStructure,
  generateTemplate,
  SUBJECT_TEMPLATE,
} from '../../../context/excelValidator';
import { handleImportResponse } from '../../../context/responseMessageParser';

const CreateMultipleSubjectForm = ({ onClose }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [structureErrors, setStructureErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Download template using utility
  const downloadTemplate = () => {
    const template = generateTemplate(
      SUBJECT_TEMPLATE.requiredColumns,
      SUBJECT_TEMPLATE.sampleData
    );

    const ws = XLSX.utils.json_to_sheet(template);

    // Enable wrap text for long text columns
    Object.keys(ws).forEach(cell => {
      if (cell.startsWith('G') || cell.startsWith('H')) {
        // SubjectOutcomes and SubjectGradeComponents columns
        ws[cell].s = {
          alignment: { wrapText: true, vertical: 'top' },
        };
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subject Template');
    XLSX.writeFile(wb, 'subject_template.xlsx');
  };

  // Validate file structure using utility
  const validateFileStructure = (parsedData) => {
    return validateExcelStructure(parsedData, SUBJECT_TEMPLATE.requiredColumns);
  };

  // Validate subject data
  const validateSubjectData = (data) => {
    const errors = [];

    data.forEach((subject, index) => {
      const rowErrors = [];

      // Required fields
      if (!subject.SubjectCode?.trim()) {
        rowErrors.push('SubjectCode is required');
      }
      if (!subject.SubjectName?.trim()) {
        rowErrors.push('SubjectName is required');
      }

      // NoCredit validation
      if (subject.NoCredit) {
        if (isNaN(subject.NoCredit)) {
          rowErrors.push('NoCredit must be a number');
        } else if (Number(subject.NoCredit) < 0) {
          rowErrors.push('NoCredit must be positive');
        }
      }

      // IsActive validation
      if (subject.IsActive !== undefined && subject.IsActive !== null) {
        const isActiveValue = String(subject.IsActive).toLowerCase();
        if (!['true', 'false', '1', '0'].includes(isActiveValue)) {
          rowErrors.push('IsActive must be true/false');
        }
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2,
          name: subject.SubjectCode || subject.SubjectName || 'No name',
          errors: rowErrors,
        });
      }
    });

    return errors;
  };

  // Check file type
  const isValidExcelFile = (file) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
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
          throw new Error('File has no sheets');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          throw new Error('Sheet is empty');
        }

        const parsedData = XLSX.utils.sheet_to_json(worksheet);

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

        // ✅ VALIDATE STRUCTURE
        const structureValidation = validateFileStructure(parsedData);

        if (!structureValidation.isValid) {
          setUploadStatus('error');
          const formattedErrors = structureValidation.errors.map(err => ({
            type: 'structure',
            message: `❌ INVALID FILE STRUCTURE! ${err}`,
            details: `Standard file must have ${SUBJECT_TEMPLATE.requiredColumns.length} columns: ${SUBJECT_TEMPLATE.requiredColumns.join(', ')}`,
          }));
          setStructureErrors(formattedErrors);
          setSubjects([]);
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
        const dataErrors = validateSubjectData(parsedData);

        setErrors(dataErrors);
        setSubjects(parsedData);
        setUploadStatus('success');

        if (dataErrors.length === 0) {
          toast.success(`✅ Loaded ${parsedData.length} subjects from file`);
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

  // Submit data to server
  const handleSubmit = async () => {
    if (subjects.length === 0) {
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
      const ws = XLSX.utils.json_to_sheet(subjects);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Subjects');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const file = new File([blob], 'subjects.xlsx', { type: blob.type });

      const response = await createMultipleSubjects(file);
      
      // Use response parser to handle message
      const isSuccess = handleImportResponse(response, toast, 'subjects');
      
      if (isSuccess) {
        resetForm();
        setTimeout(() => {
          if (onClose) onClose(true); // Pass true to trigger refresh
        }, 2000); // Give time to read messages
      }
    } catch (error) {
      console.error('Error creating subjects:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        if (errorData.errorList?.length) {
          errorData.errorList.forEach(err => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else if (errorData.message) {
          // Try to parse error message
          const isSuccess = handleImportResponse(errorData, toast, 'subjects');
          if (!isSuccess && errorData.message) {
            toast.error(errorData.message);
          }
        } else {
          toast.error('Invalid input data');
        }
      } else {
        toast.error('An unknown error occurred. Please try again.');
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
    setStructureErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  Download the Excel template and fill in subject information according to the format
                </p>
                <button
                  onClick={downloadTemplate}
                  className='inline-flex items-center gap-2 mt-2 px-5 py-3 bg-orangeFpt-600 hover:bg-orangeFpt-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-orangeFpt-200 hover:shadow-xl active:scale-95'
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
                  Select the filled Excel file (.xlsx, .xls) - Max 10MB
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
                className='flex flex-col items-center justify-center gap-3 px-6 py-4 border-3 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-orangeFpt-400 hover:bg-orangeFpt-50/50 transition-all bg-white'
              >
                <div className='p-3 bg-orangeFpt-50 rounded-full'>
                  <FileSpreadsheet className='w-6 h-6 text-orangeFpt-500' />
                </div>
                <div className='text-center'>
                  <span className='text-slate-700 font-semibold block mb-1'>
                    {fileName || 'Click to select file'}
                  </span>
                  <span className='text-xs text-slate-500'>Supports .xlsx, .xls files</span>
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

        {/* Structure Errors */}
        {structureErrors.length > 0 && (
          <div className='mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl'>
            <div className='flex items-start gap-4'>
              <div className='p-2 bg-red-100 rounded-lg'>
                <AlertCircle className='w-6 h-6 text-red-600' />
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-red-800 mb-3 text-lg'>
                  Invalid File Structure
                </h4>
                {structureErrors.map((err, idx) => (
                  <div key={idx} className='mb-3 last:mb-0 p-3 bg-white rounded-lg border border-red-100'>
                    <p className='text-red-800 font-semibold mb-1'>
                      {err.message}
                    </p>
                    <p className='text-red-600 text-sm'>
                      {err.details}
                    </p>
                  </div>
                ))}
                <div className='mt-4 pt-3 border-t border-red-200'>
                  <p className='text-sm text-red-800 font-medium mb-2'>
                    How to fix:
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
                  className='mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors'
                >
                  Upload different file
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Errors */}
        {errors.length > 0 && (
          <div className='mb-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl'>
            <div className='flex items-start gap-4'>
              <div className='p-2 bg-amber-100 rounded-lg'>
                <AlertTriangle className='w-6 h-6 text-amber-600' />
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-amber-800 mb-3 text-lg'>
                  Data Errors Detected ({errors.length} errors)
                </h4>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {errors.map((err, idx) => (
                    <div key={idx} className='p-3 bg-white rounded-lg border border-amber-100'>
                      <p className='text-sm'>
                        <span className='font-bold text-amber-800'>Row {err.row}</span>
                        <span className='text-slate-600'> ({err.name}): </span>
                        <span className='text-amber-600 font-medium'>
                          {err.errors.join(', ')}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={resetForm}
                  className='mt-4 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors'
                >
                  Fix file and upload again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success - Subject List */}
        {uploadStatus === 'success' && subjects.length > 0 && errors.length === 0 && (
          <div className='mb-6'>
            <div className='bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm'>
              <div className='max-h-80 overflow-y-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-orangeFpt-50 sticky top-0 z-10'>
                    <tr>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        No.
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Subject Code
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Subject Name
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Credits
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Syllabus
                      </th>
                      <th className='px-4 py-3 text-left font-bold text-orangeFpt-900 border-b-2 border-orangeFpt-200'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, idx) => (
                      <tr
                        key={idx}
                        className='border-b border-slate-100 hover:bg-orangeFpt-50/30 transition-colors'
                      >
                        <td className='px-4 py-3 text-slate-600 font-medium'>{idx + 1}</td>
                        <td className='px-4 py-3'>
                          <span className='px-2 py-1 bg-orangeFpt-100 text-orangeFpt-700 rounded-md font-mono text-xs font-semibold'>
                            {subject.SubjectCode}
                          </span>
                        </td>
                        <td className='px-4 py-3 font-bold text-slate-800'>
                          {subject.SubjectName}
                        </td>
                        <td className='px-4 py-3 text-slate-600 text-center font-medium'>
                          {subject.NoCredit}
                        </td>
                        <td className='px-4 py-3 text-slate-600'>
                          {subject.SyllabusName || '-'}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              subject.IsActive === true || subject.IsActive === 'true'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {subject.IsActive === true || subject.IsActive === 'true'
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

        {/* Empty State */}
        {uploadStatus === 'empty' && (
          <div className='mb-6 p-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-center'>
            <div className='inline-flex p-4 bg-slate-100 rounded-full mb-3'>
              <FileSpreadsheet className='w-8 h-8 text-slate-400' />
            </div>
            <p className='text-slate-600 font-semibold'>No valid data found in file</p>
            <p className='text-sm text-slate-500 mt-1'>Please check the file format and try again</p>
          </div>
        )}

        {/* Submit Button */}
        {subjects.length > 0 && errors.length === 0 && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-3 bg-emerald-50 rounded-lg'>
                <CheckCircle className='w-6 h-6 text-emerald-600' />
              </div>
              <div>
                <p className='text-sm text-slate-600'>Ready to create</p>
                <p className='font-bold text-slate-800 text-lg'>
                  {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={onClose}
                className='px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className='inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-200 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' />
                    Create Subjects
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMultipleSubjectForm;