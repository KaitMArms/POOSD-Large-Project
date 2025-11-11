function Login()
{
    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();
        
        const loginNameInput = document.getElementById('loginName') as HTMLInputElement;
        const loginPasswordInput = document.getElementById('loginPassword') as HTMLInputElement;
        const loginName = loginNameInput.value;
        const loginPassword = loginPasswordInput.value;

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginName, password: loginPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful login (e.g., save token, redirect)
                console.log('Login successful:', data);
                // window.location.href = '/profile';
            } else {
                // Handle login failure
                console.error('Login failed:', data.message);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }

    return(
        <div id="page-container">
            <img src="/Mascot.png" alt="Controllie - PlayedIt's Mascot, he's a living breathing controller"></img>
            <br></br>
            <div id="login-div">
                <span id="inner-title">Welcome Back to PlayedIt!</span><br />
                <input type="text" id="loginName" placeholder="Username" /><br />
                <input type="password" id="loginPassword" placeholder="Password" /><br />
                <input type="submit" id="loginButton" className="buttons" value = "Log In" onClick={doLogin} />
                <span id="login-result"></span>
                <span id="inner-title">New to PlayedIt? Make an account.</span><br />
                <a href="../pages/SignUpPage.tsx">Sign Up</a>
                
            </div>
        </div>
    );
};
export default Login;