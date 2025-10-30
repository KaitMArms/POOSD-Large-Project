import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Mode from '../components/ColorMode.tsx';

// Light & Dark Mode Controller
// This component page will load the users profile after login
function LoadUser()
{

    const[editing, setEditing] = useState(false);

    // Get user data from local storage
    // todo: verify that this is actually how it's serialized
    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let uid : string = ud.id;

    // If we're editing the user, then use a EditUser component instead of this one. 
    if (editing) {
        return <EditUser onClose={() => setEditing(false)} />;
    }

    // Button controller
    const modeButton = document.getElementById('mode-toggle');
    modeButton?.addEventListener('click', () => {
        

    });

    return(
        // HTML code goes inside container. container = html for general page layout and info
        <div id="page-container">
            <div id="user-container">
                <div id="pfp-container">
                    <img></img>
                </div>
                <div id="info-container">
                    <span id="profile-name-span">{ud.name}'s Profile</span>
                    <span id="user-info-span">{ud.username}</span>
                    <span id="user-info-span">{ud.email}</span>
                </div>
            </div>
            <div id="settings-container">
                <button id="mode-toggle">Toggle Page's Color Mode</button>
            </div>
        </div>
        //Maybe put an if statement here for if a flag is positive user is developer and another section for dev realted stuff pops up
    );
};

export default LoadUser;