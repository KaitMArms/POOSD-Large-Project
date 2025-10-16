/*import { Login } from '../components/Login.tsx';
const response = await fetch(Login('api/login'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
API lines currently throwing errors. Figure out how to fix*/
function Login()
{
    function doLogin(event:any) : void
    {
        event.preventDefault();
        alert('doIt()');
    }

    return(
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
            <input type="text" id="loginName" placeholder="Username" /><br />
            <input type="password" id="loginPassword" placeholder="Password" /><br />
            <input type="submit" id="loginButton" className="buttons" value = "Do It" onClick={doLogin} />
            <span id="loginResult"></span>
        </div>
    );
};
export default Login;