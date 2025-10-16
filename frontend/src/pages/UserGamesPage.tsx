// This will pe the page where users track their game and the progress through said games. Will need a the following sections
// Sections: Completed, In Progress, Dropped, To Play
import PageTitle from '../components/PageTitle.tsx';
import LoadUserGames from '../components/LoadUserGames.tsx';
const UserGamesPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoadUserGames />
        </div>
    );
};
export default UserGamesPage;