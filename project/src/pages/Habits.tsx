import { useEffect, useState } from 'react';
import { Plus, Check, Pencil, Trash2, X, Save, Activity } from 'lucide-react';
import { supabase, checkError, Habit, HabitLog } from '../lib/supabase';

type HabitForm = { name: string; frequency: string; streak: number; status: Habit['status'] };
const DEFAULT_FORM: HabitForm = { name: '', frequency: 'Daily', status: 'pending', streak: 0 };

function StatusBadge({ status }: { status: Habit['status'] }) {
  if (status === 'completed') return <span className="font-mono text-xs font-bold text-green-600 tracking-widest">COMPLETED</span>;
  if (status === 'streak_broken') return <span className="font-mono text-xs font-bold text-alen-red tracking-widest underline">STREAK_BROKEN</span>;
  return <span className="font-mono text-xs text-black/40 tracking-widest">PENDING</span>;
}

function HabitModal({
  habit,
  onClose,
  onSave,
}: {
  habit: Partial<HabitForm> & { id?: string };
  onClose: () => void;
  onSave: (data: HabitForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<HabitForm>({
    name: habit.name || '',
    frequency: habit.frequency || 'Daily',
    status: habit.status || 'pending',
    streak: habit.streak || 0,
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{habit.id ? 'EDIT HABIT' : 'NEW HABIT'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">HABIT NAME</div>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none"
              placeholder="Enter habit name..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">FREQUENCY</div>
              <input
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black"
                placeholder="Daily / 4x Week..."
              />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">STATUS</div>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Habit['status'] }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none"
              >
                <option value="completed">COMPLETED</option>
                <option value="pending">PENDING</option>
                <option value="streak_broken">STREAK BROKEN</option>
              </select>
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">CURRENT STREAK (days)</div>
            <input
              type="number"
              value={form.streak}
              onChange={(e) => setForm((f) => ({ ...f, streak: Number(e.target.value) }))}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black"
            />
          </div>
          <button
            onClick={() => form.name && onSave({ ...form, id: habit.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {habit.id ? 'SAVE CHANGES' : 'ADD HABIT'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-red w-full max-w-sm">
        <div className="bg-alen-red text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">CONFIRM DELETE</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5">
          <p className="font-mono text-sm mb-4">Delete <strong>"{label}"</strong>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onConfirm} className="flex-1 bg-alen-red text-white font-mono text-xs font-bold py-2 tracking-widest hover:bg-alen-red-dark">DELETE</button>
            <button onClick={onClose} className="flex-1 border-2 border-alen-black font-mono text-xs font-bold py-2 tracking-widest hover:bg-black/5">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatmapGrid({ logs }: { logs: HabitLog[] }) {
  const today = new Date();
  const completedSet = new Set(logs.filter((l) => l.completed).map((l) => l.log_date));

  // Build 52 weeks × 7 days grid
  const weeks: Date[][] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  // Align to Monday
  const dayOfWeek = (startDate.getDay() + 6) % 7;
  startDate.setDate(startDate.getDate() - dayOfWeek);

  for (let w = 0; w < 53; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      week.push(date);
    }
    weeks.push(week);
  }

  const dayLabels = ['MON', '', 'WED', '', 'FRI', '', 'SUN'];
  const monthLabels = ['JANUARY', 'MARCH', 'MAY', 'JULY', 'SEPTEMBER', 'NOVEMBER'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        <div className="flex flex-col gap-0.5 pt-5">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 font-mono text-xs text-black/40 leading-none flex items-center w-10">{label}</div>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-4 mb-1 px-0">
            {monthLabels.map((m) => (
              <div key={m} className="font-mono text-xs text-black/40 tracking-widest" style={{ width: '72px' }}>{m}</div>
            ))}
          </div>
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((date, di) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isDone = completedSet.has(dateStr);
                  const isFuture = date > today;
                  return (
                    <div
                      key={di}
                      title={dateStr}
                      className={`w-3 h-3 border ${
                        isFuture
                          ? 'border-black/5 bg-transparent'
                          : isDone
                          ? 'bg-alen-black border-alen-black'
                          : 'border-black/20 bg-cream-dark'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [modal, setModal] = useState<'new' | Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from('habits').select('*').order('created_at'),
      supabase.from('habit_logs').select('*').order('log_date', { ascending: false }),
    ]);
    setHabits(habitsData || []);
    setLogs(logsData || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleSave = async (form: HabitForm & { id?: string }) => {
    if (form.id) {
      await checkError(supabase.from('habits').update({ name: form.name, frequency: form.frequency, status: form.status, streak: form.streak }).eq('id', form.id), 'Update habit');
    } else {
      await checkError(supabase.from('habits').insert({ name: form.name, frequency: form.frequency, status: form.status, streak: form.streak }), 'Create habit');
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await checkError(supabase.from('habits').delete().eq('id', deleteTarget.id), 'Delete habit');
    setDeleteTarget(null);
    load();
  };

  const toggleToday = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = logs.find((l) => l.habit_id === habit.id && l.log_date === today);
    if (existing) {
      await checkError(supabase.from('habit_logs').update({ completed: !existing.completed }).eq('id', existing.id), 'Toggle habit log');
    } else {
      await checkError(supabase.from('habit_logs').insert({ habit_id: habit.id, log_date: today, completed: true }), 'Log habit');
    }
    const newStatus = habit.status === 'completed' ? 'pending' : 'completed';
    await checkError(supabase.from('habits').update({ status: newStatus, last_completed: today }).eq('id', habit.id), 'Update habit status');
    load();
  };

  const completedCount = habits.filter((h) => h.status === 'completed').length;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-mono text-sm text-black/40 tracking-widest">LOADING HABITS...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-4 sm:px-6 font-mono text-xs tracking-widest text-black/50">DIRECTORY / HABITS_TRACKER.LOG</div>
        <button
          onClick={() => setModal('new')}
          className="mx-6 flex items-center gap-2 bg-alen-black text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red transition-colors"
        >
          <Plus size={14} /> NEW HABIT
        </button>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-auto">
        {/* Habit cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const isComplete = habit.status === 'completed';
            return (
              <div key={habit.id} className={`border-2 bg-white p-4 ${habit.status === 'streak_broken' ? 'border-alen-red/40' : 'border-black/20'}`}>
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => toggleToday(habit)}
                    className={`w-5 h-5 border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                      isComplete ? 'bg-alen-black border-alen-black' : 'border-black/30 hover:border-alen-black'
                    }`}
                  >
                    {isComplete && <Check size={10} className="text-white" />}
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => setModal(habit)} className="p-1 hover:bg-black/5 text-black/40 hover:text-alen-black transition-colors">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeleteTarget(habit)} className="p-1 hover:bg-alen-red/10 text-black/40 hover:text-alen-red transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold tracking-wide mb-1">{habit.name}</div>
                <div className="font-mono text-xs text-black/40 tracking-widest mb-3">{habit.frequency}</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-widest text-black/50">STREAK</span>
                  <span className={`font-display text-2xl ${habit.status === 'streak_broken' ? 'text-alen-red' : 'text-alen-black'}`}>
                    {habit.streak} Days
                  </span>
                </div>
                <div className="h-1.5 bg-cream-border mt-2">
                  <div
                    className={`h-full ${habit.status === 'streak_broken' ? 'bg-alen-red' : 'bg-alen-black'}`}
                    style={{ width: `${Math.min(100, (habit.streak / 30) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-alen-black bg-white p-4 flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-alen-black flex items-center justify-center">
              <Check size={12} />
            </div>
            <div className="flex-1">
              <div className="font-mono text-xs text-black/40 tracking-widest">COMPLETE</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl">{maxStreak}</span>
                <span className="font-mono text-xs text-black/50">Days</span>
              </div>
              <div className="font-mono text-xs text-black/30 tracking-widest">STREAK</div>
            </div>
          </div>
          <div className="border-2 border-black/20 bg-white p-4 flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-black/20 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-mono text-xs text-black/40 tracking-widest">PENDING</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl">{habits.filter((h) => h.status === 'pending').length}</span>
                <span className="font-mono text-xs text-black/50">Habits</span>
              </div>
              <div className="font-mono text-xs text-black/30 tracking-widest">AWAITING</div>
            </div>
          </div>
          <div className="border-2 border-black/20 bg-white p-4 flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-black/20 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-mono text-xs text-black/40 tracking-widest">PENDING</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl">{habits.filter((h) => h.status === 'streak_broken').length}</span>
                <span className="font-mono text-xs text-black/50">Broken</span>
              </div>
              <div className="font-mono text-xs text-alen-red tracking-widest">STREAK</div>
            </div>
          </div>
        </div>

        {/* Performance heatmap */}
        <div className="border-2 border-alen-black bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs font-bold tracking-widest">PERFORMANCE HEATMAP</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-black/40">LESS</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-3 h-3 border ${i === 0 ? 'border-black/20 bg-cream-dark' : 'bg-alen-black border-alen-black'}`} style={{ opacity: 0.2 + i * 0.2 }} />
              ))}
            </div>
          </div>
          <HeatmapGrid logs={logs} />
        </div>

        {/* Habits table */}
        <div className="border-2 border-alen-black">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 min-w-[600px] bg-alen-black">
            {['ARCHIVED HABIT', 'FREQUENCY', 'STATUS', ''].map((h) => (
              <div key={h} className="px-5 py-3 font-mono text-xs font-bold text-white tracking-widest">{h}</div>
              ))}
            </div>
            {habits.map((habit, i) => (
            <div
              key={habit.id}
              className={`grid grid-cols-4 min-w-[600px] border-t border-black/10 items-center ${
                habit.status === 'streak_broken' ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-cream'
              }`}
            >
              <div className={`px-5 py-4 font-mono text-sm ${habit.status === 'streak_broken' ? 'text-alen-red' : ''}`}>{habit.name}</div>
              <div className={`px-5 py-4 font-mono text-sm ${habit.status === 'streak_broken' ? 'text-alen-red' : ''}`}>{habit.frequency}</div>
              <div className="px-5 py-4">
                <StatusBadge status={habit.status} />
              </div>
              <div className="px-5 py-4 flex items-center gap-2 justify-end">
                <button
                  onClick={() => setModal(habit)}
                  className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5 transition-colors"
                  title="Edit"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setDeleteTarget(habit)}
                  className="p-1.5 border border-black/20 hover:border-alen-red hover:bg-alen-red/5 hover:text-alen-red transition-colors"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Metadata Archive */}
        <div className="border-2 border-alen-black bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-mono text-xs font-bold tracking-widest mb-2">METADATA ARCHIVE</div>
            <p className="font-mono text-xs text-black/60 leading-relaxed max-w-lg">
              Automated habit verification system. Alen OS build v4.2.1. Localized data synchronization with bio-metric inputs.
            </p>
          </div>
          <div className="text-right mr-8">
            <div className="font-mono text-xs text-black/40 tracking-widest mb-2">ACTIVE SENSORS</div>
            {['HRM MONITOR [ONLINE]', 'SLEEP STAGE [SYNCED]', 'SCREEN TIME [ACTIVE]'].map((s) => (
              <div key={s} className="font-mono text-xs text-black/60">- {s}</div>
            ))}
          </div>
          <button
            onClick={() => setModal('new')}
            className="w-10 h-10 bg-alen-black text-white flex items-center justify-center hover:bg-alen-red transition-colors flex-shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {modal && modal !== 'new' && (
        <HabitModal habit={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'new' && (
        <HabitModal habit={DEFAULT_FORM} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {deleteTarget && (
        <ConfirmDelete label={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
