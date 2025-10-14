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
                <h2>Dev Stuff Here</h2>
            </div>
        );
    }
    else
    {
        return null;
    }
}
export default LoadDevUser;