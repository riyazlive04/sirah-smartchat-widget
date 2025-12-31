import type { QuickReply, LocalizedString, IntentLevel } from '@/types/chat';
import { cn } from '@/lib/utils';

interface QuickRepliesProps {
  replies: QuickReply[];
  lang: 'en' | 'ta';
  onSelect: (value: string) => void;
}

function getLocalizedText(text: LocalizedString | string, lang: 'en' | 'ta'): string {
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
}

export function QuickReplies({ replies, lang, onSelect }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 animate-fade-in">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onSelect(reply.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium",
            "rounded-full transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            // High intent buttons get prominent styling
            reply.intent === 'high' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
              : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
          )}
        >
          {getLocalizedText(reply.label, lang)}
        </button>
      ))}
    </div>
  );
}
