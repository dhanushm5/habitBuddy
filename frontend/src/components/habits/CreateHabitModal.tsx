import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { api } from '../../services/api';

interface CreateHabitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

const DAYS = [
  { name: 'Sunday', value: 0 },
  { name: 'Monday', value: 1 },
  { name: 'Tuesday', value: 2 },
  { name: 'Wednesday', value: 3 },
  { name: 'Thursday', value: 4 },
  { name: 'Friday', value: 5 },
  { name: 'Saturday', value: 6 },
];

export function CreateHabitModal({ onClose, onSuccess }: CreateHabitModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequencyDays, setFrequencyDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day: number) => {
    setFrequencyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (frequencyDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    setLoading(true);

    try {
      await api.createHabit({
        name,
        color,
        frequencyDays,
        reminderTime: reminderTime || undefined,
        startDate: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Habit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Morning Exercise"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <div className="grid grid-cols-8 gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                    color === c
                      ? 'ring-4 ring-gray-300 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Frequency</label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    frequencyDays.includes(day.value)
                      ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Reminder Time (Optional)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-emerald-600 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
