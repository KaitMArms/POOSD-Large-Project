import PageTitle from '../components/PageTitle.tsx';
import LoadGame from '../components/LoadGame.tsx';
import "./GamePage.css"
import "../index.css";

const GamePage = () =>
{
    return(
        <div className='page-container'>
            <PageTitle />
            <LoadGame />
        </div>
    );
};
export default GamePage; 