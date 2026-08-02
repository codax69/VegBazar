// src/components/VideoPlayer.jsx — Rebuilt with v2 1px hairline controls, Fraunces titles, and Inter typography
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const VideoPlayer = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [viewMode, setViewMode] = useState("default"); // 'default', 'theater', 'fullscreen', 'mini'

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;

      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      }
    }
  }, []);

  const getContainerClasses = () => {
    switch (viewMode) {
      case "fullscreen":
        return "fixed inset-0 z-[9999] w-screen h-screen bg-black flex flex-col justify-center items-center";
      case "theater":
        return "w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] h-auto bg-black flex flex-col justify-center items-center pb-4";
      case "mini":
        return "fixed bottom-6 right-6 w-80 aspect-video z-[9999] bg-black rounded-[12px] shadow-xl flex justify-center items-center overflow-hidden border border-[var(--color-border)]";
      case "default":
      default:
        return "w-full max-w-5xl mx-auto bg-black rounded-[12px] border border-[var(--color-border)] shadow-sm flex flex-col justify-center items-center overflow-hidden relative pb-4";
    }
  };

  return (
    <div className={`w-full bg-[var(--color-bg-app)] min-h-screen pt-4 font-body transition-colors duration-150 ${viewMode === "fullscreen" ? "" : "pb-10"}`}>
      
      {/* Controls / Header */}
      {viewMode !== "fullscreen" && viewMode !== "mini" && (
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-app)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-3.5 py-1.5 rounded-[10px] text-xs font-medium transition-colors"
          >
            ← Back
          </button>
          
          <div className="flex flex-wrap gap-1 bg-[var(--color-bg-surface)] p-1 rounded-[10px] border border-[var(--color-border)] text-xs font-body">
            <button 
              onClick={() => setViewMode("default")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${viewMode === 'default' ? 'bg-[var(--color-brand-green)] text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              Default
            </button>
            <button 
              onClick={() => setViewMode("theater")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${viewMode === 'theater' ? 'bg-[var(--color-brand-green)] text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              Theater
            </button>
            <button 
              onClick={() => setViewMode("fullscreen")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${viewMode === 'fullscreen' ? 'bg-[var(--color-brand-green)] text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              Full Screen
            </button>
            <button 
              onClick={() => setViewMode("mini")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${viewMode === 'mini' ? 'bg-[var(--color-brand-green)] text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              Mini Player
            </button>
          </div>
        </div>
      )}

      {/* When in Mini mode, show placeholder in place of video */}
      {viewMode === "mini" && (
        <div className="w-full max-w-5xl mx-auto aspect-video bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] flex flex-col justify-center items-center mb-6 font-body">
            <span className="text-[var(--color-text-secondary)] text-xs font-medium mb-3">Video is playing in mini player</span>
            <button 
              onClick={() => setViewMode("default")}
              className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white px-4 py-2 rounded-[10px] text-xs font-medium transition-colors"
            >
              Restore Video
            </button>
        </div>
      )}

      {/* Video Container */}
      <div className={`${getContainerClasses()} transition-all duration-200 ease-in-out`}>
        
        {viewMode === "fullscreen" && (
          <button
            onClick={() => setViewMode("default")}
            className="absolute top-4 left-4 z-[10000] bg-white/10 hover:bg-white/30 text-white backdrop-blur-md px-4 py-2 rounded-[10px] font-body text-xs font-medium transition-colors"
          >
            ← Exit Fullscreen
          </button>
        )}

        {viewMode === "mini" && (
          <button
            onClick={() => setViewMode("default")}
            className="absolute top-2 right-2 z-[10000] bg-black/50 hover:bg-black/80 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
            title="Expand to Default"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h4a1 1 0 110 2H5.414l3.293 3.293a1 1 0 11-1.414 1.414L4 5.414V8a1 1 0 11-2 0V4a1 1 0 011-1zm14 0a1 1 0 00-1-1h-4a1 1 0 100 2h2.586l-3.293 3.293a1 1 0 101.414 1.414L16 5.414V8a1 1 0 102 0V4a1 1 0 00-1-1zM3 17a1 1 0 001 1h4a1 1 0 100-2H5.414l3.293-3.293a1 1 0 10-1.414-1.414L4 14.586V12a1 1 0 10-2 0v4a1 1 0 001 1zm14 0a1 1 0 01-1 1h-4a1 1 0 110-2h2.586l-3.293-3.293a1 1 0 111.414-1.414L16 14.586V12a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        <div className={`w-full ${viewMode !== 'mini' && viewMode !== 'fullscreen' ? 'aspect-video' : 'h-full'}`}>
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              autoPlay
              playsInline
              controls={viewMode !== "mini"}
            >
              <source src="https://ik.imagekit.io/jr6jy9qij/0312%20(1)(1).mp4" type="video/mp4" />
            </video>
        </div>

        {/* Description / Ad Info below the video */}
        {viewMode !== "mini" && viewMode !== "fullscreen" && (
            <div className="w-full max-w-[95%] mx-auto mt-4 px-2">
                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 rounded-[12px] flex items-center justify-between font-body">
                    <div>
                        <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
                            Advertisement
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">
                            This is an ad only. Support us by learning more about our featured product.
                        </p>
                    </div>
                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider bg-[var(--color-tint-green)] text-[var(--color-brand-green)] px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                        Ad
                    </span>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default VideoPlayer;