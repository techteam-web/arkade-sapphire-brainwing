import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioContext } from "./audio.js";

const TRACK_SRC = "/audio/main-track.mp3";
const VOLUME = 0.35; // background bed — must sit under the room tone, not over it.

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const startedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);

  // Built on mount so it already exists when the fullscreen gate is clicked:
  // browsers only honour play() inside the gesture that triggered it, so there
  // is no room to construct the element lazily at that point.
  useEffect(() => {
    const audio = new Audio(TRACK_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = VOLUME;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Called once, from the "Enter Fullscreen" gesture. Leaving and re-entering
  // fullscreen must not override a mute the user chose in between, hence the
  // one-shot guard — after this the mute button solely owns playback.
  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || startedRef.current) return;
    startedRef.current = true;

    const played = audio.play();
    if (played && typeof played.then === "function") {
      played.then(() => setIsMuted(false)).catch(() => setIsMuted(true));
    } else {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    const next = !isMuted;

    if (audio) {
      if (next) {
        audio.pause();
      } else {
        // Covers the browsers with no Fullscreen API, where the gate never
        // shows: this button is then the first gesture that starts the track.
        startedRef.current = true;
        const played = audio.play();
        if (played && typeof played.catch === "function") played.catch(() => {});
      }
    }
    setIsMuted(next);
  }, [isMuted]);

  const value = useMemo(() => ({ isMuted, toggleMute, start }), [isMuted, toggleMute, start]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
