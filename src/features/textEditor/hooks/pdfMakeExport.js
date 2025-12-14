// pdfMakeExport.js - IMPROVED VERSION with Better List Support
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// ==========================================
// 1. FONT INITIALIZATION
// ==========================================
try {
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && pdfFonts.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  } else {
    pdfMake.vfs = pdfFonts;
  }
} catch (e) {
  console.error('Lỗi khởi tạo font PDF:', e);
}

if (pdfMake.vfs) {
  pdfMake.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  };
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

// Process text with marks
const processTextWithMarks = (content) => {
  if (!content || !Array.isArray(content)) return [];

  return content.map(textNode => {
    if (textNode.type === 'text') {
      const textConfig = {
        text: textNode.text || '',
      };

      // Apply marks
      if (textNode.marks) {
        textNode.marks.forEach(mark => {
          if (mark.type === 'bold') textConfig.bold = true;
          if (mark.type === 'italic') textConfig.italics = true;
          if (mark.type === 'underline') textConfig.decoration = 'underline';
          if (mark.type === 'strike') textConfig.decoration = 'lineThrough';
          if (mark.type === 'textStyle' && mark.attrs?.color) {
            textConfig.color = mark.attrs.color;
          }
          if (mark.type === 'highlight') {
            textConfig.background = mark.attrs?.color || 'yellow';
          }
        });
      }

      return textConfig;
    }

    if (textNode.type === 'hardBreak') {
      return { text: '\n' };
    }

    return { text: '' };
  });
};

// Extract plain text from paragraph node
const extractText = (paragraphNode) => {
  if (!paragraphNode || !paragraphNode.content) return '';
  
  return paragraphNode.content
    .map(item => {
      if (item.type === 'text') return item.text || '';
      if (item.type === 'hardBreak') return '\n';
      return '';
    })
    .join('');
};

// Process list items recursively
const processListItems = (listContent) => {
  if (!listContent || !Array.isArray(listContent)) return [];

  return listContent.map(listItem => {
    // listItem has type 'listItem', content contains paragraph nodes
    if (listItem.content && listItem.content.length > 0) {
      const paragraphNode = listItem.content[0];
      
      // Get text with formatting
      const textWithMarks = processTextWithMarks(paragraphNode.content);
      
      return {
        text: textWithMarks.length > 0 ? textWithMarks : extractText(paragraphNode),
        margin: [0, 2, 0, 2],
      };
    }
    
    return { text: '', margin: [0, 2, 0, 2] };
  });
};

// ==========================================
// 3. NODE MAPPING FUNCTION
// ==========================================

const mapNodeToPdfMake = node => {
  if (!node) return null;

  try {
    switch (node.type) {
      case 'paragraph': {
        const textContent = processTextWithMarks(node.content);
        
        return {
          text: textContent.length > 0 ? textContent : ' ',
          margin: [0, 5, 0, 5],
          alignment: node.attrs?.textAlign || 'left',
        };
      }

      case 'heading': {
        const sizes = [24, 20, 16, 14, 12, 10];
        const headingText = extractText(node);
        
        return {
          text: headingText || ' ',
          fontSize: sizes[(node.attrs?.level || 1) - 1],
          bold: true,
          margin: [0, 10, 0, 5],
        };
      }

      case 'bulletList': {
        const items = processListItems(node.content);
        
        return {
          ul: items,
          margin: [0, 5, 0, 10],
        };
      }

      case 'orderedList': {
        const items = processListItems(node.content);
        
        return {
          ol: items,
          margin: [0, 5, 0, 10],
        };
      }

      case 'table': {
        const body = (node.content || []).map(row => {
          return (row.content || []).map(cell => {
            // Process all paragraphs in the cell
            const cellContent = (cell.content || [])
              .map(para => {
                const text = processTextWithMarks(para.content);
                return text.length > 0 ? text : extractText(para);
              })
              .filter(Boolean);

            return { 
              text: cellContent.length > 0 ? cellContent : ' ',
              margin: [5, 5, 5, 5],
            };
          });
        });

        if (!body.length) return null;

        return {
          table: {
            headerRows: 0,
            widths: Array(body[0]?.length || 1).fill('*'),
            body: body,
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#CCCCCC',
            vLineColor: () => '#CCCCCC',
          },
          margin: [0, 10, 0, 10],
        };
      }

      case 'blockquote': {
        const quoteText = node.content?.[0] 
          ? processTextWithMarks(node.content[0].content)
          : '';
        
        return {
          text: quoteText,
          margin: [20, 10, 0, 10],
          italics: true,
          color: '#555555',
          border: [true, false, false, false],
          borderColor: ['#CCCCCC', '', '', ''],
          borderWidth: [3, 0, 0, 0],
        };
      }

      case 'codeBlock': {
        const codeText = extractText(node);
        
        return {
          text: codeText || ' ',
          font: 'Courier',
          background: '#F5F5F5',
          margin: [0, 10, 0, 10],
          preserveLeadingSpaces: true,
        };
      }

      case 'horizontalRule': {
        return {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515, // A4 width minus margins
              y2: 0,
              lineWidth: 1,
              lineColor: '#CCCCCC',
            }
          ],
          margin: [0, 10, 0, 10],
        };
      }

      case 'image': {
        // Image handling - for now just placeholder
        return {
          text: '[Image]',
          color: '#888888',
          italics: true,
          margin: [0, 5, 0, 5],
        };
      }

      default:
        console.warn(`Unhandled PDF node type: ${node.type}`);
        return null;
    }
  } catch (err) {
    console.error('Lỗi map node PDF:', node.type, err);
    return null;
  }
};

// ==========================================
// 4. MAIN EXPORT FUNCTION
// ==========================================

export const exportToPdfMake = (editor, fileName = 'document') => {
  if (!editor) {
    console.error('Editor is null');
    return;
  }

  try {
    const json = editor.getJSON();
    console.log('PDF Export JSON:', json); // Debug log
    
    const content = [];

    if (json.content) {
      json.content.forEach(node => {
        const mapped = mapNodeToPdfMake(node);
        if (mapped) {
          content.push(mapped);
        }
      });
    }

    // Ensure we have content
    if (content.length === 0) {
      content.push({ text: ' ' });
    }

    const docDefinition = {
      content: content,
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12,
        lineHeight: 1.3,
      },
      pageSize: 'A4',
      pageMargins: [60, 60, 60, 60], // 60 points ≈ 21mm
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
    console.log('PDF export successful:', fileName);
  } catch (error) {
    console.error('Lỗi xuất PDF:', error);
    alert(`Có lỗi khi xuất PDF: ${error.message}`);
    throw error;
  }
};