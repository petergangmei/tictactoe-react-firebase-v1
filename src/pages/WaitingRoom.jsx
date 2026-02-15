import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRoomListener from "../hooks/useRoomListener";

const WaitingRoom = () => {
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

  // Auto-navigate when game starts
  useEffect(() => {
    if (roomData && roomData.status === "playing") {
      navigate("/game");
    }
  }, [roomData, navigate]);

  const handleLeave = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="card bg-dark border border-secondary text-center" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-4 p-md-5">
          {/* Room Info */}
          <div className="mb-4">
            <span className="badge bg-secondary fs-6 px-3 py-2">
              Room: {passcode}
            </span>
          </div>

          <h3 className="text-light fw-bold mb-4">Waiting for Opponent...</h3>

          {/* Player Status */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between p-3 rounded mb-2 border border-secondary">
              <div className="d-flex align-items-center">
                <span className="badge bg-primary rounded-circle me-3 p-2">X</span>
                <span className="text-light fw-medium">Player 1</span>
                {playerRole === "player1" && (
                  <span className="badge bg-primary ms-2 small">You</span>
                )}
              </div>
              <span className="text-success small">
                <span className="me-1">&#9679;</span> Connected
              </span>
            </div>

            <div className="d-flex align-items-center justify-content-between p-3 rounded border border-secondary">
              <div className="d-flex align-items-center">
                <span className="badge bg-danger rounded-circle me-3 p-2">O</span>
                <span className="text-light fw-medium">Player 2</span>
              </div>
              <span className="text-warning small">
                <span className="spinner-grow spinner-grow-sm me-1" />
                Waiting...
              </span>
            </div>
          </div>

          {/* Animated Dots */}
          <div className="mb-4">
            <div className="spinner-border spinner-border-sm text-primary me-1" role="status" />
            <div className="spinner-border spinner-border-sm text-secondary me-1" role="status" />
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
          </div>

          <p className="text-secondary small mb-4">
            Share the passcode <strong className="text-light">{passcode}</strong> with your friend to start playing.
          </p>

          <button className="btn btn-outline-secondary" onClick={handleLeave}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
