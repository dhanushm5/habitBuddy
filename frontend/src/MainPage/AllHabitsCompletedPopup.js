// AllHabitsCompletedPopup.js
import React from 'react';
// import './AllHabitsCompletedPopup.css';
import dayCompletedSound from './sounds/dayCompleted.mp3';

const AllHabitsCompletedPopup = ({ setHabitCount}) => {
    return (
        <div className="popup">
            <div className="popup-content">
                <h2>Congratulations!</h2>
                <p style = {{fontSize: "20px"}}>You've completed all your habits for the day!</p>
                <audio src={dayCompletedSound} autoPlay />
                <button className = "popup-button" onClick={() => setHabitCount(0)}>Close</button>
            </div>
        </div>
    );
};

export default AllHabitsCompletedPopup;