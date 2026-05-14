import { useLocation } from "react-router-dom";
import { useTransition } from "../context/transition.js";
import MuteToggle from "./MuteToggle.jsx";

export default function PersistentChrome({ bootActive }) {
  const { pathname } = useLocation();
  const { navigateTo } = useTransition();

  if (bootActive) return null;

  const isLanding = pathname === "/";
  const isMenu = pathname === "/menu";
  const onPaper = pathname === "/views";

  const tone = onPaper ? "text-ink" : "text-paper";
  const muteVisible = !isLanding;
  const showMenuLink = !isLanding && !isMenu;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <button
        type="button"
        data-interactive
        onClick={() => !isLanding && navigateTo("/menu")}
        aria-label="Arkade Aura"
        className={`pointer-events-auto absolute top-8 left-10 bg-transparent border-0 font-display ${tone} text-base leading-none tracking-[-0.01em]`}
      >
        Arkade Aura
      </button>

      <div className="pointer-events-auto absolute top-8 right-10 flex items-center gap-6">
        {showMenuLink && (
          <button
            type="button"
            data-interactive
            onClick={() => navigateTo("/menu")}
            className={`bg-transparent border-0 p-0 text-[0.65rem] tracking-[0.32em] uppercase ${tone} hover:text-gold transition-colors`}
          >
            Menu
          </button>
        )}
        {muteVisible && <MuteToggle />}
      </div>
    </div>
  );
}
