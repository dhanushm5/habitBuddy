import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { api } from '../../services/api';
import type { Avatar } from '../../types';

interface AvatarModalProps {
  onClose: () => void;
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

const SHAPES = ['circle', 'square', 'diamond', 'hexagon'];

const ACCESSORIES = ['none', 'glasses', 'hat', 'crown', 'star'];

export function AvatarModal({ onClose }: AvatarModalProps) {
  const [color, setColor] = useState(COLORS[0]);
  const [shape, setShape] = useState('circle');
  const [accessory, setAccessory] = useState('none');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    setLoading(true);
    try {
      const avatar = await api.getAvatar();
      setColor(avatar.color || COLORS[0]);
      setShape(avatar.shape || 'circle');
      setAccessory(avatar.accessory || 'none');
    } catch (error) {
      console.log('No avatar found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveAvatar({ color, shape, accessory });
      onClose();
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  const getShapeClass = () => {
    switch (shape) {
      case 'square':
        return 'rounded-xl';
      case 'diamond':
        return 'rounded-xl transform rotate-45';
      case 'hexagon':
        return 'rounded-2xl';
      default:
        return 'rounded-full';
    }
  };

  const getAccessoryEmoji = () => {
    switch (accessory) {
      case 'glasses':
        return '👓';
      case 'hat':
        return '🎩';
      case 'crown':
        return '👑';
      case 'star':
        return '⭐';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customize Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center py-8">
            <div className="relative">
              <div
                className={`w-32 h-32 ${getShapeClass()} transition-all duration-300 shadow-2xl`}
                style={{ backgroundColor: color }}
              />
              {accessory !== 'none' && (
                <div className={`absolute top-0 right-0 text-4xl ${shape === 'diamond' ? '-rotate-45' : ''}`}>
                  {getAccessoryEmoji()}
                </div>
              )}
            </div>
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
            <label className="text-sm font-medium text-gray-700">Shape</label>
            <div className="grid grid-cols-4 gap-2">
              {SHAPES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShape(s)}
                  className={`px-4 py-3 rounded-lg font-medium capitalize transition-all duration-200 ${
                    shape === s
                      ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Accessory</label>
            <div className="grid grid-cols-5 gap-2">
              {ACCESSORIES.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAccessory(a)}
                  className={`px-4 py-3 rounded-lg font-medium capitalize transition-all duration-200 ${
                    accessory === a
                      ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
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
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-emerald-600 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Avatar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
