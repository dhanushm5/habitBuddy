// HabitItem.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import EditHabitPopup from './EditHabitPopup';

const HabitItem = ({ habit, selectedDate, handleToggleHabit, handleEditHabit, handleDeleteHabit }) => {
    const [showEditHabitPopup, setShowEditHabitPopup] = useState(false);
    const [updatedHabit, setUpdatedHabit] = useState(habit);
    const navigate = useNavigate(); // Initialize navigate

    const resetHabitForm = () => {
        setUpdatedHabit(habit);
        setShowEditHabitPopup(false);
    };

    const toggleEditPopup = () => {
        setShowEditHabitPopup(prev => !prev);
    };

    // Function to handle navigating to the calendar page
    const handleViewCalendar = () => {
        navigate('/calendar', { state: { habit, selectedDate } }); // Pass habit and selectedDate as state
    };

    return (
        <div 
            className="habit" 
            style={{ backgroundColor: habit.color || '#4db6ac' }} 
        >
            <div className = "habit-info">
                <label className = "custom-checkbox">
                    <input 
                        type="checkbox"
                        checked={habit.completedDates.includes(selectedDate.toISOString().split('T')[0])}
                        onChange={() => handleToggleHabit(habit)}
                    />
                    <span className = "checkmark"></span>     
                </label>
            </div>

            <span className={habit.completedDates.includes(selectedDate.toISOString().split('T')[0]) ? 'completed' : ''}>
                {habit.name}
            </span>

            {/* Buttons for Statistics, Edit, Delete */}
            <div className="button-group">
                <button className="stats-button" onClick={handleViewCalendar}> {/* Update onClick handler */}
                    <img className="button-icon" alt="Statistics" src="\bar-chart.png" />
                </button>
                <button className="edit-button" onClick={toggleEditPopup}>
                    <img className="button-icon" alt="Edit" src="\edit1.png" />
                </button>
                <button className="delete-button" onClick={() => handleDeleteHabit(habit._id)}>
                    <img className="button-icon" alt="Delete" src="\delete.png" />
                </button>
            </div>

            {showEditHabitPopup && (
                <EditHabitPopup 
                    oldHabit={updatedHabit}
                    handleEditHabit={handleEditHabit}
                    resetHabitForm={resetHabitForm}
                />
            )}
        </div>
    );
};

export default HabitItem;
