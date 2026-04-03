import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MapDisplay from "./MapDisplay";
import { ChevronLeft, ChevronRight, Home, ArrowLeft } from "lucide-react";
import UnifiedNavbar from "../Shared/UnifiedNavbar";
import PageBackground from "../Shared/PageBackground";
  const LockerMap = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/locker/maps");
        setMaps(response.data);
      } catch (error) {
        console.error("Error fetching maps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaps();
  }, []);

  const handleNext = () => {
    if (maps.length > 0 && currentIndex < maps.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (maps.length > 0 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) return <div className="p-10 text-center font-semibold text-gray-500">Loading maps...</div>;

  return (
    <>
      <UnifiedNavbar 
        moduleName="LOCKER MAPS" 
        centerModule={true}
        rightActions={
          <>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300 transition-all hover:scale-105 hover:opacity-90 flex items-center gap-2"
              title="Go Back"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-white text-blue-900 font-bold rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-gray-100 border-2 border-blue-200 transition-all hover:scale-105 flex items-center justify-center p-2.5"
              title="Home"
            >
              <Home size={20} />
            </button>
          </>
        }
      />
      <PageBackground className="flex flex-col items-center pb-10 w-full pt-10">

      {maps.length > 0 ? (
        <div className="flex items-center justify-center w-full max-w-7xl relative mx-auto">

          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-500 rounded-full shadow-lg transition z-10 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400 hover:scale-110'}`}
            aria-label="Previous Map"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>

          <div className="w-full flex justify-center overflow-x-auto px-20 py-4 min-h[400px] items-center ">
            
            <MapDisplay key={maps[currentIndex]._id} map={maps[currentIndex]} />
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === maps.length - 1}
            className={`absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-500 rounded-full shadow-lg transition z-10 ${currentIndex === maps.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400 hover:scale-110'}`}
            aria-label="Next Map"
          >
            <ChevronRight size={32} className="text-white" />
          </button>

        </div>
      ) : (
        <p className="text-gray-500 text-lg italic mt-10">No maps found. Please add from Admin.</p>
      )}

      {/* Pagination indicator */}
      {maps.length > 0 && (
        <div className="mt-8 text-gray-500 font-medium tracking-wide">
          Map {currentIndex + 1} of {maps.length}
        </div>
      )}

    </PageBackground>
    </>
  );
};

export default LockerMap;