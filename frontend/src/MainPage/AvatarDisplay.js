// AvatarDisplay.js
import React from 'react';

const AvatarDisplay = ({ avatar }) => {
    const { color, accessory, shape } = avatar;

    const avatarStyles = {
        backgroundColor: color,
        width: '100px',
        height: '100px',
        borderRadius: shape === 'circle' ? '50%' : '0%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    };

    // Styles for the eyes
    const eyeStyles = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: 'black',
        borderRadius: '50%',
    };

    const smileStyle = {
        position: 'absolute',
        width: '20px',
        height: '20px',
        backgroundColor: 'black',
        borderRadius: '50%',
    }

    return (
        <div className="avatar-display" style={avatarStyles}>
            {/* Conditionally render accessories */}
            {accessory === 'bowtie' && (
                <span style={{ position: 'absolute', top: '85%', fontSize: '20px' }}>🎀</span>
            )}
            {accessory === 'hat' && (
                <span style={{ position: 'absolute', top: '0', fontSize: '20px' }}>🎩</span>
            )}

            <div style={{ ...eyeStyles, left: '30%', top: '35%' }}></div>
            <div style={{ ...eyeStyles, right: '30%', top: '35%' }}></div>
            <div style = {{ ...smileStyle, right: '30%', left: '40%', top: '60%'}}></div>  
        </div>
    );
};

export default AvatarDisplay;
