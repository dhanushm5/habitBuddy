import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HabitStats = ({ habitId }) => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`/habits/${habitId}/stats`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT is stored in localStorage
                    },
                });
                setStats(response.data);
            } catch (err) {
                setError(err.response ? err.response.data : { error: 'Failed to fetch habit statistics' });
            }
        };

        fetchStats();
    }, [habitId]);

    if (error) {
        return <div>Error: {error.error}</div>;
    }

    if (!stats) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Habit Statistics</h2>
            <p>Total Days: {stats.totalDays}</p>
            <p>Completed Days: {stats.completedDays}</p>
            <p>Completion Rate: {stats.completionRate.toFixed(2)}%</p>
        </div>
    );
};

export default HabitStats;