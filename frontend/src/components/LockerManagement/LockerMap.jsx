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
      className="flex flex-col items-center p-10 min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${lockerBg})` }}
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-wide uppercase bg-white/80 py-3 px-10 rounded-xl shadow-sm backdrop-blur-md">LOCKER MAPS</h1>
      
      {maps.length > 0 ? (
        <div className="flex items-center justify-center w-full max-w-7xl relative mx-auto">
          
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className={`absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-200 rounded-full shadow-lg transition z-10 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 hover:scale-110'}`}
            aria-label="Previous Map"
          >
            <ChevronLeft size={32} className="text-blue-600" />
          </button>
          
          <div className="w-full flex justify-center overflow-x-auto px-20 py-4 min-h-[400px] items-center">
             {/* MapDisplay is rendered with a key to completely remount the map component when index changes,
                 this ensures that individual locker selection states remain separate between maps if necessary */}
             <MapDisplay key={maps[currentIndex]._id} map={maps[currentIndex]} />
          </div>

          <button 
            onClick={handleNext} 
            disabled={currentIndex === maps.length - 1}
            className={`absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-200 rounded-full shadow-lg transition z-10 ${currentIndex === maps.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 hover:scale-110'}`}
            aria-label="Next Map"
          >
            <ChevronRight size={32} className="text-blue-600" />
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