import { Shield, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Labels } from '@/types/chat';

interface ConsentPromptProps {
  onAgree: () => void;
  onDecline: () => void;
  labels?: Labels;
}

export function ConsentPrompt({ onAgree, onDecline, labels }: ConsentPromptProps) {
  return (
    <div className="p-4 border-t border-border bg-muted/50 animate-message-appear">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground mb-1">
            {labels?.consentTitle || 'Before we continue'}
          </p>
          <p className="text-xs text-muted-foreground">
            {labels?.consentMessage || 'We\'d like to save your contact details to assist you better.'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onAgree}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg",
            "bg-primary text-primary-foreground",
            "text-sm font-medium",
            "flex items-center justify-center gap-2",
            "hover:bg-primary/90 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
        >
          <Check className="w-4 h-4" />
          {labels?.consentAgree || 'I agree'}
        </button>
        
        <button
          onClick={onDecline}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg",
            "bg-secondary text-secondary-foreground",
            "text-sm font-medium",
            "flex items-center justify-center gap-2",
            "hover:bg-secondary/80 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          )}
        >
          <X className="w-4 h-4" />
          {labels?.consentDecline || 'No thanks'}
        </button>
      </div>
    </div>
  );
}
