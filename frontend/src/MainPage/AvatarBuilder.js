// Filename: AvatarBuilder.js

import React, { useState } from 'react';

const AvatarBuilder = ({ avatar, setAvatar, token }) => {
    const [color, setColor] = useState(avatar?.color || '#ffcc00');
    const [accessory, setAccessory] = useState(avatar?.accessory || 'none');
    const [shape, setShape] = useState(avatar?.shape || 'circle');

    const handleSave = async () => {
        const updatedAvatar = { color, accessory, shape };
        setAvatar(updatedAvatar);

        try {
            const response = await fetch('http://localhost:2000/avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedAvatar),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to save avatar:', errorData.error, errorData.details);
            } else {
                const result = await response.json();
                console.log(result.message);
            }
        } catch (error) {
            console.error('Error sending avatar data:', error);
        }
    };

    return (
        <div className="avatar-builder">
            <h3>Build Your Avatar</h3>
            
            <label>
                Shape:
                <select value={shape} onChange={(e) => setShape(e.target.value)}>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>

            <label>
                Color:
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                />
            </label>

            <label>
                Accessory:
                <select value={accessory} onChange={(e) => setAccessory(e.target.value)}>
                    <option value="none">None</option>
                    <option value="bowtie">Bow Tie</option>
                    <option value="hat">Hat</option>
                    <option value="glasses">Glasses</option>
                    <option value="scarf">Scarf</option>
                </select>
            </label>

            <button onClick={handleSave}>Save Avatar</button>
        </div>
    );
};

export default AvatarBuilder;
