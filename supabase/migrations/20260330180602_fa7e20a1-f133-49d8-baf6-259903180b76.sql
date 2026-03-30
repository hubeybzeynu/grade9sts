
CREATE TABLE public.report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  student_name text,
  sex text,
  age integer,
  kebele text,
  house_no text,
  teacher_name text,
  school_year text,
  grade text,
  subjects jsonb NOT NULL DEFAULT '{}',
  conduct jsonb NOT NULL DEFAULT '{}',
  days_present jsonb DEFAULT '{}',
  days_absent jsonb DEFAULT '{}',
  times_tardy jsonb DEFAULT '{}',
  total_academic_days jsonb DEFAULT '{}',
  rank jsonb DEFAULT '{}',
  remarks text,
  promoted_to text,
  detained_in_grade text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view report cards" ON public.report_cards FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert report cards" ON public.report_cards FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update report cards" ON public.report_cards FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete report cards" ON public.report_cards FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.report_cards;
