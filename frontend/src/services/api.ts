import type { Habit, HabitStats, Avatar, AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(email: string, password: string) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send reset email');
    }
    return response.json();
  }

  async resetPassword(token: string, id: string, newPassword: string) {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }
    return response.json();
  }

  async getHabits(): Promise<Habit[]> {
    const response = await fetch(`${API_URL}/habits`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch habits');
    }
    return response.json();
  }

  async getHabit(id: string): Promise<Habit> {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch habit');
    }
    return response.json();
  }

  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    const response = await fetch(`${API_URL}/habits`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(habit),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create habit');
    }
    return response.json();
  }

  async updateHabit(id: string, habit: Partial<Habit>): Promise<Habit> {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(habit),
    });
    if (!response.ok) {
      throw new Error('Failed to update habit');
    }
    return response.json();
  }

  async deleteHabit(id: string) {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete habit');
    }
    return response.json();
  }

  async completeHabit(id: string, date: string) {
    const response = await fetch(`${API_URL}/habits/${id}/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ date }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to mark habit as complete');
    }
    return response.json();
  }

  async incompleteHabit(id: string, date: string) {
    const response = await fetch(`${API_URL}/habits/${id}/incomplete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ date }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to mark habit as incomplete');
    }
    return response.json();
  }

  async getHabitStats(id: string): Promise<HabitStats> {
    const response = await fetch(`${API_URL}/habits/${id}/stats`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch habit stats');
    }
    return response.json();
  }

  async getAvatar(): Promise<Avatar> {
    const response = await fetch(`${API_URL}/avatar`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch avatar');
    }
    return response.json();
  }

  async saveAvatar(avatar: Avatar) {
    const response = await fetch(`${API_URL}/avatar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(avatar),
    });
    if (!response.ok) {
      throw new Error('Failed to save avatar');
    }
    return response.json();
  }
}

export const api = new ApiService();
