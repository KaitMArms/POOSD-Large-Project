import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    return(
        // HTML code goes inside container. container = html for general page layout and info
        <div id="profileContainer">
            <h2>ud.name</h2>
            <h2>ud.username</h2>
            <h2>ud.email</h2>
        </div>
        //Maybe put an if statement here for if a flag is positive user is developer and another section for dev realted stuff pops up
    );
};

export default LoadUser;