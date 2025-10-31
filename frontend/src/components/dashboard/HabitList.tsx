import type { Habit } from '../../types';
import { HabitCard } from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  selectedDate: Date;
  onToggleComplete: (habit: Habit, date: Date) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onViewStats: (habit: Habit) => void;
}

export function HabitList({
  habits,
  selectedDate,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewStats,
}: HabitListProps) {
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isHabitScheduledForDate = (habit: Habit, date: Date) => {
    const dayOfWeek = date.getDay();
    return habit.frequencyDays.includes(dayOfWeek);
  };

  const scheduledHabits = habits.filter(habit => isHabitScheduledForDate(habit, selectedDate));

  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full mx-auto flex items-center justify-center">
            <span className="text-4xl">🎯</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No habits yet</h3>
          <p className="text-gray-600">
            Start building better habits by creating your first one!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {getDayName(selectedDate)}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{scheduledHabits.length}</p>
            <p className="text-sm text-gray-600">habits today</p>
          </div>
        </div>

        {scheduledHabits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No habits scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledHabits.map(habit => (
              <HabitCard
                key={habit._id}
                habit={habit}
                date={selectedDate}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewStats={onViewStats}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
