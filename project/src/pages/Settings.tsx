import { useEffect, useState, useCallback } from 'react';
import { Save, User, Bell, Database, Shield, Monitor, Clock, Zap, ChevronRight, Check, RefreshCcw, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type Setting = { key: string; value: string };

const DEFAULT_SETTINGS: Record<string, string> = {
  operator_name: 'ALEN_01',
  operator_role: 'SYSTEM OPERATOR',
  timezone: 'Asia/Kolkata',
  date_format: 'DD-MMM-YYYY',
  currency: 'INR',
  weekly_focus_target: '25',
  daily_step_target: '10000',
  sleep_target: '8',
  notifications_enabled: 'true',
  notification_sound: 'true',
  theme: 'BRUTALIST_LIGHT',
  sync_interval: '30',
  data_retention_days: '365',
  hrm_monitor: 'ONLINE',
  sleep_stage: 'SYNCED',
  screen_time: 'ACTIVE',
  journal_reminder: 'true',
  journal_reminder_time: '21:00',
  focus_break_duration: '5',
  body_log_reminder: 'true',
};

type TabKey = 'profile' | 'preferences' | 'targets' | 'notifications' | 'integrations' | 'system';

const TABS: { id: TabKey; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'PROFILE', icon: <User size={14} /> },
  { id: 'preferences', label: 'PREFERENCES', icon: <Monitor size={14} /> },
  { id: 'targets', label: 'TARGETS', icon: <Zap size={14} /> },
  { id: 'notifications', label: 'NOTIFICATIONS', icon: <Bell size={14} /> },
  { id: 'integrations', label: 'INTEGRATIONS', icon: <RefreshCcw size={14} /> },
  { id: 'system', label: 'SYSTEM', icon: <Database size={14} /> },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`w-10 h-5 border-2 transition-colors flex items-center ${enabled ? 'bg-alen-black border-alen-black' : 'bg-cream-border border-black/20'}`}>
      <div className={`w-3 h-3 transition-transform ${enabled ? 'bg-white translate-x-5' : 'bg-black/20 translate-x-0.5'}`} />
    </button>
  );
}

