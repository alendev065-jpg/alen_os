import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, Play, Pause, Square, Zap, Clock, Target, AlertOctagon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

type FocusSession = {
  id: string;
  session_date: string;
  session_type: string;
  duration_minutes: number;
  distractions: number;
  completed: boolean;
  notes: string | null;
  created_at: string;
};

type SessionForm = {
  session_date: string;
  session_type: string;
  duration_minutes: string;
  distractions: string;
  completed: boolean;
  notes: string;
};

const TODAY = new Date().toISOString().split('T')[0];
const DEFAULT_FORM: SessionForm = { session_date: TODAY, session_type: 'deep_work', duration_minutes: '90', distractions: '0', completed: true, notes: '' };

const SESSION_TYPES: Record<string, { label: string; minutes: number; color: string }> = {
  deep_work: { label: 'DEEP WORK', minutes: 90, color: 'bg-alen-black' },
  pomodoro: { label: 'POMODORO', minutes: 25, color: 'bg-alen-red' },
  study: { label: 'STUDY', minutes: 60, color: 'bg-blue-500' },
  review: { label: 'REVIEW', minutes: 30, color: 'bg-green-600' },
  creative: { label: 'CREATIVE', minutes: 45, color: 'bg-yellow-600' },
};

const SEED: Omit<FocusSession, 'id' | 'created_at'>[] = [
  { session_date: '2024-10-28', session_type: 'deep_work', duration_minutes: 90, distractions: 2, completed: true, notes: 'Architecture review for ALEN V5' },
  { session_date: '2024-10-28', session_type: 'pomodoro', duration_minutes: 25, distractions: 0, completed: true, notes: 'Client email responses' },
  { session_date: '2024-10-27', session_type: 'deep_work', duration_minutes: 90, distractions: 5, completed: false, notes: 'Backend debugging - interrupted' },
  { session_date: '2024-10-27', session_type: 'study', duration_minutes: 60, distractions: 1, completed: true, notes: 'Reading: The Form of Information' },
  { session_date: '2024-10-26', session_type: 'deep_work', duration_minutes: 90, distractions: 0, completed: true, notes: 'Zero distraction session' },
  { session_date: '2024-10-25', session_type: 'creative', duration_minutes: 45, distractions: 3, completed: true, notes: 'UI design iteration' },
  { session_date: '2024-10-24', session_type: 'review', duration_minutes: 30, distractions: 0, completed: true, notes: 'Weekly archive review' },
];

