import { useState, useEffect } from "react";
import EditUser from '../components/EditUser'; // extension optional

// Light & Dark Mode Controller
// This component page will load the users profile after login
function LoadUser()
{
    const[editing, setEditing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('https://playedit.games/api/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    setError(errorData.message || "Failed to fetch user profile.");
                }
            } catch (err) {
                setError("An error occurred while fetching the user profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);


    // If we're editing the user, then use a EditUser component instead of this one.
    if (editing) {
        return <EditUser initial={user} onClose={() => setEditing(false)} />;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>No user data.</div>;
    }

    return(
        // HTML code goes inside container. container = html for general page layout and info
        <div>
            <div className="user-container">
                <div className="pfp-container">
                    <img alt={`${user.username}'s avatar`} src={user.avatarUrl ?? "/default-pfp.png"} />
                </div>
                <div className="info-container">
                    <span className="profile-name-span">{user.firstName} {user.lastName}'s Profile</span>
                    <span className="user-info-span">{user.username}</span>
                    <span className="user-info-span">{user.email}</span>
                </div>
            </div>
            <div className="settings-container">
                <button id="mode-toggle">Toggle Page's Color Mode</button>
                <label className='dev-check-container'>
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    <span className="label-checkbox">Toggle Dev User</span>
                </label>

            </div>
        </div>
    );
};

export default LoadUser;