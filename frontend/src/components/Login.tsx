function Login()
{
    function doLogin(event:any) : void
    {
        event.preventDefault();
        alert('doIt()');
    }

    return(
        <div id="page-container">
            <img src="Mascot.png" alt="Controllie - PlayedIt's Mascot, he's a living breathing controller"></img>
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