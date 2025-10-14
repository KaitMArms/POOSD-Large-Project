// This page will have all of the recommendations for games of the user & popular games. Search feature + add to personal list feature
import PageTitle from '../components/PageTitle.tsx';
import LoadGameReq from '../components/GlobalGame.tsx';

const GlobalGamesPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoadGameReq />
        </div>
    );
};
export default GlobalGamesPage;