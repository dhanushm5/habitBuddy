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
        border: '2px solid #000',
    };

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
        height: '10px',
        borderBottom: '2px solid black',
        borderRadius: '0 0 10px 10px',
    };

    const renderAccessory = () => {
        switch (accessory) {
            case 'bowtie':
                return <span style={{ position: 'absolute', bottom: '10%', fontSize: '20px' }}>🎀</span>;
            case 'hat':
                return <span style={{ position: 'absolute', top: '0', fontSize: '20px' }}>🎩</span>;
            case 'glasses':
                return (
                    <div style={{ position: 'absolute', top: '30%', display: 'flex', gap: '5px' }}>
                        <div style={{ ...eyeStyles, backgroundColor: 'transparent', border: '2px solid black' }}></div>
                        <div style={{ ...eyeStyles, backgroundColor: 'transparent', border: '2px solid black' }}></div>
                    </div>
                );
            case 'none':
            default:
                return null;
        }
    };

    return (
        <div className="avatar-display" style={avatarStyles}>
            {renderAccessory()}
            <div style={{ ...eyeStyles, left: '30%', top: '35%' }}></div>
            <div style={{ ...eyeStyles, right: '30%', top: '35%' }}></div>
            <div style={{ ...smileStyle, left: '40%', top: '60%' }}></div>
        </div>
    );
};

export default AvatarDisplay;