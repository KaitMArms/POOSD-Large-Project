import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle.tsx';
import LoadGame from '../components/LoadGame.tsx';
import EditGameModal from '../components/LoadGameEdit.tsx';
import "./GamePage.css"
import "../index.css";

const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:8080"
        : "https://playedit.games";

const GamePage = () => {
    const { slug } = useParams<{ slug?: string }>();
    const [userGameData, setUserGameData] = useState<any | null>(null);
    const [isLoadingUserList, setIsLoadingUserList] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;

        const checkUserGameList = async () => {
            setIsLoadingUserList(true);
            const token = localStorage.getItem("token");

            if (!token || !slug) {
                setUserGameData(false);
                setIsLoadingUserList(false);
                return;
            }

            const slugString = String(slug);
            if (!slugString) {
                setUserGameData(false);
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

                    const gameInList = games.find((g: any) => g.slug === slugString);

                    setUserGameData(!!gameInList);
                } else {
                    setUserGameData(false);
                }
            } catch (error) {
                console.error("Error checking user game list:", error);
                setUserGameData(false);
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
    }, [slug]);

    const handleSaveChanges = (updatedGame: any) => {
        setUserGameData(updatedGame);
    };

    const handleRemoveGame = () => {
        setUserGameData(null);
    };
    if (isLoadingUserList) {
        return (
            <div className='page-container'>
                <PageTitle />
                <div>Loading game status...</div>
            </div>
        );
    }

    return (
        <div className='page-container'>
            <PageTitle />
            {userGameData ? (
                <EditGameModal
                    game={userGameData}
                    onSave={handleSaveChanges}
                    onRemove={handleRemoveGame}
                    onClose={() => { }}
                />
            ) : (
                <LoadGame />
            )}
        </div>
    );
};

export default GamePage;
