import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import type { Shift, Coach, School, CoachAvailability, AvailabilityStatus } from '../../types';
import { getWeekDates, toISODate, formatDateLabel } from '../../utils';
import { getDayAvailabilityStatus } from '../../utils/availability';
import ShiftCard from './ShiftCard';

// ── Availability display helpers ───────────────────────────────────────────────
const AVAIL_CELL: Record<AvailabilityStatus, string> = {
  unavailable: 'bg-red-50/70',
  tentative:   'bg-amber-50/70',
  preferred:   'bg-green-50/50',
  available:   '',
};

const AVAIL_STRIPE: Record<AvailabilityStatus, string> = {
  unavailable: 'bg-red-300',
  tentative:   'bg-amber-300',
  preferred:   'bg-green-300',
  available:   '',
};

const AVAIL_BADGE: Record<AvailabilityStatus, string> = {
  unavailable: 'bg-red-100 text-red-600',
  tentative:   'bg-amber-100 text-amber-700',
  preferred:   'bg-green-100 text-green-700',
  available:   '',
};

const AVAIL_LABEL: Record<AvailabilityStatus, string> = {
  unavailable: 'Unavailable',
  tentative:   'Tentative',
  preferred:   'Preferred',
  available:   '',
};

// When dragging over a cell, how to highlight it
const AVAIL_OVER: Record<AvailabilityStatus, string> = {
  unavailable: 'bg-red-100 ring-2 ring-inset ring-red-400',
  tentative:   'bg-amber-50 ring-2 ring-inset ring-amber-400',
  preferred:   'bg-green-50 ring-2 ring-inset ring-green-400',
  available:   'bg-red-50 ring-1 ring-inset ring-red-300',
};

// ── Droppable cell ─────────────────────────────────────────────────────────────
function DroppableCell({
  id, children, isToday, availStatus,
}: {
  id: string;
  children: React.ReactNode;
  isToday: boolean;
  availStatus: AvailabilityStatus | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const baseClass = availStatus ? AVAIL_CELL[availStatus] : '';
  const overClass = isOver
    ? (availStatus ? AVAIL_OVER[availStatus] : 'bg-red-50 ring-1 ring-inset ring-red-300')
    : '';

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'p-1.5 border-r border-slate-100 last:border-r-0 min-h-[80px] space-y-1 transition-colors relative',
        isToday && !availStatus && 'bg-blue-50/40',
        !isOver && baseClass,
        isOver && overClass,
      )}
    >
      {/* Availability stripe at top of cell */}
      {availStatus && availStatus !== 'available' && !isOver && (
        <div className={clsx('absolute top-0 left-0 right-0 h-0.5', AVAIL_STRIPE[availStatus])} />
      )}

      {children}
    </div>
  );
}

// ── Draggable shift wrapper ────────────────────────────────────────────────────
function DraggableShift({
  shift, coach, school, onEdit, onDelete, activeShiftId,
}: {
  shift: Shift;
  coach?: Coach;
  school?: School;
  onEdit: (s: Shift) => void;
  onDelete: (id: string) => void;
  activeShiftId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: { shift },
  });

  const style = isDragging ? undefined : { transform: CSS.Transform.toString(transform) };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <ShiftCard
        shift={shift}
        coach={coach}
        school={school}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging || activeShiftId === shift.id}
      />
    </div>
  );
}

// ── Main grid ──────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleGridProps {
  shifts: Shift[];
  coaches: Coach[];
  schools: School[];
  weekStart: Date;
  availability: CoachAvailability[];
  onEdit: (shift: Shift) => void;
  onDelete: (id: string) => void;
  onAddShift: (date: string, coachId?: string) => void;
  onShiftDrop: (shiftId: string, newCoachId: string | null, newDate: string) => void;
}

