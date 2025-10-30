import Mode from '../components/ColorMode.tsx';

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
            <div id="devProfileContainer">
                <span id="dev-title">Your Games in Development</span>
                <span id="dev-games"></span>
            </div>
        );
    }
    else
    {
        return null;
    }
}
export default LoadDevUser;