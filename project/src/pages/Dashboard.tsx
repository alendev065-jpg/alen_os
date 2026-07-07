import { useEffect, useState } from 'react';
import { Search, Flag, AlertTriangle, Plus, Pencil, Trash2, X, Save, CheckSquare, RefreshCcw, Heart, Zap, Dumbbell, Target, BookOpen, Map } from 'lucide-react';
import { supabase, checkError, CrmPipeline, CrmContact } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';
import type { Page } from '../components/Sidebar';

const STAGES = [
  { key: 'lead', label: 'LEAD' },
  { key: 'contacted', label: 'CONTACTED' },
  { key: 'proposal_sent', label: 'PROPOSAL SENT' },
  { key: 'closed_won', label: 'CLOSED WON' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(/ /g, '-');
}

// ---- DEAL MODAL ----
type DealForm = { company: string; project: string; stage: CrmPipeline['stage']; amount: number; days_left: number | ''; priority: string; status: string; is_new: boolean };
const DEFAULT_DEAL: DealForm = { company: '', project: '', stage: 'lead', amount: 0, days_left: '', priority: 'normal', status: '', is_new: false };

function DealModal({ deal, onClose, onSave }: { deal: Partial<DealForm> & { id?: string }; onClose: () => void; onSave: (d: DealForm & { id?: string }) => void }) {
  const [form, setForm] = useState<DealForm>({
    company: deal.company || '',
    project: deal.project || '',
    stage: deal.stage || 'lead',
    amount: deal.amount || 0,
    days_left: deal.days_left ?? '',
    priority: deal.priority || 'normal',
    status: deal.status || '',
    is_new: deal.is_new || false,
  });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-lg">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{deal.id ? 'EDIT DEAL' : 'NEW DEAL'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">COMPANY</div>
              <input value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none" placeholder="Company name..." />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">PROJECT</div>
              <input value={form.project} onChange={(e) => setForm(f => ({ ...f, project: e.target.value.toUpperCase() }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase" placeholder="PROJECT TYPE..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">STAGE</div>
              <select value={form.stage} onChange={(e) => setForm(f => ({ ...f, stage: e.target.value as CrmPipeline['stage'] }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none">
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">AMOUNT (₹)</div>
              <input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DAYS LEFT</div>
              <input type="number" value={form.days_left} onChange={(e) => setForm(f => ({ ...f, days_left: e.target.value ? Number(e.target.value) : '' }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">PRIORITY</div>
              <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none">
                <option value="normal">NORMAL</option>
                <option value="critical">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_new" checked={form.is_new} onChange={(e) => setForm(f => ({ ...f, is_new: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="is_new" className="font-mono text-xs tracking-widest">MARK AS NEW</label>
          </div>
          <button onClick={() => form.company && onSave({ ...form, id: deal.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{deal.id ? 'SAVE CHANGES' : 'ADD DEAL'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- CONTACT MODAL ----
type ContactForm = { company: string; email: string; last_touchpoint_date: string; last_touchpoint_method: string };
const DEFAULT_CONTACT: ContactForm = { company: '', email: '', last_touchpoint_date: '', last_touchpoint_method: 'CALLED' };

function ContactModal({ contact, onClose, onSave }: { contact: Partial<ContactForm> & { id?: string }; onClose: () => void; onSave: (c: ContactForm & { id?: string }) => void }) {
  const [form, setForm] = useState<ContactForm>({
    company: contact.company || '',
    email: contact.email || '',
    last_touchpoint_date: contact.last_touchpoint_date || '',
    last_touchpoint_method: contact.last_touchpoint_method || 'CALLED',
  });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{contact.id ? 'EDIT CONTACT' : 'NEW CONTACT'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">COMPANY</div>
            <input value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">EMAIL</div>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:border-alen-black" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">LAST CONTACT DATE</div>
              <input type="date" value={form.last_touchpoint_date} onChange={(e) => setForm(f => ({ ...f, last_touchpoint_date: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">METHOD</div>
              <select value={form.last_touchpoint_method} onChange={(e) => setForm(f => ({ ...f, last_touchpoint_method: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none">
                {['CALLED', 'EMAIL', 'SLACK', 'MEETING', 'OTHER'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => form.company && onSave({ ...form, id: contact.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{contact.id ? 'SAVE CHANGES' : 'ADD CONTACT'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- PIPELINE CARD ----
function PipelineCard({ deal, onEdit, onDelete }: { deal: CrmPipeline; onEdit: () => void; onDelete: () => void }) {
  const isCritical = deal.priority === 'critical';
  return (
    <div className={`bg-cream p-4 mb-3 border-2 relative group ${isCritical ? 'border-alen-red' : 'border-black/20'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {deal.is_new && <span className="bg-alen-black text-white font-mono text-xs px-2 py-0.5">NEW</span>}
          {isCritical && <Flag size={14} className="text-alen-red" fill="#cc0000" />}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 hover:bg-black/5 text-black/40 hover:text-alen-black"><Pencil size={11} /></button>
          <button onClick={onDelete} className="p-1 hover:bg-alen-red/10 text-black/40 hover:text-alen-red"><Trash2 size={11} /></button>
        </div>
      </div>
      {isCritical && (
        <div className="text-alen-red font-mono text-xs font-bold tracking-widest mt-1 flex items-center gap-1">
          <AlertTriangle size={10} />{deal.status}
        </div>
      )}
      <div className="font-mono text-sm font-bold tracking-widest uppercase leading-tight mt-2">{deal.company}</div>
      <div className="font-mono text-xs text-black/50 tracking-widest mt-0.5">{deal.project}</div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/10">
        <span className="font-mono text-sm font-semibold">₹ {deal.amount.toLocaleString('en-IN')}</span>
        {deal.days_left !== null && (
          <span className={`font-mono text-xs ${deal.days_left <= 5 ? 'text-alen-red font-bold' : 'text-black/50'}`}>
            D: {String(deal.days_left).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
}

// ---- MAIN COMPONENT ----
export default function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [pipeline, setPipeline] = useState<CrmPipeline[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dealModal, setDealModal] = useState<'new' | CrmPipeline | null>(null);
  const [contactModal, setContactModal] = useState<'new' | CrmContact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'deal' | 'contact'; id: string; label: string } | null>(null);
  const [moduleStats, setModuleStats] = useState<Record<string, number | string>>({});

  async function load() {
    const [{ data: pData }, { data: cData }] = await Promise.all([
      supabase.from('crm_pipeline').select('*').order('created_at'),
      supabase.from('crm_contacts').select('*').order('company'),
    ]);
    if (pData) setPipeline(pData);
    if (cData) setContacts(cData);

    const [tasks, habits, health, focus, goals, journal, body] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('completed', false),
      supabase.from('habits').select('*', { count: 'exact', head: true }),
      supabase.from('health_logs').select('sleep_hours, stress_level').order('log_date', { ascending: false }).limit(1),
      supabase.from('focus_sessions').select('duration_minutes, completed').eq('session_date', new Date().toISOString().split('T')[0]),
      supabase.from('goals').select('*', { count: 'exact', head: true }),
      supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
      supabase.from('body_metrics').select('weight, exercise_target').order('log_date', { ascending: false }).limit(1),
    ]);

    const todayFocusMin = (focus.data || []).filter((s: any) => s.completed).reduce((t: number, s: any) => t + s.duration_minutes, 0);
    const latestHealth = health.data?.[0] as any;
    const latestBody = body.data?.[0] as any;

    setModuleStats({
      tasks: tasks.count || 0,
      habits: habits.count || 0,
      healthSleep: latestHealth?.sleep_hours ? `${latestHealth.sleep_hours}h` : '—',
      healthStress: latestHealth?.stress_level ?? '—',
      focusToday: `${todayFocusMin}m`,
      goals: goals.count || 0,
      journal: journal.count || 0,
      bodyWeight: latestBody?.weight ? `${latestBody.weight}kg` : '—',
      bodyTarget: latestBody?.exercise_target || '—',
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleSaveDeal = async (form: DealForm & { id?: string }) => {
    const payload = { company: form.company, project: form.project, stage: form.stage, amount: form.amount, days_left: form.days_left !== '' ? Number(form.days_left) : null, priority: form.priority, status: form.status || null, is_new: form.is_new };
    if (form.id) { await checkError(supabase.from('crm_pipeline').update(payload).eq('id', form.id), 'Update deal'); }
    else { await checkError(supabase.from('crm_pipeline').insert(payload), 'Create deal'); }
    setDealModal(null); load();
  };

  const handleSaveContact = async (form: ContactForm & { id?: string }) => {
    const payload = { company: form.company, email: form.email, last_touchpoint_date: form.last_touchpoint_date || null, last_touchpoint_method: form.last_touchpoint_method };
    if (form.id) { await checkError(supabase.from('crm_contacts').update(payload).eq('id', form.id), 'Update contact'); }
    else { await checkError(supabase.from('crm_contacts').insert(payload), 'Create contact'); }
    setContactModal(null); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'deal') await checkError(supabase.from('crm_pipeline').delete().eq('id', deleteTarget.id), 'Delete deal');
    else await checkError(supabase.from('crm_contacts').delete().eq('id', deleteTarget.id), 'Delete contact');
    setDeleteTarget(null); load();
  };

  const filteredContacts = contacts.filter(c => !search || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const totalPipeline = pipeline.reduce((s, d) => s + d.amount, 0);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING ARCHIVE...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 sm:border-r-2 sm:border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-4 pb-3 sm:px-4 sm:pb-0">
          <div className="flex items-center gap-2 max-w-xs">
            <Search size={14} className="text-black/40" />
            <input type="text" placeholder="SEARCH_DATABASE..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent font-mono text-xs tracking-widest placeholder:text-black/30 text-alen-black w-full border border-black/20 px-2 py-1.5 focus:outline-none focus:border-alen-black" />
          </div>
        </div>
      </div>

      {/* Pipeline banner */}
      <div className="px-4 sm:px-6 py-3 border-b border-black/10 bg-cream-dark">
        <div className="font-mono text-xs tracking-widest text-black/60">PIPELINE: <span className="text-alen-black font-bold">ALEN.STUDIO</span></div>
        <div className="font-mono text-xs tracking-widest text-black/40 mt-0.5">STATUS: ACTIVE OPERATIONS // {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(/ /g, '-')}</div>
      </div>

      {/* Cross-module summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border-b-2 border-alen-black">
        {([
          { page: 'tasks' as Page, icon: <CheckSquare size={14} />, label: 'TASKS', value: moduleStats.tasks ?? '—', sub: 'ACTIVE' },
          { page: 'habits' as Page, icon: <RefreshCcw size={14} />, label: 'HABITS', value: moduleStats.habits ?? '—', sub: 'TRACKED' },
          { page: 'goals' as Page, icon: <Target size={14} />, label: 'GOALS', value: moduleStats.goals ?? '—', sub: 'ACTIVE' },
          { page: 'focus' as Page, icon: <Zap size={14} />, label: 'FOCUS', value: moduleStats.focusToday ?? '0m', sub: 'TODAY' },
          { page: 'health' as Page, icon: <Heart size={14} />, label: 'SLEEP', value: moduleStats.healthSleep ?? '—', sub: 'LAST NIGHT' },
          { page: 'body' as Page, icon: <Dumbbell size={14} />, label: 'WEIGHT', value: moduleStats.bodyWeight ?? '—', sub: 'LATEST' },
          { page: 'journal' as Page, icon: <BookOpen size={14} />, label: 'JOURNAL', value: moduleStats.journal ?? '—', sub: 'ENTRIES' },
          { page: 'map' as Page, icon: <Map size={14} />, label: '24H MAP', value: 'VIEW', sub: 'TODAY' },
        ]).map((m) => (
          <button key={m.label} onClick={() => onNavigate(m.page)}
            className="px-3 py-3 border-r border-b sm:border-b-0 last:border-r-0 border-black/10 bg-white hover:bg-alen-black hover:text-white transition-colors group text-left">
            <div className="flex items-center gap-1.5 text-black/40 group-hover:text-white/60 mb-1">
              {m.icon}
              <span className="font-mono text-xs tracking-widest">{m.label}</span>
            </div>
            <div className="font-display text-2xl leading-none">{m.value}</div>
            <div className="font-mono text-xs text-black/30 group-hover:text-white/40 tracking-widest mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        {/* Kanban */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {STAGES.map((stage) => {
            const deals = pipeline.filter(d => d.stage === stage.key);
            return (
              <div key={stage.key} className="min-w-[240px] flex-1">
                <div className="bg-alen-black text-white font-mono text-xs font-bold tracking-widest px-4 py-3">
                  {stage.label} [{String(deals.length).padStart(2, '0')}]
                </div>
                <div className="pt-3">
                  {deals.map(deal => (
                    <PipelineCard key={deal.id} deal={deal}
                      onEdit={() => setDealModal(deal)}
                      onDelete={() => setDeleteTarget({ type: 'deal', id: deal.id, label: deal.company })}
                    />
                  ))}
                  {deals.length === 0 && (
                    <div className="border-2 border-dashed border-black/20 p-4 text-center">
                      <span className="font-mono text-xs text-black/30 tracking-widest">EMPTY</span>
                    </div>
                  )}
                  <button onClick={() => setDealModal('new')}
                    className="w-full border border-dashed border-black/20 p-2 font-mono text-xs text-black/30 hover:text-alen-black hover:border-alen-black transition-colors flex items-center justify-center gap-1">
                    <Plus size={10} /> ADD DEAL
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CRM Index Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-xs tracking-widest text-black/60">CLIENT_CRM_INDEX</div>
            <button onClick={() => setContactModal('new')}
              className="flex items-center gap-1 font-mono text-xs font-bold tracking-widest border-2 border-alen-black px-3 py-1.5 hover:bg-alen-black hover:text-white transition-colors">
              <Plus size={12} /> ADD CONTACT
            </button>
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block border-2 border-alen-black">
            <div className="grid grid-cols-4 bg-alen-black">
              {['NAME', 'CONTACT', 'LAST TOUCHPOINT', ''].map(h => (
                <div key={h} className="px-4 py-3 font-mono text-xs font-bold text-white tracking-widest">{h}</div>
              ))}
            </div>
            {filteredContacts.map((c, i) => (
              <div key={c.id} className={`grid grid-cols-4 border-t border-black/15 items-center group ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                <div className="px-4 py-3 font-mono text-xs tracking-wide">{c.company}</div>
                <div className="px-4 py-3 font-mono text-xs text-black/60">{c.email}</div>
                <div className="px-4 py-3 font-mono text-xs text-black/60">
                  {c.last_touchpoint_date ? formatDate(c.last_touchpoint_date) : '—'} / {c.last_touchpoint_method || '—'}
                </div>
                <div className="px-4 py-3 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setContactModal(c)} className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5"><Pencil size={11} /></button>
                  <button onClick={() => setDeleteTarget({ type: 'contact', id: c.id, label: c.company })} className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red hover:bg-alen-red/5"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-2">
            {filteredContacts.map((c) => (
              <div key={c.id} className="border-2 border-alen-black bg-white p-3">
                <div className="flex items-start justify-between">
                  <div className="font-mono text-xs font-bold tracking-wide">{c.company}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setContactModal(c)} className="p-1.5 border border-black/20 hover:border-alen-black hover:bg-black/5"><Pencil size={11} /></button>
                    <button onClick={() => setDeleteTarget({ type: 'contact', id: c.id, label: c.company })} className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red hover:bg-alen-red/5"><Trash2 size={11} /></button>
                  </div>
                </div>
                <div className="font-mono text-xs text-black/60 mt-1">{c.email}</div>
                <div className="font-mono text-xs text-black/60 mt-1">
                  {c.last_touchpoint_date ? formatDate(c.last_touchpoint_date) : '—'} / {c.last_touchpoint_method || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-alen-black bg-white p-5">
            <div className="font-mono text-xs tracking-widest text-black/60 mb-2">REVENUE_FORECAST</div>
            <div className="font-display text-5xl text-alen-black leading-none mb-2">
              ₹ {(totalPipeline / 100000).toFixed(2).replace('.', ',')}
            </div>
            <div className="font-mono text-xs text-black/40 tracking-widest">PROJECTED PIPELINE VALUE / Q2</div>
          </div>
          <div className="border-2 border-alen-black bg-white p-5">
            <div className="font-mono text-xs tracking-widest text-black/60 mb-2">ACTIVE_LOAD</div>
            <div className="flex items-end gap-1 h-24 mt-2">
              {[60, 80, 45, 90, 55, 75, 40, 85].map((h, i) => (
                <div key={i} className={i === 4 ? 'bg-alen-red flex-1' : 'bg-alen-black flex-1'} style={{ height: `${h}%` }} />
              ))}
              <div className="flex-1 flex items-center justify-center bg-alen-red text-white">
                <div className="text-center"><div className="font-display text-xl">+</div><div className="font-mono text-xs">78%</div></div>
              </div>
            </div>
            <div className="font-mono text-xs text-black/40 tracking-widest mt-2">RESOURCE ALLOCATION MATRIX</div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-alen-black bg-alen-black text-white px-4 sm:px-6 py-2">
        <span className="font-mono text-xs tracking-widest">ALEN.STUDIO // OPERATIONAL_STATUS: OPTIMAL // VERSION_4.0.2</span>
      </div>

      {dealModal && dealModal !== 'new' && <DealModal deal={dealModal} onClose={() => setDealModal(null)} onSave={handleSaveDeal} />}
      {dealModal === 'new' && <DealModal deal={DEFAULT_DEAL} onClose={() => setDealModal(null)} onSave={handleSaveDeal} />}
      {contactModal && contactModal !== 'new' && <ContactModal contact={contactModal} onClose={() => setContactModal(null)} onSave={handleSaveContact} />}
      {contactModal === 'new' && <ContactModal contact={DEFAULT_CONTACT} onClose={() => setContactModal(null)} onSave={handleSaveContact} />}
      {deleteTarget && <ConfirmDelete label={deleteTarget.label} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
