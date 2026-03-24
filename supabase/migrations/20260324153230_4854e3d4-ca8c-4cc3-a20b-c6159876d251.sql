-- Create table for mid-term results
CREATE TABLE public.mid_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  result_image_url TEXT NOT NULL,
  answer_image_url TEXT,
  student_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for final results
CREATE TABLE public.final_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  result_image_url TEXT NOT NULL,
  answer_image_url TEXT,
  student_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mid_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_results ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view mid results" ON public.mid_results FOR SELECT USING (true);
CREATE POLICY "Anyone can view final results" ON public.final_results FOR SELECT USING (true);

-- Allow public insert/update/delete for API management
CREATE POLICY "Allow insert mid results" ON public.mid_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update mid results" ON public.mid_results FOR UPDATE USING (true);
CREATE POLICY "Allow delete mid results" ON public.mid_results FOR DELETE USING (true);

CREATE POLICY "Allow insert final results" ON public.final_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update final results" ON public.final_results FOR UPDATE USING (true);
CREATE POLICY "Allow delete final results" ON public.final_results FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_mid_results_updated_at
  BEFORE UPDATE ON public.mid_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_final_results_updated_at
  BEFORE UPDATE ON public.final_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();