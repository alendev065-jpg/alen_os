import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, Heart, Moon, Activity, Footprints, Flame, Brain } from 'lucide-react';
import { supabase, checkError } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

type HealthLog = {
  id: string;
  log_date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
  resting_hr: number | null;
  hrv: number | null;
  steps: number | null;
  calories_burned: number | null;
  stress_level: number | null;
  notes: string | null;
  created_at: string;
};

type HealthForm = {
  log_date: string;
  sleep_hours: string;
  sleep_quality: string;
  resting_hr: string;
  hrv: string;
  steps: string;
  calories_burned: string;
  stress_level: string;
  notes: string;
};

const TODAY = new Date().toISOString().split('T')[0];

const DEFAULT_FORM: HealthForm = {
  log_date: TODAY,
  sleep_hours: '',
  sleep_quality: '',
  resting_hr: '',
  hrv: '',
  steps: '',
  calories_burned: '',
  stress_level: '',
  notes: '',
};

const SEED: Omit<HealthLog, 'id' | 'created_at'>[] = [
  { log_date: '2024-10-28', sleep_hours: 7.5, sleep_quality: 8, resting_hr: 58, hrv: 62, steps: 9200, calories_burned: 2400, stress_level: 3, notes: 'Good recovery day' },
  { log_date: '2024-10-27', sleep_hours: 6.0, sleep_quality: 6, resting_hr: 62, hrv: 48, steps: 11400, calories_burned: 2650, stress_level: 6, notes: 'High output day, poor sleep' },
  { log_date: '2024-10-26', sleep_hours: 8.0, sleep_quality: 9, resting_hr: 55, hrv: 71, steps: 6800, calories_burned: 2100, stress_level: 2, notes: 'Rest day' },
  { log_date: '2024-10-25', sleep_hours: 7.0, sleep_quality: 7, resting_hr: 60, hrv: 55, steps: 10100, calories_burned: 2520, stress_level: 4, notes: null },
  { log_date: '2024-10-24', sleep_hours: 6.5, sleep_quality: 5, resting_hr: 65, hrv: 42, steps: 8700, calories_burned: 2300, stress_level: 7, notes: 'Client deadline stress' },
  { log_date: '2024-10-23', sleep_hours: 8.5, sleep_quality: 9, resting_hr: 54, hrv: 75, steps: 7200, calories_burned: 2200, stress_level: 1, notes: 'Optimal recovery' },
  { log_date: '2024-10-22', sleep_hours: 7.0, sleep_quality: 7, resting_hr: 59, hrv: 58, steps: 9800, calories_burned: 2480, stress_level: 4, notes: null },
];

function statusColor(val: number | null, low: number, high: number): string {
  if (val === null) return 'text-black/30';
  if (val >= high) return 'text-green-600';
  if (val <= low) return 'text-alen-red';
  return 'text-alen-black';
}

function StressBar({ level }: { level: number | null }) {
  if (level === null) return <span className="font-mono text-xs text-black/30">—</span>;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 ${
              i < level
                ? level >= 7 ? 'bg-alen-red' : level >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                : 'bg-cream-border'
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-bold ml-1">{level}/10</span>
    </div>
  );
}

function SleepQualityDots({ quality }: { quality: number | null }) {
  if (quality === null) return <span className="font-mono text-xs text-black/30">—</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`w-2 h-2 ${i < quality ? 'bg-alen-black' : 'bg-cream-border'}`} />
      ))}
    </div>
  );
}

