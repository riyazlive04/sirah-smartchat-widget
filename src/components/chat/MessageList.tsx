import { useEffect, useRef } from 'react';
import type { Message, QuickReply, Attachment, FeatureToggles } from '@/types/chat';
import { cn } from '@/lib/utils';
import { TypingIndicator } from './TypingIndicator';
import { QuickReplies } from './QuickReplies';
import { MessageStatus } from './MessageStatus';
import { MessageReactions } from './MessageReactions';
import { FileText } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  lang: 'en' | 'ta';
  features?: FeatureToggles;
  onQuickReply: (value: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
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

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageList({ messages, isTyping, lang, features, onQuickReply, onReaction }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const lastBotMessage = [...messages].reverse().find(m => m.role === 'bot');
  const showQuickReplies = lastBotMessage?.quickReplies && 
    messages[messages.length - 1]?.role === 'bot' &&
    features?.enableQuickReplies !== false;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex animate-message-appear group",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          <div className="flex flex-col max-w-[80%]">
            <div
              className={cn(
                "px-4 py-2.5 text-sm leading-relaxed",
                message.role === 'user'
                  ? "chat-bubble-user"
                  : "chat-bubble-bot"
              )}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.attachments.map(attachment => (
                    <AttachmentPreview key={attachment.id} attachment={attachment} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Message footer with time and status */}
            <div className={cn(
              "flex items-center gap-1.5 mt-0.5 px-1",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}>
              <span className="text-[10px] text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
              
              {message.role === 'user' && message.status && features?.enableReadReceipts && (
                <MessageStatus status={message.status} />
              )}
            </div>

            {/* Reactions for bot messages */}
            {message.role === 'bot' && features?.enableReactions && onReaction && (
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions}
                onReact={onReaction}
                showPicker
              />
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
