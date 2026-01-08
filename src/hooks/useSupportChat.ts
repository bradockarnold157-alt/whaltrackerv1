import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNotificationSound } from "@/hooks/useNotificationSound";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

export const useSupportChat = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { playNotificationSound } = useNotificationSound();
  const processedMessageIds = useRef<Set<string>>(new Set());

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
      return;
    }

    setTickets(data || []);
    
    // Auto-select first open ticket or most recent
    const openTicket = data?.find(t => t.status === "open");
    if (openTicket && !activeTicket) {
      setActiveTicket(openTicket);
    }
  }, [user, activeTicket]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select("id, ticket_id, sender_id, is_admin, message, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    // Track all message IDs to prevent duplicates
    const newProcessedIds = new Set(data?.map(m => m.id) || []);
    processedMessageIds.current = newProcessedIds;
    
    setMessages(data || []);
  }, []);

  const createTicket = async (subject: string, initialMessage: string) => {
    if (!user) return null;

    setLoading(true);

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject })
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket.",
        variant: "destructive",
      });
      setLoading(false);
      return null;
    }

    const { error: messageError } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        is_admin: false,
        message: initialMessage,
      });

    if (messageError) {
      console.error("Error sending message:", messageError);
    }

    setActiveTicket(ticket);
    await fetchTickets();
    await fetchMessages(ticket.id);
    setLoading(false);

    return ticket;
  };

  const sendMessage = async (message: string) => {
    if (!user || !activeTicket) return;

    const { error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: activeTicket.id,
        sender_id: user.id,
        is_admin: false,
        message,
      });

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const clearUnread = useCallback(() => {
    setHasUnreadMessages(false);
  }, []);

  // Subscribe to messages for active ticket
  useEffect(() => {
    if (!activeTicket || !user) return;

    fetchMessages(activeTicket.id);

    const messagesChannel = supabase
      .channel(`user-messages-${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${activeTicket.id}`,
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          
          // Prevent duplicates
          if (processedMessageIds.current.has(newMessage.id)) {
            return;
          }
          processedMessageIds.current.add(newMessage.id);
          
          setMessages((prev) => {
            // Double check for duplicates in state
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Play sound and notify for admin messages
          if (newMessage.is_admin) {
            playNotificationSound();
            toast({
              title: "💬 Nova mensagem do suporte",
              description: "Você recebeu uma resposta.",
            });
            setHasUnreadMessages(true);
          }
        }
      )
      .subscribe();

    const ticketChannel = supabase
      .channel(`user-ticket-${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `id=eq.${activeTicket.id}`,
        },
        (payload) => {
          setActiveTicket(payload.new as SupportTicket);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [activeTicket?.id, user, fetchMessages, playNotificationSound]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, fetchTickets]);

  return {
    tickets,
    messages,
    activeTicket,
    setActiveTicket,
    loading,
    hasUnreadMessages,
    clearUnread,
    createTicket,
    sendMessage,
    fetchTickets,
    fetchMessages,
  };
};
