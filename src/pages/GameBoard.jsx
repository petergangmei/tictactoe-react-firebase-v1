import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useRoomListener from "../hooks/useRoomListener";
import { makeMove, disconnectPlayer } from "../services/roomService";

const GameBoard = () => {
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

  // Navigate to game over when finished
  useEffect(() => {
    if (roomData && roomData.status === "finished") {
      navigate("/gameover");
    }
  }, [roomData, navigate]);

  // Handle browser close / tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (passcode && playerRole) {
        disconnectPlayer(passcode, playerRole);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [passcode, playerRole]);

  const handleCellClick = useCallback(
    async (index) => {
      if (!roomData || roomData.status !== "playing") return;
      if (roomData.game.turn !== playerRole) return;
      if (roomData.game.state[index] !== null) return;

      await makeMove(passcode, index, playerRole);
    },
    [roomData, passcode, playerRole]
  );

  if (loading || !roomData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const { game, players, score } = roomData;
  const isMyTurn = game.turn === playerRole;
  const myMarker = playerRole === "player1" ? "X" : "O";
  const opponentRole = playerRole === "player1" ? "player2" : "player1";
  const opponentDisconnected = !players[opponentRole]?.connected;

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark px-3">
      {/* Header */}
      <div className="text-center mb-4" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-secondary px-3 py-2">Room: {passcode}</span>
          <span className="badge bg-primary px-3 py-2">
            You: {myMarker}
          </span>
        </div>

        {/* Turn Indicator */}
        <div
          className={`p-2 rounded text-center fw-semibold ${
            isMyTurn ? "bg-success bg-opacity-25 text-success" : "bg-secondary bg-opacity-25 text-secondary"
          }`}
        >
          {isMyTurn ? "Your Turn" : "Opponent's Turn"}
        </div>

        {/* Disconnect Warning */}
        {opponentDisconnected && (
          <div className="alert alert-warning mt-2 py-2 small mb-0">
            Opponent disconnected. Waiting for reconnection...
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="game-board mb-4">
        {game.state.map((cell, index) => (
          <button
            key={index}
            className={`game-cell ${
              cell === "X" ? "cell-x" : cell === "O" ? "cell-o" : ""
            } ${!cell && isMyTurn ? "cell-hoverable" : ""}`}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !isMyTurn}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Player Info */}
      <div className="d-flex gap-3 mb-3" style={{ maxWidth: "400px", width: "100%" }}>
        <div
          className={`flex-fill p-2 rounded text-center border ${
            game.turn === "player1"
              ? "border-primary text-primary"
              : "border-secondary text-secondary"
          }`}
        >
          <div className="small">Player 1</div>
          <div className="fw-bold fs-5">X</div>
          {playerRole === "player1" && (
            <span className="badge bg-primary small">You</span>
          )}
        </div>
        <div
          className={`flex-fill p-2 rounded text-center border ${
            game.turn === "player2"
              ? "border-danger text-danger"
              : "border-secondary text-secondary"
          }`}
        >
          <div className="small">Player 2</div>
          <div className="fw-bold fs-5">O</div>
          {playerRole === "player2" && (
            <span className="badge bg-danger small">You</span>
          )}
        </div>
      </div>

      {/* Scoreboard */}
      {score && score.totalMatches > 0 && (
        <div className="d-flex gap-2 align-items-center" style={{ maxWidth: "400px", width: "100%" }}>
          <div className="flex-fill p-2 rounded text-center bg-primary bg-opacity-10 border border-primary border-opacity-25">
            <div className="text-secondary small">P1 Wins</div>
            <div className="text-primary fw-bold fs-5">{score.player1Wins}</div>
          </div>
          <div className="flex-fill p-2 rounded text-center bg-warning bg-opacity-10 border border-warning border-opacity-25">
            <div className="text-secondary small">Draws</div>
            <div className="text-warning fw-bold fs-5">{score.draws}</div>
          </div>
          <div className="flex-fill p-2 rounded text-center bg-danger bg-opacity-10 border border-danger border-opacity-25">
            <div className="text-secondary small">P2 Wins</div>
            <div className="text-danger fw-bold fs-5">{score.player2Wins}</div>
          </div>
          <div className="flex-fill p-2 rounded text-center bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
            <div className="text-secondary small">Total</div>
            <div className="text-light fw-bold fs-5">{score.totalMatches}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
