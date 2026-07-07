import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, TrendingUp, Rocket, BookOpen, Globe, Archive, Activity, DollarSign, Target } from 'lucide-react';
import { supabase, checkError, Goal } from '../lib/supabase';

const CATEGORIES = [
  { key: 'BUSINESS', label: '01 / BUSINESS', order: 1 },
  { key: 'ACADEMIC', label: '02 / ACADEMIC', order: 2 },
  { key: 'FINANCIAL', label: '03 / FINANCIAL', order: 3 },
  { key: 'PERSONAL', label: '04 / PERSONAL', order: 4 },
];

const ICONS: Record<string, React.ReactNode> = {
  trending: <TrendingUp size={14} />,
  rocket: <Rocket size={14} />,
  book: <BookOpen size={14} />,
  globe: <Globe size={14} />,
  bank: <DollarSign size={14} />,
  pie: <DollarSign size={14} />,
  activity: <Activity size={14} />,
  archive: <Archive size={14} />,
  target: <Target size={14} />,
};

type GoalForm = {
  title: string;
  category: string;
  category_tag: string;
  progress: number;
  deadline: string;
  last_action: string;
  icon_type: string;
};

const DEFAULT_FORM: GoalForm = {
  title: '',
  category: 'BUSINESS',
  category_tag: '',
  progress: 0,
  deadline: '',
  last_action: '',
  icon_type: 'target',
};

