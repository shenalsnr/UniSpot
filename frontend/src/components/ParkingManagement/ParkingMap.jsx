import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ParkingMap = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotBookings, setSlotBookings] = useState({}); // { spotId: [{ arrivalTime, leavingTime }] }
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [hoveredSpot, setHoveredSpot] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const selectedZone = location.state?.backendZone || "";
  const selectedZoneLabel = location.state?.zoneLabel || "";

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

  useEffect(() => {
    if (!selectedZone) {
      setLoading(false);
      return;
    }
    fetchSpots();
  }, [selectedZone]);

  // Fetch bookings for all zone slots whenever spots or selected date changes
  useEffect(() => {
    if (spots.length === 0 || !selectedDate || !selectedZone) return;

    const fetchAllSlotBookings = async () => {
      const zoneSpots = spots.filter((s) => s.zone === selectedZone);
      const results = {};

      await Promise.all(
        zoneSpots.map(async (spot) => {
          try {
            const res = await fetch(
              `http://localhost:5000/api/parking/${spot._id}/bookings?date=${selectedDate}`
            );
            if (res.ok) {
              const data = await res.json();
              results[spot._id] = data.data || [];
            } else {
              results[spot._id] = [];
            }
          } catch {
            results[spot._id] = [];
          }
        })
      );

      setSlotBookings(results);
    };

    fetchAllSlotBookings();
  }, [spots, selectedDate, selectedZone]);

  const filteredSpots = useMemo(() => {
    if (!selectedZone) return [];
    return spots.filter((spot) => spot.zone === selectedZone);
  }, [spots, selectedZone]);

  const handleSpotSelect = (spot) => {
    // Slots are selectable unless under maintenance
    if (spot.isUnderMaintenance) return;
    navigate(`/parking/book/${spot._id}`, {
      state: { spot, preselectedDate: selectedDate },
    });
  };

  const handleBack = () => {
    navigate("/parking/zones");
  };

  // Determine slot display state based on time-based bookings
  const getSlotState = (spot) => {
    if (spot.isUnderMaintenance) return "maintenance";
    const bookings = slotBookings[spot._id] || [];
    if (bookings.length === 0) return "available";

    // Check if the slot has any booking for the selected date
    // We show "partial" to indicate it has some bookings but may still have open windows
    return "partial";
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

        {/* Date selector */}
        <div className="mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-bold text-gray-700 whitespace-nowrap">
            📅 Check availability for:
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <p className="text-xs text-gray-400 font-medium">
            Slots may have multiple bookings per day — choose your preferred time when booking.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-bold text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 shadow-sm"></div>
            Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-400 shadow-sm"></div>
            Partially Booked
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 shadow-sm"></div>
            Maintenance
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
              {filteredSpots.map((spot) => {
                const state = getSlotState(spot);
                const bookings = slotBookings[spot._id] || [];
                const isHovered = hoveredSpot === spot._id;

                return (
                  <div key={spot._id} className="relative">
                    <div
                      onClick={() => handleSpotSelect(spot)}
                      onMouseEnter={() => setHoveredSpot(spot._id)}
                      onMouseLeave={() => setHoveredSpot(null)}
                      className={`
                        relative h-32 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                        ${
                          state === "maintenance"
                            ? "bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-80"
                            : state === "partial"
                            ? "bg-amber-50 border-amber-300 text-amber-800 cursor-pointer hover:bg-amber-400 hover:text-white hover:border-amber-400 hover:shadow-lg hover:-translate-y-1"
                            : "bg-blue-50 border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
                        }
                      `}
                      title={
                        state === "maintenance"
                          ? "This slot is under maintenance"
                          : state === "partial"
                          ? `${bookings.length} booking(s) on this date — other windows available`
                          : "Click to book this slot"
                      }
                    >
                      <span className="text-2xl font-black">{spot.slotNumber}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-80">
                        {spot.zone}
                      </span>

                      {state === "maintenance" && (
                        <div className="absolute inset-0 bg-red-200/40 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
                          <span className="bg-red-700 text-white text-[10px] px-2 py-1 flex rounded-md font-bold uppercase tracking-wider shadow-sm">
                            Maintenance
                          </span>
                        </div>
                      )}

                      {state === "partial" && (
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                          <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tooltip: show booked time windows on hover */}
                    {isHovered && bookings.length > 0 && state !== "maintenance" && (
                      <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl pointer-events-none">
                        <p className="font-bold mb-1 text-amber-300">Booked times:</p>
                        {bookings.map((b, i) => (
                          <p key={i} className="font-mono">
                            {b.arrivalTime} – {b.leavingTime}
                          </p>
                        ))}
                        <p className="text-gray-400 mt-1 text-[10px]">Other windows available</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingMap;