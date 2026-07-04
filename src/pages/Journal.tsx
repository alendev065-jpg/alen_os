import { useEffect, useState, useCallback } from 'react';
import { Search, Bell, User, Sun, Moon, Save, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { supabase, JournalEntry } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

const TODAY = new Date().toISOString().split('T')[0];

function EnergyPicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-4 gap-1 mt-2">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`font-mono text-xs font-bold py-1.5 border transition-colors ${
            value === n
              ? 'bg-alen-black text-white border-alen-black'
              : 'bg-white text-black border-black/20 hover:border-alen-black'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function CalendarGrid({ entries, selectedDate, onSelectDate }: {
  entries: string[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-black/5">
          <ChevronLeft size={14} />
        </button>
        <span className="font-mono text-xs font-bold tracking-widest">
          {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
        </span>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-black/5">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
          <div key={d} className="font-mono text-xs text-black/40 text-center py-2 border border-black/10">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="border border-black/5 bg-black/5 h-16" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEntry = entries.includes(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === TODAY;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`border border-black/10 h-16 p-1.5 text-left transition-colors ${
                isSelected
                  ? 'bg-alen-black text-white'
                  : isToday
                  ? 'bg-cream-dark'
                  : 'bg-cream hover:bg-cream-dark'
              }`}
            >
              <div className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : ''}`}>{String(day).padStart(2, '0')}</div>
              {hasEntry && (
                <div className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-black/30'}`}>●</div>
              )}
              {isSelected && (
                <div className="font-mono text-xs text-white/60 tracking-widest">ACTIVE</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Journal() {
  const [entry, setEntry] = useState<Partial<JournalEntry>>({});
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'am' | 'pm'>('am');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    supabase.from('journal_entries').select('entry_date').then(({ data }) => {
      if (data) setAllDates(data.map((d) => d.entry_date));
    });
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('entry_date', selectedDate)
        .maybeSingle();
      setEntry(data || { entry_date: selectedDate });
    }
    load();
  }, [selectedDate]);

  const save = useCallback(async () => {
    setSaving(true);
    const payload = { ...entry, entry_date: selectedDate, updated_at: new Date().toISOString() };
    if (entry.id) {
      await supabase.from('journal_entries').update(payload).eq('id', entry.id);
    } else {
      const entryNumber = allDates.length + 1;
      const { data } = await supabase.from('journal_entries').insert({ ...payload, entry_number: entryNumber }).select().single();
      if (data) {
        setEntry(data);
        setAllDates((prev) => [...prev, selectedDate]);
      }
    }
    setSaving(false);
  }, [entry, selectedDate, allDates.length]);

  const update = (field: keyof JournalEntry, value: unknown) => {
    setEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    if (!entry.id) return;
    await supabase.from('journal_entries').delete().eq('id', entry.id);
    setAllDates((prev) => prev.filter((d) => d !== selectedDate));
    setEntry({ entry_date: selectedDate });
    setDeleteConfirm(false);
  };

  const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-display text-xl tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 px-4 sm:px-6">
          <Search size={16} className="text-black/50" />
          <Bell size={16} className="text-black/50" />
          <User size={16} className="text-black/50" />
        </div>
      </div>

      <div className="flex flex-col md:flex-1 md:flex-row">
        {/* Left sidebar */}
        <div className="w-full md:w-44 bg-alen-black flex flex-col py-4 px-5 overflow-x-auto">
          <div className="font-mono text-sm font-bold text-white mb-0.5">ALEN</div>
          <div className="font-mono text-xs text-white/40 tracking-wide leading-tight">MASTER<br />DIRECTORY</div>
          <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-3">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'map', label: '24H Map' },
              { id: 'journal', label: 'Journal', active: true },
              { id: 'habits', label: 'Habits' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'goals', label: 'Goals' },
              { id: 'settings', label: 'Settings' },
            ].map((item) => (
              <div key={item.id} className={`font-mono text-xs tracking-widest ${item.active ? 'text-white font-bold' : 'text-white/40'}`}>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="flex flex-col md:flex-1 md:flex-row">
            {/* Journal forms */}
            <div className="flex-1 flex flex-col">
              {/* Hero */}
              <div className="bg-cream-dark border-b-2 border-alen-black p-4 sm:p-8 flex items-end justify-between">
                <div>
                  <div className="font-display text-7xl leading-none mb-4">DAILY JOURNAL</div>
                  <div className="flex items-center gap-4">
                    <span className="bg-alen-red text-white font-mono text-xs font-bold px-3 py-1 tracking-widest">
                      ENTRY_{String(entry.entry_number || allDates.length + 1).padStart(4, '0')}
                    </span>
                    <span className="font-mono text-sm tracking-widest text-black/60">{dateLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry.id && (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-2 border-2 border-alen-red/30 text-alen-red/60 font-mono text-xs font-bold px-4 py-2 tracking-widest hover:border-alen-red hover:text-alen-red hover:bg-alen-red/5 transition-colors"
                    >
                      <Trash2 size={14} />
                      DELETE
                    </button>
                  )}
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 bg-alen-red text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red-dark transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </div>

              {/* System status banner */}
              <div className="bg-alen-black text-white px-4 sm:px-8 py-3 flex items-center justify-between">
                <span className="font-mono text-xs text-white/40 tracking-widest">SYSTEM STATUS</span>
                <span className="font-mono text-xs font-bold tracking-widest">OPTIMIZE OR DECAY. RECORD THE TRUTH.</span>
              </div>

              {/* AM/PM Toggle */}
              <div className="flex border-b-2 border-alen-black">
                <button
                  onClick={() => setTab('am')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-bold tracking-widest transition-colors ${
                    tab === 'am' ? 'bg-cream text-alen-black' : 'bg-cream-dark text-black/40'
                  }`}
                >
                  <Sun size={14} />
                  AM / MORNING
                </button>
                <button
                  onClick={() => setTab('pm')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-bold tracking-widest transition-colors ${
                    tab === 'pm' ? 'bg-alen-black text-white' : 'bg-cream-dark text-black/40'
                  }`}
                >
                  <Moon size={14} />
                  PM / NIGHT
                </button>
              </div>

              {tab === 'am' ? (
                <div className="p-4 sm:p-6 flex flex-col gap-0">
                  <div className="border-b border-black/10 pb-4 mb-4">
                    <div className="font-mono text-xs font-bold tracking-widest text-black/50 mb-2">01. ONE THING TO MAKE TODAY COUNT</div>
                    <textarea
                      value={entry.morning_objective || ''}
                      onChange={(e) => update('morning_objective', e.target.value)}
                      placeholder="WRITE PRIMARY OBJECTIVE..."
                      className="w-full bg-transparent font-mono text-sm placeholder:text-black/20 resize-none border-none focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="border-b border-black/10 pb-4 mb-4">
                    <div className="font-mono text-xs font-bold tracking-widest text-black/50 mb-2">02. AVOIDING RIGHT NOW</div>
                    <textarea
                      value={entry.avoiding || ''}
                      onChange={(e) => update('avoiding', e.target.value)}
                      placeholder="THE FRICTION POINT..."
                      className="w-full bg-transparent font-mono text-sm placeholder:text-black/20 resize-none border-none focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-black/10 pb-4 mb-4">
                    <div>
                      <div className="font-mono text-xs font-bold tracking-widest text-black/50 mb-2">03. ENERGY LEVEL (1-10)</div>
                      <EnergyPicker value={entry.energy_level || null} onChange={(v) => update('energy_level', v)} />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold tracking-widest text-black/50 mb-2">04. PROUD BY TONIGHT</div>
                      <textarea
                        value={entry.proud_of || ''}
                        onChange={(e) => update('proud_of', e.target.value)}
                        placeholder="DEFINE SUCCESS..."
                        className="w-full bg-transparent font-mono text-sm placeholder:text-black/20 resize-none border-none focus:outline-none"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold tracking-widest text-black/50 mb-2">05. MENTAL WEIGHT</div>
                    <textarea
                      value={entry.mental_weight || ''}
                      onChange={(e) => update('mental_weight', e.target.value)}
                      placeholder="UNLOAD THE STACK..."
                      className="w-full bg-transparent font-mono text-sm placeholder:text-black/20 resize-none border-none focus:outline-none"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-alen-black flex-1 p-4 sm:p-6 flex flex-col gap-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-4 mb-4">
                    <div>
                      <div className="font-mono text-xs font-bold tracking-widest text-alen-red mb-2">01. DID I DO THE ONE THING?</div>
                      <div className="font-mono text-xs text-white/40 tracking-widest mb-3">EXECUTION STATUS</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => update('did_the_thing', true)}
                          className={`flex-1 font-mono text-xs font-bold py-2 tracking-widest transition-colors ${
                            entry.did_the_thing === true ? 'bg-white text-alen-black' : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          YES
                        </button>
                        <button
                          onClick={() => update('did_the_thing', false)}
                          className={`flex-1 font-mono text-xs font-bold py-2 tracking-widest transition-colors ${
                            entry.did_the_thing === false ? 'bg-alen-red text-white' : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold tracking-widest text-alen-red mb-2">02. WHERE DID I WASTE TIME?</div>
                      <div className="font-mono text-xs text-white/30 tracking-widest mb-2">LEAKAGE LOG...</div>
                      <textarea
                        value={entry.wasted_time || ''}
                        onChange={(e) => update('wasted_time', e.target.value)}
                        className="w-full bg-transparent font-mono text-sm text-white placeholder:text-white/20 resize-none border-none focus:outline-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="border-b border-white/10 pb-4 mb-4">
                    <div className="font-mono text-xs font-bold tracking-widest text-alen-red mb-2">03. WHAT DID I AVOID AGAIN?</div>
                    <div className="font-mono text-xs text-white/30 tracking-widest mb-2">RECURRING FRICTION...</div>
                    <textarea
                      value={entry.avoided_again || ''}
                      onChange={(e) => update('avoided_again', e.target.value)}
                      className="w-full bg-transparent font-mono text-sm text-white placeholder:text-white/20 resize-none border-none focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="border-b border-white/10 pb-4 mb-4">
                    <div className="font-mono text-xs font-bold tracking-widest text-alen-red mb-2">04. LEARNED TODAY</div>
                    <div className="font-mono text-xs text-white/30 tracking-widest mb-2">DATA ACQUISITION...</div>
                    <textarea
                      value={entry.learned || ''}
                      onChange={(e) => update('learned', e.target.value)}
                      className="w-full bg-transparent font-mono text-sm text-white placeholder:text-white/20 resize-none border-none focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold tracking-widest text-alen-red mb-2">05. TOMORROW'S PRIORITY</div>
                    <div className="font-mono text-xs text-white/30 tracking-widest mb-2">NEXT TARGET...</div>
                    <textarea
                      value={entry.tomorrow_priority || ''}
                      onChange={(e) => update('tomorrow_priority', e.target.value)}
                      className="w-full bg-transparent font-mono text-sm text-white placeholder:text-white/20 resize-none border-none focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Archive Navigation */}
          <div className="border-t-2 border-alen-black p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-xs font-bold tracking-widest">ARCHIVE NAVIGATION</div>
                <div className="font-mono text-xs text-black/40 tracking-widest">REVIEW PREVIOUS ENTRIES</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="w-8 h-8 border-2 border-alen-black flex items-center justify-center hover:bg-alen-black hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="w-8 h-8 border-2 border-alen-black flex items-center justify-center hover:bg-alen-black hover:text-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <CalendarGrid entries={allDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmDelete
          label={`journal entry for ${selectedDate}`}
          onConfirm={handleDelete}
          onClose={() => setDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
