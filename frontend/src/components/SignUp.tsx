import { useState } from "react";
import { Link } from "react-router-dom";

function SignUp()
{
    const [showPassword, setShowPassword] = useState(false);

    async function doSignUp(event: any): Promise<void> {
        event.preventDefault();

        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

        try {
            const response = await fetch('https://playedit.games:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
            });

            const data = await response.json();

            if (response.ok) {
            console.log('Sign up successful:', data);
            // ✅ Redirect to login page after success
            window.location.href = "/";
            } else {
            console.error('Sign up failed:', data.message);
            const result = document.getElementById("sign-up-result");
            if (result) result.innerText = data.message ?? "Sign up failed.";
            }

        } catch (error) {
            console.error('An error occurred:', error);
            const result = document.getElementById("sign-up-result");
            if (result) result.innerText = "Server error — try again later.";
        }
    }

    // put function for sign up here that calls login in after signup okayed by server
    return(
        <div id="page-container">
            <div id="sign-up-container">
                <span id="inner-title">Welcome to PlayedIt!</span><br />
                <span id="inner-smaller-title">Insert your information below to join our ranks.</span><br />
                <input type="text" id="firstName" placeholder="First Name"/><br />
                <input type="text" id="lastName" placeholder="Last Name"/><br />
                <input type="text" id="email" placeholder="eMail" /><br />
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
                <input type="submit" id="loginButton" className="buttons" value = "Sign Up"
                onClick={doSignUp} />
                <span id="sign-up-result"></span>
                <p className="login-link"> Already have an account? <br /><Link to="/">Log In</Link></p>
            </div>
        </div>
    );
};
export default SignUp;