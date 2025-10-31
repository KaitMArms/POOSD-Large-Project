interface EditUserProps {
  onClose: () => void;
}


function EditUser({onClose} : EditUserProps) {
    return(
        <div id="page-container">
            <div id="signUpDiv">
            <span id="inner-title">Edit User Details</span><br />
            <input type="text" id="firstName" placeholder="First Name"/><br />
            <input type="text" id="lastName" placeholder="Last Name"/><br />
            <input type="text" id="loginName" placeholder="Username" /><br />
            <input type="password" id="loginPassword" placeholder="Password" /><br />
            <input type="submit" id="loginButton" className="buttons" value = "Submit"
            onClick={onClose} />
            
            <span id="loginResult"></span>
            </div>
        </div>
    );
}

