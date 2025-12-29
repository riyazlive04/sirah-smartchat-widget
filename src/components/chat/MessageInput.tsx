import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Labels } from '@/types/chat';

interface MessageInputProps {
  onSend: (message: string) => void;
  labels?: Labels;
  disabled?: boolean;
}

export function MessageInput({ onSend, labels, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 border-t border-border bg-card"
    >
      <div className="flex items-center gap-2">
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
          disabled={!message.trim() || disabled}
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
    </form>
  );
}
