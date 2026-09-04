import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import type { AppContext } from '../App';
import { calcHours } from '../utils';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface SchoolFinancials {
  registrations: string;
  pricePerReg: string;
  expenses: string;
}

function storageKey(year: number, month: number) {
  return `sps_fin2_${year}_${String(month).padStart(2,'0')}`;
}

function loadData(year: number, month: number): Record<string, SchoolFinancials> {
  try {
    const raw = localStorage.getItem(storageKey(year, month));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveData(year: number, month: number, data: Record<string, SchoolFinancials>) {
  try { localStorage.setItem(storageKey(year, month), JSON.stringify(data)); } catch {}
}

function num(s: string) {
  const n = parseFloat(s.replace(/[$,]/g, ''));
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmt(n: number) {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtSigned(n: number) {
  return (n < 0 ? '-' : '') + fmt(n);
}

const JAVI_PCT = 0.25;

export default function Financials() {
  const { shifts, coaches, schools } = useOutletContext<AppContext>();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const [data, setData] = useState<Record<string, SchoolFinancials>>({});

  useEffect(() => {
    setData(loadData(selectedYear, selectedMonth));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    saveData(selectedYear, selectedMonth, data);
  }, [data, selectedYear, selectedMonth]);

  // Schools that have at least one non-cancelled shift this month
  const monthShifts = shifts.filter(s => {
    if (s.status === 'Cancelled') return false;
    const d = new Date(s.date + 'T12:00:00');
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const activeSchoolIds = [...new Set(monthShifts.map(s => s.schoolId))];
  const activeSchools = schools
    .filter(sc => activeSchoolIds.includes(sc.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const getEntry = (schoolId: string): SchoolFinancials =>
    data[schoolId] ?? { registrations: '', pricePerReg: '', expenses: '' };

  const updateField = (schoolId: string, field: keyof SchoolFinancials, value: string) => {
    setData(prev => ({
      ...prev,
      [schoolId]: { ...getEntry(schoolId), [field]: value },
    }));
  };

  // Per-school calculations
  const rows = activeSchools.map(school => {
    const entry = getEntry(school.id);
    const schoolShifts = monthShifts.filter(s => s.schoolId === school.id);
    const coachCost = schoolShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime) * s.payRate, 0);

    // who coaches this school
    const coachIds = [...new Set(schoolShifts.map(s => s.coachId).filter(Boolean))];
    const coachNames = coachIds.map(id => coaches.find(c => c.id === id)?.name ?? '?').join(', ');

    const regs = num(entry.registrations);
    const price = num(entry.pricePerReg);
    const revenue = regs * price;
    const expenses = num(entry.expenses);
    const profit = revenue - coachCost - expenses;
    const javiCut = profit > 0 ? profit * JAVI_PCT : 0;

    return { school, entry, coachCost, coachNames, revenue, expenses, profit, javiCut };
  });

  // Totals
  const totRevenue   = rows.reduce((s, r) => s + r.revenue, 0);
  const totCoach     = rows.reduce((s, r) => s + r.coachCost, 0);
  const totExpenses  = rows.reduce((s, r) => s + r.expenses, 0);
  const totProfit    = rows.reduce((s, r) => s + r.profit, 0);
  const totJavi      = rows.reduce((s, r) => s + r.javiCut, 0);

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  const inputCls = 'w-full bg-transparent border-0 outline-none text-sm text-right text-slate-900 placeholder:text-slate-300 focus:ring-0';

  return (
    <div>
      <Header
        title="Financials"
        subtitle={`${monthLabel} — per-school revenue, costs & profit`}
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

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Revenue',   value: fmt(totRevenue),  cls: 'text-green-700' },
            { label: 'Coach Costs',     value: fmt(totCoach),    cls: 'text-red-600' },
            { label: 'Other Expenses',  value: fmt(totExpenses), cls: 'text-orange-600' },
            { label: 'Total Profit',    value: fmtSigned(totProfit), cls: totProfit >= 0 ? 'text-emerald-700' : 'text-red-600' },
            { label: "Javi's Cut (25%)", value: fmt(totJavi),   cls: 'text-white' },
          ].map(({ label, value, cls }, i) => (
            <div key={i} className={`rounded-xl border shadow-sm px-4 py-4 ${i === 4 ? 'bg-red-800 border-red-700' : 'bg-white border-slate-200'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${i === 4 ? 'text-red-300' : 'text-slate-500'}`}>{label}</p>
              <p className={`text-xl font-bold ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Per-school table */}
        {activeSchools.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-10 text-center text-slate-400 text-sm">
            No scheduled shifts in {monthLabel}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">School</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Coach(es)</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider w-24">Registrations</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider w-24">$/Reg</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-green-600 uppercase tracking-wider w-24">Revenue</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider w-24">Expenses</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-red-500 uppercase tracking-wider w-24">Coach Cost</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Profit</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-red-700 uppercase tracking-wider w-24">Javi 25%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ school, entry, coachCost, coachNames, revenue, profit, javiCut }) => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 text-sm">{school.name}</td>
                    <td className="px-3 py-3 text-right text-xs text-slate-400">{coachNames}</td>

                    {/* Registrations — editable */}
                    <td className="px-3 py-3">
                      <input
                        value={entry.registrations}
                        onChange={e => updateField(school.id, 'registrations', e.target.value)}
                        placeholder="0"
                        className={inputCls + ' bg-blue-50 rounded px-2 py-1'}
                      />
                    </td>

                    {/* Price per reg — editable */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-0.5 bg-blue-50 rounded px-2 py-1">
                        <span className="text-slate-400 text-xs">$</span>
                        <input
                          value={entry.pricePerReg}
                          onChange={e => updateField(school.id, 'pricePerReg', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </td>

                    {/* Revenue — auto */}
                    <td className="px-3 py-3 text-right font-semibold text-green-700">
                      {revenue > 0 ? fmt(revenue) : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Expenses — editable */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-0.5 bg-blue-50 rounded px-2 py-1">
                        <span className="text-slate-400 text-xs">$</span>
                        <input
                          value={entry.expenses}
                          onChange={e => updateField(school.id, 'expenses', e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </td>

                    {/* Coach cost — auto */}
                    <td className="px-3 py-3 text-right text-red-600 font-medium">{fmt(coachCost)}</td>

                    {/* Profit */}
                    <td className={`px-3 py-3 text-right font-semibold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {revenue > 0 ? fmtSigned(profit) : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Javi 25% */}
                    <td className={`px-3 py-3 text-right font-bold ${javiCut > 0 ? 'text-red-700' : 'text-slate-300'}`}>
                      {javiCut > 0 ? fmt(javiCut) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="bg-slate-900 border-t-2 border-slate-700">
                  <td className="px-4 py-4 font-bold text-white" colSpan={2}>Totals</td>
                  <td className="px-3 py-4" colSpan={2} />
                  <td className="px-3 py-4 text-right font-bold text-green-400">{fmt(totRevenue)}</td>
                  <td className="px-3 py-4 text-right font-bold text-orange-400">{fmt(totExpenses)}</td>
                  <td className="px-3 py-4 text-right font-bold text-red-400">{fmt(totCoach)}</td>
                  <td className={`px-3 py-4 text-right font-bold text-lg ${totProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtSigned(totProfit)}</td>
                  <td className="px-3 py-4 text-right font-bold text-lg text-red-300">{fmt(totJavi)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Javi's total due banner */}
        {totJavi > 0 && (
          <div className="bg-red-800 rounded-xl px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-red-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Total Due for Javi — {monthLabel}</p>
              <p className="text-white text-sm">25% of combined gross profit across all schools</p>
            </div>
            <p className="text-4xl font-bold text-white">{fmt(totJavi)}</p>
          </div>
        )}

      </div>
    </div>
  );
}
