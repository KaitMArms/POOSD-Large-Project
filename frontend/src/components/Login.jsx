import { Login } from '../components/Login.tsx';
const response = await fetch(Login('api/login'),
    {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});