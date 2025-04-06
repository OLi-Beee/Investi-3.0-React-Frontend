import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from "./pages/home";
import SignIn from './pages/signin';
import Signup from './pages/signup';
import DashboardPage from './pages/dashboard';
import ChatPage from "./pages/dashboard/chat"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signin" element={<SignIn/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/dashboard" element={<DashboardPage/>} />
      <Route path="/chat" element={<ChatPage/>} />
    </Routes>
  );
}

export default App;
