-- Add display_order column to products table
ALTER TABLE public.products 
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Set initial order based on current id order
UPDATE public.products 
SET display_order = id;