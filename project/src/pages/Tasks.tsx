import { useEffect, useState } from 'react';
import { Search, Plus, Check, Pencil, Trash2, X, Save } from 'lucide-react';
import { supabase, checkError, Task } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

const BUCKETS = [
  { key: 'today', label: '01. TODAY' },
  { key: 'this_week', label: '02. THIS WEEK' },
  { key: 'someday', label: '03. SOMEDAY' },
];

const PRIORITIES = ['high', 'medium', 'low'] as const;

function PriorityBadge({ priority, overdueDays }: { priority: string; overdueDays: number }) {
  const base = 'font-mono text-xs font-bold px-2 py-1 tracking-widest';
  if (priority === 'high') return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`${base} bg-alen-red text-white`}>HIGH</span>
      {overdueDays > 0 && <span className="font-mono text-xs font-bold text-alen-red tracking-widest">{overdueDays} DAYS OVERDUE</span>}
    </div>
  );
  if (priority === 'medium') return <span className={`${base} bg-alen-black text-white`}>MEDIUM</span>;
  return <span className={`${base} bg-cream-border text-alen-black border border-black/20`}>LOW</span>;
}

type TaskForm = { title: string; priority: Task['priority']; bucket: Task['bucket']; tags: string; due_time: string; due_day: string; overdue_days: number };
const DEFAULT_FORM: TaskForm = { title: '', priority: 'medium', bucket: 'today', tags: '', due_time: '', due_day: '', overdue_days: 0 };