function GoalModal({
  goal,
  onClose,
  onSave,
}: {
  goal: Partial<GoalForm> & { id?: string };
  onClose: () => void;
  onSave: (data: GoalForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<GoalForm>({
    title: goal.title || '',
    category: goal.category || 'BUSINESS',
    category_tag: goal.category_tag || '',
    progress: goal.progress ?? 0,
    deadline: goal.deadline || '',
    last_action: goal.last_action || '',
    icon_type: goal.icon_type || 'target',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-lg">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{goal.id ? 'EDIT GOAL' : 'NEW GOAL'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">GOAL TITLE</div>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value.toUpperCase() }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase"
              placeholder="ENTER GOAL..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">CATEGORY</div>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
              </select>
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">CATEGORY TAG</div>
              <input
                value={form.category_tag}
                onChange={(e) => setForm((f) => ({ ...f, category_tag: e.target.value.toUpperCase() }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none"
                placeholder="PRIORITY_HIGH..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">PROGRESS (%)</div>
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none"
              />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DEADLINE</div>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">LAST ACTION</div>
            <input
              value={form.last_action}
              onChange={(e) => setForm((f) => ({ ...f, last_action: e.target.value }))}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none"
              placeholder="Most recent action taken..."
            />
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">ICON</div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(ICONS).map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm((f) => ({ ...f, icon_type: icon }))}
                  className={`p-2 border transition-colors ${form.icon_type === icon ? 'bg-alen-black text-white border-alen-black' : 'border-black/20 hover:border-alen-black'}`}
                >
                  {ICONS[icon]}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => form.title && onSave({ ...form, id: goal.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {goal.id ? 'SAVE CHANGES' : 'ADD GOAL'}
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
            <button onClick={onConfirm} className="flex-1 bg-alen-red text-white font-mono text-xs font-bold py-2 tracking-widest">DELETE</button>
            <button onClick={onClose} className="flex-1 border-2 border-alen-black font-mono text-xs font-bold py-2 tracking-widest hover:bg-black/5">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete }: { goal: Goal; onEdit: () => void; onDelete: () => void }) {
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
  return (
    <div className="border-2 border-black/15 bg-cream p-4 relative group">
      <div className="flex items-start justify-between mb-2">
        <div className="font-mono text-sm font-bold tracking-wide leading-tight uppercase flex-1 pr-2">{goal.title}</div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 hover:bg-black/5 text-black/40 hover:text-alen-black">
            <Pencil size={11} />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-alen-red/10 text-black/40 hover:text-alen-red">
            <Trash2 size={11} />
          </button>
          <span className="text-black/20">{ICONS[goal.icon_type || 'target']}</span>
        </div>
      </div>
      <div className="font-mono text-xs text-black/40 tracking-widest mb-1">PROGRESS</div>
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-cream-border">
          <div
            className={`h-full ${goal.progress >= 80 ? 'bg-alen-red' : 'bg-alen-black'}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <span className="font-mono text-xs font-bold">{goal.progress}%</span>
      </div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5">
        <div className="font-mono text-xs text-black/40 tracking-widest">DEADLINE:</div>
        <div className={`font-mono text-xs ${isOverdue ? 'text-alen-red font-bold' : ''}`}>
          {goal.deadline ? new Date(goal.deadline + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—'}
        </div>
        <div className="font-mono text-xs text-black/40 tracking-widest">LAST</div>
        <div className="font-mono text-xs text-black/60">{goal.last_action || '—'}</div>
        <div className="font-mono text-xs text-black/40 tracking-widest">ACTION:</div>
        <div />
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modal, setModal] = useState<'new' | Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [banner, setBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from('goals').select('*').order('created_at');
    setGoals(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleSave = async (form: GoalForm & { id?: string }) => {
    if (form.id) {
      await checkError(supabase.from('goals').update({
        title: form.title,
        category: form.category,
        category_tag: form.category_tag,
        progress: form.progress,
        deadline: form.deadline || null,
        last_action: form.last_action,
        icon_type: form.icon_type,
      }).eq('id', form.id), 'Update goal');
    } else {
      await checkError(supabase.from('goals').insert({
        title: form.title,
        category: form.category,
        category_tag: form.category_tag,
        progress: form.progress,
        deadline: form.deadline || null,
        last_action: form.last_action,
        icon_type: form.icon_type,
      }), 'Create goal');
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await checkError(supabase.from('goals').delete().eq('id', deleteTarget.id), 'Delete goal');
    setDeleteTarget(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-mono text-sm text-black/40 tracking-widest">LOADING GOALS MATRIX...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-display text-xl tracking-widest">ALEN ARCHIVE</span>
        </div>
        <nav className="flex items-center gap-6 px-4 sm:px-6 flex-1">
          {['DIRECTORY', 'GOALS', 'ARCHIVE'].map((item) => (
            <span
              key={item}
              className={`font-mono text-xs tracking-widest cursor-pointer ${
                item === 'GOALS' ? 'text-alen-red font-bold border-b-2 border-alen-red pb-0.5' : 'text-black/40'
              }`}
            >
              {item}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-3 px-4 sm:px-6">
          <div className="border border-black/20 px-3 py-1.5">
            <span className="font-mono text-xs text-black/30 tracking-widest">SEARCH_SYSTEM...</span>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 bg-alen-black text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red transition-colors"
          >
            <Plus size={14} /> NEW GOAL
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 overflow-auto flex flex-col gap-6">
        {/* Review cycle banner */}
        {banner && (
          <div className="border-2 border-alen-black bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
            <div className="flex-1">
              <div className="font-display text-2xl tracking-widest mb-2">OCTOBER REVIEW CYCLE: ACTIVE</div>
              <p className="font-mono text-xs text-black/60 max-w-xl leading-relaxed">
                Your end-of-month synchronization is required. {goals.length} goals are pending verification. Structural alignment is recommended for Q4 performance.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button className="bg-alen-black text-white font-mono text-xs font-bold px-6 py-2 tracking-widest hover:bg-alen-red transition-colors">
                  INITIATE REVIEW
                </button>
                <button
                  onClick={() => setBanner(false)}
                  className="border-2 border-alen-black font-mono text-xs font-bold px-6 py-2 tracking-widest hover:bg-black/5 transition-colors"
                >
                  DISMISS
                </button>
              </div>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-alen-red flex items-center justify-center sm:ml-6 flex-shrink-0">
              <Archive size={32} className="text-white" />
            </div>
          </div>
        )}

        {/* Goal categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const catGoals = goals.filter((g) => g.category === cat.key);
            const catTag = catGoals[0]?.category_tag || '';
            return (
              <div key={cat.key} className="border-2 border-alen-black bg-white">
                <div className="flex items-center justify-between px-5 py-3 border-b border-black/10">
                  <span className="font-display text-xl tracking-widest">{cat.label}</span>
                  <span className="font-mono text-xs text-black/50 border border-black/20 px-2 py-0.5">{catTag}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:divide-x divide-black/10">
                  {catGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={() => setModal(goal)}
                      onDelete={() => setDeleteTarget(goal)}
                    />
                  ))}
                  {catGoals.length === 0 && (
                    <div className="col-span-2 p-6 text-center">
                      <span className="font-mono text-xs text-black/30 tracking-widest">NO GOALS IN THIS CATEGORY</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setModal('new')}
        className="fixed bottom-8 right-8 w-12 h-12 bg-alen-red text-white flex items-center justify-center shadow-lg hover:bg-alen-red-dark transition-colors z-20"
      >
        <Plus size={20} />
      </button>

      {modal && modal !== 'new' && (
        <GoalModal goal={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'new' && (
        <GoalModal goal={DEFAULT_FORM} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {deleteTarget && (
        <ConfirmDelete label={deleteTarget.title} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
