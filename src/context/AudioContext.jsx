import { useCallback, useMemo, useState } from "react";
import { AudioContext } from "./audio.js";

export function AudioProvider({ children }) {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
    // TODO: wire <audio> / Howler source here — play/pause based on isMuted.
  }, []);

  const value = useMemo(() => ({ isMuted, toggleMute }), [isMuted, toggleMute]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
