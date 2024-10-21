// AvatarBuilder.js
import React, { useState } from 'react';

const AvatarBuilder = ({ avatar, setAvatar, token }) => {
    const [color, setColor] = useState(avatar.color || '#ffcc00'); // Default avatar color
    const [accessory, setAccessory] = useState(avatar.accessory || 'glasses'); // Default accessory
    const [shape, setShape] = useState(avatar.shape || 'circle'); // Default shape

    const handleSave = async () => {
        setAvatar({ color, accessory, shape });
    
        // Send the avatar data to the backend
        try {
            const response = await fetch('http://localhost:2000/avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Make sure you replace `your_token` with the actual token
                },
                body: JSON.stringify({ color, accessory, shape }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to save avatar:', errorData.error, errorData.details); // Log more details
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
            
            {/* Shape Customization */}
            <label>
                Shape:
                <select value={shape} onChange={(e) => setShape(e.target.value)}>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                </select>
            </label>

            {/* Color Customization */}
            <label>
                Color:
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                />
            </label>

            {/* Accessory Customization */}
            <label>
                Accessory:
                <select value={accessory} onChange={(e) => setAccessory(e.target.value)}>
                    <option value="bowtie">Bow Tie</option>
                    <option value="hat">Hat</option>
                    <option value="none">None</option>
                </select>
            </label>

            <button onClick={handleSave}>Save Avatar</button>
        </div>
    );
};

export default AvatarBuilder;
