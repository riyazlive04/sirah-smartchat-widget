import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏']
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  },
  {
    name: 'Objects',
    emojis: ['📱', '💻', '🖥️', '📷', '📹', '🎥', '📞', '☎️', '📧', '💼', '📁', '📂', '📅', '📆', '🔔', '⏰', '⌛', '💡', '🔑', '🔒']
  },
  {
    name: 'Symbols',
    emojis: ['✅', '❌', '❓', '❗', '💯', '🔥', '⭐', '✨', '🎉', '🎊', '💪', '🙈', '🙉', '🙊', '💬', '💭', '🗣️', '👁️‍🗨️']
  }
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onSelect, disabled }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-10 h-10 rounded-full",
          "bg-secondary text-muted-foreground",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:bg-secondary/80 hover:text-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label="Insert emoji"
      >
        <Smile className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute bottom-full mb-2 right-0",
            "w-72 max-h-64",
            "bg-card border border-border rounded-xl",
            "shadow-lg overflow-hidden",
            "animate-scale-in origin-bottom-right z-50"
          )}
        >
          {/* Category tabs */}
          <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
            {EMOJI_CATEGORIES.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(index)}
                className={cn(
                  "flex-1 min-w-[50px] px-2 py-2 text-xs font-medium",
                  "transition-colors duration-150",
                  activeCategory === index
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {category.emojis[0]}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-2 max-h-48 overflow-y-auto chat-scrollbar">
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center",
                    "text-lg rounded-lg",
                    "hover:bg-primary/10 hover:scale-110",
                    "transition-all duration-150",
                    "focus:outline-none focus:ring-1 focus:ring-primary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
