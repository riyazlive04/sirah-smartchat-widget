export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-secondary rounded-2xl rounded-bl-md w-fit animate-message-appear">
      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
    </div>
  );
}
