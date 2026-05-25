import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, MapPin, Clock, X, Calendar, CalendarClock } from 'lucide-react';
import clsx from 'clsx';
import type { Coach, School, Shift, CoachAvailability } from '../types';
import { SPORT_COLORS, STATUS_COLORS, formatTime, getWeekDates, toISODate } from '../utils';
import CoachAvailabilityPanel from '../components/availability/CoachAvailabilityPanel';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CoachScheduleViewProps {
  coachId: string;
  shifts: Shift[];
  coaches: Coach[];
  schools: School[];
  availability: CoachAvailability[];
  updateShift: (s: Shift) => void;
  addAvailability: (a: CoachAvailability) => void;
  updateAvailability: (a: CoachAvailability) => void;
  deleteAvailability: (id: string) => void;
  allowActions?: boolean;
  isAdminPreview?: boolean;
}

export default function CoachScheduleView({
  coachId, shifts, coaches, schools, availability,
  updateShift, addAvailability, updateAvailability, deleteAvailability,
  allowActions = true, isAdminPreview = false,
}: CoachScheduleViewProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability'>('schedule');
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekDates()[0]);
  const [reportingShift, setReportingShift] = useState<Shift | null>(null);
  const [issueText, setIssueText] = useState('');
  const [confirmFlash, setConfirmFlash] = useState<string | null>(null);

  const coach = coaches.find(c => c.id === coachId);
  const weekDates = getWeekDates(weekStart);
  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday  = () => setWeekStart(getWeekDates()[0]);

  const weekDateSet = new Set(weekDates.map(toISODate));
  const myShifts = shifts
    .filter(s => s.coachId === coachId && weekDateSet.has(s.date))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const getSchool = (id: string) => schools.find(s => s.id === id);
  const today = toISODate(new Date());

  const handleConfirm = (shift: Shift) => {
    updateShift({ ...shift, status: 'Confirmed' });
    setConfirmFlash(shift.id);
    setTimeout(() => setConfirmFlash(null), 2000);
  };

  const handleOpenReport = (shift: Shift) => {
    setReportingShift(shift);
    setIssueText('');
  };

  const handleSubmitIssue = () => {
    if (!reportingShift) return;
    updateShift({ ...reportingShift, status: 'Issue Reported', issueNote: issueText.trim() });
    setReportingShift(null);
    setIssueText('');
  };

  const byDay = weekDates.map((date, i) => {
    const iso = toISODate(date);
    return {
      iso,
      label: DAY_NAMES[i],
      dateStr: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: iso === today,
      dayShifts: myShifts.filter(s => s.date === iso),
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Coach greeting */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {coach?.name.split(' ').map(n => n[0]).join('') ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAdminPreview ? `Previewing: ${coach?.name}` : 'My Schedule'}
          </h1>
          <p className="text-sm text-slate-500">
            {coach?.name}
            {coach?.sports?.length ? ` · ${coach.sports.join(', ')}` : ''}
          </p>
        </div>
        {isAdminPreview && (
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
            Admin Preview
          </span>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setActiveTab('schedule')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors',
            activeTab === 'schedule' ? 'bg-white text-red-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Calendar size={14} /> My Schedule
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors',
            activeTab === 'availability' ? 'bg-white text-red-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <CalendarClock size={14} /> My Availability
        </button>
      </div>

      {/* ── Schedule Tab ── */}
      {activeTab === 'schedule' && (
        <>
          {/* Week nav */}
          <div className="flex items-center justify-between mb-5 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <button onClick={prevWeek} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">{weekLabel}</p>
              <button onClick={goToday} className="text-xs text-red-800 hover:underline mt-0.5">Jump to today</button>
            </div>
            <button onClick={nextWeek} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-5">
            {byDay.map(({ iso, label, dateStr, shortDate, isToday, dayShifts }) => {
              if (dayShifts.length === 0 && !isToday) return null;
              return (
                <div key={iso}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={clsx(
                      'w-9 h-9 rounded-full flex flex-col items-center justify-center text-center flex-shrink-0',
                      isToday ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600',
                    )}>
                      <span className="text-[10px] font-semibold leading-none">{label}</span>
                      <span className="text-xs font-bold leading-tight">{shortDate.split(' ')[1]}</span>
                    </div>
                    <span className={clsx('text-sm font-semibold', isToday ? 'text-red-800' : 'text-slate-700')}>
                      {dateStr}{isToday && ' · Today'}
                    </span>
                  </div>

                  {dayShifts.length === 0 ? (
                    <div className="ml-11 bg-white rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                      No shifts today
                    </div>
                  ) : (
                    <div className="ml-11 space-y-3">
                      {dayShifts.map(shift => {
                        const school = getSchool(shift.schoolId);
                        const colors = SPORT_COLORS[shift.sport];
                        const isConfirmed = shift.status === 'Confirmed' || shift.status === 'Completed';
                        const isReported = shift.status === 'Issue Reported' || shift.status === 'Needs Coverage';
                        const justConfirmed = confirmFlash === shift.id;

                        return (
                          <div
                            key={shift.id}
                            className={clsx(
                              'bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
                              isToday ? 'border-red-200' : 'border-slate-200',
                              justConfirmed && 'ring-2 ring-green-400',
                            )}
                          >
                            <div className={clsx('h-1.5 w-full', colors.bg.replace('-100', '-400'))} />
                            <div className="px-4 py-3.5 space-y-2">
                              {/* School + status */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                                    <span className="font-semibold text-slate-900 truncate">{school?.name}</span>
                                  </div>
                                  {school?.address && (
                                    <p className="text-xs text-slate-400 pl-[18px]">{school.address}</p>
                                  )}
                                </div>
                                <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0', STATUS_COLORS[shift.status])}>
                                  {shift.status}
                                </span>
                              </div>

                              {/* Sport + time */}
                              <div className="flex items-center justify-between">
                                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', colors.bg, colors.text)}>
                                  {shift.sport}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                  <Clock size={13} className="text-slate-400" />
                                  <span className="font-medium">
                                    {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                                  </span>
                                </div>
                              </div>

                              {/* Logistics */}
                              {(school?.fieldLocation || school?.coachInstructions) && (
                                <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-2 space-y-1">
                                  {school.fieldLocation && (
                                    <p><span className="font-medium">Field:</span> {school.fieldLocation}</p>
                                  )}
                                  {school.coachInstructions && (
                                    <p><span className="font-medium">Instructions:</span> {school.coachInstructions}</p>
                                  )}
                                  {school.parkingNotes && (
                                    <p><span className="font-medium">Parking:</span> {school.parkingNotes}</p>
                                  )}
                                </div>
                              )}

                              {/* Notes */}
                              {shift.notes && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-2 italic">
                                  {shift.notes}
                                </p>
                              )}

                              {/* Issue note */}
                              {shift.issueNote && (
                                <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-2.5 py-2">
                                  <span className="font-semibold">Issue reported:</span> {shift.issueNote}
                                </div>
                              )}

                              {justConfirmed && (
                                <p className="text-xs text-green-600 font-semibold text-center">✓ Shift confirmed!</p>
                              )}

                              {allowActions && (
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => handleConfirm(shift)}
                                    disabled={isConfirmed}
                                    className={clsx(
                                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors',
                                      isConfirmed
                                        ? 'bg-green-50 text-green-600 cursor-default'
                                        : 'bg-green-600 text-white hover:bg-green-700',
                                    )}
                                  >
                                    <CheckCircle size={13} />
                                    {isConfirmed ? (shift.status === 'Completed' ? 'Completed' : 'Confirmed') : 'Confirm Shift'}
                                  </button>
                                  <button
                                    onClick={() => handleOpenReport(shift)}
                                    disabled={isReported}
                                    className={clsx(
                                      'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors',
                                      isReported
                                        ? 'border-red-200 bg-red-50 text-red-600 cursor-default'
                                        : 'border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700',
                                    )}
                                  >
                                    <AlertCircle size={13} />
                                    {isReported ? 'Reported' : 'Report Issue'}
                                  </button>
                                </div>
                              )}

                              {!allowActions && isAdminPreview && (
                                <div className="flex gap-2 pt-1 opacity-40 pointer-events-none">
                                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                                    <CheckCircle size={13} /> Confirm Shift
                                  </div>
                                  <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500">
                                    <AlertCircle size={13} /> Report Issue
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {myShifts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg font-medium">No shifts this week</p>
                <p className="text-sm mt-1">Check back later or contact your manager.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Availability Tab ── */}
      {activeTab === 'availability' && (
        <CoachAvailabilityPanel
          coachId={coachId}
          coachName={coach?.name ?? ''}
          availability={availability}
          addAvailability={addAvailability}
          updateAvailability={updateAvailability}
          deleteAvailability={deleteAvailability}
          readonly={isAdminPreview && !allowActions}
        />
      )}

      {/* Report Issue modal */}
      {reportingShift && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Report Shift Issue</h3>
              <button onClick={() => setReportingShift(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const s = getSchool(reportingShift.schoolId);
                return (
                  <p className="text-sm text-slate-500">
                    {s?.name} · {reportingShift.sport} · {formatTime(reportingShift.startTime)}
                  </p>
                );
              })()}
              <textarea
                value={issueText}
                onChange={e => setIssueText(e.target.value)}
                placeholder="Describe the issue (e.g. can't make it, equipment needed, location change)…"
                rows={3}
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-700"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setReportingShift(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitIssue}
                  disabled={!issueText.trim()}
                  className={clsx(
                    'flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    issueText.trim()
                      ? 'bg-red-800 text-white hover:bg-red-900'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                  )}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
