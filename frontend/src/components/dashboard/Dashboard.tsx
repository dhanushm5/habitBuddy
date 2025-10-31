import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Habit } from '../../types';
import { HabitList } from './HabitList';
import { HabitCalendar } from './HabitCalendar';
import { Header } from './Header';
import { CreateHabitModal } from '../habits/CreateHabitModal';
import { EditHabitModal } from '../habits/EditHabitModal';
import { StatsModal } from '../stats/StatsModal';
import { AvatarModal } from '../avatar/AvatarModal';
import { Plus } from 'lucide-react';

export function Dashboard() {
  const { logout } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [statsHabit, setStatsHabit] = useState<Habit | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const loadHabits = async () => {
    try {
      const data = await api.getHabits();
      setHabits(data);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleToggleComplete = async (habit: Habit, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const isCompleted = habit.completedDates.includes(dateString);

    try {
      if (isCompleted) {
        await api.incompleteHabit(habit._id, dateString);
      } else {
        await api.completeHabit(habit._id, dateString);
      }
      await loadHabits();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.deleteHabit(habitId);
      await loadHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Header onLogout={logout} onOpenAvatar={() => setShowAvatarModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
                <p className="text-gray-600 mt-1">Track and build better habits</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-emerald-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Habit</span>
              </button>
            </div>

            <HabitList
              habits={habits}
              selectedDate={selectedDate}
              onToggleComplete={handleToggleComplete}
              onEdit={setEditingHabit}
              onDelete={handleDeleteHabit}
              onViewStats={setStatsHabit}
            />
          </div>

          <div>
            <HabitCalendar
              habits={habits}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadHabits}
        />
      )}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSuccess={loadHabits}
        />
      )}

      {statsHabit && (
        <StatsModal
          habit={statsHabit}
          onClose={() => setStatsHabit(null)}
        />
      )}

      {showAvatarModal && (
        <AvatarModal onClose={() => setShowAvatarModal(false)} />
      )}
    </div>
  );
}
