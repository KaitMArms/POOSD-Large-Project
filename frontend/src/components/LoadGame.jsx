import { LoadGame } from '../components/LoadGame.tsx';
const response = await fetch(LoadGame('api/LoadGame'),
    {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});