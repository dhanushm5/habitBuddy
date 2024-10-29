import React from 'react';
import HabitItem from './HabitItem';


const HabitList = ({ habits, selectedDate, handleToggleHabit, handleDeleteHabit, handleEditHabit, handleViewCalendar, handleViewStatistics }) => {
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
                    handleViewCalendar={handleViewCalendar}
                    handleViewStatistics={handleViewStatistics}
                />
            ))}
        </div>
    );
};

export default HabitList;
