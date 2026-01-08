'use client';

import { useState, useEffect } from 'react';

interface CalendarProps {
  onDateSelect: (date: string | null) => void;
  selectedDate: string | null;
}

export default function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEntryDates();
  }, []);

  const fetchEntryDates = async () => {
    try {
      const response = await fetch('/api/diary/dates');
      if (response.ok) {
        const data = await response.json();
        setEntryDates(new Set(data.dates || []));
      }
    } catch (error) {
      console.error('Failed to fetch entry dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    return { year, month, startDayOfWeek, daysInMonth };
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const { year, month } = getMonthData(currentDate);
    const dateKey = formatDateKey(year, month, day);

    if (selectedDate === dateKey) {
      onDateSelect(null); // Deselect if clicking the same date
    } else {
      onDateSelect(dateKey);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect(null);
  };

  const { year, month, startDayOfWeek, daysInMonth } = getMonthData(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
  const today = new Date().getDate();

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-rose-100/50 shadow-lg shadow-rose-200/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-rose-100 rounded-xl transition-colors duration-200 text-rose-600 hover:text-rose-700 disabled:opacity-30"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[month]} {year}
          </h3>
          {isCurrentMonth && (
            <button
              onClick={goToToday}
              className="text-xs text-rose-600 hover:text-rose-700 mt-1 hover:underline"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-rose-100 rounded-xl transition-colors duration-200 text-rose-600 hover:text-rose-700 disabled:opacity-30"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dateKey = formatDateKey(year, month, day);
          const hasEntry = entryDates.has(dateKey);
          const isSelected = selectedDate === dateKey;
          const isToday = isCurrentMonth && day === today;

          return (
            <button
              key={day}
              onClick={() => hasEntry && handleDateClick(day)}
              disabled={!hasEntry}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm
                transition-all duration-200 relative
                ${hasEntry
                  ? 'cursor-pointer hover:bg-rose-100/70'
                  : 'cursor-default text-gray-300'
                }
                ${isSelected
                  ? 'bg-gradient-to-br from-rose-400 to-pink-400 text-white font-semibold shadow-md'
                  : ''
                }
                ${isToday && !isSelected
                  ? 'border-2 border-rose-300'
                  : ''
                }
              `}
              aria-label={`Day ${day}${hasEntry ? ' (has entries)' : ''}`}
              aria-pressed={isSelected}
            >
              <span className={hasEntry ? 'text-gray-700' : ''}>{day}</span>

              {/* Entry indicator dot */}
              {hasEntry && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-rose-400"></div>
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Loading entries...
        </div>
      )}

      {/* Legend */}
      {!isLoading && (
        <div className="mt-4 pt-4 border-t border-rose-100/50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <span>Has entries</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded border-2 border-rose-300"></div>
              <span>Today</span>
            </div>
            {selectedDate && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-400 to-pink-400"></div>
                <span>Selected</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
