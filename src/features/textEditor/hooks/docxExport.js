// docxExport.js - FIXED VERSION - Xử lý đúng BulletList & OrderedList
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';

// --- 1. HÀM XỬ LÝ TEXT & STYLE ---
const processTextRuns = nodeContent => {
  if (!nodeContent || !Array.isArray(nodeContent)) return [];

  return nodeContent.map(textNode => {
    if (textNode.type === 'text') {
      const options = { text: textNode.text || '' };

      if (textNode.marks) {
        textNode.marks.forEach(mark => {
          if (mark.type === 'bold') options.bold = true;
          if (mark.type === 'italic') options.italics = true;
          if (mark.type === 'underline') options.underline = {};
          if (mark.type === 'strike') options.strike = true;
          if (mark.type === 'textStyle' && mark.attrs?.color) {
            // Remove # from color if present
            const color = mark.attrs.color.replace('#', '');
            options.color = color;
          }
          if (mark.type === 'highlight') {
            const highlightColor = mark.attrs?.color || '#FFFF00';
            options.highlight = highlightColor.replace('#', '');
          }
        });
      }
      return new TextRun(options);
    }
    if (textNode.type === 'hardBreak') {
      return new TextRun({ break: 1 });
    }
    return new TextRun({ text: '' });
  });
};

// --- 2. HÀM CHUYỂN ĐỔI CHÍNH ---
const mapNodeToDocx = (node, listOptions = null) => {
  if (!node) return null;

  try {
    switch (node.type) {
      case 'paragraph': {
        let align = AlignmentType.LEFT;
        if (node.attrs?.textAlign === 'center') align = AlignmentType.CENTER;
        if (node.attrs?.textAlign === 'right') align = AlignmentType.RIGHT;
        if (node.attrs?.textAlign === 'justify') align = AlignmentType.JUSTIFIED;

        const paragraphConfig = {
          alignment: align,
          children: processTextRuns(node.content),
          spacing: { after: 120 },
        };

        // Nếu là list item, thêm bullet hoặc numbering
        if (listOptions) {
          if (listOptions.bullet !== undefined) {
            paragraphConfig.bullet = listOptions.bullet;
          }
          if (listOptions.numbering !== undefined) {
            paragraphConfig.numbering = listOptions.numbering;
          }
        }

        return new Paragraph(paragraphConfig);
      }

      case 'heading': {
        const levels = [
          HeadingLevel.HEADING_1,
          HeadingLevel.HEADING_2,
          HeadingLevel.HEADING_3,
          HeadingLevel.HEADING_4,
          HeadingLevel.HEADING_5,
          HeadingLevel.HEADING_6,
        ];
        
        // Process heading content properly
        const headingText = node.content
          ?.map(c => c.text || '')
          .join('') || '';

        return new Paragraph({
          text: headingText,
          heading: levels[(node.attrs?.level || 1) - 1],
          spacing: { before: 240, after: 120 },
        });
      }

      case 'bulletList':
        return (node.content || []).flatMap(listItem => {
          // listItem có type là 'listItem', content của nó là các paragraph nodes
          return (listItem.content || [])
            .map(paragraphNode => {
              // Gọi mapNodeToDocx cho paragraph, truyền thêm bullet config
              return mapNodeToDocx(paragraphNode, { 
                bullet: { level: 0 } 
              });
            })
            .filter(Boolean);
        });

      case 'orderedList':
        return (node.content || []).flatMap(listItem => {
          return (listItem.content || [])
            .map(paragraphNode => {
              return mapNodeToDocx(paragraphNode, { 
                numbering: { reference: 'my-numbering', level: 0 } 
              });
            })
            .filter(Boolean);
        });

      case 'table': {
        const rows = (node.content || []).map(row => {
          const cells = (row.content || []).map(cell => {
            const cellChildren = (cell.content || [])
              .map(child => mapNodeToDocx(child))
              .flat()
              .filter(Boolean);

            if (cellChildren.length === 0) {
              cellChildren.push(new Paragraph({ text: '' }));
            }

            return new TableCell({
              children: cellChildren,
              width: {
                size: 100 / (row.content?.length || 1),
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            });
          });
          return new TableRow({ children: cells });
        });

        return new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            insideHorizontal: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            insideVertical: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
          },
        });
      }

      case 'blockquote':
        return new Paragraph({
          children: processTextRuns(node.content?.[0]?.content),
          indent: { left: 720 }, // 720 twips = 0.5 inch
          border: {
            left: {
              color: '999999',
              space: 10,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
        });

      case 'horizontalRule':
        return new Paragraph({
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              space: 1,
              color: 'auto',
            },
          },
        });

      case 'image':
        // TODO: Implement proper image handling
        return new Paragraph({
          text: '[Image Placeholder]',
          border: { bottom: { style: BorderStyle.DOTTED, size: 1, space: 1 } },
        });

      case 'codeBlock':
        // Handle code blocks
        { const codeText = node.content
          ?.map(c => c.text || '')
          .join('\n') || '';
        
        return new Paragraph({
          children: [
            new TextRun({
              text: codeText,
              font: 'Courier New',
            })
          ],
          shading: {
            fill: 'F5F5F5',
          },
          indent: { left: 360 },
          spacing: { before: 120, after: 120 },
        }); }

      default:
        console.warn(`Unhandled node type: ${node.type}`);
        return null;
    }
  } catch (err) {
    console.error('Lỗi khi map node:', node.type, err);
    return null;
  }
};

// --- 3. HÀM EXPORT CHÍNH ---
export const exportToDocx = async (editor, fileName = 'document') => {
  if (!editor) {
    console.error('Editor is null or undefined');
    return;
  }

  try {
    const jsonContent = editor.getJSON();
    console.log('Export JSON:', jsonContent); // Debug log
    
    const docChildren = [];

    if (jsonContent.content) {
      jsonContent.content.forEach(node => {
        const docxNode = mapNodeToDocx(node);
        if (docxNode) {
          if (Array.isArray(docxNode)) {
            docChildren.push(...docxNode);
          } else {
            docChildren.push(docxNode);
          }
        }
      });
    }

    // Ensure we have at least one paragraph
    if (docChildren.length === 0) {
      docChildren.push(new Paragraph({ text: '' }));
    }

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'my-numbering',
            levels: [
              { 
                level: 0, 
                format: 'decimal', 
                text: '%1.', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 260 },
                  },
                },
              },
              {
                level: 1,
                format: 'lowerLetter',
                text: '%2.',
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 1440, hanging: 260 },
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
    
    console.log('Export successful:', fileName);
  } catch (error) {
    console.error('Critical Export Error:', error);
    alert(`Lỗi khi export: ${error.message}`);
    throw error;
  }
};