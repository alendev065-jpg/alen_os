import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, TrendingUp, TrendingDown, Minus, Dumbbell, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

type BodyMetric = {
  id: string;
  log_date: string;
  weight: number | null;
  body_fat: number | null;
  muscle_mass: number | null;
  hydration: number | null;
  waist: number | null;
  chest: number | null;
  arms: number | null;
  notes: string | null;
  exercise_done: string | null;
  exercise_target: string | null;
  created_at: string;
};

type MetricForm = {
  log_date: string;
  weight: string;
  body_fat: string;
  muscle_mass: string;
  hydration: string;
  chest: string;
  waist: string;
  arms: string;
  notes: string;
  exercise_done: string;
  exercise_target: string;
};

const TODAY = new Date().toISOString().split('T')[0];
const DEFAULT_FORM: MetricForm = {
  log_date: TODAY, weight: '', body_fat: '', muscle_mass: '',
  hydration: '', chest: '', waist: '', arms: '', notes: '',
  exercise_done: '', exercise_target: '',
};

const SEED: Omit<BodyMetric, 'id' | 'created_at'>[] = [
  { log_date: '2024-10-01', weight: 78.4, body_fat: 18.2, muscle_mass: 38.6, hydration: 62, chest: 98, waist: 82, arms: 36, notes: 'Morning measurement', exercise_done: 'Push day - Bench, OHP, Triceps', exercise_target: 'Pull day - Rows, Pull-ups, Biceps' },
  { log_date: '2024-10-08', weight: 77.9, body_fat: 17.8, muscle_mass: 39.1, hydration: 63, chest: 97, waist: 81, arms: 36.5, notes: 'Post workout week', exercise_done: 'Leg day - Squats, RDL, Calves', exercise_target: 'Push day - Bench, Incline, Shoulders' },
  { log_date: '2024-10-15', weight: 77.2, body_fat: 17.1, muscle_mass: 39.5, hydration: 64, chest: 97, waist: 80, arms: 37, notes: 'Clean eating week', exercise_done: 'Pull day - Deadlifts, Rows, Biceps', exercise_target: 'Leg day - Squats, Lunges, Press' },
  { log_date: '2024-10-22', weight: 76.8, body_fat: 16.9, muscle_mass: 39.8, hydration: 65, chest: 98, waist: 80, arms: 37.5, notes: 'Strength phase', exercise_done: 'Push day - Heavy Bench, OHP', exercise_target: 'Rest day - Active recovery, Mobility' },
  { log_date: '2024-10-29', weight: 76.3, body_fat: 16.5, muscle_mass: 40.1, hydration: 65, chest: 99, waist: 79, arms: 38, notes: null, exercise_done: 'Full body - Compound lifts', exercise_target: 'Cardio + Core - 30min run, Planks' },
];

function delta(curr: number | null, prev: number | null): 'up' | 'down' | 'flat' {
  if (curr === null || prev === null) return 'flat';
  if (curr > prev) return 'up';
  if (curr < prev) return 'down';
  return 'flat';
}

function DeltaIcon({ dir, inverse = false }: { dir: 'up' | 'down' | 'flat'; inverse?: boolean }) {
  const good = inverse ? dir === 'down' : dir === 'up';
  if (dir === 'flat') return <Minus size={12} className="text-black/30" />;
  if (good) return <TrendingUp size={12} className="text-green-600" />;
  return <TrendingDown size={12} className="text-alen-red" />;
}

