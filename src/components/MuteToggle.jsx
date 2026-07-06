import { useAudio } from "../context/audio.js";

export default function MuteToggle({ onPaper = false }) {
  const { isMuted, toggleMute } = useAudio();
  // When muted, adapt the resting colour to the page so the icon stays visible:
  // dark on the light (paper) page, light on the dark pages.
  const tone = isMuted ? (onPaper ? "text-ink/55" : "text-platinum/50") : "text-gold";

  return (
    <button
      type="button"
      data-interactive
      onClick={toggleMute}
      aria-label={isMuted ? "Unmute" : "Mute"}
      className={`bg-transparent border-0 p-2 ${tone} hover:text-gold transition-colors`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        {isMuted ? (
          <>
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        ) : (
          <>
            <path d="M16 8.5a4 4 0 0 1 0 7" />
          </>
        )}
      </svg>
    </button>
  );
}
