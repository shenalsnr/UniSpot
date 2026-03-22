import React, { useState, useEffect } from "react";
import axios from "axios";
import MapDisplay from "./MapDisplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import lockerBg from "../../assets/locker.png";

const LockerMap = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get("http://localhost:5000/maps");
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
    <div
      className="flex flex-col items-center pb-10 min-h-screen bg-cover bg-center bg-fixed w-full"
      style={{ backgroundImage: `url(${lockerBg})` }}
    >
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-[80] w-full bg-blue-600 backdrop-blur-md shadow-lg border-b border-blue-800 px-8 py-6 mb-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner text-blue-600 font-black text-2xl">U</div>
          <span className="text-2xl font-extrabold text-white tracking-tight hidden sm:block">UniSpot</span>
        </div>
        
        <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase drop-shadow-md whitespace-nowrap">
          LOCKER MAPS
        </h1>

        <div className="flex gap-4 items-center">
          <a href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition border border-white/20 backdrop-blur-sm">
            Admin Panel
          </a>
        </div>
      </nav>

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

          <div className="w-full flex justify-center overflow-x-auto px-20 py-4 min-h-[400px] items-center">
            {/* MapDisplay is rendered with a key to completely remount the map component when index changes,
                 this ensures that individual locker selection states remain separate between maps if necessary */}
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

    </div>
  );
};

export default LockerMap;