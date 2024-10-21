// Calendar.js
import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { useLocation } from 'react-router-dom';

const Calendar = () => {
    const { state } = useLocation();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(state ? new Date(state.selectedDate) : new Date());
    const [habit] = useState(state ? state.habit : null); // Get the habit from state

    useEffect(() => {
        if (state && state.selectedDate) {
            setSelectedDate(new Date(state.selectedDate));
        }
    }, [state]);

    const daysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const generateCalendar = () => {
        const days = [];
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = daysInMonth(currentMonth, currentYear);

        // Fill in empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div className="day empty" key={`empty-${i}`}></div>);
        }

        // Fill in days of the month
        for (let day = 1; day <= totalDays; day++) {
            days.push(
                <div
                    className={`day ${selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentMonth &&
                        selectedDate.getFullYear() === currentYear
                        ? 'selected'
                        : ''
                        }`}
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (direction) => {
        if (direction === 'next') {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        } else {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        }
    };

    return (
        <div className="calendar">
            <h1>{habit ? habit.name : 'Habit Calendar'}</h1>
            <div className="calendar-header">
                <button onClick={() => changeMonth('prev')}>Previous</button>
                <h2>{`${currentYear} - ${currentMonth + 1}`}</h2>
                <button onClick={() => changeMonth('next')}>Next</button>
            </div>
            <div className="days">
                {generateCalendar()}
            </div>
        </div>
    );
};

export default Calendar;
