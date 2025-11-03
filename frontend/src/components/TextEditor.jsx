
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';

import { useEffect, useState } from 'react';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

// Lucide Icons
import {
  Bold, Italic, Underline as UIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Type,
  List, ListOrdered, ListChecks,
  Highlighter, Palette,
  Image as ImageIcon, Link as LinkIcon, Quote, Code,
  Table as TableIcon, Undo, Redo, Eraser,
  Columns3, Rows3, X
} from 'lucide-react';

// Toolbar Button
const ToolbarButton = ({ onClick, isActive, title, children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-9 h-9 flex items-center justify-center rounded-md transition-colors
      border ${isActive 
        ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm' 
        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
    type="button"
    title={title}
  >
    {children}
  </button>
);

// Toolbar Section
const ToolbarSection = ({ children }) => (
  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md p-1 shadow-sm">
    {children}
  </div>
);

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  // Image handler
  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Link handler
  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  // Table handler
  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Color picker
  const colors = [
    '#958DF1', '#F98181', '#FBBC88', '#FAF594',
    '#70CFF8', '#94FADB', '#90EE90', '#FFB6C1'
  ];

  return (
    <div className="border-b border-gray-200 p-3 bg-white sticky top-0 z-10 flex flex-wrap gap-2">
      
      {/* Text Formatting */}
      <ToolbarSection>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <UIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={16} />
        </ToolbarButton>
      </ToolbarSection>

      {/* Alignment */}
      <ToolbarSection>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify size={16} />
        </ToolbarButton>
      </ToolbarSection>

      {/* Headings */}
      <ToolbarSection>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Paragraph">
          <Type size={16} />
        </ToolbarButton>
      </ToolbarSection>

      {/* Lists */}
      <ToolbarSection>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={16} />
        </ToolbarButton>
        
      </ToolbarSection>

      {/* Colors */}
      <ToolbarSection>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
          <Highlighter size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetColor().run()} title="Reset Color">
          <Palette size={16} />
        </ToolbarButton>
        <div className="flex items-center gap-1 pl-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              title={`Color ${c}`}
            />
          ))}
        </div>
      </ToolbarSection>

      {/* Insert */}
      <ToolbarSection>
        <ToolbarButton onClick={addImage} title="Insert Image">
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
          <Code size={16} />
        </ToolbarButton>
      </ToolbarSection>

      {/* Table */}
      <ToolbarSection>
        <ToolbarButton onClick={addTable} title="Insert Table">
          <TableIcon size={16} />
        </ToolbarButton>
        {editor.isActive('table') && (
          <>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">
              <Columns3 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
              <Rows3 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
              <X size={16} />
            </ToolbarButton>
          </>
        )}
      </ToolbarSection>

      {/* Actions */}
      <ToolbarSection>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting">
          <Eraser size={16} />
        </ToolbarButton>
      </ToolbarSection>
    </div>
  );
};

// Main Editor
export default function TextEditor({ content, onChange, placeholder = "Start writing your post..." }) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      
    ],
    content,
    editorProps: {
      attributes: {
        class: 'min-h-[400px] focus:outline-none p-4 prose prose-sm max-w-none',
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
