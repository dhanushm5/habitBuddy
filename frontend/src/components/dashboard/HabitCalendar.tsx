import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Habit } from '../../types';

interface HabitCalendarProps {
  habits: Habit[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function HabitCalendar({ habits, selectedDate, onDateChange }: HabitCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(currentMonth - 1);
    newDate.setHours(0, 0, 0, 0);
    onDateChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(currentMonth + 1);
    newDate.setHours(0, 0, 0, 0);
    onDateChange(newDate);
  };

  const getCompletionRate = (date: Date) => {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const dayOfWeek = date.getDay();

    // Only count habits that were created on or before this date
    const scheduledHabits = habits.filter(habit => {
      // Check if habit is scheduled for this day of week
      if (!habit.frequencyDays.includes(dayOfWeek)) return false;
      
      // Check if habit was created before or on this date
      if (habit.startDate) {
        const habitStartDate = new Date(habit.startDate);
        habitStartDate.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        if (date < habitStartDate) return false;
      }
      
      return true;
    });

    if (scheduledHabits.length === 0) return null;

    const completedCount = scheduledHabits.filter(habit =>
      habit.completedDates.includes(dateString)
    ).length;

    return completedCount / scheduledHabits.length;
  };

  const getDayColor = (rate: number | null) => {
    if (rate === null) return 'bg-gray-50';
    if (rate === 1) return 'bg-gradient-to-br from-emerald-400 to-emerald-500';
    if (rate >= 0.75) return 'bg-gradient-to-br from-emerald-300 to-emerald-400';
    if (rate >= 0.5) return 'bg-gradient-to-br from-blue-300 to-blue-400';
    if (rate >= 0.25) return 'bg-gradient-to-br from-blue-200 to-blue-300';
    return 'bg-gradient-to-br from-gray-200 to-gray-300';
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const completionRate = getCompletionRate(date);

    // Use date components for comparison to avoid timezone issues
    const isToday = currentYear === today.getFullYear() && 
                    currentMonth === today.getMonth() && 
                    day === today.getDate();
    const isSelected = currentYear === selectedDate.getFullYear() && 
                       currentMonth === selectedDate.getMonth() && 
                       day === selectedDate.getDate();

    days.push(
      <button
        key={day}
        onClick={() => {
          const newDate = new Date(currentYear, currentMonth, day);
          newDate.setHours(0, 0, 0, 0);
          onDateChange(newDate);
        }}
        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
          getDayColor(completionRate)
        } ${
          isSelected
            ? 'ring-4 ring-blue-500 ring-opacity-50 scale-110 shadow-lg'
            : 'hover:scale-105 hover:shadow-md'
        } ${
          isToday && !isSelected
            ? 'ring-2 ring-blue-400'
            : ''
        } ${
          completionRate !== null && completionRate > 0
            ? 'text-white'
            : 'text-gray-700'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900">
          {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Completion Rate</h4>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-gray-600">0%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <span className="text-gray-600">25%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span className="text-gray-600">50%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-emerald-400 rounded"></div>
            <span className="text-gray-600">75%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-gray-600">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
