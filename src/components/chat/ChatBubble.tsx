import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ChatBubble({ isOpen, onClick }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-widget hover:shadow-widget-hover",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {/* Pulse ring animation when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
      )}
      
      <span className={cn(
        "transition-transform duration-300",
        isOpen ? "rotate-90" : "rotate-0"
      )}>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </span>
    </button>
  );
}