function MetricModal({ metric, onClose, onSave }: {
  metric: Partial<MetricForm> & { id?: string };
  onClose: () => void;
  onSave: (m: MetricForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<MetricForm>({
    log_date: metric.log_date || TODAY,
    weight: metric.weight || '',
    body_fat: metric.body_fat || '',
    muscle_mass: metric.muscle_mass || '',
    hydration: metric.hydration || '',
    chest: metric.chest || '',
    waist: metric.waist || '',
    arms: metric.arms || '',
    notes: metric.notes || '',
    exercise_done: metric.exercise_done || '',
    exercise_target: metric.exercise_target || '',
  });
  const f = (field: keyof MetricForm, val: string) => setForm(p => ({ ...p, [field]: val }));
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between sticky top-0">
          <span className="font-mono text-xs font-bold tracking-widest">{metric.id ? 'EDIT MEASUREMENT' : 'NEW MEASUREMENT'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DATE</div>
            <input type="date" value={form.log_date} onChange={e => f('log_date', e.target.value)}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              ['weight', 'WEIGHT (kg)'],
              ['body_fat', 'BODY FAT (%)'],
              ['muscle_mass', 'MUSCLE MASS (kg)'],
              ['hydration', 'HYDRATION (%)'],
              ['chest', 'CHEST (cm)'],
              ['waist', 'WAIST (cm)'],
              ['arms', 'ARMS (cm)'],
            ] as [keyof MetricForm, string][]).map(([field, label]) => (
              <div key={field}>
                <div className="font-mono text-xs text-black/50 tracking-widest mb-1">{label}</div>
                <input type="number" step="0.1" value={form[field]} onChange={e => f(field, e.target.value)}
                  className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black" />
              </div>
            ))}
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">EXERCISE DONE TODAY</div>
            <input value={form.exercise_done} onChange={e => f('exercise_done', e.target.value)}
              placeholder="e.g. Push day - Bench, OHP, Triceps"
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase" />
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">EXERCISE TARGET (NEXT)</div>
            <input value={form.exercise_target} onChange={e => f('exercise_target', e.target.value)}
              placeholder="e.g. Pull day - Rows, Pull-ups, Biceps"
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase" />
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">NOTES</div>
            <textarea value={form.notes} onChange={e => f('notes', e.target.value)} rows={2}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black resize-none" />
          </div>
          <button onClick={() => form.log_date && onSave({ ...form, id: metric.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{metric.id ? 'SAVE CHANGES' : 'LOG MEASUREMENT'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ data, color = 'bg-alen-black' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div key={i} className={`flex-1 ${color} transition-all`}
          style={{ height: `${Math.max(8, ((v - min) / range) * 100)}%` }} />
      ))}
    </div>
  );
}

