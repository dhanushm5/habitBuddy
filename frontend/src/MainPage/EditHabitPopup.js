import React, { useState, useEffect } from 'react';

const EditHabitPopup = ({ oldHabit, handleEditHabit, resetHabitForm }) => {
    const [habit, setHabit] = useState(oldHabit);

    // Update local state when `oldHabit` changes
    useEffect(() => {
        setHabit(oldHabit);
    }, [oldHabit]);

    // Define an array of pastel colors
    const pastelColors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#E6E6FA', '#FFD1DC', '#E0BBE4', '#FF9AA2', '#FFB7B2',
        '#B5EAD7', '#C7CEEA'
    ];

    const handleFrequencyChange = (day) => {
        setHabit(prevHabit => ({
            ...prevHabit,
            frequencyDays: prevHabit.frequencyDays.includes(day)
                ? prevHabit.frequencyDays.filter(d => d !== day)
                : [...prevHabit.frequencyDays, day]
        }));
    };

    const handleColorChange = (color) => {
        setHabit(prevHabit => ({
            ...prevHabit,
            color: color // Assuming `habit.color` is the property that stores the color
        }));
    };

    return (
        <div className="popup">
            <h3>Edit Habit</h3>
            <div className = "habit-textbox">
                <input
                    type="text"
                    placeholder="Edit Habit"
                    value={habit.name || ''}  // Fallback for undefined habit name
                    onChange={(e) => setHabit({ ...habit, name: e.target.value })}
                />
            </div>
            <div className="frequency-selector">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <label key={index}>
                        {day}
                        <input
                            type="checkbox"
                            checked={habit.frequencyDays.includes(index)}
                            onChange={() => handleFrequencyChange(index)}
                        />
                    </label>
                ))}
            </div>
            <div className="color-picker">
                <label>Select Habit Color: </label>
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
                                border: habit.color === color ? '2px solid black' : '1px solid gray',
                            }}
                            onClick={() => handleColorChange(color)}  // Directly set the color
                        />
                    ))}
                </div>
            </div>
            <button class = "button" onClick={() => handleEditHabit(habit._id, habit)}>Edit Habit</button>
            <button onClick={resetHabitForm}>Cancel</button>
        </div>
    );
};

export default EditHabitPopup;
