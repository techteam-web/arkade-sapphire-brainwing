import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { useAudio } from "../context/audio.js";

// Same espresso radial gradient the Floorplan / Location sidebars use — a warm
// glow from the top-left falling off into deep espresso.
const PAGE_BG = "radial-gradient(140% 100% at 0% 0%, #33251c 0%, #201510 65%)";

const VIDEOS = [
  {
    id: "JsBysmpC9ig",
    si: "x5BvPS_LCa8SAUym",
    title: "Sapphire showcase film 1",
    label: "Walkthrough",
  },
  {
    id: "cPJO8aX1tKM",
    si: "Ab_JvjiGdqINqBZK",
    title: "Sapphire showcase film 2",
    label: "Brand Video",
  },
];

// controls=1 keeps YouTube's native scrubber/volume/quality-gear/fullscreen
// bar (YouTube has no way to show only the quality button); everything else
// that clutters the chrome is turned off — related videos, annotations, the
// "watch on YouTube" title card.
function embedSrc(video) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    si: video.si,
  });
  return `https://www.youtube.com/embed/${video.id}?${params.toString()}`;
}

function VideoTile({ video }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`);
  const { beginVideo, endVideo } = useAudio();

  // Duck the background score for as long as this video's iframe is mounted so
  // the two soundtracks never play at once; it resumes on unmount (tile swapped
  // out or the page left), not on the viewer pausing inside the YouTube player.
  useEffect(() => {
    if (!playing) return;
    beginVideo();
    return () => endVideo();
  }, [playing, beginVideo, endVideo]);

  return (
    <div className="w-full max-w-180 bg-espresso/40 border border-platinum/10 p-4 mob:p-3">
      <div className="relative w-full aspect-video overflow-hidden bg-cocoa border border-platinum/10">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedSrc(video)}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            data-interactive
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={thumb}
              onError={() => setThumb(`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-ink/20 transition-colors duration-300 group-hover:bg-ink/10" />
            <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-ink/40 text-gold backdrop-blur-sm transition-colors duration-300 group-hover:bg-gold group-hover:text-espresso">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
                <polygon points="8 5 19 12 8 19 8 5" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <p className="mt-3 font-display text-paper text-lg leading-none tracking-[-0.01em] mob:mt-2 mob:text-base">
        {video.label}
      </p>
    </div>
  );
}

export default function Showcase() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const rowRef = useRef(null);

  useGSAP(
    () => {
      const frames = rowRef.current.children;
      gsap.set([titleRef.current, ...frames], { opacity: 0, y: "0.5rem" });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" })
        .to(frames, { opacity: 1, y: 0, duration: 0.9, ease: "auraExpo", stagger: 0.12 }, "-=0.4");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-cocoa mob:h-auto mob:min-h-screen mob:overflow-y-auto"
      style={{ background: PAGE_BG }}
    >
      <h1
        ref={titleRef}
        className="absolute top-20 left-20 font-display text-paper text-3xl leading-none tracking-[-0.01em] mob:static mob:top-auto mob:left-auto mob:px-6 mob:pt-16 mob:text-2xl"
      >
        Showcase
      </h1>

      <div className="absolute inset-0 flex items-center justify-center px-8 mob:static mob:flex-col mob:px-4 mob:pb-10 mob:pt-6">
        <div
          ref={rowRef}
          className="flex w-full max-w-400 items-center justify-center gap-6 mob:flex-col mob:gap-4"
        >
          {VIDEOS.map((video) => (
            <VideoTile key={video.id} video={video} />
          ))}
        </div>
      </div>
    </main>
  );
}
