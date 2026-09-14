/*
# Create students table for IGDTUW verification

1. New Tables
- `students`
  - `id` (uuid, primary key)
  - `name` (text, not null) — student's full name
  - `college_id` (text, not null, unique) — IGDTUW college/enrollment ID
  - `created_at` (timestamp, defaults to now)
2. Security
- Enable RLS on `students`.
- Allow anon + authenticated CRUD since this is a no-auth app with a simple verification gate.
- All data is intentionally shared/public (no per-user isolation needed for this use case).
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  college_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);
