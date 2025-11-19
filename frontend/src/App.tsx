import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css';
import { ModeProvider } from "./components/ColorMode";
import LoginPage from './pages/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
import GlobalGamesPage from './pages/GlobalGamesPage.tsx';
import UserGamesPage from './pages/UserGamesPage.tsx';
import GamePage from "./pages/GamePage.tsx";
function App()
{
  return (
    <ModeProvider>
      <Router >
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />}/>
            <Route path="/signup" element={<SignUpPage />}/>
            <Route path="/profile" element={<UserProfilePage />}/>
            <Route path="/all-games" element={<GlobalGamesPage />}/>
            <Route path="/my-games" element={<UserGamesPage />}/>
            <Route path="/game/:slug" element={<GamePage />} />
          </Routes>
        </main>
      </Router>
    </ModeProvider>
  );
}
export default App
