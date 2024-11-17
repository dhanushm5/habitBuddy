// import React, { useState, useEffect } from 'react';
// import './Calendar.css';
// import { useLocation } from 'react-router-dom';

// const Calendar = () => {
//     const { state } = useLocation();
//     const [currentDate, setCurrentDate] = useState(state ? new Date(state.selectedDate) : new Date());
//     const [habit] = useState(state ? state.habit : null);

//     useEffect(() => {
//         if (state && state.selectedDate) {
//             setCurrentDate(new Date(state.selectedDate));
//         }
//     }, [state]);

//     const daysInMonth = (month, year) => {
//         return new Date(year, month + 1, 0).getDate();
//     };

//     const generateCalendar = () => {
//         const days = [];
//         const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
//         const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

//         for (let i = 0; i < firstDay; i++) {
//             days.push(<div className="day empty" key={`empty-${i}`}></div>);
//         }

//         for (let day = 1; day <= totalDays; day++) {
//             days.push(
//                 <div
//                     className={`day ${currentDate.getDate() === day &&
//                         currentDate.getMonth() === currentDate.getMonth() &&
//                         currentDate.getFullYear() === currentDate.getFullYear()
//                         ? 'selected'
//                         : ''
//                     }`}
//                     key={day}
//                     onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
//                 >
//                     {day}
//                 </div>
//             );
//         }

//         return days;
//     };

//     const changeDay = (days) => {
//         const newDate = new Date(currentDate);
//         newDate.setDate(newDate.getDate() + days);
//         setCurrentDate(newDate);
//     };

//     return (
//         <div className="calendar-container">
//             <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

//             <div className="calendar-navigation">
//                 <button onClick={() => changeDay(-1)}>&lt;</button>
//                 <span>{currentDate.toDateString()}</span>
//                 <button onClick={() => changeDay(1)}>&gt;</button>
//             </div>

//             <div className="days">
//                 {generateCalendar()}
//             </div>
//         </div>
//     );
// };

// export default Calendar;


// import React, { useState, useEffect } from 'react';
// import './Calendar.css';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios'; // Assuming you're using axios to fetch data

// const Calendar = () => {
//     const { state } = useLocation();
//     const [currentDate, setCurrentDate] = useState(state ? new Date(state.selectedDate) : new Date());
//     const [habit, setHabit] = useState(state ? state.habit : null);
//     const [completedDates, setCompletedDates] = useState([]); // State to track completed dates

//     useEffect(() => {
//         // Check if habit is available in state
//         if (state && state.selectedDate) {
//             setCurrentDate(new Date(state.selectedDate));
//         }

//         if (habit) {
//             // Assuming you fetch habit data with completedDates from your backend
//             setCompletedDates(habit.completedDates || []);
//         }
//     }, [state, habit]);

//     // Function to fetch completed dates if the habit object is missing completedDates
//     const fetchHabitData = async () => {
//         try {
//             const response = await axios.get(`/api/habits/${habit._id}`); // Adjust based on your API
//             setHabit(response.data);
//             setCompletedDates(response.data.completedDates || []);
//         } catch (error) {
//             console.error("Error fetching habit data", error);
//         }
//     };

//     useEffect(() => {
//         if (habit && habit._id) {
//             fetchHabitData(); // Fetch habit data if it's not already present
//         }
//     }, [habit]);

//     const daysInMonth = (month, year) => {
//         return new Date(year, month + 1, 0).getDate();
//     };

//     const generateCalendar = () => {
//         const days = [];
//         const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
//         const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

//         for (let i = 0; i < firstDay; i++) {
//             days.push(<div className="day empty" key={`empty-${i}`}></div>);
//         }

//         for (let day = 1; day <= totalDays; day++) {
//             const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//             const isCompleted = completedDates.some(date => new Date(date).toDateString() === currentDay.toDateString());

