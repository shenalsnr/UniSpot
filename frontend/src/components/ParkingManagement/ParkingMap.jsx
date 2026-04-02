import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ParkingMap = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const selectedZone = location.state?.backendZone || "";
  const selectedZoneLabel = location.state?.zoneLabel || "";

  useEffect(() => {
    if (!selectedZone) {
      setLoading(false);
      return;
    }

    fetchSpots();
  }, [selectedZone]);

  const fetchSpots = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/parking");

      if (res.ok) {
        const data = await res.json();
        setSpots(data.data || []);
      } else {
        console.error("Failed to fetch spots");
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = useMemo(() => {
    if (!selectedZone) return [];
    return spots.filter((spot) => spot.zone === selectedZone);
  }, [spots, selectedZone]);

  const handleSpotSelect = (spot) => {
    if (spot.isOccupied) return;
    navigate(`/parking/book/${spot._id}`, { state: { spot } });
  };

  const handleBack = () => {
    navigate("/");
  };

  if (!selectedZone) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-extrabold text-red-600 mb-4">
            No Zone Selected
          </h1>
          <p className="text-gray-600 mb-6">
            Please select a zone from the campus map first.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg bg-[oklch(48.8%_0.243_264.376)] text-white font-semibold hover:opacity-90 transition"
          >
            Go to Campus Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
              {selectedZoneLabel} Parking Slots
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Select an available slot to proceed to booking
            </p>
          </div>

          <button
            onClick={handleBack}
            className="px-5 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            Back to Zone Map
          </button>
        </div>

        <div className="flex justify-center space-x-8 mb-8 text-sm font-bold text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2 shadow-sm"></div>
            Available
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-gray-300 mr-2 shadow-sm"></div>
            Occupied
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
          {loading ? (
            <div className="animate-pulse text-center text-blue-500 font-bold py-10">
              Loading parking slots...
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                No Slots Found
              </h2>
              <p className="text-gray-500">
                No parking slots are available for <strong>{selectedZoneLabel}</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredSpots.map((spot) => (
                <div
                  key={spot._id}
                  onClick={() => handleSpotSelect(spot)}
                  className={`
                    relative h-32 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                    ${
                      spot.isOccupied
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                        : "bg-blue-50 border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
                    }
                  `}
                >
                  <span className="text-2xl font-black">{spot.slotNumber}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-80">
                    {spot.zone}
                  </span>

                  {spot.isOccupied && (
                    <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                      <span className="bg-gray-800 text-white text-[10px] px-2 py-1 flex rounded-md font-bold uppercase tracking-wider">
                        Reserved
                      </span>
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