export default function ScheduleGrid({
  shifts, coaches, schools, weekStart, availability,
  onEdit, onDelete, onAddShift, onShiftDrop,
}: ScheduleGridProps) {
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const weekDates = getWeekDates(weekStart);
  const today = toISODate(new Date());

  const getSchool = (id: string) => schools.find(s => s.id === id);
  const getCoach  = (id: string | null) => coaches.find(c => c.id === id);

  const shiftsByDate = weekDates.reduce<Record<string, Shift[]>>((acc, date) => {
    const key = toISODate(date);
    acc[key] = shifts
      .filter(s => s.date === key)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const activeShift = activeShiftId ? shifts.find(s => s.id === activeShiftId) ?? null : null;
  const activeCoaches = coaches.filter(c => c.active);

  const handleDragStart = ({ active }: DragStartEvent) => setActiveShiftId(active.id as string);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveShiftId(null);
    if (!over) return;
    const shiftId = active.id as string;
    const [targetCoachId, targetDate] = (over.id as string).split('::');
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    const newCoachId = targetCoachId === 'unassigned' ? null : targetCoachId;
    if (newCoachId === shift.coachId && targetDate === shift.date) return;
    onShiftDrop(shiftId, newCoachId, targetDate);
  };

  const handleDragCancel = () => setActiveShiftId(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header row */}
          <div
            className="grid gap-0 border-b border-slate-200 bg-white sticky top-0 z-10"
            style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}
          >
            <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
              Coach
            </div>
            {weekDates.map((date, i) => {
              const { date: dateStr } = formatDateLabel(date);
              const iso = toISODate(date);
              const isToday = iso === today;
              return (
                <div
                  key={iso}
                  className={clsx(
                    'px-3 py-3 text-center border-r border-slate-200 last:border-r-0',
                    isToday && 'bg-blue-50',
                  )}
                >
                  <p className={clsx('text-xs font-semibold uppercase tracking-wider', isToday ? 'text-blue-600' : 'text-slate-500')}>
                    {DAY_LABELS[i]}
                  </p>
                  <p className={clsx('text-sm font-bold mt-0.5', isToday ? 'text-blue-700' : 'text-slate-800')}>
                    {dateStr}
                  </p>
                  {isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-1" />}
                </div>
              );
            })}
          </div>

          {/* Availability legend */}
          <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-4 text-xs text-slate-500">
            <span className="font-medium">Availability:</span>
            {[
              { color: 'bg-red-300',    label: 'Unavailable' },
              { color: 'bg-amber-300',  label: 'Tentative' },
              { color: 'bg-green-300',  label: 'Preferred' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={clsx('inline-block w-3 h-1.5 rounded-full', color)} />
                {label}
              </span>
            ))}
          </div>

          {/* Coach rows */}
          {activeCoaches.map((coach, coachIdx) => (
            <div
              key={coach.id}
              className={clsx(
                'grid gap-0 border-b border-slate-100 group',
                coachIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30',
              )}
              style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}
            >
              {/* Coach name */}
              <div className="px-4 py-3 border-r border-slate-200 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-800 font-bold text-xs flex-shrink-0 mt-0.5">
                  {coach.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{coach.name}</p>
                  <p className="text-xs text-slate-400 truncate">{coach.sports[0]}</p>
                </div>
              </div>

              {/* Day cells */}
              {weekDates.map(date => {
                const iso = toISODate(date);
                const isToday = iso === today;
                const cellId = `${coach.id}::${iso}`;
                const dayShifts = (shiftsByDate[iso] || []).filter(s => s.coachId === coach.id);
                const availStatus = getDayAvailabilityStatus(coach.id, iso, availability);

                return (
                  <DroppableCell key={iso} id={cellId} isToday={isToday} availStatus={availStatus}>
                    {/* Availability badge when cell is empty */}
                    {dayShifts.length === 0 && availStatus && availStatus !== 'available' && (
                      <div className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium w-fit mt-1', AVAIL_BADGE[availStatus])}>
                        {AVAIL_LABEL[availStatus]}
                      </div>
                    )}

                    {dayShifts.map(shift => (
                      <DraggableShift
                        key={shift.id}
                        shift={shift}
                        coach={getCoach(shift.coachId)}
                        school={getSchool(shift.schoolId)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        activeShiftId={activeShiftId}
                      />
                    ))}

                    {dayShifts.length === 0 && (
                      <button
                        onClick={() => onAddShift(iso, coach.id)}
                        className="w-full h-full min-h-[48px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-xs text-slate-400">+ Add</span>
                      </button>
                    )}
                  </DroppableCell>
                );
              })}
            </div>
          ))}

          {/* Unassigned row */}
          {(() => {
            const hasUnassigned = weekDates.some(d => (shiftsByDate[toISODate(d)] || []).some(s => !s.coachId));
            if (!hasUnassigned) return null;
            return (
              <div
                className="grid gap-0 border-b border-red-100 bg-red-50/20"
                style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}
              >
                <div className="px-4 py-3 border-r border-slate-200 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs flex-shrink-0">
                    ?
                  </div>
                  <p className="text-sm font-medium text-red-700">Unassigned</p>
                </div>
                {weekDates.map(date => {
                  const iso = toISODate(date);
                  const isToday = iso === today;
                  const cellId = `unassigned::${iso}`;
                  const dayShifts = (shiftsByDate[iso] || []).filter(s => !s.coachId);
                  return (
                    <DroppableCell key={iso} id={cellId} isToday={isToday} availStatus={null}>
                      {dayShifts.map(shift => (
                        <DraggableShift
                          key={shift.id}
                          shift={shift}
                          coach={undefined}
                          school={getSchool(shift.schoolId)}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          activeShiftId={activeShiftId}
                        />
                      ))}
                    </DroppableCell>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeShift ? (
          <ShiftCard
            shift={activeShift}
            coach={getCoach(activeShift.coachId)}
            school={getSchool(activeShift.schoolId)}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
