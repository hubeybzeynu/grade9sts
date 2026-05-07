
-- 1. Add birth date columns
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS birth_year  INTEGER,
  ADD COLUMN IF NOT EXISTS birth_month INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS birth_day   INTEGER NOT NULL DEFAULT 1;

-- 2. Insert the new student Baselalel Shemelis Girma (temporary id, will be renumbered)
INSERT INTO public.students (id, name, english_name, age, gender, section, image_url, download_url)
SELECT 9999, 'ባስላልኤል ሽመልስ ግርማ', 'Baselalel Shemelis Girma', 16, 'Male', '9B', '/student-placeholder.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.students WHERE english_name = 'Baselalel Shemelis Girma');

-- 3. +1 year to every existing student (skip the brand-new Baselalel which already has updated age)
UPDATE public.students
SET age = age + 1
WHERE english_name <> 'Baselalel Shemelis Girma'
  AND age IS NOT NULL;

-- 4. Function + trigger: compute age from birth fields
CREATE OR REPLACE FUNCTION public.compute_age_from_birth()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  bm INT := COALESCE(NEW.birth_month, 1);
  bd INT := COALESCE(NEW.birth_day, 1);
BEGIN
  IF NEW.birth_year IS NOT NULL THEN
    NEW.age := EXTRACT(YEAR FROM today)::INT - NEW.birth_year
      - CASE WHEN (EXTRACT(MONTH FROM today)::INT, EXTRACT(DAY FROM today)::INT) < (bm, bd) THEN 1 ELSE 0 END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_students_compute_age ON public.students;
CREATE TRIGGER trg_students_compute_age
BEFORE INSERT OR UPDATE OF birth_year, birth_month, birth_day ON public.students
FOR EACH ROW EXECUTE FUNCTION public.compute_age_from_birth();

-- 5. Renumber IDs alphabetically by english_name
DO $$
DECLARE
  rec RECORD;
  new_id INT := 1;
BEGIN
  -- Build mapping table
  CREATE TEMP TABLE _id_map (old_id INT, new_id INT) ON COMMIT DROP;

  FOR rec IN SELECT id FROM public.students ORDER BY english_name ASC LOOP
    INSERT INTO _id_map(old_id, new_id) VALUES (rec.id, new_id);
    new_id := new_id + 1;
  END LOOP;

  -- Shift current ids out of range to avoid PK conflicts
  UPDATE public.students s SET id = -m.new_id FROM _id_map m WHERE s.id = m.old_id;
  -- Apply final ids
  UPDATE public.students s SET id = m.new_id FROM _id_map m WHERE s.id = -m.new_id;

  -- Update report_cards.student_id (text) using mapping (only when it matches a numeric old id)
  UPDATE public.report_cards rc
  SET student_id = m.new_id::TEXT
  FROM _id_map m
  WHERE rc.student_id ~ '^\d+$' AND rc.student_id::INT = m.old_id;
END $$;
