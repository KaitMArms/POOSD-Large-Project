import { LoadUser } from '../components/LoadUser.tsx';
const response = await fetch(LoadUser('api/LoadUser'),
    {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});