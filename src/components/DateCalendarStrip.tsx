import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  formatLocalYYYYMMDD,
  getDateMeta,
  getRecentDateList,
  shiftDateString,
} from '../utils/dateUtils';

interface DateCalendarStripProps {
  selectedDate: string;
  todayStr: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DateCalendarStrip({
  selectedDate,
  todayStr,
  onSelectDate,
}: DateCalendarStripProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [viewMonth, setViewMonth] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return { year: y, month: m - 1 };
  });

  const stripDates = useMemo(() => {
    const recent = getRecentDateList(todayStr, 14);
    if (!recent.includes(selectedDate)) {
      return [selectedDate, ...recent];
    }
    return recent;
  }, [todayStr, selectedDate]);

  const openCalendar = () => {
    const [y, m] = selectedDate.split('-').map(Number);
    setViewMonth({ year: y, month: m - 1 });
    setCalendarOpen(true);
  };

  const monthDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const startWeekday = firstDay.getDay();
    const totalDays = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();

    const cells: Array<{ dateStr: string | null; dayNum: number | null }> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ dateStr: null, dayNum: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = formatLocalYYYYMMDD(new Date(viewMonth.year, viewMonth.month, d));
      cells.push({ dateStr, dayNum: d });
    }
    return cells;
  }, [viewMonth]);

  const monthTitle = useMemo(() => {
    return new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [viewMonth]);

  const [todayY, todayM] = todayStr.split('-').map(Number);
  const canGoNextMonth =
    viewMonth.year < todayY || (viewMonth.year === todayY && viewMonth.month < todayM - 1);

  const goPrevMonth = () => {
    setViewMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goNextMonth = () => {
    if (!canGoNextMonth) return;
    setViewMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const pickDateFromModal = (dateStr: string) => {
    onSelectDate(dateStr);
    setCalendarOpen(false);
  };

  return (
    <section aria-label="Date selector" className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 min-w-max">
            {stripDates.map((dateStr) => {
              const meta = getDateMeta(dateStr, todayStr);
              const isSelected = dateStr === selectedDate;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  aria-pressed={isSelected}
                  className={`min-h-[48px] px-3.5 py-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8] ${
                    isSelected
                      ? 'bg-[#0B6E4F] text-white dark:bg-[#5FD4A8] dark:text-[#072118] shadow-[0_2px_8px_rgba(11,110,79,0.24)] dark:shadow-none'
                      : 'bg-white dark:bg-[#161D1B] text-[#2A3834] dark:text-[#CBD7D3] border border-black/[0.07] dark:border-white/[0.08] hover:border-[#0B6E4F]/40 dark:hover:border-[#5FD4A8]/40'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold leading-none ${
                      isSelected
                        ? 'text-white/90 dark:text-[#072118]/85'
                        : 'text-[#5A6C66] dark:text-[#8A9D97]'
                    }`}
                  >
                    {meta.shortChipTop}
                  </span>
                  <span className="text-[13px] font-bold leading-tight mt-1">
                    {meta.shortChipBottom}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated Calendar Jump Button */}
        <button
          type="button"
          onClick={openCalendar}
          aria-label="Jump to specific date"
          title="Jump to specific date"
          className="min-h-[48px] min-w-[48px] px-3 rounded-2xl flex items-center justify-center gap-2 bg-white dark:bg-[#161D1B] text-[#0B6E4F] dark:text-[#5FD4A8] border border-black/[0.08] dark:border-white/[0.10] hover:bg-[#EEF4F1] dark:hover:bg-[#1E2A26] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6E4F] dark:focus-visible:outline-[#5FD4A8]"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
            Pick Date
          </span>
        </button>
      </div>

      {/* Material 3 Date Picker Modal */}
      {calendarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose news date"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#161D1B] border border-black/[0.08] dark:border-white/[0.10] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#0E1715] dark:text-[#F1F6F4]">
                  Jump to Date
                </h2>
                <p className="text-xs text-[#5A6C66] dark:text-[#8A9D97] mt-0.5">
                  Load news digest for any past or current day
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                aria-label="Close calendar"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#4C5C57] dark:text-[#98ABA5] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Jump Buttons */}
            <div className="flex items-center gap-2 mb-4">
              {[
                { label: 'Today', date: todayStr },
                { label: 'Yesterday', date: shiftDateString(todayStr, -1) },
                { label: 'Last Week', date: shiftDateString(todayStr, -7) },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => pickDateFromModal(preset.date)}
                  className={`flex-1 min-h-[40px] px-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedDate === preset.date
                      ? 'bg-[#0B6E4F] text-white dark:bg-[#5FD4A8] dark:text-[#072118]'
                      : 'bg-[#EEF4F1] dark:bg-[#1E2A26] text-[#1D352D] dark:text-[#D5E6DF] hover:bg-[#E1ECE6] dark:hover:bg-[#273832]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goPrevMonth}
                aria-label="Previous month"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#2A3834] dark:text-[#D9E5E0] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-display text-sm font-bold text-[#0E1715] dark:text-[#F1F6F4]">
                {monthTitle}
              </span>
              <button
                type="button"
                onClick={goNextMonth}
                disabled={!canGoNextMonth}
                aria-label="Next month"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#2A3834] dark:text-[#D9E5E0] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
              {WEEKDAYS.map((w) => (
                <span
                  key={w}
                  className="text-[11px] font-semibold text-[#5A6C66] dark:text-[#8A9D97] py-1"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1 tabular-nums">
              {monthDays.map((cell, idx) => {
                if (!cell.dateStr || cell.dayNum === null) {
                  return <div key={`empty-${idx}`} className="h-10" />;
                }
                const isFuture = cell.dateStr > todayStr;
                const isSelected = cell.dateStr === selectedDate;
                const isTodayCell = cell.dateStr === todayStr;

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    disabled={isFuture}
                    onClick={() => pickDateFromModal(cell.dateStr!)}
                    className={`h-10 rounded-full text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-[#0B6E4F] text-white dark:bg-[#5FD4A8] dark:text-[#072118]'
                        : isTodayCell
                        ? 'border border-[#0B6E4F] dark:border-[#5FD4A8] text-[#0B6E4F] dark:text-[#5FD4A8] hover:bg-[#EEF4F1] dark:hover:bg-[#1E2A26]'
                        : 'text-[#182320] dark:text-[#E2EBE8] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {cell.dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
