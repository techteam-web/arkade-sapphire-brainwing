import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { TransitionProvider } from "./context/TransitionContext.jsx";
import { AudioProvider } from "./context/AudioContext.jsx";

import BootLoader from "./components/BootLoader.jsx";
import TransitionOverlay from "./components/TransitionOverlay.jsx";
import PersistentChrome from "./components/PersistentChrome.jsx";
import FullscreenGate from "./components/FullscreenGate.jsx";

import Landing from "./pages/Landing.jsx";
import Menu from "./pages/Menu.jsx";
import Views from "./pages/Views.jsx";
import Gallery from "./pages/Gallery.jsx";
import Floorplan from "./pages/Floorplan.jsx";
import Location from "./pages/Location.jsx";
import Brochure from "./pages/Brochure.jsx";
import Showcase from "./pages/Showcase.jsx";

function readBooted() {
  try {
    if (new URLSearchParams(window.location.search).has("noboot")) return true;
    return sessionStorage.getItem("aura.booted") === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [bootActive, setBootActive] = useState(() => !readBooted());

  return (
    <TransitionProvider>
      <AudioProvider>
        <PersistentChrome bootActive={bootActive} />
        <TransitionOverlay />
        {bootActive && <BootLoader onComplete={() => setBootActive(false)} />}

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/views" element={<Views />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/floorplan" element={<Floorplan />} />
          <Route path="/location" element={<Location />} />
          <Route path="/brochure" element={<Brochure />} />
          <Route path="/showcase" element={<Showcase />} />
        </Routes>

        <img
          src="/Brainwing-logo.webp"
          alt="Brainwing logo"
          className="fixed bottom-4 right-4 w-36 z-50 pointer-events-none opacity-80 mob:w-24 mob:bottom-3 mob:right-3"
        />
        {/* Inside AudioProvider: the gate's click is the gesture that starts the track. */}
        <FullscreenGate />
      </AudioProvider>
    </TransitionProvider>
  );
}
