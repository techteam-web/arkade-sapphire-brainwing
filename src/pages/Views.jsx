import { useRef, useState } from "react";
import { APP_DATA } from "../data"



export default function Views() {

  const Floor_Data = [ 
    {label: "Top" , day:"0-dji_0876_01" },
    {label: "Middle" , day:"1-dji_0877_02" },
    {label: "Bottom" , day:"2-dji_0878_03" }
  ]

  const rootRef = useRef(null);

  const [currentFloorIdx, setCurrentFloorIdx] = useState(0); // 0 is Terrace based on our array
  const [isAutoRotating, setIsAutoRotating] = useState(false); // Auto-rotate toggle

  const [currentSceneId, setCurrentSceneId] = useState(APP_DATA.scenes[0].id);
  
  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-paper text-ink"
    >
    
    
        
    </main>
  );
}
