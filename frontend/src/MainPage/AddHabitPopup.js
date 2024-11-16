import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AddHabitPopup = ({
    habitName,
    setHabitName,
    frequencyDays,
    handleFrequencyChange,
    reminderTime,
    setReminderTime,
    habitColor,
    setHabitColor,
    handleAddHabit,
    resetHabitForm
}) => {
    // Define an array of pastel colors
    const pastelColors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#E6E6FA', '#FFD1DC', '#E0BBE4', '#FF9AA2', '#FFB7B2',
        '#B5EAD7', '#C7CEEA'
    ];
    const [error, setError] = useState('');

    const handleAddClick = () => {
        if (!habitName) {
            setError('Habit name cannot be empty');
            return;
        }
        if (frequencyDays.length === 0) {
            setError('Habit frequency cannot be zero');
            return;
        }
        handleAddHabit();
        resetHabitForm();
    }

    const handleInputChange = (e) => {
        setHabitName(e.target.value);
        if (error) {
            setError(''); // Clear error when user starts typing
        }
    }

    return (
        <div className="popup">
            <h2>Add New Habit</h2>
            <div className = "habit-textbox">    
                <input
                    type="text"
                    placeholder="Add Habit"
                    value={habitName}
                    onChange={handleInputChange}
                />
            </div>
            <div className="frequency-selector">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <label key={index}>
                        <span>{day}</span>
                        <input
                            type="checkbox"
                            checked={frequencyDays.includes(index)}
                            onChange={() => handleFrequencyChange(index)}
                        />
                    </label>
                ))}
            </div>
            <div className="reminder-box">
                <h3><label>Set Reminder: </label></h3>
                <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                />
            </div>
            <div className="color-picker">
                <h3><label>Select Habit Color: </label></h3>
                <div className="color-swatches">
                    {pastelColors.map((color, index) => (
                        <div
                            key={index}
                            className="color-swatch"
                            style={{
                                backgroundColor: color,
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                border: habitColor === color ? '2px solid black' : '1px solid gray',
                            }}
                            onClick={() => setHabitColor(color)}
                        />
                    ))}
                </div>
            </div>
            <button class = "popup-button" onClick={handleAddClick}>Add Habit</button>
            <button class = "popup-button" onClick={resetHabitForm}>Cancel</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

// Adding PropTypes for better documentation and validation
AddHabitPopup.propTypes = {
    habitName: PropTypes.string.isRequired,
    setHabitName: PropTypes.func.isRequired,
    frequencyDays: PropTypes.array.isRequired,
    handleFrequencyChange: PropTypes.func.isRequired,
    reminderTime: PropTypes.string.isRequired,
    setReminderTime: PropTypes.func.isRequired,
    habitColor: PropTypes.string.isRequired,
    setHabitColor: PropTypes.func.isRequired,
    handleAddHabit: PropTypes.func.isRequired,
    resetHabitForm: PropTypes.func.isRequired,
};

export default AddHabitPopup;