function HealthModal({
  log,
  onClose,
  onSave,
}: {
  log: Partial<HealthForm> & { id?: string };
  onClose: () => void;
  onSave: (l: HealthForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<HealthForm>({
    log_date: log.log_date || TODAY,
    sleep_hours: log.sleep_hours || '',
    sleep_quality: log.sleep_quality || '',
    resting_hr: log.resting_hr || '',
    hrv: log.hrv || '',
    steps: log.steps || '',
    calories_burned: log.calories_burned || '',
    stress_level: log.stress_level || '',
    notes: log.notes || '',
  });

  const f = (field: keyof HealthForm, val: string) => setForm(p => ({ ...p, [field]: val }));

  const FIELDS: [keyof HealthForm, string, string][] = [
    ['sleep_hours', 'SLEEP (hrs)', '7.5'],
    ['sleep_quality', 'SLEEP QUALITY (1-10)', '8'],
    ['resting_hr', 'RESTING HR (bpm)', '58'],
    ['hrv', 'HRV (ms)', '62'],
    ['steps', 'STEPS', '9000'],
    ['calories_burned', 'CALORIES BURNED', '2400'],
    ['stress_level', 'STRESS LEVEL (1-10)', '3'],
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between sticky top-0">
          <span className="font-mono text-xs font-bold tracking-widest">
            {log.id ? 'EDIT HEALTH LOG' : 'NEW HEALTH LOG'}
          </span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DATE</div>
            <input
              type="date"
              value={form.log_date}
              onChange={e => f('log_date', e.target.value)}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map(([field, label, placeholder]) => (
              <div key={field}>
                <div className="font-mono text-xs text-black/50 tracking-widest mb-1">{label}</div>
                <input
                  type="number"
                  step="0.1"
                  value={form[field]}
                  onChange={e => f(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black"
                />
              </div>
            ))}
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">NOTES</div>
            <textarea
              value={form.notes}
              onChange={e => f('notes', e.target.value)}
              rows={2}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none resize-none"
            />
          </div>
          <button
            onClick={() => form.log_date && onSave({ ...form, id: log.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2"
          >
            <Save size={14} />{log.id ? 'SAVE CHANGES' : 'LOG HEALTH DATA'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WeeklyChart({ logs }: { logs: HealthLog[] }) {
  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-7);
  const maxSleep = Math.max(...sorted.map(l => l.sleep_hours || 0), 10);
  return (
    <div className="flex items-end gap-1 h-20">
      {sorted.map((log, i) => {
        const h = ((log.sleep_hours || 0) / maxSleep) * 100;
        const isLow = (log.sleep_hours || 0) < 6.5;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full transition-all ${isLow ? 'bg-alen-red' : 'bg-alen-black'}`}
              style={{ height: `${Math.max(8, h)}%` }}
            />
            <span className="font-mono text-xs text-black/40">
              {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Health() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [modal, setModal] = useState<'new' | HealthLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HealthLog | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .order('log_date', { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        const seeded = await checkError(supabase.from('health_logs').insert(SEED).select(), 'Seed health logs');
        setLogs(seeded || []);
      } else {
        setLogs(data);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: HealthForm & { id?: string }) => {
    const payload = {
      log_date: form.log_date,
      sleep_hours: form.sleep_hours ? Number(form.sleep_hours) : null,
      sleep_quality: form.sleep_quality ? Number(form.sleep_quality) : null,
      resting_hr: form.resting_hr ? Number(form.resting_hr) : null,
      hrv: form.hrv ? Number(form.hrv) : null,
      steps: form.steps ? Number(form.steps) : null,
      calories_burned: form.calories_burned ? Number(form.calories_burned) : null,
      stress_level: form.stress_level ? Number(form.stress_level) : null,
      notes: form.notes || null,
    };
    if (form.id) {
      await checkError(supabase.from('health_logs').update(payload).eq('id', form.id), 'Update health log');
    } else {
      await checkError(supabase.from('health_logs').insert(payload), 'Create health log');
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await checkError(supabase.from('health_logs').delete().eq('id', deleteTarget.id), 'Delete health log');
    setDeleteTarget(null);
    load();
  };

  const sorted = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date));
  const latest = sorted[0];
  const avgSleep = logs.length
    ? (logs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / logs.length).toFixed(1)
    : '—';
  const avgHRV = logs.length
    ? Math.round(logs.reduce((s, l) => s + (l.hrv || 0), 0) / logs.length)
    : '—';
  const avgStress = logs.length
    ? (logs.reduce((s, l) => s + (l.stress_level || 0), 0) / logs.length).toFixed(1)
    : '—';

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING HEALTH MONITOR...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-6 font-mono text-xs tracking-widest text-black/50">
          DIRECTORY / HEALTH_MONITOR.LOG
        </div>
        <button
          onClick={() => setModal('new')}
          className="mx-6 flex items-center gap-2 bg-alen-black text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red transition-colors"
        >
          <Plus size={14} /> LOG TODAY
        </button>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-auto">
        {/* Status banner */}
        <div className="bg-alen-black text-white px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <div className="font-display text-4xl tracking-widest">HEALTH_MONITOR</div>
            <div className="font-mono text-xs text-white/40 tracking-widest mt-1">BIO-METRIC SURVEILLANCE // ACTIVE</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-white/40 tracking-widest">SYSTEM_STATUS</div>
            <div className="font-mono text-sm font-bold text-green-400 tracking-widest mt-1">
              {(latest?.hrv || 0) >= 55 ? 'OPTIMAL' : (latest?.hrv || 0) >= 40 ? 'MODERATE' : 'RECOVERY NEEDED'}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Moon size={18} />, label: 'AVG SLEEP', value: `${avgSleep}h`, sub: 'LAST ENTRIES', color: 'bg-blue-500' },
            { icon: <Heart size={18} />, label: 'HRV SCORE', value: `${avgHRV}ms`, sub: 'AVERAGE', color: 'bg-alen-red' },
            { icon: <Brain size={18} />, label: 'STRESS INDEX', value: `${avgStress}/10`, sub: 'AVG DAILY LEVEL', color: 'bg-yellow-500' },
          ].map(card => (
            <div key={card.label} className="border-2 border-alen-black bg-white p-5 flex items-start gap-4">
              <div className={`w-10 h-10 ${card.color} flex items-center justify-center text-white flex-shrink-0`}>
                {card.icon}
              </div>
              <div>
                <div className="font-mono text-xs text-black/40 tracking-widest">{card.label}</div>
                <div className="font-display text-3xl leading-none mt-1">{card.value}</div>
                <div className="font-mono text-xs text-black/30 tracking-widest mt-1">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Latest entry + sleep chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {latest && (
            <div className="border-2 border-alen-black bg-white p-5">
              <div className="font-mono text-xs font-bold tracking-widest mb-4">
                LATEST ENTRY // {new Date(latest.log_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <Moon size={14} />, label: 'SLEEP', value: `${latest.sleep_hours || '—'}h`, sub: `Quality: ${latest.sleep_quality || '—'}/10` },
                  { icon: <Activity size={14} />, label: 'RESTING HR', value: `${latest.resting_hr || '—'} bpm`, sub: latest.resting_hr ? (latest.resting_hr < 60 ? 'EXCELLENT' : 'NORMAL') : '—' },
                  { icon: <Heart size={14} />, label: 'HRV', value: `${latest.hrv || '—'}ms`, sub: latest.hrv ? (latest.hrv >= 60 ? 'HIGH RECOVERY' : 'MODERATE') : '—' },
                  { icon: <Footprints size={14} />, label: 'STEPS', value: latest.steps ? latest.steps.toLocaleString() : '—', sub: latest.steps ? (latest.steps >= 10000 ? 'GOAL MET' : 'BELOW TARGET') : '—' },
                  { icon: <Flame size={14} />, label: 'CALORIES', value: latest.calories_burned ? latest.calories_burned.toLocaleString() : '—', sub: 'BURNED' },
                  { icon: <Brain size={14} />, label: 'STRESS', value: `${latest.stress_level || '—'}/10`, sub: latest.stress_level ? (latest.stress_level <= 3 ? 'LOW' : latest.stress_level <= 6 ? 'MODERATE' : 'HIGH') : '—' },
                ].map(m => (
                  <div key={m.label} className="border border-black/10 p-3">
                    <div className="flex items-center gap-1 text-black/40 mb-1">
                      {m.icon}
                      <span className="font-mono text-xs tracking-widest">{m.label}</span>
                    </div>
                    <div className="font-mono text-sm font-bold">{m.value}</div>
                    <div className="font-mono text-xs text-black/30 tracking-widest">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-alen-black bg-white p-5">
            <div className="font-mono text-xs font-bold tracking-widest mb-1">SLEEP PATTERN</div>
            <div className="font-mono text-xs text-black/40 mb-4">HOURS PER NIGHT // RECENT ENTRIES</div>
            <WeeklyChart logs={logs} />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-black/10 pt-3">
              {[
                { label: 'TARGET', value: '8.0h', color: 'text-alen-black' },
                { label: 'AVERAGE', value: `${avgSleep}h`, color: 'text-alen-black' },
                { label: 'DEFICIT', value: avgSleep !== '—' ? `${Math.max(0, 8 - Number(avgSleep)).toFixed(1)}h` : '—', color: 'text-alen-red' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-mono text-xs text-black/30 tracking-widest">{s.label}</div>
                  <div className={`font-mono text-sm font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stress timeline */}
        <div className="border-2 border-alen-black bg-white p-5">
          <div className="font-mono text-xs font-bold tracking-widest mb-4">STRESS TIMELINE</div>
          <div className="flex items-end gap-1 h-12 mb-2">
            {[...logs]
              .sort((a, b) => a.log_date.localeCompare(b.log_date))
              .slice(-14)
              .map((log, i) => {
                const level = log.stress_level || 0;
                return (
                  <div key={i} className="flex-1">
                    <div
                      className={`w-full ${level >= 7 ? 'bg-alen-red' : level >= 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ height: `${(level / 10) * 100}%`, minHeight: 4 }}
                    />
                  </div>
                );
              })}
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-black/30">OLDEST</span>
            <span className="font-mono text-xs text-black/30">LATEST</span>
          </div>
        </div>

        {/* Health log table */}
        <div className="border-2 border-alen-black">
          <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
            <span className="font-display text-xl tracking-widest">HEALTH LOG</span>
            <span className="font-mono text-xs text-white/40">{logs.length} ENTRIES</span>
          </div>
          <div className="overflow-x-auto">
            <div
              className="grid bg-cream-dark min-w-[750px]"
              style={{ gridTemplateColumns: '110px 70px 90px 70px 60px 90px 90px 100px 70px' }}
            >
              {['DATE', 'SLEEP', 'QUALITY', 'HR', 'HRV', 'STEPS', 'CALS', 'STRESS', ''].map(h => (
                <div key={h} className="px-3 py-3 font-mono text-xs font-bold tracking-widest border-b border-black/10">{h}</div>
              ))}
            </div>
            {sorted.map((log, i) => (
              <div
                key={log.id}
                className={`grid items-center group min-w-[750px] ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}
                style={{ gridTemplateColumns: '110px 70px 90px 70px 60px 90px 90px 100px 70px' }}
              >
              <div className="px-3 py-3 font-mono text-xs font-bold">
                {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}
              </div>
              <div className={`px-3 py-3 font-mono text-xs font-bold ${statusColor(log.sleep_hours, 6, 7.5)}`}>
                {log.sleep_hours ? `${log.sleep_hours}h` : '—'}
              </div>
              <div className="px-3 py-3"><SleepQualityDots quality={log.sleep_quality} /></div>
              <div className={`px-3 py-3 font-mono text-xs ${statusColor(log.resting_hr ? 65 - log.resting_hr + 55 : null, 55, 65)}`}>
                {log.resting_hr || '—'}
              </div>
              <div className={`px-3 py-3 font-mono text-xs font-bold ${statusColor(log.hrv, 40, 60)}`}>
                {log.hrv || '—'}
              </div>
              <div className={`px-3 py-3 font-mono text-xs ${statusColor(log.steps, 5000, 10000)}`}>
                {log.steps ? log.steps.toLocaleString() : '—'}
              </div>
              <div className="px-3 py-3 font-mono text-xs text-black/60">
                {log.calories_burned ? log.calories_burned.toLocaleString() : '—'}
              </div>
              <div className="px-3 py-3"><StressBar level={log.stress_level} /></div>
              <div className="px-3 py-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal(log)}
                  className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5 transition-colors"
                >
                  <Pencil size={10} />
                </button>
                <button
                  onClick={() => setDeleteTarget(log)}
                  className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
            {logs.length === 0 && (
              <div className="p-8 text-center">
                <span className="font-mono text-xs text-black/30 tracking-widest">NO HEALTH LOGS YET</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-alen-black bg-alen-black text-white px-4 sm:px-6 py-2 flex justify-between">
        <span className="font-mono text-xs tracking-widest">HRM_MONITOR // ONLINE</span>
        <span className="font-mono text-xs text-white/40">SLEEP_STAGE // SYNCED</span>
      </div>

      {modal && modal !== 'new' && (
        <HealthModal
          log={{
            ...modal,
            sleep_hours: String(modal.sleep_hours || ''),
            sleep_quality: String(modal.sleep_quality || ''),
            resting_hr: String(modal.resting_hr || ''),
            hrv: String(modal.hrv || ''),
            steps: String(modal.steps || ''),
            calories_burned: String(modal.calories_burned || ''),
            stress_level: String(modal.stress_level || ''),
            notes: modal.notes || '',
          }}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {modal === 'new' && (
        <HealthModal log={DEFAULT_FORM} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {deleteTarget && (
        <ConfirmDelete
          label={`${deleteTarget.log_date} health log`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
