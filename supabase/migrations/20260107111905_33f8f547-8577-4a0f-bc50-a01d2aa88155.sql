-- Add PIX transaction data and deliverable to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS pix_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS pix_qrcode TEXT,
ADD COLUMN IF NOT EXISTS pix_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deliverable TEXT;