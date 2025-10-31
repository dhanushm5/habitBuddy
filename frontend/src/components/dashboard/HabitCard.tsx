import { Check, Edit2, Trash2, BarChart3 } from 'lucide-react';
import type { Habit } from '../../types';

interface HabitCardProps {
  habit: Habit;
  date: Date;
  onToggleComplete: (habit: Habit, date: Date) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onViewStats: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  date,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewStats,
}: HabitCardProps) {
  // Use local date components to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = String(today.getDate()).padStart(2, '0');
  const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
  
  const isToday = dateString === todayString;
  const isCompleted = habit.completedDates.includes(dateString);

  return (
    <div
      className="group bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
      style={{ borderLeftWidth: '4px', borderLeftColor: habit.color || '#3B82F6' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => onToggleComplete(habit, date)}
            disabled={!isToday}
            className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
              !isToday
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                : isCompleted
                ? 'bg-gradient-to-br from-blue-500 to-emerald-500 border-transparent'
                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
            }`}
            title={!isToday ? 'You can only complete habits for today' : ''}
          >
            {isCompleted && <Check className="w-6 h-6 text-white" />}
          </button>

          <div className="flex-1">
            <h4
              className={`font-semibold text-lg ${
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {habit.name}
            </h4>
            {habit.reminderTime && (
              <p className="text-sm text-gray-500">Reminder at {habit.reminderTime}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onViewStats(habit)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="View stats"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => onEdit(habit)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit habit"
          >
            <Edit2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this habit?')) {
                onDelete(habit._id);
              }
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
