import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageStatus as MessageStatusType } from '@/types/chat';

interface MessageStatusProps {
  status: MessageStatusType;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        );
      case 'sent':
        return <Check className="w-3.5 h-3.5" />;
      case 'delivered':
        return <Check className="w-3.5 h-3.5" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center",
        status === 'read' ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      aria-label={`Message ${status}`}
    >
      {getStatusIcon()}
    </span>
  );
}
