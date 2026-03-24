import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ParkingMap = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedZoneLabel, setSelectedZoneLabel] = useState('');

  useEffect(() => {
    const zone = location.state?.backendZone;
    const label = location.state?.zoneLabel;
    
    if (!zone) {
      navigate('/parking/zones');
      return;
    }
    
    setSelectedZoneLabel(label || zone);
    fetchSpots(zone);
  }, [location, navigate]);

  const fetchSpots = async (zone) => {
    try {
      const res = await fetch(`http://localhost:5000/api/parking?zone=${encodeURIComponent(zone)}`);
      if (res.ok) {
        const data = await res.json();
        setSpots(data.data);
      } else {
        console.error("Failed to fetch spots");
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
    setLoading(false);
  };

  // Removed mock data function as requested

  const handleSpotSelect = (spot) => {
    if (spot.isOccupied) return;
    navigate(`/parking/book/${spot._id}`, { state: { spot } });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">Interactive Parking Map</h1>
          <p className="text-gray-500 mt-2 font-medium">Select an available spot in {selectedZoneLabel} to proceed to booking</p>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-8 mb-8 text-sm font-bold text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2 shadow-sm"></div> Available
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-gray-300 mr-2 shadow-sm"></div> Occupied
          </div>
        </div>

        {/* Grid Container */}
        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
          {loading ? (
            <div className="animate-pulse text-center text-blue-500 font-bold py-10">Loading map...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {spots.map((spot) => (
                <div
                  key={spot._id}
                  onClick={() => handleSpotSelect(spot)}
                  className={`
                    relative h-32 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                    ${spot.isOccupied 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70' 
                      : 'bg-blue-50 border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  <span className="text-2xl font-black">{spot.slotNumber}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-80">{spot.zone}</span>
                  
                  {spot.isOccupied && (
                    <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                      <span className="bg-gray-800 text-white text-[10px] px-2 py-1 flex rounded-md font-bold uppercase tracking-wider">Reserved</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingMap;
