"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to prevent SSR issues (document is not defined)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
  // Use useMemo to prevent toolbar from re-rendering and losing focus
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'align': [] }],
      ['link', 'clean']                                 // remove formatting button
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'script',
    'indent',
    'align',
    'link'
  ];

  return (
    <div className={`rich-text-container bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all ${className}`}>
      <style jsx global>{`
        .rich-text-container .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding: 12px 16px;
        }
        .rich-text-container .ql-container {
          border: none;
          min-height: 400px;
          font-family: inherit;
          font-size: 15px;
        }
        .rich-text-container .ql-editor {
          min-height: 400px;
          padding: 20px;
        }
        .rich-text-container .ql-editor p {
          margin-bottom: 1em;
          color: #334155;
          line-height: 1.6;
        }
        .rich-text-container .ql-editor h1, 
        .rich-text-container .ql-editor h2, 
        .rich-text-container .ql-editor h3 {
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          color: #0f172a;
          font-weight: 700;
        }
      `}</style>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Write something amazing..."}
      />
    </div>
  );
}
