// MainPage.js
import React, { useState, useEffect } from 'react';
import './MainPage.css'; // For styling
import { useNavigate } from 'react-router-dom';
import HabitList from './HabitList';
import AddHabitPopup from './AddHabitPopup';
import DateCarousel from './DateCarousel';

const MainPage = ({ token, isLoggedIn }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');
    const [frequencyDays, setFrequencyDays] = useState([]);
    const [habitColor, setHabitColor] = useState('#4db6ac'); // default color
    const [showAddHabitPopup, setShowAddHabitPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            fetchHabits();
        } else {
            navigate("/login");
        }
    }, [isLoggedIn]);

    const fetchHabits = async () => {
        try {
            const response = await fetch('http://localhost:2000/habits', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setHabits(data);
        } catch (error) {
            console.error('Failed to fetch habits:', error);
        }
    };

    const handleToggleHabit = async (habit) => {
        const date = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

        if (habit.completedDates.includes(date)) {
            // If already completed, remove the completion
            try {
                const response = await fetch(`http://localhost:2000/habits/${habit._id}/incomplete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ date }),
                });
                if (response.ok) {
                    setHabits(prev =>
                        prev.map(h =>
                            h._id === habit._id 
                                ? { ...h, completedDates: h.completedDates.filter(d => d !== date) } 
                                : h
                        )
                    );
                    fetchHabits();
                } else {
                    console.error('Failed to mark habit as incomplete:', await response.json());
                }
            } catch (error) {
                console.error('Failed to mark habit as incomplete:', error);
            }
        } else {
            // If not completed, mark it as complete
            try {
                const response = await fetch(`http://localhost:2000/habits/${habit._id}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ date }),
                });
                if (response.ok) {
                    setHabits(prev =>
                        prev.map(h =>
                            h._id === habit._id 
                                ? { ...h, completedDates: [...h.completedDates, date] } 
                                : h
                        )
                    );
                    fetchHabits();
                } else {
                    console.error('Failed to mark habit as complete:', await response.json());
                }
            } catch (error) {
                console.error('Failed to mark habit as complete:', error);
            }
        }
    };

    const handleAddHabit = async () => {
        if (newHabit && frequencyDays.length > 0) {
            const habit = { 
                name: newHabit, 
                frequencyDays, 
                color: habitColor, 
                startDate: new Date().toISOString().split('T')[0] // Set start date to current date
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
                setHabits(prev =>
                    prev.map(h =>
                        h._id === habitId ? data : h
                    )
                );
                fetchHabits();
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

    const resetHabitForm = () => {
        setNewHabit('');
        setFrequencyDays([]);
        setHabitColor('#4db6ac');
        setShowAddHabitPopup(false);
    };

    const handleFrequencyChange = (day) => {
        if (frequencyDays.includes(day)) {
          setFrequencyDays(frequencyDays.filter(d => d !== day));
        } else {
          setFrequencyDays([...frequencyDays, day]);
        }
    };

    const changeDate = (days) => {
      setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + days)));
    };

    return (
      <div className="main-page">
          <h1>Habit Tracker</h1>

          <DateCarousel selectedDate={selectedDate} changeDate={changeDate} />

          <h2>Habits for {selectedDate.toLocaleDateString('en-GB')}</h2>
          <HabitList 
              habits={habits.filter(habit => habit.frequencyDays.includes(selectedDate.getDay()))} 
              selectedDate={selectedDate} 
              handleToggleHabit={handleToggleHabit} 
              handleEditHabit={handleEditHabit}
              handleDeleteHabit={handleDeleteHabit}
          />

          <button onClick={() => setShowAddHabitPopup(true)}>Add Habit</button>

          {showAddHabitPopup && (
              <AddHabitPopup 
                  newHabit={newHabit}
                  setNewHabit={setNewHabit}
                  frequencyDays={frequencyDays}
                  handleFrequencyChange={handleFrequencyChange}
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