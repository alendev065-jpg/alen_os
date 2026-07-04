import { useEffect, useState } from 'react';
import { Bell, Settings, AlertTriangle, Plus, Pencil, Trash2, X, Save, Clock } from 'lucide-react';
import { supabase, ActivityLog } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DATES: Record<string, string> = {
  MON: '2024-05-20', TUE: '2024-05-21', WED: '2024-05-22',
  THU: '2024-05-23', FRI: '2024-05-24', SAT: '2024-05-25', SUN: '2024-05-26',
};

const CATEGORIES = [
  { key: 'study', label: 'STUDY / RESEARCH', color: 'bg-blue-500', textColor: 'text-white' },
  { key: 'work', label: 'WORK / EXECUTION', color: 'bg-alen-red', textColor: 'text-white' },
  { key: 'rest', label: 'REST / RECOVERY', color: 'bg-green-600', textColor: 'text-white' },
  { key: 'exercise', label: 'EXERCISE / PHYSIOLOGY', color: 'bg-orange-500', textColor: 'text-white' },
  { key: 'waste', label: 'WASTE / UNPRODUCTIVE', color: 'bg-gray-400', textColor: 'text-black' },
  { key: 'meal', label: 'MEAL / NUTRITION', color: 'bg-yellow-500', textColor: 'text-black' },
  { key: 'social', label: 'SOCIAL / CONNECTION', color: 'bg-purple-500', textColor: 'text-white' },
  { key: 'commute', label: 'COMMUTE / TRAVEL', color: 'bg-cyan-500', textColor: 'text-white' },
  { key: 'reading', label: 'READING / LEARNING', color: 'bg-indigo-500', textColor: 'text-white' },
  { key: 'creative', label: 'CREATIVE / FLOW', color: 'bg-pink-500', textColor: 'text-white' },
  { key: 'admin', label: 'ADMIN / ERRANDS', color: 'bg-stone-500', textColor: 'text-white' },
  { key: 'custom', label: 'CUSTOM / OTHER', color: 'bg-alen-black', textColor: 'text-white' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

function getCategory(key: string) {
  return CATEGORIES.find(c => c.key === key);
}

function CategoryBadge({ category, customLabel }: { category: string; customLabel?: string | null }) {
  const cat = getCategory(category);
  if (!cat) return null;
  const label = category === 'custom' && customLabel ? customLabel.toUpperCase() : cat.label;
  return (
    <span className={`${cat.color} ${cat.textColor} font-mono text-xs font-bold px-3 py-1 tracking-widest uppercase inline-block`}>
      {label}
    </span>
  );
}

type LogForm = {
  time_slot: string;
  category: string;
  description: string;
  custom_category_label: string;
};
const DEFAULT_LOG: LogForm = { time_slot: '09:00', category: 'work', description: '', custom_category_label: '' };

function LogModal({ log, selectedDay, onClose, onSave }: {
  log: Partial<LogForm> & { id?: string };
  selectedDay: string;
  onClose: () => void;
  onSave: (l: LogForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<LogForm>({
    time_slot: log.time_slot || '09:00',
    category: log.category || 'work',
    description: log.description || '',
    custom_category_label: log.custom_category_label || '',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between sticky top-0">
          <span className="font-mono text-xs font-bold tracking-widest">{log.id ? 'EDIT LOG ENTRY' : `NEW ENTRY // ${selectedDay}`}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">TIME SLOT</div>
              <select value={form.time_slot} onChange={(e) => setForm(f => ({ ...f, time_slot: e.target.value }))}
                className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none">
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">CATEGORY</div>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value, custom_category_label: e.target.value === 'custom' ? f.custom_category_label : '' }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none">
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {form.category === 'custom' && (
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">CUSTOM CATEGORY NAME</div>
              <input value={form.custom_category_label} onChange={(e) => setForm(f => ({ ...f, custom_category_label: e.target.value }))}
                placeholder="e.g. MEDITATION, CALLS, PLANNING..."
                className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase" />
            </div>
          )}

          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DESCRIPTION</div>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none resize-none" rows={3}
              placeholder="Describe the activity..." />
          </div>

          <button onClick={() => {
            if (!form.description) return;
            if (form.category === 'custom' && !form.custom_category_label.trim()) return;
            onSave({ ...form, id: log.id });
          }}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{log.id ? 'SAVE CHANGES' : 'ADD ENTRY'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivityMap() {
  const [selectedDay, setSelectedDay] = useState('WED');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState<'new' | ActivityLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActivityLog | null>(null);

  async function load() {
    const date = DATES[selectedDay];
    const { data } = await supabase.from('activity_logs').select('*').eq('log_date', date).order('time_slot');
    setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [selectedDay]);

  const handleSave = async (form: LogForm & { id?: string }) => {
    const date = DATES[selectedDay];
    const payload = {
      log_date: date,
      time_slot: form.time_slot,
      category: form.category,
      description: form.description,
      custom_category_label: form.category === 'custom' ? form.custom_category_label.toUpperCase() : null,
    };
    if (form.id) {
      await supabase.from('activity_logs').update(payload).eq('id', form.id);
    } else {
      await supabase.from('activity_logs').insert(payload);
    }
    setLogModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('activity_logs').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const workHours = logs.filter(l => l.category === 'work').length;
  const studyHours = logs.filter(l => l.category === 'study').length;
  const wasteHours = logs.filter(l => l.category === 'waste').length;
  const sleepHours = logs.filter(l => l.category === 'rest').length;
  const exerciseHours = logs.filter(l => l.category === 'exercise').length;
  const productiveHours = workHours + studyHours;

  const timelineSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const logBySlot: Record<string, ActivityLog[]> = {};
  logs.forEach(l => {
    if (!logBySlot[l.time_slot]) logBySlot[l.time_slot] = [];
    logBySlot[l.time_slot].push(l);
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-4 sm:px-6 font-mono text-xs tracking-widest text-black/50">DIRECTORY / 24H_ACTIVITY_MAP.LOG</div>
        <div className="flex items-center gap-4 px-4 sm:px-6">
          <Bell size={16} className="text-black/50" />
          <Settings size={16} className="text-black/50" />
        </div>
      </div>

      <div className="grid grid-cols-7 border-b-2 border-alen-black">
        {DAYS.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`py-4 font-mono text-xs font-bold tracking-widest border-r last:border-r-0 border-alen-black transition-colors ${
              selectedDay === day ? 'bg-alen-black text-white' : day === 'SAT' || day === 'SUN' ? 'bg-cream text-alen-red hover:bg-black/5' : 'bg-cream text-alen-black hover:bg-black/5'
            }`}>{day}</button>
        ))}
      </div>

      <div className="flex flex-col md:flex-1 md:flex-row gap-4 p-4 sm:p-6">
        {/* Left panel */}
        <div className="w-full md:w-64 md:flex-shrink-0 flex flex-col gap-4">
          <div className="border-2 border-alen-black bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold tracking-widest">ACTIVITY LEGEND</span>
              <span className="font-mono text-xs text-black/40">12 TYPES</span>
            </div>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(cat => {
                const count = logs.filter(l => l.category === cat.key).length;
                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <div className={`w-6 h-6 ${cat.color} flex-shrink-0`} />
                    <span className="font-mono text-xs tracking-wide flex-1">{cat.label}</span>
                    {count > 0 && <span className="font-mono text-xs font-bold text-black/40">{count}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-2 border-alen-black bg-cream-dark p-4">
            <div className="font-mono text-xs font-bold tracking-widest mb-3">CRITICAL ATTENTION</div>
            <p className="font-mono text-xs leading-relaxed">Wasted time peaked at 14:00 today. Review browsing habits to reduce algorithmic friction.</p>
            <div className="border-t border-black/20 mt-3 pt-3 flex items-end justify-between">
              <div>
                <div className="font-mono text-xs text-black/40 tracking-widest">SESSION ID</div>
                <div className="font-mono text-xs font-bold">TRK-9902-X</div>
              </div>
              <AlertTriangle size={20} className="text-alen-black" />
            </div>
          </div>

          <div className="border-2 border-alen-black bg-white p-4">
            <div className="font-mono text-xs font-bold tracking-widest mb-4">DAILY QUOTA</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold tracking-widest bg-alen-black text-white px-2 py-0.5">EFFICIENCY</span>
                  <span className="font-mono text-xs font-bold">75%</span>
                </div>
                <div className="h-2 bg-cream-border"><div className="h-full bg-alen-black" style={{ width: '75%' }} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold tracking-widest bg-alen-red text-white px-2 py-0.5">ENERGY</span>
                  <span className="font-mono text-xs font-bold">40%</span>
                </div>
                <div className="h-2 bg-cream-border"><div className="h-full bg-alen-red" style={{ width: '40%' }} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - 24H Timeline + Activity log */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* 24H Visual Timeline */}
          <div className="border-2 border-alen-black bg-white">
            <div className="flex items-center justify-between px-4 py-2 border-b border-black/10">
              <span className="font-mono text-xs font-bold tracking-widest">24H TIMELINE // {selectedDay}</span>
              <span className="font-mono text-xs text-black/40 tracking-widest">{logs.length} ENTRIES</span>
            </div>
            <div className="overflow-x-auto">
            <div className="grid grid-cols-24 gap-0 min-w-[800px]">
              {timelineSlots.map(slot => {
                const slotLogs = logBySlot[slot] || [];
                const topLog = slotLogs[0];
                const cat = topLog ? getCategory(topLog.category) : null;
                return (
                  <div key={slot} className="border-r last:border-r-0 border-black/10 min-h-[60px] flex flex-col">
                    <div className="font-mono text-[8px] text-black/40 text-center py-1 border-b border-black/5">{slot}</div>
                    <div className="flex-1 relative group">
                      {topLog && (
                        <div className={`absolute inset-0 ${cat?.color || 'bg-alen-black'} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                          onClick={() => setLogModal(topLog)}
                          title={`${slot} - ${topLog.description}`}>
                          {slotLogs.length > 1 && (
                            <span className="absolute top-0 right-0 font-mono text-[8px] font-bold text-white bg-black/50 px-0.5">+{slotLogs.length - 1}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-black/10">
              <div className="flex items-center gap-3 flex-wrap">
                {CATEGORIES.slice(0, 6).map(cat => (
                  <div key={cat.key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 ${cat.color}`} />
                    <span className="font-mono text-[10px] tracking-wide text-black/60">{cat.label.split(' / ')[0]}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setLogModal('new')}
                className="flex items-center gap-1 bg-alen-black text-white font-mono text-xs font-bold px-3 py-1.5 tracking-widest hover:bg-alen-red transition-colors">
                <Plus size={12} /> ADD ENTRY
              </button>
            </div>
          </div>

          {/* Activity log table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-xs text-black/50 tracking-widest">{logs.length} ENTRIES // {selectedDay}</div>
              <button onClick={() => setLogModal('new')}
                className="flex items-center gap-1 border-2 border-alen-black font-mono text-xs font-bold px-3 py-1.5 tracking-widest hover:bg-alen-black hover:text-white transition-colors">
                <Plus size={12} /> ADD ENTRY
              </button>
            </div>
            <div className="border-2 border-alen-black">
              <div className="overflow-x-auto">
              <div className="grid grid-cols-[80px_1fr_60px] bg-alen-black min-w-[500px]">
                <div className="px-4 py-3 font-mono text-xs font-bold text-white tracking-widest">TIME</div>
                <div className="px-4 py-3 font-mono text-xs font-bold text-white tracking-widest">ACTIVITY LOG / CLASSIFICATION</div>
                <div className="px-2 py-3 font-mono text-xs font-bold text-white tracking-widest"></div>
              </div>
              {loading ? (
                <div className="p-8 text-center"><span className="font-mono text-xs text-black/40 tracking-widest">LOADING LOG...</span></div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center"><span className="font-mono text-xs text-black/40 tracking-widest">NO ENTRIES FOR THIS DATE</span></div>
              ) : (
                logs.map((log, i) => (
                  <div key={log.id} className={`grid grid-cols-[80px_1fr_60px] border-t border-black/15 items-center group min-w-[500px] ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                    <div className="px-4 py-4 font-mono text-sm font-bold">{log.time_slot}</div>
                    <div className="px-4 py-4 flex items-center gap-4">
                      <CategoryBadge category={log.category} customLabel={log.custom_category_label} />
                      <span className={`font-mono text-sm ${log.category === 'waste' ? 'italic text-black/60' : ''}`}>{log.description}</span>
                    </div>
                    <div className="px-2 py-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setLogModal(log)} className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5"><Pencil size={10} /></button>
                      <button onClick={() => setDeleteTarget(log)} className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red hover:bg-alen-red/5"><Trash2 size={10} /></button>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-alen-black text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-12">
          <div><div className="font-mono text-xs text-white/40 tracking-widest">PRODUCTIVE</div><div className="font-display text-3xl text-white">{productiveHours}H</div></div>
          <div><div className="font-mono text-xs text-white/40 tracking-widest">WASTED</div><div className="font-display text-3xl text-alen-red">{wasteHours}H</div></div>
          <div><div className="font-mono text-xs text-white/40 tracking-widest">SLEEP</div><div className="font-display text-3xl text-green-400">{sleepHours}H</div></div>
          <div><div className="font-mono text-xs text-white/40 tracking-widest">EXERCISE</div><div className="font-display text-3xl text-orange-400">{exerciseHours}H</div></div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-white/40 tracking-widest">SYSTEM HEALTH:</div>
          <div className="font-mono text-sm font-bold text-green-400 tracking-widest">OPTIMAL</div>
          <div className="font-mono text-xs text-white/30 tracking-widest">NEXT SYNC: 00:00:00</div>
        </div>
      </div>

      <div className="bg-cream-dark border-t border-black/10 px-4 sm:px-6 py-2 flex justify-between">
        <span className="font-mono text-xs text-black/40">© 2024 ALEN OS V.4.2</span>
        <span className="font-mono text-xs text-black/40">EDITORIAL BRUTALISM DATA ENGINE</span>
        <span className="font-mono text-xs text-black/40">LATENCY: 12MS</span>
      </div>

      {logModal && logModal !== 'new' && (
        <LogModal
          log={{
            ...logModal,
            custom_category_label: (logModal as any).custom_category_label || '',
          }}
          selectedDay={selectedDay}
          onClose={() => setLogModal(null)}
          onSave={handleSave}
        />
      )}
      {logModal === 'new' && <LogModal log={DEFAULT_LOG} selectedDay={selectedDay} onClose={() => setLogModal(null)} onSave={handleSave} />}
      {deleteTarget && <ConfirmDelete label={`${deleteTarget.time_slot} - ${deleteTarget.description.slice(0, 30)}...`} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
