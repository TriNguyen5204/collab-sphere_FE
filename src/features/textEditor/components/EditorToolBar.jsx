// EditorToolBar.jsx
import React from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Baseline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo2,
  Redo2,
} from "lucide-react"

const EditorToolBar = ({ editor }) => {
  if (!editor) return null

  const size = 18;

  const applyHeading = (e) => {
    const level = parseInt(e.target.value, 10)
    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().setHeading({ level }).run()
    }
  }

  const applyFont = (e) => {
    editor.chain().focus().setFontFamily(e.target.value).run()
  }

  const applyFontSize = (e) => {
    editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()
  }

  const textStyleAttrs = editor.getAttributes('textStyle')
  const highlightAttrs = editor.getAttributes('highlight')
  const headingAttrs = editor.getAttributes('heading')
  
  const editorState = {
    color: textStyleAttrs.color || '',
    isHighlighted: editor.isActive('highlight'),
    highlightColor: highlightAttrs.color || '#FFFF00',
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    isUnderline: editor.isActive('underline'),
    isStrike: editor.isActive('strike'),
    fontFamily: textStyleAttrs.fontFamily || '',
    fontSize: textStyleAttrs.fontSize || '',
    isParagraph: editor.isActive('paragraph'),
    isHeading: editor.isActive('heading'),
    headingLevel: headingAttrs.level || 0,
    isBulletList: editor.isActive('bulletList'),
    isOrderedList: editor.isActive('orderedList'),
    isAlignLeft: editor.isActive({ textAlign: 'left' }),
    isAlignCenter: editor.isActive({ textAlign: 'center' }),
    isAlignRight: editor.isActive({ textAlign: 'right' }),
    isAlignJustify: editor.isActive({ textAlign: 'justify' }),
  }

  const headingValue = () => {
    if (editorState.isParagraph) return "0"
    if (editorState.isHeading) return editorState.headingLevel.toString()
    return "0"
  }

  const ToolbarButton = ({ active, onClick, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-lg transition-all hover:bg-gray-100 ${
        active ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'text-gray-700'
      }`}
    >
      {children}
    </button>
  )

  const ToolbarDivider = () => (
    <div className="w-px h-8 bg-gray-300 mx-1" />
  )

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-1">
        {/* Font Family & Size */}
        <select
          onChange={applyFont}
          value={editorState.fontFamily || "Arial"}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer text-sm font-medium"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>

        <select
          onChange={applyFontSize}
          value={editorState.fontSize || "16px"}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer text-sm font-medium"
        >
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>

        <select
          onChange={applyHeading}
          value={headingValue()}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer text-sm font-medium"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        <ToolbarDivider />

        {/* Text Style */}
        <ToolbarButton active={editorState.isBold} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isItalic} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isUnderline} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <Underline size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isStrike} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough size={size} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Color Pickers */}
        <div className="relative group">
          <button
            onClick={() => document.getElementById('editorColorPicker')?.click()}
            className={`p-2.5 rounded-lg transition-all hover:bg-gray-100 ${
              editorState.color ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            }`}
            title="Text Color"
          >
            <Baseline size={size} />
          </button>
          <input
            type="color"
            id="editorColorPicker"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editorState.color || '#000000'}
            className="absolute opacity-0 w-0 h-0"
          />
        </div>

        <div className="relative group">
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2.5 rounded-lg transition-all hover:bg-gray-100 ${
              editorState.isHighlighted ? 'bg-yellow-100 text-yellow-600' : 'text-gray-700'
            }`}
            title="Highlight"
          >
            <Highlighter size={size} />
          </button>
          <input
            type="color"
            id="editorHighlightPicker"
            onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
            value={editorState.highlightColor}
            className="absolute opacity-0 w-0 h-0"
          />
        </div>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton active={editorState.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
          <ListOrdered size={size} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton active={editorState.isAlignLeft} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">
          <AlignLeft size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isAlignCenter} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">
          <AlignCenter size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isAlignRight} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">
          <AlignRight size={size} />
        </ToolbarButton>
        <ToolbarButton active={editorState.isAlignJustify} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">
          <AlignJustify size={size} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo2 size={size} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo2 size={size} />
        </ToolbarButton>
      </div>
    </div>
  )
}

export default EditorToolBar
