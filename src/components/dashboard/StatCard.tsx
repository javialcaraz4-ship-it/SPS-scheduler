import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'red' | 'green' | 'orange' | 'blue';
  sub?: string;
}

const colorMap = {
  red:    { icon: 'bg-red-100 text-red-700',     border: 'border-red-100' },
  green:  { icon: 'bg-green-100 text-green-600', border: 'border-green-100' },
  orange: { icon: 'bg-orange-100 text-orange-600',border: 'border-orange-100' },
  blue:   { icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-100' },
};

export default function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx('bg-white rounded-xl p-5 border', c.border, 'shadow-sm')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={clsx('p-3 rounded-xl', c.icon)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
