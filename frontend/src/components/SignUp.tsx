import { useState } from "react";
import { Link } from "react-router-dom";

function SignUp()
{
    const [showPassword, setShowPassword] = useState(false);

    async function doSignUp(event:any) : Promise<void>
    {
        event.preventDefault();
        
        const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
        const lastNameInput = document.getElementById('lastName') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const loginPasswordInput = document.getElementById('loginPassword') as HTMLInputElement;

        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const email = emailInput.value;
        const password = loginPasswordInput.value;

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Sign up successful:', data);
                // maybe redirect to login page
            } else {
                console.error('Sign up failed:', data.message);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }

    // put function for sign up here that calls login in after signup okayed by server
    return(
        <div id="page-container">
            <div id="sign-up-container">
                <span id="inner-title">Welcome to PlayedIt! <br>Insert your information below to join our ranks.</br></span><br />
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
                <input type="submit" id="loginButton" className="buttons" value = "Do It"
                onClick={doSignUp} />
                <span id="sign-up-result"></span>
                <p className="login-link"> Already have an account? <br></br> <Link to="/">Log In</Link></p>
            </div>
        </div>
    );
};
export default SignUp;