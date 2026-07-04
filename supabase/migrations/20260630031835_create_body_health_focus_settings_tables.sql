/*
# Create body_metrics, health_logs, focus_sessions, user_settings tables

1. New Tables
- `body_metrics`: Body composition tracking (weight, body fat, muscle mass, hydration, measurements) + exercise done/needs done
  - id, log_date, weight, body_fat, muscle_mass, hydration, waist, chest, arms, notes, exercise_done, exercise_target, created_at
- `health_logs`: Health metrics (sleep, heart rate, HRV, steps, stress)
  - id, log_date, sleep_hours, sleep_quality, resting_hr, hrv, steps, calories_burned, stress_level, notes, created_at
- `focus_sessions`: Focus/deep work session tracking
  - id, session_date, session_type, duration_minutes, distractions, status, notes, started_at, ended_at, created_at
- `user_settings`: Key-value settings store for the Settings page
  - id, key, value, updated_at

2. Security
- RLS enabled on all tables.
- All tables allow anon + authenticated CRUD (single-tenant, no auth screen).
- USING (true) is acceptable because the app has no sign-in and all data is intentionally shared.

3. Notes
- All tables use gen_random_uuid() for primary keys.
- created_at defaults to now().
- user_settings uses a unique key column for upsert operations.
*/

CREATE TABLE IF NOT EXISTS body_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric,
  body_fat numeric,
  muscle_mass numeric,
  hydration numeric,
  waist numeric,
  chest numeric,
  arms numeric,
  notes text,
  exercise_done text,
  exercise_target text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_body_metrics" ON body_metrics;
CREATE POLICY "anon_select_body_metrics" ON body_metrics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_body_metrics" ON body_metrics;
CREATE POLICY "anon_insert_body_metrics" ON body_metrics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_body_metrics" ON body_metrics;
CREATE POLICY "anon_update_body_metrics" ON body_metrics FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_body_metrics" ON body_metrics;
CREATE POLICY "anon_delete_body_metrics" ON body_metrics FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours numeric,
  sleep_quality integer,
  resting_hr integer,
  hrv integer,
  steps integer,
  calories_burned integer,
  stress_level integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_health_logs" ON health_logs;
CREATE POLICY "anon_select_health_logs" ON health_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_health_logs" ON health_logs;
CREATE POLICY "anon_insert_health_logs" ON health_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_health_logs" ON health_logs;
CREATE POLICY "anon_update_health_logs" ON health_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_health_logs" ON health_logs;
CREATE POLICY "anon_delete_health_logs" ON health_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  session_type text NOT NULL DEFAULT 'deep_work',
  duration_minutes integer NOT NULL DEFAULT 25,
  distractions integer DEFAULT 0,
  status text DEFAULT 'completed',
  notes text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_focus_sessions" ON focus_sessions;
CREATE POLICY "anon_select_focus_sessions" ON focus_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_focus_sessions" ON focus_sessions;
CREATE POLICY "anon_insert_focus_sessions" ON focus_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_focus_sessions" ON focus_sessions;
CREATE POLICY "anon_update_focus_sessions" ON focus_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_focus_sessions" ON focus_sessions;
CREATE POLICY "anon_delete_focus_sessions" ON focus_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_user_settings" ON user_settings;
CREATE POLICY "anon_select_user_settings" ON user_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_settings" ON user_settings;
CREATE POLICY "anon_insert_user_settings" ON user_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_settings" ON user_settings;
CREATE POLICY "anon_update_user_settings" ON user_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_settings" ON user_settings;
CREATE POLICY "anon_delete_user_settings" ON user_settings FOR DELETE
  TO anon, authenticated USING (true);