//             days.push(
//                 <div
//                     className={`day ${currentDate.getDate() === day &&
//                         currentDate.getMonth() === currentDate.getMonth() &&
//                         currentDate.getFullYear() === currentDate.getFullYear()
//                         ? 'selected'
//                         : ''
//                     } ${isCompleted ? 'completed' : ''}`} 
//                     key={day}
//                     onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
//                 >
//                     {day}
//                 </div>
//             );
//         }

//         return days;
//     };

//     const changeDay = (days) => {
//         const newDate = new Date(currentDate);
//         newDate.setDate(newDate.getDate() + days);
//         setCurrentDate(newDate);
//     };

//     return (
//         <div className="calendar-container">
//             <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

//             <div className="calendar-navigation">
//                 <button onClick={() => changeDay(-1)}>&lt;</button>
//                 <span>{currentDate.toDateString()}</span>
//                 <button onClick={() => changeDay(1)}>&gt;</button>
//             </div>

//             <div className="days">
//                 {generateCalendar()}
//             </div>
//         </div>
//     );
// };

// export default Calendar;

// import React, { useState, useEffect } from 'react';
// import './Calendar.css';
// import { useLocation } from 'react-router-dom';

// const Calendar = () => {
//     const { state } = useLocation();
//     const [currentDate, setCurrentDate] = useState(state ? new Date(state.selectedDate) : new Date());
//     const [habit] = useState(state ? state.habit : null);
//     const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//     useEffect(() => {
//         if (state && state.selectedDate) {
//             setCurrentDate(new Date(state.selectedDate));
//         }
//     }, [state]);

//     const daysInMonth = (month, year) => {
//         return new Date(year, month + 1, 0).getDate();
//     };

//     // Organize the calendar days by columns: Sunday to Saturday (0 to 6)
//     const generateCalendar = () => {
//         const days = [[], [], [], [], [], [], []]; // Array for Sunday to Saturday columns
//         const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
//         const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

//         // Fill empty days before the first day of the month
//         for (let i = 0; i < firstDay; i++) {
//             days[i].push(<div className="day empty" key={`empty-${i}`}></div>);
//         }

//         // Fill the calendar days by their corresponding day of the week
//         for (let day = 1; day <= totalDays; day++) {
//             const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//             const dayOfWeek = currentDay.getDay(); // Get the day of the week (0-6)

//             const isTrackedDay = habit && habit.frequencyDays.includes(dayOfWeek); // Check if this day is a tracked day
//             const isCompleted = habit && habit.completedDates.includes(currentDay.toISOString().split('T')[0]); // Check if this day is marked completed

//             days[dayOfWeek].push(
//                 <div
//                     className={`day ${currentDate.getDate() === day &&
//                         currentDate.getMonth() === currentDate.getMonth() &&
//                         currentDate.getFullYear() === currentDate.getFullYear()
//                         ? 'selected'
//                         : ''} 
//                         ${isTrackedDay ? 'tracked' : ''} 
//                         ${isCompleted ? 'completed' : ''}`}
//                     key={day}
//                     onClick={() => setCurrentDate(currentDay)}
//                 >
//                     {day}
//                 </div>
//             );
//         }

//         return days;
//     };

//     const changeDay = (days) => {
//         const newDate = new Date(currentDate);
//         newDate.setDate(newDate.getDate() + days);
//         setCurrentDate(newDate);
//     };

//     const calculateStats = () => {
//         if (!habit || !habit.frequencyDays) return {};
    
//         const currentMonth = currentDate.getMonth(); // Get the current month
//         const currentYear = currentDate.getFullYear(); // Get the current year
    
//         let totalTrackedDays = 0;
//         let completedTrackedDays = 0;
    
//         for (let day = 1; day <= daysInMonth(currentMonth, currentYear); day++) {
//             const date = new Date(currentYear, currentMonth, day);
//             const dayOfWeek = date.getDay();
    
