import { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, Target, Flame } from 'lucide-react';
import { api } from '../../services/api';
import type { Habit, HabitStats } from '../../types';

interface StatsModalProps {
  habit: Habit;
  onClose: () => void;
}

export function StatsModal({ habit, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [habit._id]);

  const loadStats = async () => {
    try {
      const data = await api.getHabitStats(habit._id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Let's start building!";
    if (streak === 1) return 'Great start!';
    if (streak < 7) return 'Keep going!';
    if (streak < 30) return 'Amazing progress!';
    return "You're on fire!";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in slide-in-from-bottom-4 duration-300">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: habit.color }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{habit.name}</h2>
              <p className="text-sm text-gray-600">Statistics & Progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Flame className="w-5 h-5" />
                    <span className="text-sm font-medium">Current Streak</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-900">
                    {stats.currentStreak}
                  </div>
                  <p className="text-sm text-blue-700">
                    {getStreakMessage(stats.currentStreak)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Longest Streak</span>
                  </div>
                  <div className="text-4xl font-bold text-emerald-900">
                    {stats.longestStreak}
                  </div>
                  <p className="text-sm text-emerald-700">
                    Personal best
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-orange-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <div className="flex items-end space-x-4">
                  <div className="text-5xl font-bold text-orange-900">
                    {stats.completionRate.toFixed(0)}%
                  </div>
                  <div className="text-lg text-orange-700 pb-2">
                    {stats.completedDays} / {stats.totalDays} days
                  </div>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Recent Activity</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (27 - i));
                    // Use local date components to avoid timezone issues
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}`;
                    const isCompleted = habit.completedDates.includes(dateString);
                    const dayOfWeek = date.getDay();
                    const isScheduled = habit.frequencyDays.includes(dayOfWeek);

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg ${
                          !isScheduled
                            ? 'bg-gray-200'
                            : isCompleted
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                            : 'bg-gray-300'
                        }`}
                        title={date.toLocaleDateString()}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">Last 28 days</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load statistics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
