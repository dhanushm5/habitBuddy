import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditHabitPopup from './EditHabitPopup';

const HabitItem = ({ habit, selectedDate, handleToggleHabit, handleEditHabit, handleDeleteHabit, handleViewCalendar, handleViewStatistics }) => {
    const [showEditHabitPopup, setShowEditHabitPopup] = useState(false);
    const [updatedHabit, setUpdatedHabit] = useState(habit);
    const navigate = useNavigate();

    const resetHabitForm = () => {
        setUpdatedHabit(habit);
        setShowEditHabitPopup(false);
    };

    const toggleEditPopup = () => {
        setShowEditHabitPopup(prev => !prev);
    };

    const handleStatsClick = () => {
        // Navigate to Calendar with habit and selected date
        navigate('/calendar', { state: { habit, selectedDate } });
    };

    return (
        <div 
            className="habit" 
            style={{ backgroundColor: habit.color || '#4db6ac' }} 
        >
            <div className="habit-info">
                <label className="custom-checkbox">
                    <input 
                        type="checkbox"
                        checked={habit.completedDates.includes(selectedDate.toISOString().split('T')[0])}
                        onChange={() => handleToggleHabit(habit)}
                    />
                    <span className="checkmark"></span>     
                </label>
            </div>

            <span className={habit.completedDates.includes(selectedDate.toISOString().split('T')[0]) ? 'completed' : ''}>
                {habit.name}
            </span>

            <div className="button-group">
                <button className="stats-button" onClick={handleStatsClick}>
                    <img className="button-icon" alt="Statistics" src="/bar-chart.png" />
                </button>
                <button className="edit-button" onClick={toggleEditPopup}>
                    <img className="button-icon" alt="Edit" src="/edit1.png" />
                </button>
                <button className="delete-button" onClick={() => handleDeleteHabit(habit._id)}>
                    <img className="button-icon" alt="Delete" src="/delete.png" />
                </button>
            </div>

            {showEditHabitPopup && (
                <EditHabitPopup 
                    oldHabit={updatedHabit}
                    setUpdatedHabit={setUpdatedHabit}
                    setShowEditHabitPopup={setShowEditHabitPopup}
                    handleEditHabit={handleEditHabit}
                    toggleEditPopup={toggleEditPopup}
                    resetHabitForm={resetHabitForm}
                />
            )}
        </div>
    );
};

export default HabitItem;
