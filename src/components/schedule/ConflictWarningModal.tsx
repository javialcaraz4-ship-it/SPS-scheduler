import { AlertTriangle, AlertOctagon, Clock, UserX, Tag, X } from 'lucide-react';
import type { ShiftConflict } from '../../utils/conflicts';
import clsx from 'clsx';

interface ConflictWarningModalProps {
  conflicts: ShiftConflict[];
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFLICT_STYLES: Record<ShiftConflict['type'], {
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  unavailable:   { icon: AlertOctagon, color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
  tentative:     { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  overlap:       { icon: Clock,         color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  inactive:      { icon: UserX,         color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200' },
  sport_mismatch:{ icon: Tag,           color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

const hasBlocker = (conflicts: ShiftConflict[]) =>
  conflicts.some(c => c.type === 'unavailable' || c.type === 'overlap' || c.type === 'inactive');

export default function ConflictWarningModal({ conflicts, onConfirm, onCancel }: ConflictWarningModalProps) {
  const isStrict = hasBlocker(conflicts);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center', isStrict ? 'bg-red-100' : 'bg-amber-100')}>
              <AlertTriangle size={16} className={isStrict ? 'text-red-600' : 'text-amber-600'} />
            </div>
            <h3 className="font-semibold text-slate-900">Scheduling Conflict</h3>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-600">
            {conflicts.length === 1 ? 'The following issue was detected:' : 'The following issues were detected:'}
          </p>

          <div className="space-y-2">
            {conflicts.map((conflict, i) => {
              const style = CONFLICT_STYLES[conflict.type];
              const Icon = style.icon;
              return (
                <div key={i} className={clsx('flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-sm', style.bg)}>
                  <Icon size={15} className={clsx('flex-shrink-0 mt-0.5', style.color)} />
                  <span className="text-slate-800">{conflict.message}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 pt-1">
            You can still schedule this shift by choosing "Schedule Anyway".
          </p>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors',
              isStrict ? 'bg-red-700 hover:bg-red-800' : 'bg-amber-600 hover:bg-amber-700',
            )}
          >
            Schedule Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
