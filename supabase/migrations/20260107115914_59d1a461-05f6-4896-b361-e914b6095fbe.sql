-- Create a function to get available stock count for a product (public access)
CREATE OR REPLACE FUNCTION public.get_available_stock_count(p_product_id integer)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.product_stock
  WHERE product_id = p_product_id
    AND is_available = true
$$;