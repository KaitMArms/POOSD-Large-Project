import { LoadUserGames } from '../components/LoadUserGames.tsx';
const response = await fetch(LoadUserGames('api/LoadUserGames'),
    {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});