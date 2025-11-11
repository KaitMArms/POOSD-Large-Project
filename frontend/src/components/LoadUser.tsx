import { useState, useEffect } from "react";
import EditUser from '../components/EditUser.tsx';

// Light & Dark Mode Controller
// This component page will load the users profile after login
function LoadUser()
{
    const[editing, setEditing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No token found. Please log in.");
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || "Failed to fetch user profile.");
                }
            } catch (err) {
                setError("An error occurred while fetching the user profile.");
            }
        };

        fetchUserProfile();
    }, []);


    // If we're editing the user, then use a EditUser component instead of this one. 
    if (editing) {
        return <EditUser initial={user} onClose={() => setEditing(false)} />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return(
        // HTML code goes inside container. container = html for general page layout and info
        <div id="page-container">
            <div id="user-container">
                <div id="pfp-container">
                    <img></img>
                </div>
                <div id="info-container">
                    <span id="profile-name-span">{user.firstName}'s Profile</span>
                    <span id="user-info-span">{user.username}</span>
                    <span id="user-info-span">{user.email}</span>
                </div>
            </div>
            <div id="settings-container">
                <button id="mode-toggle">Toggle Page's Color Mode</button>
                <label id='dev-check-container'>
                    <input type="checkbox">
                        <span id="checkmark"></span>
                        <span id="label-checkbox">Toggle Dev User</span>
                    </input>
                </label>

            </div>
        </div>
        //Maybe put an if statement here for if a flag is positive user is developer and another section for dev realted stuff pops up
    );
};

export default LoadUser;