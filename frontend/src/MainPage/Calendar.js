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
            days.push(
                <div
                    className={`day ${currentDate.getDate() === day &&
                        currentDate.getMonth() === currentDate.getMonth() &&
                        currentDate.getFullYear() === currentDate.getFullYear()
                        ? 'selected'
                        : ''
                    }`}
                    key={day}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (month) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + month);
        setCurrentDate(newDate);
    };

    return (
        <div className="calendar-container">
            <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

            <div className="calendar-navigation">
                <button onClick={() => changeMonth(-1)}>&lt;</button>
                <span>{currentDate.toDateString().split(" ")[1] + " " + currentDate.toDateString().split(" ")[3]}</span>
                <button onClick={() => changeMonth(1)}>&gt;</button>
            </div>

            <div className="days">
                {generateCalendar()}
            </div>
        </div>
    );
};

export default Calendar;
