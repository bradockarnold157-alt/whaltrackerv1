-- Create store settings table for minimum order value and other configs
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can view settings"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can insert settings"
ON public.store_settings
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update settings"
ON public.store_settings
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete settings"
ON public.store_settings
FOR DELETE
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default minimum order value
INSERT INTO public.store_settings (key, value) VALUES ('minimum_order_value', '20');