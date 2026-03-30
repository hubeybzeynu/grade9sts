
CREATE TABLE public.students (
  id integer PRIMARY KEY,
  name text NOT NULL,
  english_name text NOT NULL,
  age integer,
  gender text,
  section text,
  telegram text,
  instagram text,
  image_url text,
  download_url text
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view students" ON public.students FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert students" ON public.students FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update students" ON public.students FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete students" ON public.students FOR DELETE TO public USING (true);
