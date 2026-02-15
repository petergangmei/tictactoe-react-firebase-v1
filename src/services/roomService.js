import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Initial empty Tic Tac Toe board (9 cells, all null)
const INITIAL_GAME_STATE = Array(9).fill(null);

/**
 * Create a new room with player1
 */
export const createRoom = async (passcode) => {
  const roomRef = doc(db, "rooms", passcode);
  await setDoc(roomRef, {
    createdAt: serverTimestamp(),
    status: "waiting",
    players: {
      player1: { connected: true },
      player2: { connected: false },
    },
    game: {
      turn: "player1",
      startedBy: "player1",
      state: INITIAL_GAME_STATE,
      winner: null,
      winLine: null,
      isDraw: false,
    },
    score: {
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      totalMatches: 0,
    },
  });
  return "player1";
};

/**
 * Join an existing room as player2
 */
export const joinRoom = async (passcode) => {
  const roomRef = doc(db, "rooms", passcode);
  await updateDoc(roomRef, {
    "players.player2.connected": true,
    status: "playing",
  });
  return "player2";
};

/**
 * Try to enter a room — returns { role, error }
 */
export const enterRoom = async (passcode) => {
  const roomRef = doc(db, "rooms", passcode);
  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) {
    // Room doesn't exist — create it, become player1
    const role = await createRoom(passcode);
    return { role, error: null };
  }

  const data = snapshot.data();

  // Check if player2 slot is available
  if (!data.players.player2.connected) {
    const role = await joinRoom(passcode);
    return { role, error: null };
  }

  // Room is full
  return { role: null, error: "Room is full. Try a different passcode." };
};

/**
 * Make a move on the board
 */
export const makeMove = async (passcode, index, playerRole) => {
  const roomRef = doc(db, "rooms", passcode);
  const snapshot = await getDoc(roomRef);
  const data = snapshot.data();

  // Validate it's the player's turn
  if (data.game.turn !== playerRole) return false;

  // Validate the cell is empty
  if (data.game.state[index] !== null) return false;

  // Validate game is still playing
  if (data.status !== "playing") return false;

  // Apply the move
  const newState = [...data.game.state];
  const marker = playerRole === "player1" ? "X" : "O";
  newState[index] = marker;

  // Check for winner
  const result = checkWinner(newState);

  const updateData = {
    "game.state": newState,
  };

  if (result.winner) {
    updateData["game.winner"] = playerRole;
    updateData["game.winLine"] = result.winLine;
    updateData["status"] = "finished";
    updateData[`score.${playerRole}Wins`] = increment(1);
    updateData["score.totalMatches"] = increment(1);
  } else if (result.isDraw) {
    updateData["game.isDraw"] = true;
    updateData["status"] = "finished";
    updateData["score.draws"] = increment(1);
    updateData["score.totalMatches"] = increment(1);
  } else {
    updateData["game.turn"] =
      playerRole === "player1" ? "player2" : "player1";
  }

  await updateDoc(roomRef, updateData);
  return true;
};

/**
 * Check for a winner or draw
 */
const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // columns
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winLine: line };
    }
  }

  // Check for draw (all cells filled, no winner)
  if (board.every((cell) => cell !== null)) {
    return { winner: null, winLine: null, isDraw: true };
  }

  return { winner: null, winLine: null, isDraw: false };
};

/**
 * Reset the game for a new round.
 * Alternates who goes first — whoever started last game sits out this time.
 */
export const resetGame = async (passcode) => {
  const roomRef = doc(db, "rooms", passcode);
  const snapshot = await getDoc(roomRef);
  const data = snapshot.data();

  // Alternate: if player1 started last game, player2 starts next (and vice versa)
  const lastStarter = data.game.startedBy || "player1";
  const nextStarter = lastStarter === "player1" ? "player2" : "player1";

  await updateDoc(roomRef, {
    "game.state": INITIAL_GAME_STATE,
    "game.turn": nextStarter,
    "game.startedBy": nextStarter,
    "game.winner": null,
    "game.winLine": null,
    "game.isDraw": false,
    status: "playing",
  });
};

/**
 * Set player as disconnected
 */
export const disconnectPlayer = async (passcode, playerRole) => {
  const roomRef = doc(db, "rooms", passcode);
  await updateDoc(roomRef, {
    [`players.${playerRole}.connected`]: false,
  });
};

/**
 * Reconnect a player
 */
export const reconnectPlayer = async (passcode, playerRole) => {
  const roomRef = doc(db, "rooms", passcode);
  await updateDoc(roomRef, {
    [`players.${playerRole}.connected`]: true,
  });
};
