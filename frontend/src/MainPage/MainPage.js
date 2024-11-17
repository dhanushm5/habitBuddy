// MainPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import HabitList from './HabitList';
import AddHabitPopup from './AddHabitPopup';
import DateCarousel from './DateCarousel';
import AvatarBuilder from './AvatarBuilder';
import AvatarDisplay from './AvatarDisplay';

const MainPage = ({ token, isLoggedIn }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [habits, setHabits] = useState([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [frequencyDays, setFrequencyDays] = useState([]);
    const [habitColor, setHabitColor] = useState('#B5EAD7');
    const [showAddHabitPopup, setShowAddHabitPopup] = useState(false);
    const [reminderTime, setReminderTime] = useState('');
    const [avatar, setAvatar] = useState({});
    const [editAvatar, setEditAvatar] = useState(false);
    const showAvatar = false;

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            fetchHabits();
            fetchAvatar();
        } else {
            navigate("/login");
        }
    }, [isLoggedIn]);

    const fetchAvatar = async () => {
        try {
            const response = await fetch('http://localhost:2000/avatar', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setAvatar(data);
        } catch (error) {
            console.error('Failed to fetch avatar:', error);
        }
    };

    const fetchHabits = async () => {
        try {
            const response = await fetch('http://localhost:2000/habits', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setHabits(data);
        } catch (error) {
            console.error('Failed to fetch habits:', error);
        }
    };

    const handleAddHabit = async () => {
        if (newHabitName && frequencyDays.length > 0) {
            const habit = { 
                name: newHabitName, 
                frequencyDays, 
                color: habitColor, 
                startDate: new Date().toISOString().split('T')[0],
                reminderTime: reminderTime || undefined 
            };
            try {
                const response = await fetch('http://localhost:2000/habits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(habit),
                });
                const data = await response.json();
                if (response.ok) {
                    setHabits(prev => [...prev, data]);
                } else {
                    console.error('Failed to add habit:', data.error);
                }
                resetHabitForm();
                fetchHabits();
            } catch (error) {
                console.error('Failed to add habit:', error);
            }
        }
    };

    const handleEditHabit = async (habitId, updatedHabit) => {
        try {
            const response = await fetch(`http://localhost:2000/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedHabit),
            });
            const data = await response.json();
            if (response.ok) {
                setHabits(prev => prev.map(h => h._id === habitId ? data : h));
            } else {
                console.error('Failed to edit habit:', data.error);
            }
        } catch (error) {
            console.error('Failed to edit habit:', error);
        }
    };

    const handleDeleteHabit = async (habitId) => {
        try {
            const response = await fetch(`http://localhost:2000/habits/${habitId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setHabits(prev => prev.filter(h => h._id !== habitId));
                fetchHabits();
            } else {
                console.error('Failed to delete habit:', await response.json());
            }
        } catch (error) {
            console.error('Failed to delete habit:', error);
        }
    };

    const handleToggleHabit = async (habit) => {
        const today = new Date().toISOString().split('T')[0];
        const selectedDateString = selectedDate.toISOString().split('T')[0];

        if (selectedDateString !== today) {
            console.error('Habits can only be toggled for today\'s date.');
            return;
        }

        const url = habit.completedDates.includes(today) 
            ? `http://localhost:2000/habits/${habit._id}/incomplete` 
            : `http://localhost:2000/habits/${habit._id}/complete`;
        const method = habit.completedDates.includes(today) ? 'POST' : 'POST';
        const updatedDates = habit.completedDates.includes(today)
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today];

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ date: today }),
            });
            if (response.ok) {
                setHabits(prev => prev.map(h => h._id === habit._id ? { ...h, completedDates: updatedDates } : h));
                fetchHabits();
            } else {
                console.error('Failed to toggle habit:', await response.json());
            }
        } catch (error) {
            console.error('Failed to toggle habit:', error);
        }
    };

    const resetHabitForm = () => {
        setNewHabitName('');
        setFrequencyDays([]);
        setHabitColor('#B5EAD7');
        setShowAddHabitPopup(false);
    };

    return (
        <div className="main-page">
            <h1>Habit Buddy</h1>

            {showAvatar && 
                <div className="avatar-section">
                    <h2>Your Avatar</h2>
                    <AvatarDisplay avatar={avatar} />
                    <button onClick={() => setEditAvatar(!editAvatar)}>
                        {editAvatar ? 'Close Avatar Builder' : 'Edit Avatar'}
                    </button>
                </div>
            }

            {editAvatar && (
                <AvatarBuilder
                    avatar={avatar}
                    setAvatar={setAvatar}
                    token={token}
                />
            )}

            <DateCarousel
                selectedDate={selectedDate}
                changeDate={(days) => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + days)))}
            />

            <h2>Habits for {selectedDate.toLocaleDateString('en-GB')}</h2>
            <HabitList 
                habits={habits.filter(habit => habit.frequencyDays.includes(selectedDate.getDay()))} 
                selectedDate={selectedDate} 
                handleToggleHabit={handleToggleHabit} 
                handleEditHabit={handleEditHabit}
                handleDeleteHabit={handleDeleteHabit}
            />

            <div className="addHabitContainer">
                <button id="addhabit" onClick={() => setShowAddHabitPopup(true)}>Add Habit</button>
            </div>

            {showAddHabitPopup && (
                <AddHabitPopup
                    habitName={newHabitName}
                    setHabitName={setNewHabitName}
                    frequencyDays={frequencyDays}
                    handleFrequencyChange={(day) =>
                        setFrequencyDays(frequencyDays.includes(day)
                            ? frequencyDays.filter(d => d !== day)
                            : [...frequencyDays, day])
                    }
                    reminderTime={reminderTime}
                    setReminderTime={setReminderTime}
                    habitColor={habitColor}
                    setHabitColor={setHabitColor}
                    handleAddHabit={handleAddHabit}
                    resetHabitForm={resetHabitForm}
                />
            )}
        </div>
    );
};

export default MainPage;
