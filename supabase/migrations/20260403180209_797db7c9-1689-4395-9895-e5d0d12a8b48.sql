ALTER TABLE public.report_cards 
ADD COLUMN IF NOT EXISTS card_password text DEFAULT '',
ADD COLUMN IF NOT EXISTS total_students integer DEFAULT 0;