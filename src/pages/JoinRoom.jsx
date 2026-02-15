import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { enterRoom } from "../services/roomService";

const JoinRoom = () => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    const trimmed = passcode.trim();

    if (!trimmed) {
      setError("Please enter a passcode.");
      return;
    }

    if (trimmed.length < 3) {
      setError("Passcode must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { role, error: roomError } = await enterRoom(trimmed);

      if (roomError) {
        setError(roomError);
        setLoading(false);
        return;
      }

      // Store session info
      sessionStorage.setItem("passcode", trimmed);
      sessionStorage.setItem("playerRole", role);

      // Navigate based on role
      if (role === "player1") {
        navigate("/waiting");
      } else {
        navigate("/game");
      }
    } catch (err) {
      console.error("Join error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="card bg-dark border border-secondary" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-4 p-md-5">
          {/* Logo / Title */}
          <div className="text-center mb-4">
            <div className="display-1 mb-2">
              <span className="text-primary">X</span>
              <span className="text-light mx-1">|</span>
              <span className="text-danger">O</span>
            </div>
            <h2 className="text-light fw-bold mb-1">Tic Tac Toe</h2>
            <p className="text-secondary small">
              Enter a passcode to create or join a room
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleJoin}>
            <div className="mb-3">
              <label htmlFor="passcode" className="form-label text-secondary small">
                Room Passcode
              </label>
              <input
                type="text"
                id="passcode"
                className="form-control form-control-lg bg-dark text-light border-secondary text-center"
                placeholder="e.g. 7392"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                maxLength={20}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Connecting...
                </>
              ) : (
                "Enter Room"
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="text-center mt-4">
            <small className="text-secondary">
              Share the same passcode with your friend to play together.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
