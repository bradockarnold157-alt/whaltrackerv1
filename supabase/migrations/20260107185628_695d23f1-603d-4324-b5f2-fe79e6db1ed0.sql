-- Add rating and reviews_count columns to products table
ALTER TABLE public.products
ADD COLUMN rating numeric DEFAULT 5.0,
ADD COLUMN reviews_count integer DEFAULT 0;

-- Add constraints for valid rating range (0.5 to 5, in 0.5 increments)
ALTER TABLE public.products
ADD CONSTRAINT products_rating_range CHECK (rating >= 0 AND rating <= 5);