//             if (habit.frequencyDays.includes(dayOfWeek)) {
//                 totalTrackedDays++;
//                 if (habit.completedDates.includes(date.toISOString().split('T')[0])) {
//                     completedTrackedDays++;
//                 }
//             }
//         }
    
//         return {
//             totalTrackedDays,
//             completedTrackedDays,
//         };
//     };

//     const stats = calculateStats();

//     return (
//         <div className="calendar-wrapper">
//             <div className="calendar-container">
//                 <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

//                 <div className="calendar-navigation">
//                     <button onClick={() => changeDay(-1)}>&lt;</button>
//                     <span>{currentDate.toDateString()}</span>
//                     <button onClick={() => changeDay(1)}>&gt;</button>
//                 </div>

//                 <div className="calendar-grid">
//                     {/* Calendar header with days of the week */}
//                     <div className="calendar-header">
//                         {daysOfWeek.map((day, index) => (
//                             <div key={index} className="calendar-header-day">{day}</div>
//                         ))}
//                     </div>

//                     {/* Calendar grid, rendering the days in columns */}
//                     {generateCalendar().map((dayColumn, index) => (
//                         <div key={index} className="calendar-column">
//                             {dayColumn}
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="calendar-stats">
//                 <h3>Stats</h3>
//                 {habit && stats.totalTrackedDays > 0 && (
//                     <>
//                         <p><strong>Total Tracked Days:</strong> {stats.totalTrackedDays}</p>
//                         <p><strong>Completed Days:</strong> {stats.completedTrackedDays}</p>
//                         <p><strong>Completion Rate:</strong> {((stats.completedTrackedDays / stats.totalTrackedDays) * 100).toFixed(2)}%</p>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Calendar;


import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { useLocation } from 'react-router-dom';

const Calendar = () => {
    const { state } = useLocation();
    const [currentDate, setCurrentDate] = useState(state ? new Date(state.selectedDate) : new Date());
    const [habit] = useState(state ? state.habit : null);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

        // Fill empty spaces for the first row of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="day empty"></div>);
        }

        // Fill days for the month
        for (let day = 1; day <= totalDays; day++) {
            days.push(
                <div
                    key={day}
                    className={`day ${currentDate.getDate() === day && currentDate.getMonth() === currentDate.getMonth() &&
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

    const changeDay = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const calculateStats = () => {
        if (!habit || !habit.frequencyDays) return {};

        const currentMonth = currentDate.getMonth(); 
        const currentYear = currentDate.getFullYear(); 

        let totalTrackedDays = 0;
        let completedTrackedDays = 0;

        for (let day = 1; day <= daysInMonth(currentMonth, currentYear); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay();

            if (habit.frequencyDays.includes(dayOfWeek)) {
                totalTrackedDays++;
                if (habit.completedDates.includes(date.toISOString().split('T')[0])) {
                    completedTrackedDays++;
                }
            }
        }

        return {
            totalTrackedDays,
            completedTrackedDays,
        };
    };

    const stats = calculateStats();

    return (
        <div className="calendar-wrapper">
            <div className="calendar-container">
                <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

            <div className="calendar-navigation">
                <button onClick={() => changeMonth(-1)}>&lt;</button>
                <span>{currentDate.toDateString().split(" ")[1] + " " + currentDate.toDateString().split(" ")[3]}</span>
                <button onClick={() => changeMonth(1)}>&gt;</button>
            </div>

            <div className="calendar-stats">
                <h3>Stats</h3>
                {habit && stats.totalTrackedDays > 0 && (
                    <>
                        <p><strong>Total Tracked Days:</strong> {stats.totalTrackedDays}</p>
                        <p><strong>Completed Days:</strong> {stats.completedTrackedDays}</p>
                        <p><strong>Completion Rate:</strong> {((stats.completedTrackedDays / stats.totalTrackedDays) * 100).toFixed(2)}%</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Calendar;