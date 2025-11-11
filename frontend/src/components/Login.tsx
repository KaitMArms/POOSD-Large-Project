import { useState } from "react";
import { Link } from "react-router-dom";

function Login()
{
    const [showPassword, setShowPassword] = useState(false);

    async function doLogin(event: any): Promise<void> {
        event.preventDefault();
        const loginName = (document.getElementById("loginName") as HTMLInputElement).value;
        const loginPassword = (document.getElementById("loginPassword") as HTMLInputElement).value;

        try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: loginName, password: loginPassword })
        });

        const data = await response.json();
        if (response.ok) console.log('Login successful:', data);
        else console.error('Login failed:', data.message);

        } 
        catch (error) {
            console.error('An error occurred:', error);
        }
    }

    return(
        <div id="page-container">
            <div>
                <img src="/Mascot.png" alt="Controllie - PlayedIt's Mascot, he's a living breathing controller"></img>
            </div>
            <br></br>
            <div id="login-container">
                <span id="inner-title">Welcome Back to PlayedIt!</span><br />
                <input type="text" id="loginName" placeholder="Username / Email" /><br />
                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="loginPassword"
                        placeholder="Password"
                        className="login-input"
                    />
                    <button
                        type="button"
                        className="toggle-eye"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                </div>
                <input type="submit" id="loginButton" className="buttons" value = "Log In" onClick={doLogin} />
                <span id="login-result"></span>
                <p className="signup-link">New to PlayedIt? <Link to="/signup">Sign Up</Link></p>
            </div>
        </div>
    );
};
export default Login;