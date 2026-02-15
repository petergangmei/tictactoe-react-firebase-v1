import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import JoinRoom from "./pages/JoinRoom";
import WaitingRoom from "./pages/WaitingRoom";
import GameBoard from "./pages/GameBoard";
import GameOver from "./pages/GameOver";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/game" element={<GameBoard />} />
        <Route path="/gameover" element={<GameOver />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
