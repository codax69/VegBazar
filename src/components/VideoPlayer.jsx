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
        // Break out of container to be full width
        return "w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] h-auto bg-black flex flex-col justify-center items-center pb-4";
      case "mini":
        // Fixed bottom right small player
        return "fixed bottom-6 right-6 w-80 aspect-video z-[9999] bg-black rounded-xl shadow-2xl flex justify-center items-center overflow-hidden border border-gray-700/50";
      case "default":
      default:
        // Standard view within the container boundaries
        return "w-full max-w-5xl mx-auto bg-black rounded-2xl shadow-lg flex flex-col justify-center items-center overflow-hidden relative pb-4";
    }
  };

  return (
    <div className={`w-full ${viewMode === "fullscreen" ? "" : "pb-10"}`}>
      
      {/* Controls / Header */}
      {viewMode !== "fullscreen" && viewMode !== "mini" && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
          >
            ← Back
          </button>
          
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode("default")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'default' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Default
            </button>
            <button 
              onClick={() => setViewMode("theater")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'theater' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Theater
            </button>
            <button 
              onClick={() => setViewMode("fullscreen")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'fullscreen' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Full Screen
            </button>
            <button 
              onClick={() => setViewMode("mini")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'mini' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Mini Player
            </button>
          </div>
        </div>
      )}

      {/* When in Mini mode, show placeholder in place of video */}
      {viewMode === "mini" && (
        <div className="w-full max-w-5xl mx-auto aspect-video bg-gray-100 rounded-2xl shadow-sm flex flex-col justify-center items-center border border-gray-200 mb-6">
            <span className="text-gray-500 font-medium mb-4">Video is playing in mini player</span>
            <button 
              onClick={() => setViewMode("default")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Restore Video
            </button>
        </div>
      )}

      {/* Video Container */}
      <div className={`${getContainerClasses()} transition-all duration-300 ease-in-out`}>
        
        {viewMode === "fullscreen" && (
          <button
            onClick={() => setViewMode("default")}
            className="absolute top-4 left-4 z-[10000] bg-white/10 hover:bg-white/30 text-white backdrop-blur-md px-4 py-2 rounded-lg font-bold transition-all"
          >
            ← Exit Fullscreen
          </button>
        )}

        {viewMode === "mini" && (
          <button
            onClick={() => setViewMode("default")}
            className="absolute top-2 right-2 z-[10000] bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-all"
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
            <div className="w-full max-w-[95%] mx-auto mt-4 px-2 text-white">
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                            Advertisement
                        </h2>
                        <p className="text-gray-300 text-sm mt-1">
                            This is an ad only. Support us by learning more about our featured product.
                        </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider bg-gray-700 text-gray-300 px-3 py-1 rounded-full border border-gray-600">
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