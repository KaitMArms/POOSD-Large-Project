import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle.tsx';
import LoadGame from '../components/LoadGame.tsx';
import LoadGameEdit from '../components/LoadGameEdit.tsx';
import "./GamePage.css"
import "../index.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://playedit.games";

const GamePage = () =>
{
    const { id } = useParams<{ id?: string }>();
    const [isGameInUserList, setIsGameInUserList] = useState<boolean | null>(null);
    const [isLoadingUserList, setIsLoadingUserList] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;

        const checkUserGameList = async () => {
            setIsLoadingUserList(true);
            const token = localStorage.getItem("token");

            if (!token || !id) {
                setIsGameInUserList(false);
                setIsLoadingUserList(false);
                return;
            }

            const numericId = Number(id);
            if (isNaN(numericId)) {
                setIsGameInUserList(false);
                setIsLoadingUserList(false);
                return;
            }

            try {
                const userGamesResp = await fetch(`${API_BASE}/api/user/games/list`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (cancelled) return;

                if (userGamesResp.ok) {
                    const userGamesData = await userGamesResp.json();
                    const games = Array.isArray(userGamesData.games) ? userGamesData.games : [];

                    const gameInList = games.find((g: any) => g.gameId === numericId);

                    setIsGameInUserList(!!gameInList);
                } else {
                    setIsGameInUserList(false);
                }
            } catch (error) {
                console.error("Error checking user game list:", error);
                setIsGameInUserList(false);
            } finally {
                if (!cancelled) {
                    setIsLoadingUserList(false);
                }
            }
        };

        checkUserGameList();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoadingUserList) {
        return (
            <div className='page-container'>
                <PageTitle />
                <div>Loading game status...</div>
            </div>
        );
    }

    return(
        <div className='page-container'>
            <PageTitle />
            {isGameInUserList ? <LoadGameEdit /> : <LoadGame />}
        </div>
    );
};

export default GamePage;
