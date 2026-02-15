import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRoomListener from "../hooks/useRoomListener";
import { resetGame } from "../services/roomService";

const GameOver = () => {
  const navigate = useNavigate();
  const passcode = sessionStorage.getItem("passcode");
  const playerRole = sessionStorage.getItem("playerRole");
  const { roomData, loading } = useRoomListener(passcode);

  // Redirect if no session
  useEffect(() => {
    if (!passcode || !playerRole) {
      navigate("/");
    }
  }, [passcode, playerRole, navigate]);

  // If game resets (status changes to playing), navigate back to game
  useEffect(() => {
    if (roomData && roomData.status === "playing") {
      navigate("/game");
    }
  }, [roomData, navigate]);

  const handlePlayAgain = async () => {
    try {
      await resetGame(passcode);
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const handleExit = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (loading || !roomData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const { game, score } = roomData;
  const isWinner = game.winner === playerRole;
  const isDraw = game.isDraw;

  // Determine result text and styling
  let resultTitle, resultSubtitle, resultColor, resultIcon;
  if (isDraw) {
    resultTitle = "It's a Draw!";
    resultSubtitle = "Well played by both sides.";
    resultColor = "warning";
    resultIcon = "=";
  } else if (isWinner) {
    resultTitle = "You Won!";
    resultSubtitle = "Congratulations! Great moves.";
    resultColor = "success";
    resultIcon = playerRole === "player1" ? "X" : "O";
  } else {
    resultTitle = "You Lost!";
    resultSubtitle = "Better luck next time.";
    resultColor = "danger";
    resultIcon = playerRole === "player1" ? "O" : "X";
  }

  // Render the final board
  const renderFinalBoard = () => (
    <div className="game-board game-board-small mb-4">
      {game.state.map((cell, index) => {
        const isWinCell = game.winLine && game.winLine.includes(index);
        return (
          <div
            key={index}
            className={`game-cell game-cell-small ${
              cell === "X" ? "cell-x" : cell === "O" ? "cell-o" : ""
            } ${isWinCell ? "cell-win" : ""}`}
          >
            {cell}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark px-3">
      <div
        className="card bg-dark border border-secondary text-center"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="card-body p-4 p-md-5">
          {/* Result Icon */}
          <div
            className={`display-1 fw-bold text-${resultColor} mb-2`}
          >
            {resultIcon}
          </div>

          {/* Result Title */}
          <h2 className={`text-${resultColor} fw-bold mb-1`}>
            {resultTitle}
          </h2>
          <p className="text-secondary mb-4">{resultSubtitle}</p>

          {/* Final Board */}
          {renderFinalBoard()}

          {/* Scoreboard */}
          {score && (
            <div className="d-flex gap-2 align-items-center mb-4">
              <div className="flex-fill p-2 rounded text-center bg-primary bg-opacity-10 border border-primary border-opacity-25">
                <div className="text-secondary small">P1 (X)</div>
                <div className="text-primary fw-bold fs-5">{score.player1Wins}</div>
              </div>
              <div className="flex-fill p-2 rounded text-center bg-warning bg-opacity-10 border border-warning border-opacity-25">
                <div className="text-secondary small">Draws</div>
                <div className="text-warning fw-bold fs-5">{score.draws}</div>
              </div>
              <div className="flex-fill p-2 rounded text-center bg-danger bg-opacity-10 border border-danger border-opacity-25">
                <div className="text-secondary small">P2 (O)</div>
                <div className="text-danger fw-bold fs-5">{score.player2Wins}</div>
              </div>
              <div className="flex-fill p-2 rounded text-center bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                <div className="text-secondary small">Total</div>
                <div className="text-light fw-bold fs-5">{score.totalMatches}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="d-grid gap-2">
            <button
              className={`btn btn-${resultColor} btn-lg fw-semibold`}
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={handleExit}
            >
              Exit Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
