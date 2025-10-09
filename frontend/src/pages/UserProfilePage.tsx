// This is where the user can see their profile with all of their stats and their settings such as change in and delete account
import PageTitle from '../components/PageTitle.tsx';
import LoadUser from '../components/LoadUser.tsx';
const UserProfilePage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoadUser />
        </div>
    );
};
export default UserProfilePage;