function SessionModal({ session, onClose, onSave }: {
  session: Partial<SessionForm> & { id?: string };
  onClose: () => void;
  onSave: (s: SessionForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<SessionForm>({
    session_date: session.session_date || TODAY,
    session_type: session.session_type || 'deep_work',
    duration_minutes: session.duration_minutes || '90',
    distractions: session.distractions || '0',
    completed: session.completed ?? true,
    notes: session.notes || '',
  });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{session.id ? 'EDIT SESSION' : 'LOG SESSION'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DATE</div>
              <input type="date" value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
                className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">TYPE</div>
              <select value={form.session_type} onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none">
                {Object.entries(SESSION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DURATION (min)</div>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DISTRACTIONS</div>
              <input type="number" min="0" value={form.distractions} onChange={e => setForm(f => ({ ...f, distractions: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, completed: !f.completed }))}
              className={`flex items-center gap-2 font-mono text-xs font-bold px-4 py-2 border-2 tracking-widest transition-colors ${form.completed ? 'bg-alen-black text-white border-alen-black' : 'border-black/20 text-black/50'}`}>
              {form.completed ? 'COMPLETED' : 'INCOMPLETE'}
            </button>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">NOTES</div>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none resize-none" />
          </div>
          <button onClick={() => onSave({ ...form, id: session.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{session.id ? 'SAVE CHANGES' : 'LOG SESSION'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveTimer({ onComplete }: { onComplete: (duration: number, distractions: number, type: string) => void }) {
  const [selectedType, setSelectedType] = useState('deep_work');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetMinutes = SESSION_TYPES[selectedType].minutes;
  const targetSeconds = targetMinutes * 60;
  const remaining = Math.max(0, targetSeconds - elapsed);
  const pct = Math.min(100, (elapsed / targetSeconds) * 100);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          if (e + 1 >= targetSeconds) {
            setRunning(false);
            clearInterval(intervalRef.current!);
            return e + 1;
          }
          return e + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, targetSeconds]);

  const handleStop = () => {
    setRunning(false);
    const minutesDone = Math.floor(elapsed / 60);
    if (minutesDone > 0) {
      onComplete(minutesDone, distractions, selectedType);
    }
    setElapsed(0);
    setDistractions(0);
  };

  return (
    <div className="border-2 border-alen-black bg-white p-6">
      <div className="font-mono text-xs font-bold tracking-widest mb-4">FOCUS TERMINAL // LIVE SESSION</div>

      {/* Type selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {Object.entries(SESSION_TYPES).map(([k, v]) => (
          <button key={k} onClick={() => { setSelectedType(k); setElapsed(0); }}
            disabled={running}
            className={`font-mono text-xs font-bold px-3 py-1.5 tracking-widest border transition-colors ${selectedType === k ? `${v.color} text-white border-transparent` : 'border-black/20 text-black/50 hover:border-alen-black disabled:cursor-not-allowed'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center mb-6">
        <div className="font-display text-8xl text-alen-black tracking-widest leading-none">
          {mm}:{ss}
        </div>
        <div className="font-mono text-xs text-black/40 tracking-widest mt-2">
          {SESSION_TYPES[selectedType].label} // {targetMinutes} MIN TARGET
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-cream-border mt-4 overflow-hidden">
          <div className={`h-full ${SESSION_TYPES[selectedType].color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between w-full mt-1">
          <span className="font-mono text-xs text-black/30">{Math.floor(elapsed / 60)}min elapsed</span>
          <span className="font-mono text-xs text-black/30">{Math.ceil(remaining / 60)}min left</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={() => setRunning(r => !r)}
          className={`flex-1 flex items-center justify-center gap-2 font-mono text-xs font-bold py-3 tracking-widest transition-colors ${running ? 'bg-yellow-500 text-white' : 'bg-alen-black text-white hover:bg-alen-red'}`}>
          {running ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> {elapsed > 0 ? 'RESUME' : 'START'}</>}
        </button>
        {elapsed > 0 && (
          <button onClick={handleStop}
            className="flex items-center gap-2 border-2 border-alen-red text-alen-red font-mono text-xs font-bold px-4 py-3 tracking-widest hover:bg-alen-red hover:text-white transition-colors">
            <Square size={14} /> STOP & LOG
          </button>
        )}
        {running && (
          <button onClick={() => setDistractions(d => d + 1)}
            className="flex items-center gap-2 border-2 border-black/20 font-mono text-xs font-bold px-4 py-3 tracking-widest hover:border-alen-red hover:text-alen-red transition-colors">
            <AlertOctagon size={14} />
            <span className="font-bold">{distractions}</span>
          </button>
        )}
      </div>
      {running && (
        <div className="mt-2 text-center font-mono text-xs text-black/40">TAP <span className="font-bold">⚠</span> EACH TIME YOU GET DISTRACTED</div>
      )}
    </div>
  );
}

export default function Focus() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [modal, setModal] = useState<'new' | FocusSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('focus_sessions').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      if (data.length === 0) {
        const { data: seeded } = await supabase.from('focus_sessions').insert(SEED).select();
        setSessions(seeded || []);
      } else {
        setSessions(data);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTimerComplete = async (duration: number, distractions: number, type: string) => {
    const payload = { session_date: TODAY, session_type: type, duration_minutes: duration, distractions, completed: duration >= SESSION_TYPES[type].minutes, notes: null };
    const { data } = await supabase.from('focus_sessions').insert(payload).select().maybeSingle();
    if (data) setSessions(prev => [data, ...prev]);
    else load();
  };

  const handleSave = async (form: SessionForm & { id?: string }) => {
    const payload = { session_date: form.session_date, session_type: form.session_type, duration_minutes: Number(form.duration_minutes), distractions: Number(form.distractions), completed: form.completed, notes: form.notes || null };
    if (form.id) {
      await supabase.from('focus_sessions').update(payload).eq('id', form.id);
    } else {
      await supabase.from('focus_sessions').insert(payload);
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('focus_sessions').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const todaySessions = sessions.filter(s => s.session_date === TODAY);
  const todayMinutes = todaySessions.reduce((t, s) => t + (s.completed ? s.duration_minutes : 0), 0);
  const totalMinutes = sessions.filter(s => s.completed).reduce((t, s) => t + s.duration_minutes, 0);
  const avgDistractions = sessions.length ? (sessions.reduce((t, s) => t + s.distractions, 0) / sessions.length).toFixed(1) : '0';
  const completionRate = sessions.length ? Math.round((sessions.filter(s => s.completed).length / sessions.length) * 100) : 0;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING FOCUS TERMINAL...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-4 sm:px-6 font-mono text-xs tracking-widest text-black/50">DIRECTORY / FOCUS_SESSIONS.LOG</div>
        <button onClick={() => setModal('new')}
          className="mx-4 sm:mx-6 flex items-center gap-2 bg-alen-black text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red transition-colors">
          <Plus size={14} /> LOG SESSION
        </button>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Zap size={16} />, label: 'TODAY', value: `${todayMinutes}min`, sub: `${todaySessions.length} sessions`, color: 'text-alen-red' },
            { icon: <Clock size={16} />, label: 'TOTAL FOCUS', value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, sub: 'ALL TIME', color: 'text-alen-black' },
            { icon: <AlertOctagon size={16} />, label: 'AVG DISTRACTIONS', value: avgDistractions, sub: 'PER SESSION', color: 'text-yellow-600' },
            { icon: <Target size={16} />, label: 'COMPLETION RATE', value: `${completionRate}%`, sub: 'SESSIONS FINISHED', color: completionRate >= 80 ? 'text-green-600' : 'text-alen-red' },
          ].map(card => (
            <div key={card.label} className="border-2 border-alen-black bg-white p-4">
              <div className="flex items-center gap-2 text-black/40 mb-2">
                {card.icon}
                <span className="font-mono text-xs tracking-widest">{card.label}</span>
              </div>
              <div className={`font-display text-3xl ${card.color} leading-none`}>{card.value}</div>
              <div className="font-mono text-xs text-black/30 tracking-widest mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Main grid: Timer + session breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <LiveTimer onComplete={handleTimerComplete} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Today's sessions */}
            <div className="border-2 border-alen-black bg-white p-4 flex-1">
              <div className="font-mono text-xs font-bold tracking-widest mb-3">TODAY // {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}</div>
              {todaySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center">
                  <Zap size={24} className="text-black/10 mb-2" />
                  <span className="font-mono text-xs text-black/30 tracking-widest">NO SESSIONS YET</span>
                  <span className="font-mono text-xs text-black/20 tracking-widest">START THE TIMER</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {todaySessions.map(s => (
                    <div key={s.id} className={`border p-2 ${s.completed ? 'border-green-300 bg-green-50' : 'border-alen-red/30 bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-xs font-bold tracking-widest ${SESSION_TYPES[s.session_type]?.color.replace('bg-', 'text-') || 'text-alen-black'}`}>{SESSION_TYPES[s.session_type]?.label || s.session_type}</span>
                        <span className="font-mono text-xs font-bold">{s.duration_minutes}min</span>
                      </div>
                      {s.distractions > 0 && <span className="font-mono text-xs text-alen-red">{s.distractions} distraction{s.distractions > 1 ? 's' : ''}</span>}
                    </div>
                  ))}
                  <div className="border-t border-black/10 pt-2 flex justify-between">
                    <span className="font-mono text-xs text-black/40 tracking-widest">TOTAL</span>
                    <span className="font-mono text-xs font-bold">{todayMinutes}min</span>
                  </div>
                </div>
              )}
            </div>

            {/* Session type breakdown */}
            <div className="border-2 border-alen-black bg-white p-4">
              <div className="font-mono text-xs font-bold tracking-widest mb-3">SESSION BREAKDOWN</div>
              {Object.entries(SESSION_TYPES).map(([key, type]) => {
                const count = sessions.filter(s => s.session_type === key).length;
                const mins = sessions.filter(s => s.session_type === key && s.completed).reduce((t, s) => t + s.duration_minutes, 0);
                return count > 0 ? (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${type.color}`} />
                      <span className="font-mono text-xs tracking-widest">{type.label}</span>
                    </div>
                    <span className="font-mono text-xs font-bold">{Math.floor(mins / 60)}h {mins % 60}m</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Session history table */}
        <div className="border-2 border-alen-black">
          <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
            <span className="font-display text-xl tracking-widest">SESSION ARCHIVE</span>
            <span className="font-mono text-xs text-white/40">{sessions.length} TOTAL</span>
          </div>
          <div className="overflow-x-auto">
            <div className="grid bg-cream-dark min-w-[680px]" style={{ gridTemplateColumns: '110px 130px 100px 90px 80px 1fr 70px' }}>
              {['DATE', 'TYPE', 'DURATION', 'DISTRACTIONS', 'STATUS', 'NOTES', ''].map(h => (
                <div key={h} className="px-3 py-3 font-mono text-xs font-bold tracking-widest border-b border-black/10">{h}</div>
              ))}
            </div>
            {sessions.slice(0, 20).map((s, i) => (
              <div key={s.id} className={`grid items-center group min-w-[680px] ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}
                style={{ gridTemplateColumns: '110px 130px 100px 90px 80px 1fr 70px' }}>
              <div className="px-3 py-3 font-mono text-xs font-bold">{new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}</div>
              <div className="px-3 py-3">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 tracking-widest text-white ${SESSION_TYPES[s.session_type]?.color || 'bg-black'}`}>
                  {SESSION_TYPES[s.session_type]?.label || s.session_type}
                </span>
              </div>
              <div className="px-3 py-3 font-mono text-xs font-bold">{s.duration_minutes}min</div>
              <div className="px-3 py-3">
                {s.distractions > 0
                  ? <span className="font-mono text-xs text-alen-red font-bold">⚠ {s.distractions}</span>
                  : <span className="font-mono text-xs text-green-600 font-bold">CLEAN</span>}
              </div>
              <div className="px-3 py-3">
                {s.completed
                  ? <span className="font-mono text-xs font-bold text-green-600 tracking-widest">DONE</span>
                  : <span className="font-mono text-xs font-bold text-alen-red tracking-widest">ABORT</span>}
              </div>
              <div className="px-3 py-3 font-mono text-xs text-black/50 truncate">{s.notes || '—'}</div>
              <div className="px-3 py-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(s)} className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5 transition-colors"><Pencil size={10} /></button>
                <button onClick={() => setDeleteTarget(s)} className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red transition-colors"><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      <div className="border-t-2 border-alen-black bg-alen-black text-white px-4 sm:px-6 py-2 flex justify-between">
        <span className="font-mono text-xs tracking-widest">FOCUS_ENGINE // ACTIVE</span>
        <span className="font-mono text-xs text-white/40">SCREEN_TIME // ACTIVE</span>
      </div>

      {modal && modal !== 'new' && (
        <SessionModal session={{ ...modal, duration_minutes: String(modal.duration_minutes), distractions: String(modal.distractions), notes: modal.notes || '' }}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'new' && <SessionModal session={DEFAULT_FORM} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && <ConfirmDelete label={`${deleteTarget.session_date} ${SESSION_TYPES[deleteTarget.session_type]?.label}`} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
