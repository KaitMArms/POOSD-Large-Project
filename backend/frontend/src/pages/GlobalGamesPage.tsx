// This page will have all of the recommendations for games of the user & popular games. Search feature + add to personal list feature
import PageTitle from '../components/PageTitle.tsx';
import LoadGlobalGame from '../components/GlobalGame.tsx';
import "./GlobalGames.css"
const GlobalGamesPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoadGlobalGame />
        </div>
    );
};
export default GlobalGamesPage;