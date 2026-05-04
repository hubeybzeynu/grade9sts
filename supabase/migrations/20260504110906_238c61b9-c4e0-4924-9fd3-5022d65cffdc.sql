
CREATE TABLE IF NOT EXISTS public.telegram_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_link_id TEXT NOT NULL UNIQUE,
  user_email TEXT,
  user_name TEXT,
  telegram_chat_id BIGINT,
  telegram_username TEXT,
  telegram_first_name TEXT,
  linked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  linked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_telegram_links_chat_id ON public.telegram_links(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_links_email ON public.telegram_links(user_email);

ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view telegram links"
  ON public.telegram_links FOR SELECT USING (true);

CREATE POLICY "Anyone can insert telegram links"
  ON public.telegram_links FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.telegram_bot_state (
  id INT PRIMARY KEY CHECK (id = 1),
  update_offset BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.telegram_bot_state (id, update_offset)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;
