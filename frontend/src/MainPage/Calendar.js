import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { useLocation } from 'react-router-dom';

const Calendar = () => {
    const { state } = useLocation();
    const [currentDate, setCurrentDate] = useState(state ? new Date(state.selectedDate) : new Date());
    const [habit] = useState(state ? state.habit : null);

    useEffect(() => {
        if (state && state.selectedDate) {
            setCurrentDate(new Date(state.selectedDate));
        }
    }, [state]);

    const daysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const generateCalendar = () => {
        const days = [];
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

        for (let i = 0; i < firstDay; i++) {
            days.push(<div className="day empty" key={`empty-${i}`}></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            // Check if this day is in the completed dates of the habit
            let backgroundColor;
            
            if (habit && habit.completedDates.includes(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)) {
                backgroundColor = habit.color; // Use the assigned color for completed days
            } else {
                backgroundColor = '#e0f7fa'; // Default color for non-completed days
            }

            days.push(
                <div
                    className={`day ${currentDate.getDate() === day &&
                        currentDate.getMonth() === currentDate.getMonth() &&
                        currentDate.getFullYear() === currentDate.getFullYear()
                        ? 'selected'
                        : ''
                    }`}
                    key={day}
                    style={{ backgroundColor }} // Apply dynamic background color
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    const changeDay = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    return (
        <div className="calendar-container">
            <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

            <div className="calendar-navigation">
                <button onClick={() => changeDay(-1)}>&lt;</button>
                <span>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
                <button onClick={() => changeDay(1)}>&gt;</button>
            </div>

            <div className="days">
                {generateCalendar()}
            </div>
        </div>
    );
};

export default Calendar;