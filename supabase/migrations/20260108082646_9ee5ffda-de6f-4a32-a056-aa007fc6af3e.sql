-- Allow admins to delete tickets
CREATE POLICY "Admins can delete tickets"
ON public.support_tickets
FOR DELETE
USING (is_admin());

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages"
ON public.support_messages
FOR DELETE
USING (is_admin());