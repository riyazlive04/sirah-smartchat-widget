import { useEffect, useRef } from 'react';
import type { Message, QuickReply, Attachment } from '@/types/chat';
import { cn } from '@/lib/utils';
import { TypingIndicator } from './TypingIndicator';
import { QuickReplies } from './QuickReplies';
import { FileText, Image } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  lang: 'en' | 'ta';
  onQuickReply: (value: string) => void;
}

function getLocalizedText(text: any, lang: 'en' | 'ta'): string {
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
}

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type.startsWith('image/');

  if (isImage) {
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block mt-2"
      >
        <img 
          src={attachment.url} 
          alt={attachment.name}
          className="max-w-[200px] max-h-[150px] rounded-lg object-cover border border-border"
        />
      </a>
    );
  }

  return (
    <a 
      href={attachment.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 mt-2 px-3 py-2",
        "bg-background/50 rounded-lg",
        "border border-border",
        "hover:bg-background/80 transition-colors"
      )}
    >
      <FileText className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs truncate max-w-[150px]">{attachment.name}</span>
    </a>
  );
}

export function MessageList({ messages, isTyping, lang, onQuickReply }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Get the last bot message's quick replies (only show for the most recent bot message)
  const lastBotMessage = [...messages].reverse().find(m => m.role === 'bot');
  const showQuickReplies = lastBotMessage?.quickReplies && 
    messages[messages.length - 1]?.role === 'bot';

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex animate-message-appear",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] px-4 py-2.5 text-sm leading-relaxed",
              message.role === 'user'
                ? "chat-bubble-user"
                : "chat-bubble-bot"
            )}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.attachments.map(attachment => (
                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      {showQuickReplies && !isTyping && (
        <div className="flex justify-start">
          <div className="max-w-[90%]">
            <QuickReplies
              replies={lastBotMessage.quickReplies!}
              lang={lang}
              onSelect={onQuickReply}
            />
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
