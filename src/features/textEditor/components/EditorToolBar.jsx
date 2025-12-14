// EditorToolBar.jsx - Microsoft Word Style (FIXED VERSION)
import React, { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo2,
  Redo2,
  ChevronDown,
  Type,
  FileDown,
  FileText,
  Upload
} from 'lucide-react';
import { exportToDocx } from '../hooks/docxExport';
import { exportToPdfMake } from '../hooks/pdfMakeExport';
import { importFromDocx } from '../hooks/docxImport';

const EditorToolBar = ({ editor, currentRoomName }) => {
  const [, setUpdateTrigger] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    editor.on('transaction', updateToolbar);
    editor.on('selectionUpdate', updateToolbar);
    editor.on('update', updateToolbar);

    return () => {
      editor.off('transaction', updateToolbar);
      editor.off('selectionUpdate', updateToolbar);
      editor.off('update', updateToolbar);
    };
  }, [editor]);

  if (!editor) return null;

  const textStyleAttrs = editor.getAttributes('textStyle');
  const highlightAttrs = editor.getAttributes('highlight');
  const headingAttrs = editor.getAttributes('heading');

  // ✅ FIX: Properly get fontSize with fallback
  const currentFontSize = textStyleAttrs.fontSize || '16px';

  const editorState = {
    color: textStyleAttrs.color || '#000000',
    isHighlighted: editor.isActive('highlight'),
    highlightColor: highlightAttrs.color || '#FFFF00',
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    isUnderline: editor.isActive('underline'),
    isStrike: editor.isActive('strike'),
    fontFamily: textStyleAttrs.fontFamily || 'Arial',
    fontSize: currentFontSize,
    isParagraph: editor.isActive('paragraph'),
    isHeading: editor.isActive('heading'),
    headingLevel: headingAttrs.level || 0,
    isBulletList: editor.isActive('bulletList'),
    isOrderedList: editor.isActive('orderedList'),
    isAlignLeft: editor.isActive({ textAlign: 'left' }),
    isAlignCenter: editor.isActive({ textAlign: 'center' }),
    isAlignRight: editor.isActive({ textAlign: 'right' }),
    isAlignJustify: editor.isActive({ textAlign: 'justify' }),
  };

  const headingValue = () => {
    if (editorState.isHeading) return `h${editorState.headingLevel}`;
    return 'normal';
  };

  const applyHeading = value => {
    if (value === 'normal') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace('h', ''));
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const applyFont = value => {
    editor.chain().focus().setFontFamily(value).run();
  };

  // ✅ FIX: Correct way to set fontSize
  const applyFontSize = value => {
    editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
  };

  const handleExportWord = () => {
    try {
      exportToDocx(editor, currentRoomName);
    } catch (error) {
      console.error('Lỗi export:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const htmlContent = await importFromDocx(file);
      
      if (htmlContent) {
        // Cách 1: Ghi đè toàn bộ nội dung cũ
        editor.commands.setContent(htmlContent);
        
        // Cách 2: Chèn tiếp vào vị trí con trỏ (nếu muốn giữ nội dung cũ thì dùng dòng dưới)
        // editor.commands.insertContent(htmlContent);
      }
    } catch (error) {
      alert("Lỗi khi import file: " + error.message);
    } finally {
      // Reset input để có thể chọn lại cùng 1 file nếu muốn
      e.target.value = ''; 
    }
  };

  // --- Hàm Export PDF ---
  const handleExportPDF = () => {
    try {
      exportToPdfMake(editor, currentRoomName);
    } catch (error) {
      console.error('Lỗi export:', error);
    }
  };

  // Quick color presets
  const colorPresets = [
    '#000000',
    '#434343',
    '#666666',
    '#999999',
    '#B7B7B7',
    '#CCCCCC',
    '#D9D9D9',
    '#EFEFEF',
    '#F3F3F3',
    '#FFFFFF',
    '#980000',
    '#FF0000',
    '#FF9900',
    '#FFFF00',
    '#00FF00',
    '#00FFFF',
    '#4A86E8',
    '#0000FF',
    '#9900FF',
    '#FF00FF',
  ];

  const highlightPresets = [
    'transparent',
    '#FFFF00',
    '#00FF00',
    '#00FFFF',
    '#FF00FF',
    '#0000FF',
    '#FF0000',
    '#FFFF99',
    '#99FF99',
    '#99FFFF',
    '#FF99FF',
    '#9999FF',
    '#FF9999',
  ];

  const ToolbarButton = ({
    active,
    onClick,
    children,
    title,
    className = '',
  }) => (
    <button
      type='button'
      onMouseDown={e => {
        e.preventDefault();
        onClick(e);
      }}
      title={title}
      className={`
        relative px-2 py-1.5 rounded transition-all
        hover:bg-gray-200 active:bg-gray-300
        ${active ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-700'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className='w-px h-6 bg-gray-300 mx-1' />;

  const Dropdown = ({ value, onChange, options, className = '' }) => (
    <div className='relative'>
      <select
        value={value}
        onChange={e => {
          e.preventDefault();
          onChange(e.target.value);
        }}
        className={`
          appearance-none px-3 py-1.5 pr-8 rounded border border-gray-300
          bg-white hover:bg-gray-50 focus:bg-white
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
          text-sm cursor-pointer transition-all
          ${className}
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500' />
    </div>
  );

  const ColorPickerDropdown = ({
    colors,
    value,
    onChange,
    onToggle,
    show,
    type = 'color',
  }) => (
    <div className='relative'>
      <button
        type='button'
        onMouseDown={e => {
          e.preventDefault();
          onToggle();
        }}
        className={`
          relative px-2 py-1.5 rounded transition-all flex items-center gap-1
          hover:bg-gray-200 active:bg-gray-300
          ${show ? 'bg-gray-200' : ''}
        `}
        title={type === 'color' ? 'Text Color' : 'Highlight Color'}
      >
        {type === 'color' ? (
          <Type className='w-5 h-5' />
        ) : (
          <Highlighter className='w-5 h-5' />
        )}
        <div className='w-4 h-1 rounded' style={{ backgroundColor: value }} />
        <ChevronDown className='w-3 h-3' />
      </button>

      {show && (
        <div className='absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 w-48'>
          <div className='mb-2'>
            <input
              type='color'
              value={value}
              onChange={e => onChange(e.target.value)}
              className='w-full h-8 rounded cursor-pointer'
            />
          </div>
          <div className='text-xs font-semibold text-gray-600 mb-2'>
            Quick Colors
          </div>
          <div className='grid grid-cols-10 gap-1'>
            {colors.map(color => (
              <button
                key={color}
                type='button'
                onMouseDown={e => {
                  e.preventDefault();
                  onChange(color);
                  onToggle();
                }}
                className='w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform'
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className='bg-white border-b border-gray-300 sticky top-0 z-40'>
      {/* Top Row - File operations would go here in full Word clone */}
      <div className='border-b border-gray-200 px-4 py-1 text-xs text-gray-600 flex items-center gap-4'>
        <span className='font-semibold'>Collaborative Editor</span>
        <span className='text-gray-400'>|</span>
        <span>Home</span>
      </div>

      {/* Main Toolbar */}
      <div className='px-4 py-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Undo/Redo Group */}
          <div className='flex items-center gap-1'>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title='Undo (Ctrl+Z)'
            >
              <Undo2 className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title='Redo (Ctrl+Y)'
            >
              <Redo2 className='w-5 h-5' />
            </ToolbarButton>
          </div>
          <ToolbarDivider />
          {/* Font & Size Group */}
          <div className='flex items-center gap-2'>
            <Dropdown
              value={editorState.fontFamily}
              onChange={applyFont}
              options={[
                { value: 'Arial', label: 'Arial' },
                { value: 'Times New Roman', label: 'Times New Roman' },
                { value: 'Courier New', label: 'Courier New' },
                { value: 'Georgia', label: 'Georgia' },
                { value: 'Verdana', label: 'Verdana' },
                { value: 'Comic Sans MS', label: 'Comic Sans MS' },
              ]}
              className='w-40'
            />
            <Dropdown
              value={editorState.fontSize}
              onChange={applyFontSize}
              options={[
                { value: '8px', label: '8' },
                { value: '10px', label: '10' },
                { value: '12px', label: '12' },
                { value: '14px', label: '14' },
                { value: '16px', label: '16' },
                { value: '18px', label: '18' },
                { value: '20px', label: '20' },
                { value: '22px', label: '22' },
                { value: '24px', label: '24' },
                { value: '26px', label: '26' },
                { value: '28px', label: '28' },
                { value: '36px', label: '36' },
                { value: '48px', label: '48' },
                { value: '72px', label: '72' },
              ]}
              className='w-20'
            />
          </div>
          <ToolbarDivider />
          {/* Text Style Group */}
          <div className='flex items-center gap-1'>
            <ToolbarButton
              active={editorState.isBold}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title='Bold (Ctrl+B)'
            >
              <Bold className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isItalic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title='Italic (Ctrl+I)'
            >
              <Italic className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isUnderline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title='Underline (Ctrl+U)'
            >
              <Underline className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isStrike}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title='Strikethrough'
            >
              <Strikethrough className='w-5 h-5' />
            </ToolbarButton>
          </div>
          <ToolbarDivider />
          {/* Color & Highlight Group */}
          <div className='flex items-center gap-1'>
            <ColorPickerDropdown
              colors={colorPresets}
              value={editorState.color}
              onChange={color => editor.chain().focus().setColor(color).run()}
              onToggle={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              show={showColorPicker}
              type='color'
            />
            <ColorPickerDropdown
              colors={highlightPresets}
              value={editorState.highlightColor}
              onChange={color => {
                if (color === 'transparent') {
                  editor.chain().focus().unsetHighlight().run();
                } else {
                  editor.chain().focus().setHighlight({ color }).run();
                }
              }}
              onToggle={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              show={showHighlightPicker}
              type='highlight'
            />
          </div>
          <ToolbarDivider />
          {/* Paragraph Style */}
          <Dropdown
            value={headingValue()}
            onChange={applyHeading}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'h1', label: 'Heading 1' },
              { value: 'h2', label: 'Heading 2' },
              { value: 'h3', label: 'Heading 3' },
              { value: 'h4', label: 'Heading 4' },
              { value: 'h5', label: 'Heading 5' },
              { value: 'h6', label: 'Heading 6' },
            ]}
            className='w-32'
          />
          <ToolbarDivider />
          {/* Lists Group */}
          <div className='flex items-center gap-1'>
            <ToolbarButton
              active={editorState.isBulletList}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title='Bullet List'
            >
              <List className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isOrderedList}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title='Numbered List'
            >
              <ListOrdered className='w-5 h-5' />
            </ToolbarButton>
          </div>
          <ToolbarDivider />
          {/* Alignment Group */}
          <div className='flex items-center gap-1'>
            <ToolbarButton
              active={editorState.isAlignLeft}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title='Align Left'
            >
              <AlignLeft className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isAlignCenter}
              onClick={() =>
                editor.chain().focus().setTextAlign('center').run()
              }
              title='Align Center'
            >
              <AlignCenter className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isAlignRight}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title='Align Right'
            >
              <AlignRight className='w-5 h-5' />
            </ToolbarButton>
            <ToolbarButton
              active={editorState.isAlignJustify}
              onClick={() =>
                editor.chain().focus().setTextAlign('justify').run()
              }
              title='Justify'
            >
              <AlignJustify className='w-5 h-5' />
            </ToolbarButton>
          </div>
          <div className='w-px h-6 bg-gray-300 mx-1' /> {/* Divider */}
          {/* Export Buttons */}
          <div className='flex items-center gap-1'>
            <ToolbarButton onClick={handleExportWord} title='Export to Word'>
              <FileText className='w-5 h-5 text-blue-600' />
            </ToolbarButton>

            <ToolbarButton onClick={handleExportPDF} title='Export to PDF'>
              <FileDown className='w-5 h-5 text-red-600' />
            </ToolbarButton>
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-gray-200 p-2 rounded flex items-center gap-1"
            title="Import Docx"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Import</span>
          </button>

          {/* Input file ẩn (chỉ chấp nhận .docx) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".docx"
            className="hidden"
          />
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showColorPicker || showHighlightPicker) && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => {
            setShowColorPicker(false);
            setShowHighlightPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default EditorToolBar;
