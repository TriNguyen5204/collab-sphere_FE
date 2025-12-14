// docxImport.js - IMPROVED VERSION with Better Error Handling
import mammoth from 'mammoth';

/**
 * Import DOCX file and convert to HTML
 * @param {File} file - The .docx file to import
 * @returns {Promise<string>} - HTML content
 */
export const importFromDocx = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!file.name.endsWith('.docx')) {
    throw new Error('Please select a .docx file');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Configure mammoth with image handling
    const options = {
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read('base64').then(function(imageBuffer) {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`
          };
        });
      }),
      
      // Style mapping for better conversion
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Subtitle'] => h2:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    
    // Check for conversion messages
    if (result.messages.length > 0) {
      console.group('📋 DOCX Import Messages:');
      result.messages.forEach(msg => {
        if (msg.type === 'error') {
          console.error('❌', msg.message);
        } else if (msg.type === 'warning') {
          console.warn('⚠️', msg.message);
        } else {
          console.log('ℹ️', msg.message);
        }
      });
      console.groupEnd();
    }

    // Validate HTML output
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('Document appears to be empty');
    }

    // Clean up HTML
    const cleanedHtml = cleanupHtml(result.value);
    
    console.log('✅ DOCX Import successful:', {
      originalSize: file.size,
      messages: result.messages.length,
      htmlLength: cleanedHtml.length,
    });

    return cleanedHtml;
  } catch (error) {
    console.error('❌ DOCX Import Error:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('zip')) {
      throw new Error('File appears to be corrupted or not a valid DOCX file');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected documents are not supported');
    } else {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
};

/**
 * Clean up HTML from mammoth conversion
 * @param {string} html - Raw HTML from mammoth
 * @returns {string} - Cleaned HTML
 */
const cleanupHtml = (html) => {
  // Remove empty paragraphs
  let cleaned = html.replace(/<p><\/p>/g, '');
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Normalize line breaks
  cleaned = cleaned.replace(/(<\/p>)\s*(<p>)/g, '$1$2');
  
  return cleaned.trim();
};

/**
 * Import DOCX and insert at current cursor position
 * @param {File} file - The .docx file
 * @param {Editor} editor - TipTap editor instance
 */
export const importAndInsert = async (file, editor) => {
  if (!editor) {
    throw new Error('Editor not provided');
  }

  const htmlContent = await importFromDocx(file);
  
  // Insert at current position
  editor.commands.insertContent(htmlContent);
  
  return true;
};

/**
 * Import DOCX and replace all content
 * @param {File} file - The .docx file
 * @param {Editor} editor - TipTap editor instance
 */
export const importAndReplace = async (file, editor) => {
  if (!editor) {
    throw new Error('Editor not provided');
  }

  const htmlContent = await importFromDocx(file);
  
  // Replace all content
  editor.commands.setContent(htmlContent);
  
  return true;
};

/**
 * Preview DOCX content without importing
 * @param {File} file - The .docx file
 * @returns {Promise<Object>} - Preview data
 */
export const previewDocx = async (file) => {
  const htmlContent = await importFromDocx(file);
  
  // Create temporary container to extract metadata
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  
  const preview = {
    wordCount: temp.textContent.split(/\s+/).filter(Boolean).length,
    paragraphCount: temp.querySelectorAll('p').length,
    headingCount: temp.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    listCount: temp.querySelectorAll('ul, ol').length,
    imageCount: temp.querySelectorAll('img').length,
    htmlLength: htmlContent.length,
  };
  
  return preview;
};