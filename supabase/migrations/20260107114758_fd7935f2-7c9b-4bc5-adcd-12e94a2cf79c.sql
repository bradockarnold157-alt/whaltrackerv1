-- Create product_stock table for digital deliverables
CREATE TABLE public.product_stock (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    credential text NOT NULL,
    is_available boolean NOT NULL DEFAULT true,
    assigned_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    assigned_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Only admins can manage stock
CREATE POLICY "Admins can view all stock"
ON public.product_stock
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert stock"
ON public.product_stock
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update stock"
ON public.product_stock
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete stock"
ON public.product_stock
FOR DELETE
USING (is_admin());

-- Index for faster lookups
CREATE INDEX idx_product_stock_product_available ON public.product_stock(product_id, is_available) WHERE is_available = true;