/**
 * Parse API response message that contains multiple messages separated by "!"
 * Extract import count and display individual messages
 * 
 * @param {string} message - The full message from API response
 * @returns {Object} { messages: string[], importCount: number, hasErrors: boolean }
 * 
 * Example input:
 * "One Student already existed! Another error! Successfully imported 5 students."
 * 
 * Example output:
 * {
 *   messages: ["One Student already existed", "Another error", "Successfully imported 5 students"],
 *   importCount: 5,
 *   hasErrors: true
 * }
 */
export const parseApiResponseMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { messages: [], importCount: 0, hasErrors: false };
  }

  // Split by "!" and filter out empty strings
  const messages = message
    .split('!')
    .map(msg => msg.trim())
    .filter(msg => msg.length > 0);

  // Extract import count from the last message
  // Pattern: "Successfully imported X students" or "Successfully imported X lecturers"
  let importCount = 0;
  const lastMessage = messages[messages.length - 1] || '';
  const importMatch = lastMessage.match(/Successfully imported (\d+)/i);
  
  if (importMatch) {
    importCount = parseInt(importMatch[1], 10);
  }

  // Check if there are error messages (messages other than success)
  const hasErrors = messages.some(msg => 
    !msg.toLowerCase().includes('successfully imported')
  );

  return {
    messages,
    importCount,
    hasErrors,
  };
};

/**
 * Display parsed messages as toast notifications
 * 
 * @param {Object} parsedMessage - Result from parseApiResponseMessage
 * @param {Function} toast - Toast notification function
 * @param {string} entityType - Type of entity (student, lecturer, subject)
 */
export const displayApiMessages = (parsedMessage, toast, entityType = 'records') => {
  const { messages, importCount, hasErrors } = parsedMessage;

  // If no records imported, show all messages as errors
  if (importCount === 0) {
    messages.forEach(msg => {
      if (!msg.toLowerCase().includes('successfully imported')) {
        toast.error(msg);
      }
    });
    toast.error(`Failed to import any ${entityType}. Please check the errors above.`);
    return;
  }

  // If some records imported, show errors as warnings and success message
  messages.forEach(msg => {
    const msgLower = msg.toLowerCase();
    
    if (msgLower.includes('successfully imported')) {
      toast.success(msg);
    } else if (msgLower.includes('already existed') || 
               msgLower.includes('cannot create') ||
               msgLower.includes('error') ||
               msgLower.includes('failed')) {
      toast.warning(msg);
    } else {
      toast.info(msg);
    }
  });
};

/**
 * Complete response handler for import operations
 * 
 * @param {Object} response - API response object
 * @param {Function} toast - Toast notification function
 * @param {string} entityType - Type of entity being imported
 * @returns {boolean} - Whether the import was successful (at least 1 record imported)
 */
export const handleImportResponse = (response, toast, entityType = 'records') => {
  // Check for explicit failure
  if (response.isSuccess === false) {
    if (response.errorList && response.errorList.length > 0) {
      response.errorList.forEach(err => {
        toast.error(`${err.field ? err.field + ': ' : ''}${err.message}`);
      });
      return false;
    }
    
    if (response.message) {
      toast.error(response.message);
      return false;
    }
    
    toast.error(`Failed to import ${entityType}`);
    return false;
  }

  // Handle success case with message
  if (response.isSuccess === true && response.message) {
    const parsed = parseApiResponseMessage(response.message);
    
    // If there are parsed messages, display them
    if (parsed.messages.length > 0) {
      displayApiMessages(parsed, toast, entityType);
      return parsed.importCount > 0 || !parsed.hasErrors;
    }
    
    // If no parsed messages but has message, show it as success
    toast.success(response.message);
    return true;
  }

  // Default success case (no message)
  if (response.isSuccess === true) {
    toast.success(`Successfully imported ${entityType}`);
    return true;
  }

  // Fallback for unclear response
  toast.info('Import completed. Please check the results.');
  return true;
};