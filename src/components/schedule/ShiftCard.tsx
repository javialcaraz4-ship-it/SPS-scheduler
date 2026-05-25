import { Clock, MapPin, Edit2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { Shift, Coach, School } from '../../types';
import { SPORT_COLORS, formatTime } from '../../utils';

interface ShiftCardProps {
  shift: Shift;
  coach?: Coach;
  school?: School;
  onEdit?: (shift: Shift) => void;
  onDelete?: (id: string) => void;
  /** When true the card is rendered inside the DragOverlay — no interactive buttons */
  isOverlay?: boolean;
  /** When true the original card is being dragged — show as placeholder */
  isDragging?: boolean;
}

export default function ShiftCard({
  shift, coach, school, onEdit, onDelete, isOverlay, isDragging,
}: ShiftCardProps) {
  const colors = SPORT_COLORS[shift.sport];
  const isUnassigned = !shift.coachId;

  return (
    <div
      className={clsx(
        'group relative rounded-lg border px-2.5 py-2 text-xs transition-all select-none',
        colors.bg, colors.border,
        isUnassigned && 'ring-2 ring-red-400 ring-offset-1',
        isOverlay  && 'shadow-2xl rotate-1 scale-105 cursor-grabbing opacity-95',
        isDragging && 'opacity-30 pointer-events-none',
        !isOverlay && !isDragging && 'cursor-grab hover:shadow-md',
      )}
    >
      {/* Edit/delete — hidden when dragging or in overlay */}
      {onEdit && onDelete && !isOverlay && !isDragging && (
        <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-1 z-10">
          <button
            onClick={e => { e.stopPropagation(); onEdit(shift); }}
            className="p-1 bg-white rounded shadow hover:bg-slate-100 transition-colors"
          >
            <Edit2 size={10} className="text-slate-600" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(shift.id); }}
            className="p-1 bg-white rounded shadow hover:bg-red-50 transition-colors"
          >
            <Trash2 size={10} className="text-red-500" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 mb-1">
        <Clock size={10} className={colors.text} />
        <span className={clsx('font-semibold', colors.text)}>
          {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-0.5">
        <MapPin size={10} className="text-slate-500 flex-shrink-0" />
        <span className="font-medium text-slate-800 truncate">{school?.name}</span>
      </div>

      <p className={clsx('font-medium truncate', colors.text)}>{shift.sport}</p>

      <div className="mt-1 pt-1 border-t border-current border-opacity-20">
        {isUnassigned ? (
          <p className="text-red-700 font-semibold">⚠ Needs Coach</p>
        ) : (
          <p className="text-slate-600 truncate">{coach?.name}</p>
        )}
      </div>
    </div>
  );
}
