// EditHabitPopup.js
import React, { useState } from 'react';

const EditHabitPopup = ({ oldHabit, handleEditHabit, resetHabitForm }) => {
    const [habit, setHabit] = useState(oldHabit);

    const handleFrequencyChange = (day) => {
        setHabit(prevHabit => ({
            ...prevHabit,
            frequencyDays: prevHabit.frequencyDays.includes(day)
                ? prevHabit.frequencyDays.filter(d => d !== day)
                : [...prevHabit.frequencyDays, day]
        }));
    };

    return (
        <div className="popup">
            <h3>Edit Habit</h3>
            <input
                type="text"
                placeholder="Edit Habit"
                value={habit.name}
                onChange={(e) => setHabit({ ...habit, name: e.target.value })}
            />
            <div className="frequency-selector">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <label key={index}>
                        <input
                            type="checkbox"
                            checked={habit.frequencyDays.includes(index)}
                            onChange={() => handleFrequencyChange(index)}
                        />
                        {day}
                    </label>
                ))}
            </div>
            <div className="color-picker">
                <label>Select Habit Color: </label>
                <input
                    type="color"
                    value={habit.color}
                    onChange={(e) => setHabit({ ...habit, color: e.target.value })}
                />
            </div>
            <button onClick={() => handleEditHabit(habit._id, habit)}>Edit Habit</button>
            <button onClick={resetHabitForm}>Cancel</button>
        </div>
    );
};

export default EditHabitPopup;