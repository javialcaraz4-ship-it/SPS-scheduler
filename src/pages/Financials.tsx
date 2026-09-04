import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import Header from '../components/layout/Header';
import type { AppContext } from '../App';
import { calcHours } from '../utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface LineItem {
  id: string;
  name: string;
  amount: string; // stored as string for input binding
}

function blankItem(): LineItem {
  return { id: crypto.randomUUID(), name: '', amount: '' };
}

function storageKey(year: number, month: number) {
  return `sps_financials_${year}_${String(month).padStart(2, '0')}`;
}

function loadData(year: number, month: number): { revenue: LineItem[]; expenses: LineItem[] } {
  try {
    const raw = localStorage.getItem(storageKey(year, month));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { revenue: [blankItem()], expenses: [blankItem()] };
}

function saveData(year: number, month: number, data: { revenue: LineItem[]; expenses: LineItem[] }) {
  try { localStorage.setItem(storageKey(year, month), JSON.stringify(data)); } catch {}
}

function parseAmt(s: string): number {
  const n = parseFloat(s.replace(/[$,]/g, ''));
  return isNaN(n) ? 0 : n;
}

export default function Financials() {
  const { shifts, coaches } = useOutletContext<AppContext>();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const [revenue, setRevenue] = useState<LineItem[]>([blankItem()]);
  const [expenses, setExpenses] = useState<LineItem[]>([blankItem()]);

  // Load from localStorage when month/year changes
  useEffect(() => {
    const d = loadData(selectedYear, selectedMonth);
    setRevenue(d.revenue);
    setExpenses(d.expenses);
  }, [selectedYear, selectedMonth]);

  // Persist on any change
  useEffect(() => {
    saveData(selectedYear, selectedMonth, { revenue, expenses });
  }, [revenue, expenses, selectedYear, selectedMonth]);

  // ── Auto-calculated coach costs ──────────────────────────────────────────────
  const monthShifts = shifts.filter(s => {
    if (s.status === 'Cancelled') return false;
    const d = new Date(s.date + 'T12:00:00');
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const coachCosts = coaches
    .filter(c => c.active)
    .map(coach => {
      const cs = monthShifts.filter(s => s.coachId === coach.id);
      if (cs.length === 0) return null;
      const hours = cs.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0);
      const cost  = cs.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime) * s.payRate, 0);
      return { coach, shifts: cs.length, hours, cost };
    })
    .filter(Boolean) as { coach: typeof coaches[0]; shifts: number; hours: number; cost: number }[];

  const totalCoachCost = coachCosts.reduce((sum, r) => sum + r.cost, 0);

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totalRevenue   = revenue.reduce((s, i) => s + parseAmt(i.amount), 0);
  const totalExpenses  = expenses.reduce((s, i) => s + parseAmt(i.amount), 0);
  const grossProfit    = totalRevenue - totalCoachCost - totalExpenses;
  const javiCut        = grossProfit > 0 ? grossProfit * 0.25 : 0;
  const netAfterJavi   = grossProfit - javiCut;

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  // ── Line item helpers ────────────────────────────────────────────────────────
  const updateRevenue = (id: string, field: keyof LineItem, val: string) =>
    setRevenue(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  const addRevenue = () => setRevenue(prev => [...prev, blankItem()]);
  const removeRevenue = (id: string) =>
    setRevenue(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const updateExpense = (id: string, field: keyof LineItem, val: string) =>
    setExpenses(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  const addExpense = () => setExpenses(prev => [...prev, blankItem()]);
  const removeExpense = (id: string) =>
    setExpenses(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div>
      <Header
        title="Financials"
        subtitle={`${monthLabel} — Revenue · Coach Costs · Profit`}
        actions={
          <div className="flex items-center gap-2">
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700">
              {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        }
      />

      <div className="p-6 space-y-6">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={<DollarSign size={18} className="text-green-600" />} label="Revenue" value={fmt(totalRevenue)} color="text-green-700" />
          <StatCard icon={<TrendingDown size={18} className="text-red-500" />} label="Coach Costs" value={fmt(totalCoachCost)} color="text-red-600" />
          <StatCard icon={<TrendingDown size={18} className="text-orange-500" />} label="Other Expenses" value={fmt(totalExpenses)} color="text-orange-600" />
          <StatCard
            icon={<TrendingUp size={18} className={grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'} />}
            label="Gross Profit"
            value={(grossProfit < 0 ? '-' : '') + fmt(grossProfit)}
            color={grossProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}
          />
        </div>

        {/* ── Revenue + Expenses inputs ── */}
        <div className="grid grid-cols-2 gap-6">

          {/* Revenue */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Revenue</h2>
              <button onClick={addRevenue}
                className="flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-medium transition-colors">
                <Plus size={13} /> Add line
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {revenue.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-4 py-2.5">
                  <input
                    value={item.name}
                    onChange={e => updateRevenue(item.id, 'name', e.target.value)}
                    placeholder="Description"
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent border-0 outline-none focus:ring-0"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 text-sm">$</span>
                    <input
                      value={item.amount}
                      onChange={e => updateRevenue(item.id, 'amount', e.target.value)}
                      placeholder="0"
                      className="w-24 text-sm text-right text-slate-900 font-medium placeholder:text-slate-300 bg-transparent border-0 outline-none focus:ring-0"
                    />
                  </div>
                  <button onClick={() => removeRevenue(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex justify-between">
              <span className="text-sm font-semibold text-green-800">Total Revenue</span>
              <span className="text-sm font-bold text-green-700">{fmt(totalRevenue)}</span>
            </div>
          </div>

          {/* Other Expenses */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Other Expenses</h2>
              <button onClick={addExpense}
                className="flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-medium transition-colors">
                <Plus size={13} /> Add line
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {expenses.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-4 py-2.5">
                  <input
                    value={item.name}
                    onChange={e => updateExpense(item.id, 'name', e.target.value)}
                    placeholder="Description"
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent border-0 outline-none focus:ring-0"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 text-sm">$</span>
                    <input
                      value={item.amount}
                      onChange={e => updateExpense(item.id, 'amount', e.target.value)}
                      placeholder="0"
                      className="w-24 text-sm text-right text-slate-900 font-medium placeholder:text-slate-300 bg-transparent border-0 outline-none focus:ring-0"
                    />
                  </div>
                  <button onClick={() => removeExpense(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-orange-50 border-t border-orange-100 flex justify-between">
              <span className="text-sm font-semibold text-orange-800">Total Other Expenses</span>
              <span className="text-sm font-bold text-orange-700">{fmt(totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* ── Coach Costs (auto) ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Coach Costs</h2>
            <span className="text-xs text-slate-400">Auto-calculated from scheduled shifts</span>
          </div>
          {coachCosts.length === 0 ? (
            <p className="px-5 py-8 text-center text-slate-400 text-sm">No shifts in {monthLabel}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Coach', 'Shifts', 'Hours', 'Est. Cost'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coachCosts.map(({ coach, shifts: sc, hours, cost }) => (
                  <tr key={coach.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{coach.name}</td>
                    <td className="px-5 py-3 text-slate-600">{sc}</td>
                    <td className="px-5 py-3 text-slate-600">{hours.toFixed(1)}h</td>
                    <td className="px-5 py-3 font-semibold text-red-700">{fmt(cost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-red-50 border-t border-red-100">
                  <td className="px-5 py-3 font-semibold text-red-900">Total Coach Costs</td>
                  <td className="px-5 py-3 font-semibold text-red-700">{coachCosts.reduce((s, r) => s + r.shifts, 0)}</td>
                  <td className="px-5 py-3 font-semibold text-red-700">{coachCosts.reduce((s, r) => s + r.hours, 0).toFixed(1)}h</td>
                  <td className="px-5 py-3 font-bold text-red-700">{fmt(totalCoachCost)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Profit Summary ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Profit Summary</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <SummaryRow label="Total Revenue" value={fmt(totalRevenue)} valueClass="text-green-700" />
            <SummaryRow label="− Coach Costs" value={`(${fmt(totalCoachCost)})`} valueClass="text-red-600" />
            <SummaryRow label="− Other Expenses" value={`(${fmt(totalExpenses)})`} valueClass="text-orange-600" />
            <div className="px-6 py-4 flex justify-between items-center bg-slate-50">
              <span className="text-base font-bold text-slate-900">= Gross Profit</span>
              <span className={`text-xl font-bold ${grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {grossProfit < 0 ? '-' : ''}{fmt(grossProfit)}
              </span>
            </div>

            {/* Javi's cut */}
            <div className="px-6 py-5 bg-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent size={16} className="text-red-300" />
                  <span className="text-white font-semibold">Javi's Cut (25%)</span>
                </div>
                <span className="text-xl font-bold text-white">{fmt(javiCut)}</span>
              </div>
              <p className="text-red-300 text-xs mt-1 ml-6">25% of gross profit</p>
            </div>

            <div className="px-6 py-4 flex justify-between items-center bg-emerald-50">
              <span className="text-base font-bold text-emerald-900">Net (after Javi's cut)</span>
              <span className="text-xl font-bold text-emerald-700">{fmt(netAfterJavi)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="px-6 py-3.5 flex justify-between items-center">
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
