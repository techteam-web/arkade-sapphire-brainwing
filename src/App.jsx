import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { TransitionProvider } from "./context/TransitionContext.jsx";
import { AudioProvider } from "./context/AudioContext.jsx";

import BootLoader from "./components/BootLoader.jsx";
import TransitionOverlay from "./components/TransitionOverlay.jsx";
import PersistentChrome from "./components/PersistentChrome.jsx";

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
      </AudioProvider>
    </TransitionProvider>
  );
}
