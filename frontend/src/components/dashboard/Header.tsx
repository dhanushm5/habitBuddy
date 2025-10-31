import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  onOpenAvatar: () => void;
}

export function Header({ onLogout, onOpenAvatar }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
              <p className="text-sm text-gray-500">Build better habits, one day at a time</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAvatar}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Avatar</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
