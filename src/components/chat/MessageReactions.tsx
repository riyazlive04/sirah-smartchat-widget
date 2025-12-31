import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MessageReaction } from '@/types/chat';

const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '😮'];

interface MessageReactionsProps {
  messageId: string;
  reactions?: MessageReaction[];
  onReact: (messageId: string, emoji: string) => void;
  showPicker?: boolean;
}

export function MessageReactions({ messageId, reactions = [], onReact, showPicker = false }: MessageReactionsProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(messageId, emoji);
    setIsPickerOpen(false);
  };

  const hasReactions = reactions.length > 0;

  return (
    <div className="relative">
      {/* Display existing reactions */}
      {hasReactions && (
        <div className="flex gap-1 mt-1">
          {reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                "inline-flex items-center gap-1",
                "px-1.5 py-0.5 rounded-full",
                "bg-primary/10 hover:bg-primary/20",
                "text-xs transition-all duration-200",
                "border border-primary/20"
              )}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-muted-foreground">{reaction.count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Reaction picker trigger */}
      {showPicker && (
        <div className="relative inline-block">
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className={cn(
              "mt-1 p-1 rounded-full",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted/50 transition-colors",
              "text-xs opacity-0 group-hover:opacity-100",
              hasReactions && "opacity-100"
            )}
            aria-label="Add reaction"
          >
            <span className="text-sm">😊</span>
          </button>

          {/* Reaction picker popup */}
          {isPickerOpen && (
            <div
              className={cn(
                "absolute bottom-full left-0 mb-1",
                "flex gap-1 p-1.5 rounded-full",
                "bg-card border border-border shadow-lg",
                "animate-scale-in z-50"
              )}
            >
              {AVAILABLE_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center",
                    "text-lg rounded-full",
                    "hover:bg-primary/10 hover:scale-125",
                    "transition-all duration-150"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
