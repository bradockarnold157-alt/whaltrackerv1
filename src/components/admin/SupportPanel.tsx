import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Clock, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminSupport } from "@/hooks/useAdminSupport";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SupportPanel = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    tickets,
    messages,
    activeTicket,
    setActiveTicket,
    loading,
    hasNewTicketMessages,
    clearNewMessages,
    sendMessage,
    closeTicket,
    deleteTicket,
  } = useAdminSupport();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear notification when selecting a ticket
  useEffect(() => {
    if (activeTicket && hasNewTicketMessages) {
      clearNewMessages();
    }
  }, [activeTicket, hasNewTicketMessages, clearNewMessages]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    await sendMessage(message, user.id);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openTickets = tickets.filter((t) => t.status === "open");
  const closedTickets = tickets.filter((t) => t.status === "closed");

  return (
    <div className="grid h-[600px] gap-6 lg:grid-cols-3">
      {/* Tickets List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Tickets
            {hasNewTicketMessages && (
              <Badge variant="destructive" className="ml-auto animate-pulse">
                Nova mensagem
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {tickets.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Nenhum ticket</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {openTickets.length > 0 && (
                  <>
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      Abertos ({openTickets.length})
                    </p>
                    {openTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setActiveTicket(ticket)}
                        className={cn(
                          "w-full rounded-lg p-3 text-left transition-colors hover:bg-muted",
                          activeTicket?.id === ticket.id && "bg-muted"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{ticket.subject}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {ticket.user_name}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {ticket.last_message}
                            </p>
                          </div>
                          <Badge variant="default" className="shrink-0">
                            Aberto
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </>
                )}
                {closedTickets.length > 0 && (
                  <>
                    <p className="mt-4 px-2 py-1 text-xs font-medium text-muted-foreground">
                      Fechados ({closedTickets.length})
                    </p>
                    {closedTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setActiveTicket(ticket)}
                        className={cn(
                          "w-full rounded-lg p-3 text-left opacity-60 transition-colors hover:bg-muted hover:opacity-100",
                          activeTicket?.id === ticket.id && "bg-muted opacity-100"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{ticket.subject}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {ticket.user_name}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            Fechado
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        {activeTicket ? (
          <>
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{activeTicket.subject}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activeTicket.user_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(activeTicket.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeTicket.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeTicket(activeTicket.id)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Fechar
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Apagar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar ticket?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja apagar este ticket e todas as suas mensagens? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTicket(activeTicket.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Apagar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex h-[400px] flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.is_admin ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          msg.is_admin
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            msg.is_admin ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {activeTicket.status === "open" && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua resposta..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button onClick={handleSend} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Selecione um ticket para ver as mensagens</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SupportPanel;