function Field({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/8">
      <div>
        <div className="font-mono text-xs font-bold tracking-widest">{label}</div>
        {sub && <div className="font-mono text-xs text-black/40 mt-0.5">{sub}</div>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <div className="font-display text-2xl tracking-widest">{title}</div>
      <div className="font-mono text-xs text-black/40 tracking-widest">{sub}</div>
    </div>
  );
}

export default function Settings() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('user_settings').select('*');
    if (!error && data) {
      const map: Record<string, string> = { ...DEFAULT_SETTINGS };
      (data as Setting[]).forEach(s => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));
  const toggle = (key: string) => set(key, settings[key] === 'true' ? 'false' : 'true');

  const save = async () => {
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await supabase.from('user_settings').upsert(upserts, { onConflict: 'key' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <SectionHeader title="OPERATOR PROFILE" sub="IDENTITY CONFIGURATION // SYSTEM OPERATOR" />
            <div className="border-2 border-alen-black bg-white p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 pb-6 border-b border-black/10">
                <div className="w-16 h-16 bg-alen-black flex items-center justify-center">
                  <span className="font-display text-3xl text-white">{settings.operator_name?.charAt(0) || 'A'}</span>
                </div>
                <div>
                  <div className="font-display text-3xl">{settings.operator_name}</div>
                  <div className="font-mono text-xs text-black/50 tracking-widest">{settings.operator_role}</div>
                  <div className="font-mono text-xs text-green-600 tracking-widest mt-1">● SYSTEM ACTIVE</div>
                </div>
              </div>
              <Field label="OPERATOR NAME" sub="Display name across the system">
                <input value={settings.operator_name} onChange={e => set('operator_name', e.target.value.toUpperCase())}
                  className="border-2 border-alen-black bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none uppercase w-full sm:w-44" />
              </Field>
              <Field label="ROLE / DESIGNATION" sub="Shown in sidebar">
                <input value={settings.operator_role} onChange={e => set('operator_role', e.target.value.toUpperCase())}
                  className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-alen-black w-full sm:w-44 uppercase" />
              </Field>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div>
            <SectionHeader title="PREFERENCES" sub="DISPLAY & REGIONAL SETTINGS" />
            <div className="border-2 border-alen-black bg-white p-5">
              <Field label="TIMEZONE" sub="Used for activity timestamps">
                <select value={settings.timezone} onChange={e => set('timezone', e.target.value)}
                  className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none w-full sm:w-44">
                  {['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>
              <Field label="DATE FORMAT" sub="Applied across all modules">
                <select value={settings.date_format} onChange={e => set('date_format', e.target.value)}
                  className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none w-full sm:w-44">
                  {['DD-MMM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="CURRENCY" sub="Financial module display">
                <select value={settings.currency} onChange={e => set('currency', e.target.value)}
                  className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none w-full sm:w-44">
                  {['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="THEME" sub="Visual system mode">
                <select value={settings.theme} onChange={e => set('theme', e.target.value)}
                  className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none w-full sm:w-44">
                  {['BRUTALIST_LIGHT', 'BRUTALIST_DARK', 'MINIMAL'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>
        );

      case 'targets':
        return (
          <div>
            <SectionHeader title="PERFORMANCE TARGETS" sub="BASELINE METRICS // DAILY QUOTAS" />
            <div className="border-2 border-alen-black bg-white p-5">
              {[
                { key: 'weekly_focus_target', label: 'WEEKLY FOCUS TARGET', sub: 'Hours of deep work per week', unit: 'hrs' },
                { key: 'daily_step_target', label: 'DAILY STEP TARGET', sub: 'Step count goal', unit: 'steps' },
                { key: 'sleep_target', label: 'SLEEP TARGET', sub: 'Hours of sleep per night', unit: 'hrs' },
                { key: 'focus_break_duration', label: 'BREAK DURATION', sub: 'Minutes between focus sessions', unit: 'min' },
              ].map(({ key, label, sub, unit }) => (
                <Field key={key} label={label} sub={sub}>
                  <div className="flex items-center gap-2">
                    <input type="number" value={settings[key]} onChange={e => set(key, e.target.value)}
                      className="border-2 border-alen-black bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none w-full sm:w-20 text-center" />
                    <span className="font-mono text-xs text-black/50">{unit}</span>
                  </div>
                </Field>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <SectionHeader title="NOTIFICATIONS" sub="ALERT SYSTEM CONFIGURATION" />
            <div className="border-2 border-alen-black bg-white p-5">
              <Field label="NOTIFICATIONS ENABLED" sub="Master switch for all alerts">
                <Toggle enabled={settings.notifications_enabled === 'true'} onToggle={() => toggle('notifications_enabled')} />
              </Field>
              <Field label="NOTIFICATION SOUND" sub="Audio alerts">
                <Toggle enabled={settings.notification_sound === 'true'} onToggle={() => toggle('notification_sound')} />
              </Field>
              <Field label="JOURNAL REMINDER" sub="Evening prompt for daily journal">
                <Toggle enabled={settings.journal_reminder === 'true'} onToggle={() => toggle('journal_reminder')} />
              </Field>
              <Field label="JOURNAL REMINDER TIME" sub="Time to receive journal prompt">
                <input type="time" value={settings.journal_reminder_time} onChange={e => set('journal_reminder_time', e.target.value)}
                  className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-alen-black w-full sm:w-32" />
              </Field>
              <Field label="BODY LOG REMINDER" sub="Weekly body measurement prompt">
                <Toggle enabled={settings.body_log_reminder === 'true'} onToggle={() => toggle('body_log_reminder')} />
              </Field>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <SectionHeader title="INTEGRATIONS" sub="SENSOR & DEVICE CONNECTIONS" />
            <div className="border-2 border-alen-black bg-white p-5">
              {[
                { key: 'hrm_monitor', label: 'HRM MONITOR', sub: 'Heart rate monitor device', statuses: ['ONLINE', 'OFFLINE', 'SYNCING'] },
                { key: 'sleep_stage', label: 'SLEEP STAGE TRACKER', sub: 'Sleep phase monitor', statuses: ['SYNCED', 'OFFLINE', 'PENDING'] },
                { key: 'screen_time', label: 'SCREEN TIME MONITOR', sub: 'Device usage tracking', statuses: ['ACTIVE', 'PAUSED', 'OFFLINE'] },
              ].map(({ key, label, sub, statuses }) => {
                const val = settings[key];
                const isActive = val === 'ONLINE' || val === 'SYNCED' || val === 'ACTIVE';
                return (
                  <Field key={key} label={label} sub={sub}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-alen-red'} animate-pulse`} />
                      <select value={val} onChange={e => set(key, e.target.value)}
                        className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-xs focus:outline-none w-full sm:w-28">
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </Field>
                );
              })}
              <Field label="SYNC INTERVAL" sub="Database sync frequency">
                <div className="flex items-center gap-2">
                  <input type="number" value={settings.sync_interval} onChange={e => set('sync_interval', e.target.value)}
                    className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none w-full sm:w-16 text-center" />
                  <span className="font-mono text-xs text-black/50">sec</span>
                </div>
              </Field>
            </div>
          </div>
        );

      case 'system':
        return (
          <div>
            <SectionHeader title="SYSTEM" sub="DATA MANAGEMENT & DIAGNOSTICS" />
            <div className="flex flex-col gap-4">
              <div className="border-2 border-alen-black bg-white p-5">
                <div className="font-mono text-xs font-bold tracking-widest mb-4">SYSTEM INFO</div>
                {[
                  ['VERSION', 'ALEN OS V.4.2'],
                  ['BUILD', 'EDITORIAL BRUTALISM ENGINE'],
                  ['DATABASE', 'SUPABASE // ENCRYPTED'],
                  ['TERMINAL ACCESS', '0x44_AF_32_F2'],
                  ['UPTIME', '99.97%'],
                  ['DATA RETENTION', `${settings.data_retention_days} DAYS`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5 border-b border-black/8">
                    <span className="font-mono text-xs text-black/40 tracking-widest">{k}</span>
                    <span className="font-mono text-xs font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="border-2 border-alen-black bg-white p-5">
                <div className="font-mono text-xs font-bold tracking-widest mb-4">DATA MANAGEMENT</div>
                <Field label="DATA RETENTION PERIOD" sub="How long to keep historical entries">
                  <div className="flex items-center gap-2">
                    <input type="number" value={settings.data_retention_days} onChange={e => set('data_retention_days', e.target.value)}
                      className="border border-black/20 bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none w-full sm:w-20 text-center" />
                    <span className="font-mono text-xs text-black/50">days</span>
                  </div>
                </Field>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 border-2 border-black/20 font-mono text-xs font-bold py-2.5 tracking-widest hover:border-alen-black transition-colors">
                    EXPORT ALL DATA
                  </button>
                  <button className="flex-1 border-2 border-alen-red/30 font-mono text-xs font-bold py-2.5 tracking-widest text-alen-red/60 hover:border-alen-red hover:text-alen-red transition-colors">
                    PURGE ARCHIVE
                  </button>
                </div>
                <button
                  onClick={signOut}
                  className="mt-3 w-full border-2 border-alen-black bg-alen-black text-white font-mono text-xs font-bold py-2.5 tracking-widest hover:bg-alen-red hover:border-alen-red transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={12} /> SIGN OUT
                </button>
              </div>
              <div className="border-2 border-alen-black bg-black p-5">
                <div className="font-mono text-xs font-bold text-white tracking-widest mb-3">ENCRYPTED TERMINAL</div>
                <div className="font-mono text-xs text-green-400 leading-relaxed">
                  <div>{'>'} ALEN_OS v4.2.1 // OPERATIONAL</div>
                  <div>{'>'} DATABASE: CONNECTED</div>
                  <div>{'>'} SYNC: REAL-TIME ACTIVE</div>
                  <div>{'>'} ENCRYPTION: AES-256-GCM</div>
                  <div className="text-white/30 mt-2">TERMINAL_ID: 0x44_AF_32_F2</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING SETTINGS...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-4 sm:px-6 font-mono text-xs tracking-widest text-black/50">DIRECTORY / SYSTEM_SETTINGS.CFG</div>
        <button onClick={save}
          className={`mx-4 sm:mx-6 flex items-center gap-2 font-mono text-xs font-bold px-4 py-2 tracking-widest transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-alen-black text-white hover:bg-alen-red'}`}>
          {saved ? <><Check size={14} /> SAVED</> : <><Save size={14} /> SAVE SETTINGS</>}
        </button>
      </div>

      <div className="flex flex-col md:flex-1 md:flex-row md:overflow-hidden">
        {/* Settings tabs */}
        <div className="w-full md:w-52 border-r-2 border-alen-black bg-white flex-shrink-0 overflow-x-auto">
          <div className="p-4 border-b border-black/10">
            <div className="font-mono text-xs text-black/40 tracking-widest">CONFIGURATION</div>
          </div>
          <nav className="py-2 flex flex-row md:flex-col">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-widest transition-colors text-left ${
                  activeTab === tab.id ? 'bg-alen-black text-white border-r-2 border-alen-red' : 'text-black/50 hover:text-alen-black hover:bg-black/3'
                }`}>
                {tab.icon}
                {tab.label}
                {activeTab !== tab.id && <ChevronRight size={12} className="ml-auto opacity-30" />}
              </button>
            ))}
          </nav>

          {/* Version badge */}
          <div className="p-4 border-t border-black/10 mt-auto">
            <div className="font-mono text-xs text-black/30 tracking-widest">ALEN OS V.4.2</div>
            <div className="font-mono text-xs text-black/20 tracking-widest">BUILD: 2024.10.28</div>
          </div>
        </div>

        {/* Settings content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderTab()}
        </div>
      </div>

      <div className="border-t-2 border-alen-black bg-alen-black text-white px-4 sm:px-6 py-2 flex justify-between">
        <span className="font-mono text-xs tracking-widest">SYSTEM_SETTINGS // CFG v4.2</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono text-xs text-white/40">OPERATIONAL_STATUS: OPTIMAL</span>
        </div>
      </div>
    </div>
  );
}
