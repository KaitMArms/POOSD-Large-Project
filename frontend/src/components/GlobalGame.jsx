import { LoadGameReq } from '../components/GlobalGame.tsx';
const response = await fetch(LoadGameReq('api/GlobalGame'),
    {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});