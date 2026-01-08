-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Zap',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories" 
ON public.categories 
FOR SELECT 
USING (is_admin());

-- Admins can insert categories
CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (is_admin());

-- Admins can update categories
CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (is_admin());

-- Admins can delete categories
CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, icon, display_order) VALUES
  ('Streaming', 'Tv', 1),
  ('Música', 'Music', 2),
  ('Jogos', 'Gamepad2', 3),
  ('Cursos', 'GraduationCap', 4),
  ('Gift Cards', 'Gift', 5),
  ('Premium', 'Zap', 6);