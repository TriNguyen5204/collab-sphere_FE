// Utility function to validate Excel file structure
// Dùng cho các component upload Excel

/**
 * Validate xem file Excel có đúng template không
 * @param {Array} parsedData - Data đã parse từ XLSX
 * @param {Array} requiredColumns - Danh sách cột bắt buộc
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateExcelStructure = (parsedData, requiredColumns) => {
  const errors = [];

  // 1. Kiểm tra file có data không
  if (!parsedData || parsedData.length === 0) {
    return {
      isValid: false,
      errors: ['File không có dữ liệu. Vui lòng thêm dữ liệu vào file Excel.'],
    };
  }

  // 2. Lấy headers từ dòng đầu tiên
  const firstRow = parsedData[0];
  const actualColumns = Object.keys(firstRow);

  // 3. Kiểm tra từng cột bắt buộc
  const missingColumns = [];
  requiredColumns.forEach(col => {
    if (!actualColumns.includes(col)) {
      missingColumns.push(col);
    }
  });

  if (missingColumns.length > 0) {
    errors.push(
      `File thiếu các cột bắt buộc: ${missingColumns.join(', ')}`
    );
  }

  // 4. Kiểm tra có cột thừa không (optional warning)
  const extraColumns = actualColumns.filter(
    col => !requiredColumns.includes(col)
  );

  return {
    isValid: errors.length === 0,
    errors,
    warnings: extraColumns.length > 0 
      ? [`File có các cột không cần thiết: ${extraColumns.join(', ')}`]
      : [],
    actualColumns,
    missingColumns,
    extraColumns,
  };
};

/**
 * Generate template mẫu để download
 * @param {Array} columns - Danh sách cột
 * @param {Object} sampleData - Dữ liệu mẫu
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
// TEMPLATES CHO CÁC LOẠI FILE
// ==========================================

// Template cho Student Accounts
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
    Email: 'nguyenvana@university.edu.vn',
    Password: '12345',
    Fullname: 'Nguyễn Văn A',
    Address: '123 Đường ABC, Quận 1, TP.HCM',
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
      errorMessage: 'Email không hợp lệ',
    },
    Password: {
      required: true,
      minLength: 5,
      errorMessage: 'Password phải có ít nhất 5 ký tự',
    },
    Fullname: {
      required: true,
      minLength: 3,
      errorMessage: 'Fullname phải có ít nhất 3 ký tự',
    },
    Address: {
      required: true,
      errorMessage: 'Address là bắt buộc',
    },
    PhoneNumber: {
      required: true,
      pattern: /^[0-9]{10,11}$/,
      errorMessage: 'PhoneNumber phải là 10-11 chữ số',
    },
    YOB: {
      required: true,
      type: 'number',
      min: 1950,
      max: 2010,
      errorMessage: 'YOB phải là số từ 1950-2010',
    },
    School: {
      required: true,
      errorMessage: 'School là bắt buộc',
    },
    StudentCode: {
      required: true,
      errorMessage: 'StudentCode là bắt buộc',
    },
    Major: {
      required: true,
      errorMessage: 'Major là bắt buộc',
    },
  },
};

// Template cho Lecturer Accounts
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
  validationRules: {
    Email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Email không hợp lệ',
    },
    Password: {
      required: true,
      minLength: 5,
      errorMessage: 'Password phải có ít nhất 5 ký tự',
    },
    FullName: {
      required: true,
      minLength: 3,
      errorMessage: 'FullName phải có ít nhất 3 ký tự',
    },
    Address: {
      required: true,
      errorMessage: 'Address là bắt buộc',
    },
    PhoneNumber: {
      required: true,
      pattern: /^[0-9]{10,11}$/,
      errorMessage: 'PhoneNumber phải là 10-11 chữ số',
    },
    YOB: {
      required: true,
      type: 'number',
      min: 1950,
      max: 1980,
      errorMessage: 'YOB phải là số từ 1950-1980',
    },
    School: {
      required: true,
      errorMessage: 'School là bắt buộc',
    },
    LecturerCode: {
      required: true,
      errorMessage: 'LecturerCode là bắt buộc',
    },
    Major: {
      required: true,
      errorMessage: 'Major là bắt buộc',
    },
  },
};

// Template cho Subjects
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
 * Validate data theo rules
 * @param {Array} data - Parsed data
 * @param {Object} validationRules - Rules để validate
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
        rowErrors.push(`${field} là bắt buộc`);
        return;
      }

      // Skip validation nếu value trống và không required
      if (!value && !rule.required) return;

      // Check type
      if (rule.type === 'number' && isNaN(Number(value))) {
        rowErrors.push(`${field} phải là số`);
        return;
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(String(value))) {
        rowErrors.push(rule.errorMessage || `${field} không hợp lệ`);
      }

      // Check minLength
      if (rule.minLength && String(value).length < rule.minLength) {
        rowErrors.push(
          rule.errorMessage ||
            `${field} phải có ít nhất ${rule.minLength} ký tự`
        );
      }

      // Check min/max for numbers
      if (rule.type === 'number') {
        const numValue = Number(value);
        if (rule.min && numValue < rule.min) {
          rowErrors.push(
            rule.errorMessage || `${field} phải lớn hơn hoặc bằng ${rule.min}`
          );
        }
        if (rule.max && numValue > rule.max) {
          rowErrors.push(
            rule.errorMessage || `${field} phải nhỏ hơn hoặc bằng ${rule.max}`
          );
        }
      }
    });

    if (rowErrors.length > 0) {
      errors.push({
        row: index + 2, // +2 vì excel có header ở dòng 1
        name: row.Fullname || row.FullName || row.SubjectCode || 'Không có tên',
        errors: rowErrors,
      });
    }
  });

  return errors;
};