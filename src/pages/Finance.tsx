import { useEffect, useState } from 'react';
import { Search, Bell, User, TrendingUp, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { supabase, FinanceTransaction, FinanceReceivable } from '../lib/supabase';
import ConfirmDelete from '../components/ConfirmDelete';

// ---- TRANSACTION MODAL ----
type TxForm = { transaction_date: string; type: 'income' | 'expense'; category: string; description: string; subcategory: string; amount: number };
const DEFAULT_TX: TxForm = { transaction_date: new Date().toISOString().split('T')[0], type: 'income', category: '', description: '', subcategory: '', amount: 0 };

function TxModal({ tx, onClose, onSave }: { tx: Partial<TxForm> & { id?: string }; onClose: () => void; onSave: (t: TxForm & { id?: string }) => void }) {
  const [form, setForm] = useState<TxForm>({
    transaction_date: tx.transaction_date || new Date().toISOString().split('T')[0],
    type: tx.type || 'income',
    category: tx.category || '',
    description: tx.description || '',
    subcategory: tx.subcategory || '',
    amount: tx.amount || 0,
  });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{tx.id ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DATE</div>
              <input type="date" value={form.transaction_date} onChange={(e) => setForm(f => ({ ...f, transaction_date: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none focus:border-alen-black" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">TYPE</div>
              <div className="flex gap-1">
                {(['income', 'expense'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 font-mono text-xs font-bold py-2 tracking-widest border transition-colors ${
                      form.type === t ? (t === 'income' ? 'bg-alen-black text-white border-alen-black' : 'bg-alen-red text-white border-alen-red') : 'border-black/20 hover:border-alen-black'
                    }`}>{t.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">DESCRIPTION</div>
            <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value.toUpperCase() }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">CATEGORY</div>
              <input value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value.toUpperCase() }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none uppercase" placeholder="CONSULTING..." />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">SUB-CATEGORY</div>
              <input value={form.subcategory} onChange={(e) => setForm(f => ({ ...f, subcategory: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none" placeholder="Strategy retainer..." />
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">AMOUNT (₹)</div>
            <input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
          </div>
          <button onClick={() => form.description && onSave({ ...form, id: tx.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{tx.id ? 'SAVE CHANGES' : 'ADD TRANSACTION'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- RECEIVABLE MODAL ----
type RecvForm = { entity: string; amount: number; outstanding_since: string; status: FinanceReceivable['status'] };
const DEFAULT_RECV: RecvForm = { entity: '', amount: 0, outstanding_since: new Date().toISOString().split('T')[0], status: 'pending' };

function RecvModal({ recv, onClose, onSave }: { recv: Partial<RecvForm> & { id?: string }; onClose: () => void; onSave: (r: RecvForm & { id?: string }) => void }) {
  const [form, setForm] = useState<RecvForm>({
    entity: recv.entity || '',
    amount: recv.amount || 0,
    outstanding_since: recv.outstanding_since || new Date().toISOString().split('T')[0],
    status: recv.status || 'pending',
  });
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-cream border-2 border-alen-black w-full max-w-md">
        <div className="bg-alen-black text-white px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold tracking-widest">{recv.id ? 'EDIT RECEIVABLE' : 'NEW RECEIVABLE'}</span>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">ENTITY</div>
            <input value={form.entity} onChange={(e) => setForm(f => ({ ...f, entity: e.target.value.toUpperCase() }))}
              className="w-full border-2 border-alen-black bg-white px-3 py-2 font-mono text-sm focus:outline-none uppercase" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">AMOUNT (₹)</div>
              <input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-sm focus:outline-none" />
            </div>
            <div>
              <div className="font-mono text-xs text-black/50 tracking-widest mb-1">OUTSTANDING SINCE</div>
              <input type="date" value={form.outstanding_since} onChange={(e) => setForm(f => ({ ...f, outstanding_since: e.target.value }))}
                className="w-full border border-black/20 bg-white px-3 py-2 font-mono text-xs focus:outline-none" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-black/50 tracking-widest mb-1">STATUS</div>
            <div className="flex gap-2">
              {(['pending', 'overdue', 'paid'] as const).map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 font-mono text-xs font-bold py-2 tracking-widest border transition-colors ${
                    form.status === s ? (s === 'overdue' ? 'bg-alen-red text-white border-alen-red' : 'bg-alen-black text-white border-alen-black') : 'border-black/20 hover:border-alen-black'
                  }`}>{s.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <button onClick={() => form.entity && onSave({ ...form, id: recv.id })}
            className="w-full bg-alen-black text-white font-mono text-xs font-bold py-3 tracking-widest hover:bg-alen-red transition-colors flex items-center justify-center gap-2">
            <Save size={14} />{recv.id ? 'SAVE CHANGES' : 'ADD RECEIVABLE'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'overdue') return <span className="bg-alen-red text-white font-mono text-xs font-bold px-2 py-1 tracking-widest">OVERDUE</span>;
  return <span className="border border-black/30 text-black/60 font-mono text-xs px-2 py-1 tracking-widest">PENDING</span>;
}

function IncomeExpenseBar() {
  const data = [
    { month: 'MAY', income: 70, expense: 35 },
    { month: 'JUN', income: 60, expense: 30 },
    { month: 'JUL', income: 55, expense: 40 },
    { month: 'AUG', income: 80, expense: 32 },
    { month: 'SEP', income: 75, expense: 38 },
    { month: 'OCT', income: 85, expense: 28 },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-end gap-4 mb-2">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-alen-red" /><span className="font-mono text-xs text-black/60">INCOME</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-alen-black" /><span className="font-mono text-xs text-black/60">EXPENSE</span></div>
      </div>
      <div className="flex items-end gap-2 flex-1">
        {data.map(d => (
          <div key={d.month} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col gap-0.5">
              <div className="bg-alen-red w-full" style={{ height: `${d.income * 1.2}px` }} />
              <div className="bg-alen-black w-full" style={{ height: `${d.expense * 1.2}px` }} />
            </div>
            <span className="font-mono text-xs text-black/40 mt-1">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Finance() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [receivables, setReceivables] = useState<FinanceReceivable[]>([]);
  const [txModal, setTxModal] = useState<'new' | FinanceTransaction | null>(null);
  const [recvModal, setRecvModal] = useState<'new' | FinanceReceivable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'tx' | 'recv'; id: string; label: string } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: txData }, { data: recvData }] = await Promise.all([
      supabase.from('finance_transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('finance_receivables').select('*').order('status'),
    ]);
    if (txData) setTransactions(txData);
    if (recvData) setReceivables(recvData);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleSaveTx = async (form: TxForm & { id?: string }) => {
    const payload = { transaction_date: form.transaction_date, type: form.type, category: form.category, description: form.description, subcategory: form.subcategory || null, amount: form.amount };
    if (form.id) { await supabase.from('finance_transactions').update(payload).eq('id', form.id); }
    else { await supabase.from('finance_transactions').insert(payload); }
    setTxModal(null); load();
  };

  const handleSaveRecv = async (form: RecvForm & { id?: string }) => {
    const payload = { entity: form.entity, amount: form.amount, outstanding_since: form.outstanding_since, status: form.status };
    if (form.id) { await supabase.from('finance_receivables').update(payload).eq('id', form.id); }
    else { await supabase.from('finance_receivables').insert(payload); }
    setRecvModal(null); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'tx') await supabase.from('finance_transactions').delete().eq('id', deleteTarget.id);
    else await supabase.from('finance_receivables').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalLiquidity = totalIncome - totalExpenses;
  const totalReceivables = receivables.reduce((s, r) => s + r.amount, 0);
  const savingsActual = 285000;
  const savingsTarget = 400000;
  const savingsPct = Math.round((savingsActual / savingsTarget) * 100);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="font-mono text-sm text-black/40 tracking-widest">LOADING LEDGER...</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream">
      <div className="flex items-center border-b-2 border-alen-black bg-white sticky top-0 z-10">
        <div className="px-6 py-3 border-r-2 border-alen-black">
          <span className="font-display text-xl tracking-widest">ALEN ARCHIVE</span>
        </div>
        <nav className="flex items-center gap-6 px-6 flex-1">
          {['DIRECTORY', 'FINANCE', 'REPORTS'].map(item => (
            <span key={item} className={`font-mono text-xs tracking-widest cursor-pointer ${item === 'FINANCE' ? 'text-alen-black font-bold border-b-2 border-alen-red pb-0.5' : 'text-black/40 hover:text-black'}`}>{item}</span>
          ))}
        </nav>
        <div className="flex items-center gap-3 px-6">
          <div className="flex items-center gap-2 border border-black/20 px-3 py-1.5">
            <Search size={12} className="text-black/40" />
            <span className="font-mono text-xs text-black/30 tracking-widest">QUERY LEDGER...</span>
          </div>
          <Bell size={16} className="text-black/50" />
          <User size={16} className="text-black/50" />
        </div>
      </div>

      <div className="flex flex-col md:flex-1 md:flex-row">
        <div className="w-full md:w-16 bg-alen-black flex flex-row md:flex-col items-center pt-4 border-r-2 border-alen-black">
          <div className="w-9 h-9 bg-alen-red flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div className="mt-4 font-mono text-xs text-white/40" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
            ALEN // MASTER DIRECTORY
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Fiscal Status */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="bg-white border-2 border-alen-black p-4 sm:p-6 w-full md:w-80">
              <div className="font-display text-4xl tracking-widest mb-2">FISCAL STATUS</div>
              <div className="font-mono text-xs text-alen-red font-bold tracking-widest mb-4">PERIOD: OCTOBER 2023</div>
              <div className="border-2 border-alen-black p-4 mb-3">
                <div className="font-mono text-xs text-black/40 tracking-widest">TOTAL LIQUIDITY</div>
                <div className="font-display text-3xl mt-1">₹ {totalLiquidity.toLocaleString('en-IN')}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-black/20 p-3">
                  <div className="font-mono text-xs text-black/40 tracking-widest">MONTHLY ROI</div>
                  <div className="font-mono text-lg font-bold text-alen-red">+12.4%</div>
                </div>
                <div className="border border-black/20 p-3">
                  <div className="font-mono text-xs text-black/40 tracking-widest">BURN RATE</div>
                  <div className="font-mono text-sm font-bold">₹ 42K/mo</div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white border-2 border-alen-black p-4 sm:p-6 flex flex-col">
              <IncomeExpenseBar />
            </div>
          </div>

          {/* Pending Receivables */}
          <div className="mb-6 border-2 border-alen-black">
            <div className="bg-alen-black text-white flex items-center justify-between px-5 py-3">
              <span className="font-display text-xl tracking-widest">PENDING RECEIVABLES</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs">TOTAL: ₹ {totalReceivables.toLocaleString('en-IN')}</span>
                <button onClick={() => setRecvModal('new')} className="flex items-center gap-1 border border-white/30 px-2 py-1 font-mono text-xs hover:border-white hover:bg-white/10 transition-colors">
                  <Plus size={12} /> ADD
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
            <div className="grid grid-cols-5 min-w-[600px] border-b border-black/15 bg-cream-dark">
              {['ENTITY / WHO OWES', 'AMOUNT', 'OUTSTANDING SINCE', 'STATUS', 'ACTION'].map(h => (
                <div key={h} className="px-4 py-3 font-mono text-xs font-bold tracking-widest">{h}</div>
              ))}
            </div>
            {receivables.map((r, i) => (
              <div key={r.id} className={`grid grid-cols-5 min-w-[600px] border-t border-black/10 items-center group ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                <div className="px-4 py-3 font-mono text-xs font-bold tracking-wide">{r.entity}</div>
                <div className="px-4 py-3 font-mono text-xs">₹ {r.amount.toLocaleString('en-IN')}</div>
                <div className="px-4 py-3 font-mono text-xs text-black/60">{new Date(r.outstanding_since).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
                <div className="px-4 py-3"><StatusBadge status={r.status} /></div>
                <div className="px-4 py-3 flex items-center gap-1">
                  <button className="bg-alen-black text-white font-mono text-xs font-bold px-3 py-1.5 tracking-widest hover:bg-alen-red transition-colors">NUDGE</button>
                  <button onClick={() => setRecvModal(r)} className="p-1.5 border border-black/20 hover:border-alen-black opacity-0 group-hover:opacity-100 transition-all"><Pencil size={11} /></button>
                  <button onClick={() => setDeleteTarget({ type: 'recv', id: r.id, label: r.entity })} className="p-1.5 border border-black/20 hover:border-alen-red hover:text-alen-red opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Income + Expense + Savings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Income Log */}
            <div className="border-2 border-alen-black">
              <div className="bg-alen-black text-white px-4 py-3 flex items-center justify-between">
                <span className="font-display text-xl tracking-widest">INCOME LOG</span>
                <button onClick={() => setTxModal({ ...DEFAULT_TX, type: 'income' } as FinanceTransaction)} className="flex items-center gap-1 border border-white/30 px-2 py-1 font-mono text-xs hover:bg-white/10"><Plus size={11} /></button>
              </div>
              <div className="divide-y divide-black/10">
                {income.slice(0, 5).map(t => (
                  <div key={t.id} className="px-4 py-3 bg-white group relative">
                    <div className="font-mono text-xs text-black/50 tracking-widest">{new Date(t.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}</div>
                    <div className="font-mono text-xs font-bold tracking-wide mt-0.5">{t.description}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono text-xs text-black/40 tracking-widest">{t.subcategory}</span>
                      <span className="font-mono text-sm font-bold">+₹ {t.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setTxModal(t)} className="p-1 border border-black/20 hover:border-alen-black bg-white"><Pencil size={9} /></button>
                      <button onClick={() => setDeleteTarget({ type: 'tx', id: t.id, label: t.description })} className="p-1 border border-black/20 hover:border-alen-red hover:text-alen-red bg-white"><Trash2 size={9} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-black/20">
                <button className="font-mono text-xs text-black/60 tracking-widest underline hover:text-alen-black">EXPORT .CSV FULL LOG</button>
              </div>
            </div>

            {/* Expense Log */}
            <div className="border-2 border-alen-red">
              <div className="bg-alen-red text-white px-4 py-3 flex items-center justify-between">
                <span className="font-display text-xl tracking-widest">EXPENSE LOG</span>
                <button onClick={() => setTxModal({ ...DEFAULT_TX, type: 'expense' } as FinanceTransaction)} className="flex items-center gap-1 border border-white/30 px-2 py-1 font-mono text-xs hover:bg-white/10"><Plus size={11} /></button>
              </div>
              <div className="divide-y divide-black/10">
                {expenses.slice(0, 5).map(t => (
                  <div key={t.id} className="px-4 py-3 bg-white group relative">
                    <div className="font-mono text-xs text-black/50 tracking-widest">{new Date(t.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}</div>
                    <div className="font-mono text-xs font-bold tracking-wide mt-0.5">{t.description}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono text-xs text-black/40 tracking-widest">{t.subcategory}</span>
                      <span className="font-mono text-sm font-bold text-alen-red">-₹ {t.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setTxModal(t)} className="p-1 border border-black/20 hover:border-alen-black bg-white"><Pencil size={9} /></button>
                      <button onClick={() => setDeleteTarget({ type: 'tx', id: t.id, label: t.description })} className="p-1 border border-black/20 hover:border-alen-red hover:text-alen-red bg-white"><Trash2 size={9} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-black/20">
                <button className="font-mono text-xs text-black/60 tracking-widest underline hover:text-alen-black">AUDIT ALL TRANSACTIONS</button>
              </div>
            </div>

            {/* Savings + Advisory */}
            <div className="flex flex-col gap-4">
              <div className="border-2 border-alen-black p-4 bg-white">
                <div className="font-display text-2xl tracking-widest mb-2">SAVINGS TARGET</div>
                <div className="font-mono text-xs text-black/50 tracking-widest mb-2">ACTUAL: ₹ {savingsActual.toLocaleString('en-IN')} TARGET: ₹ {savingsTarget.toLocaleString('en-IN')}</div>
                <div className="flex h-8 border border-black/20 overflow-hidden mb-3">
                  <div className="bg-alen-black flex items-center justify-center" style={{ width: `${savingsPct}%` }}>
                    <span className="font-mono text-xs font-bold text-white">{savingsPct}%</span>
                  </div>
                  <div className="bg-cream-dark flex-1" />
                </div>
                <div className="border border-black/20 p-3">
                  <div className="font-mono text-xs text-black/40 tracking-widest">GAP TO FILL</div>
                  <div className="font-display text-2xl mt-1">₹ {(savingsTarget - savingsActual).toLocaleString('en-IN')}</div>
                  <div className="font-mono text-xs text-black/50 mt-1 italic">"Reduce non-essential SaaS burn to hit target by EOM."</div>
                </div>
              </div>
              <div className="border-2 border-alen-black p-4 bg-white flex-1">
                <div className="font-mono text-xs font-bold tracking-widest mb-2">ALEN ADVISORY</div>
                <p className="font-mono text-xs text-black/70 leading-relaxed">
                  Your expense in <span className="bg-alen-red text-white px-1">Hardware</span> is 14% higher than last month. Consider deferring non-critical assets to Q1.
                </p>
                <button className="w-full mt-3 bg-alen-black text-white font-mono text-xs font-bold py-2 tracking-widest hover:bg-alen-red transition-colors">VIEW STRATEGY</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-alen-black bg-cream-dark px-4 sm:px-6 py-2 flex justify-between">
        <span className="font-mono text-xs text-black/40">ENCRYPTED TERMINAL ACCESS: 0x44_AF_32_F2</span>
        <span className="font-mono text-xs text-black/40">DATA REFRESHED: 12:45:01 UTC</span>
      </div>

      {txModal && txModal !== 'new' && <TxModal tx={txModal} onClose={() => setTxModal(null)} onSave={handleSaveTx} />}
      {txModal === 'new' && <TxModal tx={DEFAULT_TX} onClose={() => setTxModal(null)} onSave={handleSaveTx} />}
      {recvModal && recvModal !== 'new' && <RecvModal recv={recvModal} onClose={() => setRecvModal(null)} onSave={handleSaveRecv} />}
      {recvModal === 'new' && <RecvModal recv={DEFAULT_RECV} onClose={() => setRecvModal(null)} onSave={handleSaveRecv} />}
      {deleteTarget && <ConfirmDelete label={deleteTarget.label} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
