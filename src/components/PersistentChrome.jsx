import { useLocation } from "react-router-dom";
import { useTransition } from "../context/transition.js";
import MuteToggle from "./MuteToggle.jsx";

export default function PersistentChrome({ bootActive }) {
  const { pathname, search } = useLocation();
  const { navigateTo } = useTransition();

  if (bootActive) return null;

  const isLanding = pathname === "/";
  const isMenu = pathname === "/menu";
  const isViews = pathname === "/views";
  const onPaper = isViews;

  // The MENU / mute pill is always the dark espresso glass now, so its contents
  // stay light on every page (incl. /views, whose panel is espresso too).
  const tone = "text-paper";
  const muteVisible = !isLanding;
  const showMenuLink = !isLanding && !isMenu && !isViews;

  // On the 360 view, the pill's action is "Back" (to the plan we arrived from,
  // passed as ?from=<floorId>) rather than "Menu".
  const backTarget = new URLSearchParams(search).get("from");
  const goBack = () => navigateTo(backTarget ? `/floorplan?floor=${backTarget}` : "/menu");

  // A soft halo behind the logo so it stays legible on any render WITHOUT laying
  // a filter-like gradient over the image — light halo on dark pages, dark on paper.
  const logoShadow = onPaper
    ? "drop-shadow(0 1px 3px rgba(255,255,255,0.85)) drop-shadow(0 2px 14px rgba(255,255,255,0.5))"
    : "drop-shadow(0 1px 3px rgba(0,0,0,0.6)) drop-shadow(0 2px 16px rgba(0,0,0,0.45))";

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {!isLanding && (
        <button
          type="button"
          data-interactive
          onClick={() => navigateTo("/menu")}
          aria-label="Arkade Sapphire"
          className="pointer-events-auto absolute top-8 left-10 bg-transparent border-0 p-0 leading-none mob:top-5 mob:left-5"
        >
          <img
            src={onPaper ? "/arkade-logo.webp" : "/arkade-logo-light.webp"}
            alt="Arkade Sapphire"
            draggable="false"
            style={{ filter: logoShadow }}
            className="h-5 2xl:h-6 3xl:h-7 w-auto max-w-[46vw] object-contain select-none"
          />
        </button>
      )}

      {/* MENU + mute live in a small glass pill — keeps them clearly legible on
          any render while leaving the image itself completely un-filtered. */}
      {(showMenuLink || isViews || muteVisible) && (
        <div
          className="pointer-events-auto absolute top-6 right-10 flex items-center gap-1 rounded-full border border-paper/20 bg-espresso/40 px-1.5 py-1 shadow-sm backdrop-blur-md mob:top-4 mob:right-5"
        >
          {isViews ? (
            <button
              type="button"
              data-interactive
              onClick={goBack}
              aria-label="Back to floor plan"
              className={`flex items-center gap-1.5 rounded-full bg-transparent border-0 py-1.5 pl-3 pr-3.5 text-[0.65rem] tracking-[0.28em] uppercase ${tone} hover:text-gold transition-colors`}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          ) : (
            showMenuLink && (
              <button
                type="button"
                data-interactive
                onClick={() => navigateTo("/menu")}
                className={`rounded-full bg-transparent border-0 px-3.5 py-1.5 pr-3 text-[0.65rem] tracking-[0.32em] uppercase ${tone} hover:text-gold transition-colors`}
              >
                Menu
              </button>
            )
          )}
          {muteVisible && <MuteToggle onPaper={false} />}
        </div>
      )}
    </div>
  );
}
