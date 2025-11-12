import '../pages/DevUserProfile.css';

// Load the dev info & related setting on the profile
type LoadDevUserProps =
{
    event: boolean;
}

const LoadDevUser: React.FC<LoadDevUserProps> =({ event }) =>
{
    if(event === true)
    {
        return(
            // put stuff that is supposed to be on dev user in here
            <div className="devProfileContainer">
                <span className="dev-title">Your Games in Development</span>
                <span className="dev-games"></span>
            </div>
        );
    }
    else
    {
        return null;
    }
}
export default LoadDevUser;