function TaskModal({ task, onClose, onSave }: { task: Partial<TaskForm> & { id?: string; task_id?: string }; onClose: () => void; onSave: (t: TaskForm & { id?: string; task_id?: string }) => void }) {
  const [form, setForm] = useState<TaskForm>({
    title: task.title || '',
    priority: task.priority || 'medium',
    bucket: task.bucket || 'today',
    tags: (task.tags as unknown as string) || '',
    due_time: task.due_time || '',
    due_day: task.due_day || '',
    overdue_days: task.overdue_days || 0,
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{task.id ? 'EDIT TASK' : 'NEW TASK //TERMINAL'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">TASK TITLE</div>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase"
              placeholder="ENTER TASK NAME..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">PRIORITY</div>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 font-mono text-xs font-bold py-1.5 tracking-widest border transition-colors ${
                      form.priority === p
                        ? p === 'high' ? 'bg-alen-red text-white border-alen-red' : 'bg-alen-black text-white border-alen-black'
                        : 'bg-white text-black/50 border-black/20 hover:border-alen-black'
                    }`}>{p.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">BUCKET</div>
              <select value={form.bucket} onChange={(e) => setForm(f => ({ ...f, bucket: e.target.value as Task['bucket'] }))}
                className="w-full border-2 border-black/20 bg-white px-2 py-1.5 font-mono text-xs focus:outline-none">
                <option value="today">TODAY</option>
                <option value="this_week">THIS WEEK</option>
                <option value="someday">SOMEDAY</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DUE TIME</div>
              <input value={form.due_time} onChange={(e) => setForm(f => ({ ...f, due_time: e.target.value }))}
                placeholder="18:00" className="w-full border border-black/20 bg-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-alen-black" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DUE DAY</div>
              <input value={form.due_day} onChange={(e) => setForm(f => ({ ...f, due_day: e.target.value }))}
                placeholder="MONDAY" className="w-full border border-black/20 bg-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-alen-black" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">TAGS (comma-separated)</div>
            <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="BUSINESS, PERSONAL..." className="w-full border border-black/20 bg-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-alen-black" />
          </div>
          <button onClick={() => form.title && onSave({ ...form, id: task.id, task_id: task.task_id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{task.id ? 'SAVE CHANGES' : '+ COMMIT TASK'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onComplete, onEdit, onDelete }: { task: Task; onComplete: () => void; onEdit: () => void; onDelete: () => void }) {
  const isHighOverdue = task.priority === 'high' && task.overdue_days > 0;
  return (
    <div className={`bg-cream border-2 mb-3 relative group ${isHighOverdue ? 'border-alen-red' : 'border-alen-black/20'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <PriorityBadge priority={task.priority} overdueDays={task.overdue_days} />
          {(task.due_time || task.due_day) && (
            <span className="font-mono text-xs text-black/40 tracking-widest">
              {task.due_day ? `${task.due_day} ` : ''}{task.due_time ? `DUE: ${task.due_time}` : ''}
            </span>
          )}
        </div>
        <div className="font-mono text-sm font-bold tracking-wide uppercase mt-2 mb-2 leading-tight">{task.title}</div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
              <span key={tag} className="font-mono text-xs border border-black/20 px-2 py-0.5 text-black/60">{tag}</span>
            ))}
          </div>
        )}
        <div className="border-t border-black/10 pt-2 flex items-center justify-between">
          <span className="font-mono text-xs text-black/40">ID: {task.task_id}</span>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="w-6 h-6 border border-black/20 flex items-center justify-center hover:border-alen-black hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100">
              <Pencil size={10} />
            </button>
            <button onClick={onDelete} className="w-6 h-6 border border-black/20 flex items-center justify-center hover:border-alen-red hover:text-alen-red hover:bg-alen-red/5 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={10} />
            </button>
            <button onClick={onComplete} className="w-6 h-6 border-2 border-alen-black flex items-center justify-center hover:bg-alen-black hover:text-white transition-colors">
              <Check size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskModal, setTaskModal] = useState<'new' | Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  async function load() {
    const { data } = await supabase.from('tasks').select('*').eq('completed', false).order('created_at');
    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleComplete = async (id: string) => {
    await checkError(supabase.from('tasks').update({ completed: true }).eq('id', id), 'Complete task');
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = async (form: TaskForm & { id?: string; task_id?: string }) => {
    const tagsArray = typeof form.tags === 'string'
      ? form.tags.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
      : form.tags;
    const payload = {
      title: form.title.toUpperCase(),
      priority: form.priority,
      bucket: form.bucket,
      tags: tagsArray,
      due_time: form.due_time || null,
      due_day: form.due_day ? form.due_day.toUpperCase() : null,
      overdue_days: form.overdue_days,
      completed: false,
    };
    if (form.id) {
      await checkError(supabase.from('tasks').update(payload).eq('id', form.id), 'Update task');
    } else {
      const taskId = `${Math.floor(Math.random() * 9000) + 1000}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      await checkError(supabase.from('tasks').insert({ ...payload, task_id: taskId }), 'Create task');
    }
    setTaskModal(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await checkError(supabase.from('tasks').delete().eq('id', deleteTarget.id), 'Delete task');
    setDeleteTarget(null);
    load();
  };

  const filtered = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));
  const activeTasks = tasks.length;
  const overdueTasks = tasks.filter(t => t.overdue_days > 0).length;
  const timeStr = time.toTimeString().slice(0, 8);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING TASK TERMINAL...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-cream sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 border-r-2 border-alen-black">
          <span className="font-mono text-sm font-bold tracking-widest">ALEN ARCHIVE</span>
        </div>
        <div className="flex-1 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-black/40" />
            <input type="text" placeholder="QUERY ARCHIVE..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent font-mono text-xs tracking-widest placeholder:text-black/30 focus:outline-none" />
          </div>
        </div>
        <div className="px-4 sm:px-6 flex items-center gap-3">
          <div className="flex items-center gap-2 border border-alen-red px-3 py-1">
            <div className="w-2 h-2 bg-alen-red rounded-full animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-widest">SYNCED: 100%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-black/10">
        <div>
          <div className="font-mono text-sm font-bold tracking-widest">TASK TERMINAL</div>
          <div className="font-mono text-xs text-black/40 tracking-widest">ALEN_OS // DIRECTORY: /TASKS/MAIN_VIEW</div>
        </div>
        <button onClick={() => setTaskModal('new')}
          className="flex items-center gap-2 bg-alen-black text-white font-mono text-xs font-bold px-4 py-2 tracking-widest hover:bg-alen-red transition-colors">
          <Plus size={14} />NEW TASK
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-0 md:overflow-hidden overflow-visible">
        {BUCKETS.map(bucket => {
          const bucketTasks = filtered.filter(t => t.bucket === bucket.key);
          return (
            <div key={bucket.key} className="w-full md:flex-1 flex flex-col md:border-r last:border-r-0 border-b md:border-b-0 border-black/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                <span className="font-mono text-xs font-bold tracking-widest">{bucket.label}</span>
                <span className="font-mono text-sm font-bold bg-cream-border px-2 py-0.5">{String(bucketTasks.length).padStart(2, '0')}</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {bucketTasks.map(task => (
                  <TaskCard key={task.id} task={task}
                    onComplete={() => handleComplete(task.id)}
                    onEdit={() => setTaskModal(task)}
                    onDelete={() => setDeleteTarget(task)}
                  />
                ))}
                {bucketTasks.length === 0 && (
                  <div className="border-2 border-dashed border-black/15 p-6 text-center">
                    <span className="font-mono text-xs text-black/25 tracking-widest">QUEUE EMPTY</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-alen-black text-white px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <span className="font-mono text-xs tracking-widest">ACTIVE: <span className="font-bold">{String(activeTasks).padStart(2, '0')}</span></span>
          <span className="font-mono text-xs tracking-widest">OVERDUE: <span className={`font-bold ${overdueTasks > 0 ? 'text-alen-red' : ''}`}>{String(overdueTasks).padStart(2, '0')}</span></span>
          <span className="font-mono text-xs tracking-widest">COMPLETED (24H): <span className="font-bold">12</span></span>
        </div>
        <span className="font-mono text-xs tracking-widest">SYSTEM_TIME: {timeStr}</span>
      </div>

      {taskModal && taskModal !== 'new' && (
        <TaskModal task={{ ...taskModal, tags: taskModal.tags?.join(', ') || '' }} onClose={() => setTaskModal(null)} onSave={handleSave} />
      )}
      {taskModal === 'new' && <TaskModal task={DEFAULT_FORM} onClose={() => setTaskModal(null)} onSave={handleSave} />}
      {deleteTarget && <ConfirmDelete label={deleteTarget.title} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
