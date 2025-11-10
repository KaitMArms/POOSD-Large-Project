// This is where the user can see their profile with all of their stats and their settings such as change in and delete account
import PageTitle from '../components/PageTitle.tsx';
import LoadUser from '../components/LoadUser.tsx';
import LoadDevUser from '../components/LoadDevUser.tsx';
import "../pages/DevUserProfile.css";
import "../pages/UserProfile.css";
import "../index.css";

const UserProfilePage = () =>
{
    const devFlag = false; // figure out dynamic solution temp placeholder
    
    return(
        <div>
            <PageTitle />
            <LoadUser />
            <LoadDevUser event={devFlag}/>
        </div>
    );
};
export default UserProfilePage;