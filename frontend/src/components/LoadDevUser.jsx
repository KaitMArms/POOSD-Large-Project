import { LoadDevUser } from '../components/LoadDevUser.tsx';
const response = await fetch(LoadDevUser('api/LoadDevUser'),
    {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});