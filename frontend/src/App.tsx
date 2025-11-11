import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css';
import LoginPage from './pages/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import VerifyEmailPage from "./pages/VerifyEmailPage.tsx";
import UserProfilePage from './pages/UserProfilePage.tsx';
import GlobalGamesPage from './pages/GlobalGamesPage.tsx';
import UserGamesPage from './pages/UserGamesPage.tsx';
import GamePage from "./pages/GamePage.tsx";
function App()
{
  return (
    <Router >
      <Routes>
        <Route path="/" element={<LoginPage />}/>
        <Route path="/signup" element={<SignUpPage />}/>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/profile" element={<UserProfilePage />}/>
        <Route path="/all-games" element={<GlobalGamesPage />}/>
        <Route path="/my-games" element={<UserGamesPage />}/>
        <Route path="/game/:id" element={<GamePage />} />
      </Routes>
    </Router>
  );
}
export default App
