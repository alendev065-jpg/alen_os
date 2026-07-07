import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

type Listener = (msg: string) => void;
let toastListener: Listener | null = null;

export function setToastListener(fn: Listener) {
  toastListener = fn;
  return () => { if (toastListener === fn) toastListener = null; };
}

function notify(message: string) {
  if (toastListener) toastListener(message);
  else console.error(message);
}

export async function checkError<T>(
  promise: Promise<{ data: T | null; error: { message: string } | null }>,
  label = 'Operation'
): Promise<T | null> {
  const { data, error } = await promise;
  if (error) {
    notify(`${label} failed: ${error.message}`);
    return null;
  }
  return data;
}

export type CrmPipeline = {
  id: string;
  user_id: string;
  company: string;
  project: string;
  stage: 'lead' | 'contacted' | 'proposal_sent' | 'closed_won';
  amount: number;
  days_left: number | null;
  priority: string;
  status: string | null;
  is_new: boolean;
  created_at: string;
};

export type CrmContact = {
  id: string;
  user_id: string;
  company: string;
  email: string;
  last_touchpoint_date: string | null;
  last_touchpoint_method: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  bucket: 'today' | 'this_week' | 'someday';
  tags: string[];
  due_time: string | null;
  due_day: string | null;
  completed: boolean;
  task_id: string | null;
  overdue_days: number;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  entry_number: number | null;
  morning_objective: string | null;
  avoiding: string | null;
  energy_level: number | null;
  proud_of: string | null;
  mental_weight: string | null;
  did_the_thing: boolean | null;
  wasted_time: string | null;
  avoided_again: string | null;
  learned: string | null;
  tomorrow_priority: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  log_date: string;
  time_slot: string;
  category: string;
  description: string;
  custom_category_label: string | null;
  created_at: string;
};

export type FinanceTransaction = {
  id: string;
  user_id: string;
  transaction_date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  subcategory: string | null;
  amount: number;
  created_at: string;
};

export type FinanceReceivable = {
  id: string;
  user_id: string;
  entity: string;
  amount: number;
  outstanding_since: string;
  status: 'overdue' | 'pending' | 'paid';
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  frequency: string;
  streak: number;
  status: 'completed' | 'pending' | 'streak_broken';
  last_completed: string | null;
  created_at: string;
};

export type HabitLog = {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  category_tag: string | null;
  progress: number;
  deadline: string | null;
  last_action: string | null;
  icon_type: string | null;
  created_at: string;
};
