-- Create support tickets table
CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    subject text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create support messages table
CREATE TABLE public.support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid NOT NULL,
    is_admin boolean NOT NULL DEFAULT false,
    message text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all tickets"
ON public.support_tickets FOR UPDATE
USING (is_admin());

-- RLS Policies for support_messages
CREATE POLICY "Users can view messages from their tickets"
ON public.support_messages FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = support_messages.ticket_id
    AND support_tickets.user_id = auth.uid()
));

CREATE POLICY "Users can send messages to their tickets"
ON public.support_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE support_tickets.id = support_messages.ticket_id
        AND support_tickets.user_id = auth.uid()
    )
    AND is_admin = false
);

CREATE POLICY "Admins can view all messages"
ON public.support_messages FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can send messages to any ticket"
ON public.support_messages FOR INSERT
WITH CHECK (is_admin() AND is_admin = true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;

-- Trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();