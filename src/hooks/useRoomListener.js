import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Realtime listener for a room document.
 * Returns the room data and loading state.
 */
const useRoomListener = (passcode) => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!passcode) {
      setLoading(false);
      return;
    }

    const roomRef = doc(db, "rooms", passcode);

    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRoomData({ id: snapshot.id, ...snapshot.data() });
          setError(null);
        } else {
          setRoomData(null);
          setError("Room not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Room listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [passcode]);

  return { roomData, loading, error };
};

export default useRoomListener;
