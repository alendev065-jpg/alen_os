
CREATE TABLE IF NOT EXISTS habits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  frequency text NOT NULL,
  streak integer DEFAULT 0,
  status text DEFAULT 'pending',
  last_completed date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  category_tag text,
  progress integer DEFAULT 0,
  deadline date,
  last_action text,
  icon_type text DEFAULT 'target',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_habits" ON habits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_habit_logs" ON habit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_goals" ON goals FOR ALL TO anon USING (true) WITH CHECK (true);
