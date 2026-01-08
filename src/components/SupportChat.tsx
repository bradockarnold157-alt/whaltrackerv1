import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useSupportChat } from "@/hooks/useSupportChat";
import { cn } from "@/lib/utils";

const SupportChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    activeTicket,
    loading,
    hasUnreadMessages,
    clearUnread,
    createTicket,
    sendMessage,
    setActiveTicket,
  } = useSupportChat();

  const isTicketClosed = activeTicket?.status === "closed";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear unread when opening chat
  useEffect(() => {
    if (isOpen && hasUnreadMessages) {
      clearUnread();
    }
  }, [isOpen, hasUnreadMessages, clearUnread]);

  const handleSend = async () => {
    if (!message.trim()) return;

    if (!activeTicket) {
      // Creating new ticket
      if (!subject.trim()) {
        setIsCreatingTicket(true);
        return;
      }
      await createTicket(subject, message);
      setSubject("");
      setIsCreatingTicket(false);
    } else {
      await sendMessage(message);
    }

    setMessage("");
  };

  const handleNewTicket = () => {
    setActiveTicket(null);
    setIsCreatingTicket(true);
    setSubject("");
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        {/* Unread indicator */}
        {hasUnreadMessages && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary p-4 text-primary-foreground">
            <div>
              <h3 className="font-semibold">Suporte</h3>
              <p className="text-xs opacity-80">
                {activeTicket 
                  ? `Ticket: ${activeTicket.subject}${isTicketClosed ? " (Encerrado)" : ""}` 
                  : "Envie sua mensagem"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && !isTicketClosed ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <MessageCircle className="mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">Olá! Como podemos ajudar?</p>
                <p className="text-xs">Envie uma mensagem para iniciar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.is_admin ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        msg.is_admin
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Closed Ticket Banner */}
          {isTicketClosed ? (
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-muted p-3 text-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Este ticket foi encerrado.
                </p>
              </div>
              <Button onClick={handleNewTicket} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Criar Novo Ticket
              </Button>
            </div>
          ) : (
            /* Input */
            <div className="border-t border-border p-4">
              {!activeTicket && isCreatingTicket && (
                <div className="mb-2">
                  <Input
                    placeholder="Assunto do ticket..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mb-2"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!message.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!activeTicket && !isCreatingTicket && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Pressione Enter para criar um novo ticket
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChat;
