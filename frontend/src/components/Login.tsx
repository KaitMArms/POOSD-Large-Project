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
            <div id="login-div">
                <span id="inner-title">Welcome Back to PlayedIt!</span><br />
                <input type="text" id="loginName" placeholder="Username" /><br />
                <input type="password" id="loginPassword" placeholder="Password" /><br />
                <input type="submit" id="loginButton" className="buttons" value = "Do It" onClick={doLogin} />
                <span id="login-result"></span>
            </div>
        </div>
    );
};
export default Login;