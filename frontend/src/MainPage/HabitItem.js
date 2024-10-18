// HabitItem.js
import React from 'react';


const HabitItem = ({ habit, selectedDate, handleToggleHabit }) => {
    const handleCheckboxChange = () => {
        handleToggleHabit(habit);
    };

    return (
        <div className="habit" style={{ backgroundColor: habit.color || '#4db6ac' }}>
            <span className={habit.completedDates.includes(selectedDate.toISOString().split('T')[0]) ? 'completed' : ''}>
                {habit.name}
            </span>
            <div>
                <input 
                    type="checkbox"
                    checked={habit.completedDates.includes(selectedDate.toISOString().split('T')[0])}
                    onChange={handleCheckboxChange}
                />
            </div>
        </div>
    );
};

export default HabitItem;