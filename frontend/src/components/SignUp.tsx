import "frontend\src\index.css"

function SignUp()
{
    function doLogin(event:any) : void
    {
        event.preventDefault();
        alert('doIt()');
    }

    // put function for sign up here that calls login in after signup okayed by server
    return(
        <div id="page-container">
            <div id="sign-up-container">
                <span id="inner-title">Welcome to PlayedIt! <br>Insert your information below to join our ranks.</br></span><br />
                <input type="text" id="firstName" placeholder="First Name"/><br />
                <input type="text" id="lastName" placeholder="Last Name"/><br />
                <input type="text" id="email" placeholder="eMail" /><br />
                <input type="password" id="loginPassword" placeholder="Password" /><br />
                <input type="submit" id="loginButton" className="buttons" value = "Do It"
                onClick={doLogin} />
                <span id="sign-up-result"></span>
            </div>
        </div>
    );
};
export default SignUp;