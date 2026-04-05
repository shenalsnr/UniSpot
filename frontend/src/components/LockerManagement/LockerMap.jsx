import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MapDisplay from "./MapDisplay";
import { ChevronLeft, ChevronRight, Home, ArrowLeft } from "lucide-react";
import UnifiedNavbar from "../Shared/UnifiedNavbar";


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
            
          </>
        }
      />
      <div className="flex flex-col items-center pb-20 w-full pt-16 min-h-screen relative bg-white">
        {/* Professional White Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-white via-slate-50 to-white"></div>
        
        {/* Subtle Geometric Pattern */}
        <div className="fixed inset-0 opacity-3 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)`,
            backgroundSize: '400px 400px, 400px 400px'
          }}></div>
        </div>
        
        {/* Professional Border Accents */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>

      {maps.length > 0 ? (
        <div className="flex items-center justify-center w-full max-w-7xl relative mx-auto px-4">

          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-full shadow-2xl transition-all duration-300 z-20 ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:from-slate-700 hover:to-slate-800 hover:scale-110 hover:shadow-3xl'}`}
            aria-label="Previous Map"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>

          <div className="w-full flex justify-center overflow-x-auto px-8 py-8 min-h-[500px] items-center relative z-10">
            
            <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 p-10 rounded-3xl shadow-2xl w-full max-w-5xl relative overflow-hidden">
              {/* Professional Header */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              {/* Map Title */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-2">
                  {maps[currentIndex]?.locationName || 'Locker Map'}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Interactive Map View</span>
                </div>
              </div>
              
              <div className="relative">
                <MapDisplay key={maps[currentIndex]._id} map={maps[currentIndex]} />
              </div>
              
              {/* Enhanced Pagination */}
              {maps.length > 0 && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: maps.length }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === currentIndex 
                            ? 'bg-blue-500 w-8 shadow-lg' 
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-slate-800">Map {currentIndex + 1} of {maps.length}</span>
                    <p className="text-sm text-slate-500 mt-1">Navigate through available locker locations</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === maps.length - 1}
            className={`absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-full shadow-2xl transition-all duration-300 z-20 ${currentIndex === maps.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:from-slate-700 hover:to-slate-800 hover:scale-110 hover:shadow-3xl'}`}
            aria-label="Next Map"
          >
            <ChevronRight size={28} className="text-white" />
          </button>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Maps Available</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">Please contact your administrator to add locker maps to the system.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default LockerMap;