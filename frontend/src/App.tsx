import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css';
import LoginPage from './pages/LoginPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
function App()
{
  return (
    <Router >
      <Routes>
        <Route path="/" element={<LoginPage />}/>
        <Route path="/profile" element={<UserProfilePage />}/>
      </Routes>
    </Router>
  );
}
export default App
