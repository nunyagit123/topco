import React, { useState, useRef, ChangeEvent, useMemo } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { validateFiles, validateMessageText, RateLimiter, INPUT_CONFIG, FILE_UPLOAD_CONFIG } from '../utils/security';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: File[]) => void;
  isLoading: boolean;
  onClearChat: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, onClearChat }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rateLimiter = useMemo(() => new RateLimiter(INPUT_CONFIG.rateLimitMs), []);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Enforce max length
    if (newText.length > INPUT_CONFIG.maxMessageLength) {
      setError(`Message exceeds ${INPUT_CONFIG.maxMessageLength} characters`);
      return;
    }
    
    setError(null);
    setText(newText);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...files, ...newFiles];
      
      // Validate files
      const validation = validateFiles(allFiles);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setError(null);
      setFiles(allFiles);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSend = () => {
    if ((!text.trim() && files.length === 0) || isLoading) return;
    
    // Rate limiting check
    if (!rateLimiter.canProceed()) {
      const remaining = Math.ceil(rateLimiter.getRemainingTime() / 1000);
      setError(`Please wait ${remaining} second(s) before sending another message`);
      return;
    }
    
    // Validate message text
    if (text.trim()) {
      const textValidation = validateMessageText(text);
      if (!textValidation.valid) {
        setError(textValidation.error || 'Invalid message');
        return;
      }
    }
    
    // Validate files
    if (files.length > 0) {
      const fileValidation = validateFiles(files);
      if (!fileValidation.valid) {
        setError(fileValidation.error || 'Invalid files');
        return;
      }
    }
    
    setError(null);
    onSendMessage(text, files);
    setText('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-700 bg-black p-4 transition-all">
      <div className="max-w-4xl mx-auto">
        
        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}
        
        {/* File Preview */}
        {files.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto py-2">
            {files.map((file, i) => (
              <div key={i} className="relative group flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 w-24 h-24 flex flex-col items-center justify-center">
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
                {file.type.startsWith('image/') ? (
                   <ImageIcon className="text-slate-400 mb-1" size={24} />
                ) : (
                   <Paperclip className="text-slate-400 mb-1" size={24} />
                )}
                <span className="text-[10px] text-slate-500 truncate w-full text-center">{file.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-3 bg-black p-2 rounded-xl border border-slate-700 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all shadow-sm">
          
          <button
            onClick={onClearChat}
            className="p-3 text-slate-400 hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
             <span className="text-xs font-bold uppercase tracking-wider">Clear</span>
          </button>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 my-auto"></div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Attach File"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept={FILE_UPLOAD_CONFIG.allowedMimeTypes.join(',')}
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none max-h-[150px] py-3 text-sm"
            rows={1}
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={(!text.trim() && files.length === 0) || isLoading}
            className={`p-3 rounded-lg transition-all ${
              (!text.trim() && files.length === 0) || isLoading
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-400">TopcoBot can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
};