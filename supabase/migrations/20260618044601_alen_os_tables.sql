
CREATE TABLE IF NOT EXISTS crm_pipeline (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company text NOT NULL,
  project text NOT NULL,
  stage text NOT NULL,
  amount numeric NOT NULL,
  days_left integer,
  priority text DEFAULT 'normal',
  status text,
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company text NOT NULL,
  email text NOT NULL,
  last_touchpoint_date date,
  last_touchpoint_method text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  priority text NOT NULL,
  bucket text NOT NULL,
  tags text[],
  due_time text,
  due_day text,
  completed boolean DEFAULT false,
  task_id text,
  overdue_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date date NOT NULL UNIQUE,
  entry_number integer,
  morning_objective text,
  avoiding text,
  energy_level integer,
  proud_of text,
  mental_weight text,
  did_the_thing boolean,
  wasted_time text,
  avoided_again text,
  learned text,
  tomorrow_priority text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date date NOT NULL,
  time_slot text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date date NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  subcategory text,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_receivables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity text NOT NULL,
  amount numeric NOT NULL,
  outstanding_since date NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);
