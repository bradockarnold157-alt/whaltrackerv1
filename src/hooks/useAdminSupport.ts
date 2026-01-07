import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SupportTicketWithUser {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  last_message?: string;
  unread_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

export const useAdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicketWithUser[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicketWithUser | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);

    // Fetch tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("support_tickets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      setLoading(false);
      return;
    }

    // Fetch profiles for user info
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name");

    // Fetch last message for each ticket
    const ticketsWithInfo = await Promise.all(
      (ticketsData || []).map(async (ticket) => {
        const { data: lastMsg } = await supabase
          .from("support_messages")
          .select("message")
          .eq("ticket_id", ticket.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const profile = profiles?.find((p) => p.user_id === ticket.user_id);

        return {
          ...ticket,
          user_name: profile?.display_name || "Usuário",
          last_message: lastMsg?.message || "",
        };
      })
    );

    setTickets(ticketsWithInfo);
    setLoading(false);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select("id, ticket_id, sender_id, is_admin, message, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async (message: string, userId: string) => {
    if (!activeTicket) return;

    const { error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: activeTicket.id,
        sender_id: userId,
        is_admin: true,
        message,
      });

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }

    // Update ticket updated_at
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeTicket.id);
  };

  const closeTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: "closed" })
      .eq("id", ticketId);

    if (error) {
      console.error("Error closing ticket:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fechar o ticket.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ticket fechado",
      description: "O ticket foi fechado com sucesso.",
    });

    await fetchTickets();
    setActiveTicket(null);
  };

  const reopenTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: "open" })
      .eq("id", ticketId);

    if (error) {
      console.error("Error reopening ticket:", error);
      return;
    }

    await fetchTickets();
  };

  // Subscribe to realtime
  useEffect(() => {
    if (!activeTicket) return;

    fetchMessages(activeTicket.id);

    const channel = supabase
      .channel(`admin-messages-${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${activeTicket.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTicket?.id]);

  // Subscribe to new tickets
  useEffect(() => {
    const channel = supabase
      .channel("admin-tickets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    messages,
    activeTicket,
    setActiveTicket,
    loading,
    sendMessage,
    closeTicket,
    reopenTicket,
    fetchTickets,
    fetchMessages,
  };
};
