import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Send, Paperclip, X, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Labels, Attachment } from '@/types/chat';

interface MessageInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  labels?: Labels;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function MessageInput({ onSend, labels, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(null);
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`File type not supported: ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name} (max 5MB)`);
        continue;
      }

      // Create local URL for preview
      const url = URL.createObjectURL(file);
      
      newAttachments.push({
        id: generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        url
      });
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments].slice(0, 3)); // Max 3 attachments
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message, attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
      setError(null);
    }
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-border bg-card"
    >
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className={cn(
                "relative group",
                "bg-secondary rounded-lg overflow-hidden",
                "border border-border",
                isImage(attachment.type) ? "w-16 h-16" : "px-3 py-2"
              )}
            >
              {isImage(attachment.type) ? (
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div className="text-xs">
                    <p className="truncate max-w-[100px] font-medium">{attachment.name}</p>
                    <p className="text-muted-foreground">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className={cn(
                  "absolute -top-1 -right-1",
                  "w-5 h-5 rounded-full",
                  "bg-destructive text-destructive-foreground",
                  "flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-200"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 pt-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2">
          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || attachments.length >= 3}
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-secondary text-muted-foreground",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:bg-secondary/80 hover:text-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={labels?.placeholder || 'Type your message...'}
            disabled={disabled}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-full",
              "bg-secondary text-foreground",
              "placeholder:text-muted-foreground",
              "border border-transparent",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
              "transition-all duration-200",
              "text-sm",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || disabled}
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:bg-primary/90 hover:scale-105",
              "active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={labels?.send || 'Send'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
