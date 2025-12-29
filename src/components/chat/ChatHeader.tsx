import { X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  botName: string;
  businessName?: string;
  onClose: () => void;
  onToggleLanguage?: () => void;
  currentLang?: 'en' | 'ta';
  enableTamil?: boolean;
}

export function ChatHeader({ 
  botName, 
  businessName, 
  onClose, 
  onToggleLanguage,
  currentLang,
  enableTamil 
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <span className="text-lg">💬</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{botName}</h3>
          {businessName && (
            <p className="text-xs text-primary-foreground/80">{businessName}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {enableTamil && onToggleLanguage && (
          <button
            onClick={onToggleLanguage}
            className={cn(
              "w-8 h-8 rounded-full",
              "bg-primary-foreground/20 hover:bg-primary-foreground/30",
              "flex items-center justify-center",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            )}
            aria-label="Toggle language"
            title={currentLang === 'en' ? 'Switch to Tamil' : 'Switch to English'}
          >
            <Globe className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={onClose}
          className={cn(
            "w-8 h-8 rounded-full",
            "bg-primary-foreground/20 hover:bg-primary-foreground/30",
            "flex items-center justify-center",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
          )}
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
