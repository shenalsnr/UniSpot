import React, { useState, useEffect } from "react";
import axios from "axios";
import MapDisplay from "./MapDisplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    if (maps.length > 0) {
      setCurrentIndex((prev) => (prev === maps.length - 1 ? 0 : prev + 1));
    }
  };

  const handlePrev = () => {
    if (maps.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? maps.length - 1 : prev - 1));
    }
  };

  if (loading) return <div className="p-10 text-center font-semibold text-gray-500">Loading maps...</div>;

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-wide uppercase">LOCKER MAPS</h1>
      
      {maps.length > 0 ? (
        <div className="flex items-center gap-6 w-full max-w-7xl justify-center relative">
          
          <button 
            onClick={handlePrev} 
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition flex-shrink-0 z-10"
            aria-label="Previous Map"
          >
            <ChevronLeft size={32} className="text-gray-700" />
          </button>
          
          <div className="flex-1 flex justify-center w-full overflow-hidden px-4">
             {/* MapDisplay is rendered with a key to completely remount the map component when index changes,
                 this ensures that individual locker selection states remain separate between maps if necessary */}
             <MapDisplay key={maps[currentIndex]._id} map={maps[currentIndex]} />
          </div>

          <button 
            onClick={handleNext} 
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition flex-shrink-0 z-10"
            aria-label="Next Map"
          >
            <ChevronRight size={32} className="text-gray-700" />
          </button>
          
        </div>
      ) : (
        <p className="text-gray-500 text-lg italic mt-10">No maps found. Please add from Admin.</p>
      )}

      {/* Pagination indicator */}
      {maps.length > 0 && (
        <div className="mt-8 text-gray-500 font-medium">
          Map {currentIndex + 1} of {maps.length}
        </div>
      )}

    </div>
  );
};

export default LockerMap;