export default function Body() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [modal, setModal] = useState<'new' | BodyMetric | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BodyMetric | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('body_metrics').select('*').order('log_date', { ascending: false });
    if (!error && data) {
      if (data.length === 0) {
        const { data: seeded } = await supabase.from('body_metrics').insert(SEED).select();
        setMetrics(seeded || []);
      } else {
        setMetrics(data);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: MetricForm & { id?: string }) => {
    const payload = {
      log_date: form.log_date,
      weight: form.weight ? Number(form.weight) : null,
      body_fat: form.body_fat ? Number(form.body_fat) : null,
      muscle_mass: form.muscle_mass ? Number(form.muscle_mass) : null,
      hydration: form.hydration ? Number(form.hydration) : null,
      chest: form.chest ? Number(form.chest) : null,
      waist: form.waist ? Number(form.waist) : null,
      arms: form.arms ? Number(form.arms) : null,
      notes: form.notes || null,
      exercise_done: form.exercise_done || null,
      exercise_target: form.exercise_target || null,
    };
    if (form.id) {
      await supabase.from('body_metrics').update(payload).eq('id', form.id);
    } else {
      await supabase.from('body_metrics').insert(payload);
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('body_metrics').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const sorted = [...metrics].sort((a, b) => b.log_date.localeCompare(a.log_date));
  const latest = sorted[0];
  const prev = sorted[1];

  const weightData = [...metrics].sort((a, b) => a.log_date.localeCompare(b.log_date)).map(m => m.weight || 0).filter(Boolean);
  const fatData = [...metrics].sort((a, b) => a.log_date.localeCompare(b.log_date)).map(m => m.body_fat || 0).filter(Boolean);

  const STAT_CARDS = [
    { label: 'WEIGHT', value: latest?.weight ? `${latest.weight} kg` : '—', dir: delta(latest?.weight, prev?.weight), inverse: true },
    { label: 'BODY FAT', value: latest?.body_fat ? `${latest.body_fat}%` : '—', dir: delta(latest?.body_fat, prev?.body_fat), inverse: true },
    { label: 'MUSCLE MASS', value: latest?.muscle_mass ? `${latest.muscle_mass} kg` : '—', dir: delta(latest?.muscle_mass, prev?.muscle_mass), inverse: false },
    { label: 'HYDRATION', value: latest?.hydration ? `${latest.hydration}%` : '—', dir: delta(latest?.hydration, prev?.hydration), inverse: false },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING BODY METRICS...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-6 font-mono text-xs tracking-widest text-black/50">DIRECTORY / BODY_METRICS.LOG</div>
        <button onClick={() => setModal('new')}
          className="mx-6 flex items-center gap-2 bg-alen-black text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red transition-colors">
          <Plus size={14} /> LOG MEASUREMENT
        </button>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-auto">
        <div className="bg-alen-black text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-display text-4xl tracking-widest">BODY_COMPOSITION</div>
            <div className="font-mono text-xs text-white/40 tracking-widest mt-1">PHYSICAL METRICS // TRACKING ACTIVE</div>
          </div>
          <div className="flex items-center gap-3">
            <Dumbbell size={32} className="text-white/20" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STAT_CARDS.map(card => (
            <div key={card.label} className="border-2 border-alen-black bg-white p-5">
              <div className="font-mono text-xs text-black/40 tracking-widest mb-1">{card.label}</div>
              <div className="flex items-end justify-between">
                <div className="font-display text-4xl text-alen-black leading-none">{card.value}</div>
                <DeltaIcon dir={card.dir as 'up' | 'down' | 'flat'} inverse={card.inverse} />
              </div>
              <div className="font-mono text-xs text-black/30 tracking-widest mt-1">VS LAST ENTRY</div>
            </div>
          ))}
        </div>

        {/* Exercise tracking: done vs target */}
        {latest && (latest.exercise_done || latest.exercise_target) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-alen-black bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-600 flex items-center justify-center text-white">
                  <Check size={16} />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold tracking-widest">EXERCISE COMPLETED</div>
                  <div className="font-mono text-xs text-black/40 tracking-widest">LAST SESSION</div>
                </div>
              </div>
              <div className="font-mono text-sm font-bold uppercase leading-relaxed">{latest.exercise_done || 'NOT LOGGED'}</div>
              <div className="font-mono text-xs text-black/30 tracking-widest mt-2">
                {new Date(latest.log_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}
              </div>
            </div>
            <div className="border-2 border-alen-red bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-alen-red flex items-center justify-center text-white">
                  <Dumbbell size={16} />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold tracking-widest">EXERCISE TARGET</div>
                  <div className="font-mono text-xs text-black/40 tracking-widest">NEXT SESSION</div>
                </div>
              </div>
              <div className="font-mono text-sm font-bold uppercase leading-relaxed">{latest.exercise_target || 'NOT SET'}</div>
              <div className="font-mono text-xs text-alen-red tracking-widest mt-2">UPCOMING</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-alen-black bg-white p-5">
            <div className="font-mono text-xs font-bold tracking-widest mb-1">WEIGHT TREND</div>
            <div className="font-mono text-xs text-black/40 mb-3">KG OVER TIME</div>
            {weightData.length > 0 ? (
              <>
                <MiniBarChart data={weightData} color="bg-alen-black" />
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-xs text-black/30">OLDEST</span>
                  <span className="font-mono text-xs text-black/30">LATEST</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-xs font-bold">{Math.max(...weightData).toFixed(1)} kg HIGH</span>
                  <span className="font-mono text-xs font-bold text-alen-red">{Math.min(...weightData).toFixed(1)} kg LOW</span>
                </div>
              </>
            ) : <div className="h-10 flex items-center justify-center font-mono text-xs text-black/30">NO DATA</div>}
          </div>

          <div className="border-2 border-alen-black bg-white p-5">
            <div className="font-mono text-xs font-bold tracking-widest mb-1">BODY FAT TREND</div>
            <div className="font-mono text-xs text-black/40 mb-3">% OVER TIME</div>
            {fatData.length > 0 ? (
              <>
                <MiniBarChart data={fatData} color="bg-alen-red" />
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-xs text-black/30">OLDEST</span>
                  <span className="font-mono text-xs text-black/30">LATEST</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-xs font-bold">{Math.max(...fatData).toFixed(1)}% HIGH</span>
                  <span className="font-mono text-xs font-bold text-green-600">{Math.min(...fatData).toFixed(1)}% LOW</span>
                </div>
              </>
            ) : <div className="h-10 flex items-center justify-center font-mono text-xs text-black/30">NO DATA</div>}
          </div>
        </div>

        {latest && (
          <div className="border-2 border-alen-black bg-white p-5">
            <div className="font-mono text-xs font-bold tracking-widest mb-4">BODY COMPOSITION // LATEST SNAPSHOT</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'BODY FAT', pct: latest.body_fat || 0, color: 'bg-alen-red', max: 35 },
                { label: 'MUSCLE MASS', pct: latest.muscle_mass ? (latest.muscle_mass / (latest.weight || 1)) * 100 : 0, color: 'bg-alen-black', max: 60 },
                { label: 'HYDRATION', pct: latest.hydration || 0, color: 'bg-blue-500', max: 80 },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold tracking-widest">{bar.label}</span>
                    <span className="font-mono text-sm font-bold">{bar.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-cream-border">
                    <div className={`h-full ${bar.color} transition-all`} style={{ width: `${Math.min(100, (bar.pct / bar.max) * 100)}%` }} />
                  </div>
                  <div className="font-mono text-xs text-black/30 mt-1">TARGET: {bar.max}% max</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-2 border-alen-black">
          <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
            <span className="font-display text-xl tracking-widest">MEASUREMENT LOG</span>
            <span className="font-mono text-xs text-white/40">{metrics.length} ENTRIES</span>
          </div>
          <div className="overflow-x-auto">
            <div className="grid bg-cream-dark min-w-[900px]" style={{ gridTemplateColumns: '100px repeat(7,1fr) 1fr 70px' }}>
              {['DATE', 'WEIGHT', 'FAT%', 'MUSCLE', 'H₂O', 'CHEST', 'WAIST', 'ARMS', 'EXERCISE', ''].map(h => (
                <div key={h} className="px-3 py-3 font-mono text-xs font-bold tracking-widest border-b border-black/10">{h}</div>
              ))}
            </div>
            {sorted.map((m, i) => (
              <div key={m.id} className={`grid items-center group min-w-[900px] ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}
                style={{ gridTemplateColumns: '100px repeat(7,1fr) 1fr 70px' }}>
                <div className="px-3 py-3 font-mono text-xs font-bold">
                  {new Date(m.log_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}
                </div>
                {[m.weight, m.body_fat, m.muscle_mass, m.hydration, m.chest, m.waist, m.arms].map((v, vi) => (
                  <div key={vi} className="px-3 py-3 font-mono text-xs text-black/70">{v !== null ? v : '—'}</div>
                ))}
                <div className="px-3 py-3 font-mono text-xs text-black/60 truncate">
                  {m.exercise_done ? <span className="text-green-600 font-bold">DONE: </span> : ''}
                  {m.exercise_done || '—'}
                  {m.exercise_target ? <span className="text-alen-red font-bold ml-2">NEXT: </span> : ''}
                  {m.exercise_target || ''}
                </div>
                <div className="px-3 py-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(m)} className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5 transition-colors"><Pencil size={10} /></button>
                  <button onClick={() => setDeleteTarget(m)} className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red transition-colors"><Trash2 size={10} /></button>
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <div className="p-8 text-center"><span className="font-mono text-xs text-black/30 tracking-widest">NO MEASUREMENTS LOGGED</span></div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-alen-black bg-alen-black text-white px-4 sm:px-6 py-2 flex justify-between">
        <span className="font-mono text-xs tracking-widest">BODY_SYSTEM // METRICS ACTIVE</span>
        <span className="font-mono text-xs text-white/40">SYNC: REAL-TIME</span>
      </div>

      {modal && modal !== 'new' && (
        <MetricModal metric={{
          ...modal,
          weight: String(modal.weight || ''),
          body_fat: String(modal.body_fat || ''),
          muscle_mass: String(modal.muscle_mass || ''),
          hydration: String(modal.hydration || ''),
          chest: String(modal.chest || ''),
          waist: String(modal.waist || ''),
          arms: String(modal.arms || ''),
          notes: modal.notes || '',
          exercise_done: modal.exercise_done || '',
          exercise_target: modal.exercise_target || '',
        }}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'new' && <MetricModal metric={DEFAULT_FORM} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && <ConfirmDelete label={`${deleteTarget.log_date} entry`} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
