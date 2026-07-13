import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioContext } from "./audio.js";
import { canFullscreen, isFullscreen, onFullscreenChange } from "../utils/fullscreen.js";

const TRACK_SRC = "/audio/main-track.mp3";
const VOLUME = 0.35; // background bed — must sit under the room tone, not over it.

// Where there's no Fullscreen API (iOS Safari) the gate never shows and we can
// never observe fullscreen, so tying playback to it would silence the tour for
// good. Those browsers simply always count as "allowed".
const FS_SUPPORTED = canFullscreen();

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const startedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [inFullscreen, setInFullscreen] = useState(isFullscreen);

  // Built on mount so it exists before any gesture can ask it to play.
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

  useEffect(() => onFullscreenChange(() => setInFullscreen(isFullscreen())), []);

  // The score is allowed to sound only inside fullscreen. Leaving by Esc, F11 or
  // a gesture pauses it; coming back resumes from where it stopped, unless the
  // user muted in the meantime.
  const shouldPlay = hasStarted && !isMuted && (!FS_SUPPORTED || inFullscreen);

  // Single writer for playback. Everything else just moves the three flags
  // above, which keeps play/pause from being driven from several directions at
  // once. play() lands inside the click's sticky user activation, so the
  // browser still honours it here rather than in the handler itself.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (shouldPlay) {
      const played = audio.play();
      if (played && typeof played.catch === "function") played.catch(() => {});
    } else {
      audio.pause();
    }
  }, [shouldPlay]);

  // Called from the "Enter Fullscreen" gesture. One-shot: re-entering fullscreen
  // later must not override a mute the user chose in between.
  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setHasStarted(true);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    // Also the first gesture on browsers with no gate, hence hasStarted here.
    startedRef.current = true;
    setHasStarted(true);
    setIsMuted((m) => !m);
  }, []);

  const value = useMemo(() => ({ isMuted, toggleMute, start }), [isMuted, toggleMute, start]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
