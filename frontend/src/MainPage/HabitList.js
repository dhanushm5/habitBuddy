import React from 'react';
import HabitItem from './HabitItem';


const HabitList = ({ habits, selectedDate, handleToggleHabit, handleDeleteHabit, handleEditHabit }) => {
    return (
        <div className="habitlist">
            {habits.map(habit => (
                <HabitItem 
                    key={habit._id} 
                    habit={habit} 
                    selectedDate={selectedDate} 
                    handleToggleHabit={handleToggleHabit} 
                    handleEditHabit={handleEditHabit}
                    handleDeleteHabit={handleDeleteHabit}
                />
            ))}
        </div>
    );
};

export default HabitList;
