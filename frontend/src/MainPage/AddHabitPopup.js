import React from 'react';

const AddHabitPopup = ({ newHabit, setNewHabit, frequencyDays, handleFrequencyChange, habitColor, setHabitColor, handleAddHabit, resetHabitForm }) => {
    // Define an array of pastel colors
    const pastelColors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#E6E6FA', '#FFD1DC', '#E0BBE4', '#FF9AA2', '#FFB7B2',
        '#B5EAD7', '#C7CEEA'
    ];

    return (
        <div className="popup">
            <h3>Add New Habit</h3>
            <input
                type="text"
                placeholder="Add Habit"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
            />
            <div className="frequency-selector">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <label key={index}>
                        <input
                            type="checkbox"
                            checked={frequencyDays.includes(index)}
                            onChange={() => handleFrequencyChange(index)}
                        />
                        {day}
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
                                border: habitColor === color ? '2px solid black' : '1px solid gray',
                            }}
                            onClick={() => setHabitColor(color)}
                        />
                    ))}
                </div>
            </div>
            <button class = "button" onClick={handleAddHabit}>Add Habit</button>
            <button onClick={resetHabitForm}>Cancel</button>
        </div>
    );
};

export default AddHabitPopup;
