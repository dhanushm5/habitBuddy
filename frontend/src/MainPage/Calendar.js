import React, { useState, useEffect, useRef } from 'react';
import './Calendar.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Chart from 'chart.js/auto';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

// Helper functions
const shiftDate = (date, numDays) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
};

const calculateWeekdayCompletions = (completedDates) => {
  const weekdays = Array(7).fill(0);
  completedDates.forEach(dateStr => {
    const date = new Date(dateStr);
    const day = date.getDay();
    weekdays[day]++;
  });
  return weekdays;
};

// HabitGraph component
const HabitGraph = ({ habit, currentDate, completedDates }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const calculateGraphData = () => {
      const labels = [];
      const data = [];
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = date.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
        labels.push(day);
        if (habit.frequencyDays.includes(date.getDay())) {
          data.push(completedDates.includes(dateString) ? 1 : 0);
        } else {
          data.push(null);
        }
      }
      return { labels, data };
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (canvasRef.current && habit) {
      const chartContext = canvasRef.current.getContext('2d');
      const { labels, data } = calculateGraphData();
      const gradient = chartContext.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(75, 192, 192, 1)');
      gradient.addColorStop(1, 'rgba(75, 192, 192, 0)');

      chartInstanceRef.current = new Chart(chartContext, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Habit Completion',
              data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: gradient,
              tension: 0.4,
              fill: true,
              spanGaps: true,
              pointBackgroundColor: data.map(point =>
                point === 1 ? 'rgba(34, 197, 94, 1)' : point === 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(229, 231, 235, 1)'
              ),
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                label: function (tooltipItem) {
                  return tooltipItem.raw === 1 ? 'Completed' : tooltipItem.raw === 0 ? 'Missed' : 'Not Tracked';
                },
              },
            },
            legend: {
              display: true,
              labels: {
                font: { size: 14, weight: 'bold' },
                color: '#4B5563',
              },
            },
          },
          animations: {
            tension: {
              duration: 2000,
              easing: 'easeInOutBounce',
              from: 0.8,
              to: 0.4,
              loop: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value === 1 ? 'Completed' : value === 0 ? 'Missed' : '';
                },
                font: { size: 12 },
              },
              grid: {
                color: 'rgba(229, 231, 235, 0.5)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Days of the Month',
                font: { size: 14, weight: 'bold' },
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [habit, currentDate, completedDates]);

  return <canvas ref={canvasRef} style={{ maxHeight: '400px' }} />;
};

const Calendar = () => {
  const { state } = useLocation();
  const [currentDate, setCurrentDate] = useState(state?.selectedDate ? new Date(state.selectedDate) : new Date());
  const [habit, setHabit] = useState(state?.habit || null);
  const [completedDates, setCompletedDates] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state?.selectedDate) setCurrentDate(new Date(state.selectedDate));
    if (state?.habit) setHabit(state.habit);
  }, [state]);

  useEffect(() => {
    if (habit) {
      fetchHabitData();
      fetchHabitStats();
    }
  }, [habit]);

  const fetchHabitData = async () => {
    if (!habit?._id) {
      console.error('Habit or habit._id is undefined:', habit);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:2000/habits/${habit._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCompletedDates(response.data.completedDates || []);
    } catch (error) {
      console.error('Error fetching habit data', error);
      setError('Failed to fetch habit data.');
    }
  };

  const fetchHabitStats = async () => {
    if (!habit?._id) {
      console.error('Habit or habit._id is undefined:', habit);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:2000/habits/${habit._id}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching habit stats', error);
      setError('Failed to fetch habit statistics.');
    }
  };

  const totalDays = stats?.totalDays || 0;
  const completedDays = stats?.completedDays || 0;
  const completionRate = stats?.completionRate.toFixed(2) || 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const weekdayCompletions = stats ? calculateWeekdayCompletions(completedDates) : Array(7).fill(0);

  const barChartData = {
    labels: ['Total Days', 'Completed Days'],
    datasets: [
      {
        label: 'Days',
        data: [totalDays, completedDays],
        backgroundColor: ['#4db6ac', '#3eb489'],
      },
    ],
  };

  const pieChartData = {
    labels: ['Completed', 'Missed'],
    datasets: [
      {
        data: [completedDays, totalDays - completedDays],
        backgroundColor: ['#3eb489', '#dadcdc'],
      },
    ],
  };

  const weekdayCompletionsData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Completions',
        data: weekdayCompletions,
        backgroundColor: '#3eb489',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Habit Progress' },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Completion Rate' },
    },
  };

  const weekdayBarChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Completions by Weekday' },
    },
  };

  const generateCalendar = () => {
    const days = [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayIndex = date.getDay();
    const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const nextDays = 42 - (firstDayIndex + lastDay);

    for (let x = firstDayIndex; x > 0; x--) {
      days.push(<div className="prev-date" key={`prev-${x}`}>{prevLastDay - x + 1}</div>);
    }

    for (let i = 1; i <= lastDay; i++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
      const formattedDate = dayDate.toISOString().split('T')[0];
      const isCompleted = completedDates.includes(formattedDate);

      days.push(
        <div
          className={`day ${isCompleted ? 'completed' : ''}`}
          key={`current-${i}`}
          onClick={() => setCurrentDate(dayDate)}
        >
          {i}
          {isCompleted && <span className="dot"></span>}
        </div>
      );
    }

    for (let j = 1; j <= nextDays; j++) {
      days.push(<div className="next-date" key={`next-${j}`}>{j}</div>);
    }

    return days;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const prevMonth = () => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - 1);
    setCurrentDate(date);
  };

  const nextMonth = () => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    setCurrentDate(date);
  };

  return (
    <div className="calendar-container">
      <h1>{habit ? habit.name : 'Habit Calendar'}</h1>

      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      <div className="calendar">
        <div className="weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="days">{generateCalendar()}</div>
      </div>

      {error && <div className="error">{error}</div>}

      {stats && (
        <div className="stats">
          <div className="statsText">
            <h3>Statistics</h3>
            <p>Total Days: {totalDays}</p>
            <p>Completed Days: {completedDays}</p>
            <p>Completion Rate: {completionRate}%</p>
            <p>Current Streak: {currentStreak} days</p>
            <p>Longest Streak: {longestStreak} days</p>
          </div>

          <div className="chart-container">
            <h4>Completion Overview</h4>
            <Bar data={barChartData} options={barChartOptions} />

            <h4>Completion Rate</h4>
            <Pie data={pieChartData} options={pieChartOptions} />

            <h4>Completions by Weekday</h4>
            <Bar data={weekdayCompletionsData} options={weekdayBarChartOptions} />

            <h4>Habit Completion Graph</h4>
            <HabitGraph habit={habit} currentDate={currentDate} completedDates={completedDates} />
          </div>

          <div className="heatmap">
            <h4>Habit Completion Heatmap</h4>
            <CalendarHeatmap
              startDate={shiftDate(new Date(), -150)}
              endDate={new Date()}
              values={completedDates.map(date => ({ date, count: 1 }))}
              classForValue={(value) => {
                if (!value) {
                  return 'color-empty';
                }
                return value.count > 0 ? 'color-filled' : 'color-empty';
              }}
              showWeekdayLabels={true}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) {
                  return { 'data-tip': 'No data' };
                }
                return { 'data-tip': `${value.date}: ${value.count} completions` };
              }}
            />
            <ReactTooltip />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;