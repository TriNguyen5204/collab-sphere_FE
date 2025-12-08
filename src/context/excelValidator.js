// Utility function to validate Excel file structure
// Used for Excel upload components

/**
 * Validate if Excel file matches the template
 * @param {Array} parsedData - Data parsed from XLSX
 * @param {Array} requiredColumns - List of required columns
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateExcelStructure = (parsedData, requiredColumns) => {
  const errors = [];

  // 1. Check if file has data
  if (!parsedData || parsedData.length === 0) {
    return {
      isValid: false,
      errors: ['File has no data. Please add data to the Excel file.'],
    };
  }

  // 2. Get headers from the first row
  const firstRow = parsedData[0];
  const actualColumns = Object.keys(firstRow);

  // 3. Check each required column
  const missingColumns = [];
  requiredColumns.forEach(col => {
    if (!actualColumns.includes(col)) {
      missingColumns.push(col);
    }
  });

  if (missingColumns.length > 0) {
    errors.push(
      `File is missing required columns: ${missingColumns.join(', ')}`
    );
  }

  // 4. Check for extra columns (optional warning)
  const extraColumns = actualColumns.filter(
    col => !requiredColumns.includes(col)
  );

  return {
    isValid: errors.length === 0,
    errors,
    warnings: extraColumns.length > 0 
      ? [`File has unnecessary columns: ${extraColumns.join(', ')}`]
      : [],
    actualColumns,
    missingColumns,
    extraColumns,
  };
};

/**
 * Generate sample template for download
 * @param {Array} columns - List of columns
 * @param {Object} sampleData - Sample data
 * @returns {Array} Template data
 */
export const generateTemplate = (columns, sampleData) => {
  const template = {};
  columns.forEach(col => {
    template[col] = sampleData[col] || '';
  });
  return [template];
};

// ==========================================
// TEMPLATES FOR FILE TYPES
// ==========================================

// Template for Student Accounts
export const STUDENT_TEMPLATE = {
  requiredColumns: [
    'Email',
    'Password',
    'Fullname',
    'Address',
    'PhoneNumber',
    'YOB',
    'School',
    'StudentCode',
    'Major',
  ],
  sampleData: {
    Email: 'johndoe@university.edu.vn',
    Password: '12345',
    Fullname: 'John Doe',
    Address: '123 ABC Street, District 1, HCMC',
    PhoneNumber: '84123456789',
    YOB: 1980,
    School: 'FPT University',
    StudentCode: 'SE214727',
    Major: 'Computer Science',
  },
  validationRules: {
    Email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Invalid Email',
    },
    Password: {
      required: true,
      minLength: 5,
      errorMessage: 'Password must be at least 5 characters',
    },
    Fullname: {
      required: true,
      minLength: 3,
      errorMessage: 'Fullname must be at least 3 characters',
    },
    Address: {
      required: true,
      errorMessage: 'Address is required',
    },
    PhoneNumber: {
      required: true,
      pattern: /^[0-9]{10,11}$/,
      errorMessage: 'PhoneNumber must be 10-11 digits',
    },
    YOB: {
      required: true,
      type: 'number',
      min: 1950,
      max: 2010,
      errorMessage: 'YOB must be a number between 1950-2010',
    },
    School: {
      required: true,
      errorMessage: 'School is required',
    },
    StudentCode: {
      required: true,
      errorMessage: 'StudentCode is required',
    },
    Major: {
      required: true,
      errorMessage: 'Major is required',
    },
  },
};

// Template for Lecturer Accounts
export const LECTURER_TEMPLATE = {
  requiredColumns: [
    'Email',
    'Password',
    'FullName',
    'Address',
    'PhoneNumber',
    'YOB',
    'School',
    'LecturerCode',
    'Major',
  ],
  sampleData: {
    Email: 'johndoe@university.edu.vn',
    Password: '12345',
    FullName: 'John Doe',
    Address: '123 ABC Street, District 1, HCMC',
    PhoneNumber: '84123456789',
    YOB: 1980,
    School: 'FPT University',
    LecturerCode: 'SE184727',
    Major: 'Computer Science',
  },
  validationRules: {
    Email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Invalid Email',
    },
    Password: {
      required: true,
      minLength: 5,
      errorMessage: 'Password must be at least 5 characters',
    },
    FullName: {
      required: true,
      minLength: 3,
      errorMessage: 'FullName must be at least 3 characters',
    },
    Address: {
      required: true,
      errorMessage: 'Address is required',
    },
    PhoneNumber: {
      required: true,
      pattern: /^[0-9]{10,11}$/,
      errorMessage: 'PhoneNumber must be 10-11 digits',
    },
    YOB: {
      required: true,
      type: 'number',
      min: 1950,
      max: 1980,
      errorMessage: 'YOB must be a number between 1950-1980',
    },
    School: {
      required: true,
      errorMessage: 'School is required',
    },
    LecturerCode: {
      required: true,
      errorMessage: 'LecturerCode is required',
    },
    Major: {
      required: true,
      errorMessage: 'Major is required',
    },
  },
};

// Template for Subjects
export const SUBJECT_TEMPLATE = {
  requiredColumns: [
    'SubjectCode',
    'SubjectName',
    'IsActive',
    'SyllabusName',
    'Description',
    'NoCredit',
    'SubjectOutcomes',
    'SubjectGradeComponents',
  ],
  sampleData: {
    SubjectCode: 'CS101',
    SubjectName: 'Introduction to Computer Science',
    IsActive: true,
    SyllabusName: 'CS Syllabus 2024',
    Description: 'Basic concepts of computer science',
    NoCredit: 3,
    SubjectOutcomes: 'Make a Product\nLearn how to\nPresent final',
    SubjectGradeComponents: 'Product:25\nLearning:25\nPresentation:50',
  },
};

/**
 * Validate data according to rules
 * @param {Array} data - Parsed data
 * @param {Object} validationRules - Rules to validate
 * @returns {Array} Validation errors
 */
export const validateDataWithRules = (data, validationRules) => {
  const errors = [];

  data.forEach((row, index) => {
    const rowErrors = [];

    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = row[field];

      // Check required
      if (rule.required && (!value || String(value).trim() === '')) {
        rowErrors.push(`${field} is required`);
        return;
      }

      // Skip validation if value is empty and not required
      if (!value && !rule.required) return;

      // Check type
      if (rule.type === 'number' && isNaN(Number(value))) {
        rowErrors.push(`${field} must be a number`);
        return;
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(String(value))) {
        rowErrors.push(rule.errorMessage || `${field} is invalid`);
      }

      // Check minLength
      if (rule.minLength && String(value).length < rule.minLength) {
        rowErrors.push(
          rule.errorMessage ||
            `${field} must be at least ${rule.minLength} characters`
        );
      }

      // Check min/max for numbers
      if (rule.type === 'number') {
        const numValue = Number(value);
        if (rule.min && numValue < rule.min) {
          rowErrors.push(
            rule.errorMessage || `${field} must be greater than or equal to ${rule.min}`
          );
        }
        if (rule.max && numValue > rule.max) {
          rowErrors.push(
            rule.errorMessage || `${field} must be less than or equal to ${rule.max}`
          );
        }
      }
    });

    if (rowErrors.length > 0) {
      errors.push({
        row: index + 2, // +2 because excel has header at row 1
        name: row.Fullname || row.FullName || row.SubjectCode || 'No name',
        errors: rowErrors,
      });
    }
  });

  return errors;
};