import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PARKING_API = 'http://localhost:5000/api/parking';

const WaitingSlotPanel = () => {
  const [waitingBookings, setWaitingBookings] = useState([]);
  const [availableSpots, setAvailableSpots] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get staff info from session storage / local storage (set at login)
  const staffInfo = JSON.parse(localStorage.getItem('securityStaff') || sessionStorage.getItem('securityStaff') || '{}');
  const staffId = staffInfo?.staffID || 'SECURITY';

  // Auto-dismiss notifications
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 6000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchWaitingBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${PARKING_API}/waiting`);
      setWaitingBookings(res.data.data || []);
    } catch (err) {
      setError('Failed to load waiting queue. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaitingBookings();
    // Poll every 30 seconds to keep queue fresh
    const interval = setInterval(fetchWaitingBookings, 30000);
    return () => clearInterval(interval);
  }, [fetchWaitingBookings]);

  // When a booking is selected, load all spots and filter for the same zone + date
  const handleSelectBooking = async (booking) => {
    setSelectedBooking(booking);
    setSelectedSpotId('');
    setSpotsLoading(true);
    setAvailableSpots([]);

    try {
      // Fetch all spots (to get candidates) + their bookings for the date
      const spotsRes = await axios.get(`${PARKING_API}?zone=${encodeURIComponent(booking.zone)}`);
      const allSpots = spotsRes.data.data || [];

      // For each spot, check time-slot conflicts on the booking's date
      const bookingDateStr = booking.bookingDate
        ? new Date(booking.bookingDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const eligible = [];

      await Promise.all(
        allSpots.map(async (spot) => {
          if (spot.isOccupied || spot.isUnderMaintenance) return;
          if (spot._id === booking.spotId) return; // original slot

          try {
            const bRes = await axios.get(
              `${PARKING_API}/${spot._id}/bookings?date=${bookingDateStr}`
            );
            const existingBookings = bRes.data.data || [];

            // Check if booking's time window conflicts
            const hasConflict = existingBookings.some((eb) => {
              const newS = toMins(booking.arrivalTime);
              const newE = toMins(booking.leavingTime);
              const exS  = toMins(eb.arrivalTime);
              const exE  = toMins(eb.leavingTime);
              return newS < exE && newE > exS;
            });

            if (!hasConflict) eligible.push(spot);
          } catch {
            // Skip if check fails
          }
        })
      );

      setAvailableSpots(eligible);
    } catch (err) {
      setError('Failed to load available slots.');
    } finally {
      setSpotsLoading(false);
    }
  };

  const toMins = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const handleReassign = async () => {
    if (!selectedBooking || !selectedSpotId) {
      setError('Please select both a waiting booking and a new slot.');
      return;
    }

    setReassigning(true);
    setError('');

    try {
      const res = await axios.put(`${PARKING_API}/${selectedBooking._id}/reassign`, {
        newSpotId: selectedSpotId,
        staffId,
      });

      if (res.data.success) {
        const newSlot = availableSpots.find((s) => s._id === selectedSpotId);
        setSuccess(
          `✓ Booking reassigned from ${selectedBooking.slotNumber} → ${newSlot?.slotNumber || 'new slot'}. Student has been notified.`
        );
        setSelectedBooking(null);
        setSelectedSpotId('');
        setAvailableSpots([]);
        fetchWaitingBookings(); // refresh queue
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reassignment failed. Please try again.');
    } finally {
      setReassigning(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A';

  const waitDuration = (createdAt) => {
    const mins = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">

      {/* Success */}
      {success && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <p className="text-emerald-700 font-bold">{success}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✕</span>
            <p className="text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Header info */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-indigo-200 p-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="text-5xl">⏳</div>
          <div>
            <h2 className="text-2xl font-black text-indigo-800">Waiting Queue</h2>
            <p className="text-indigo-600 font-semibold mt-1">
              Students whose booked slots are occupied due to overstay.
              Select a student below and assign them to an available slot.
            </p>
          </div>
          <div className="ml-auto text-center">
            <div className="text-4xl font-black text-indigo-700">
              {loading ? '—' : waitingBookings.length}
            </div>
            <div className="text-indigo-600 text-sm font-bold uppercase tracking-wider">Waiting</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Waiting Queue Table ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800">📋 Queue</h3>
            <button
              onClick={fetchWaitingBookings}
              disabled={loading}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center animate-pulse text-indigo-400 font-bold">
              Loading waiting queue...
            </div>
          ) : waitingBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-xl font-bold text-slate-700">Queue is empty</p>
              <p className="text-slate-500 mt-2">No students are currently waiting for slot reassignment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {waitingBookings.map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => handleSelectBooking(booking)}
                  className={`p-5 cursor-pointer transition-all duration-200 hover:bg-indigo-50 ${
                    selectedBooking?._id === booking._id
                      ? 'bg-indigo-50 border-l-4 border-indigo-500'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Waiting
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {waitDuration(booking.createdAt)} ago
                        </span>
                      </div>
                      <p className="font-black text-slate-800 text-base truncate">
                        {booking.studentId}
                      </p>
                      <p className="text-sm text-slate-500 font-semibold mt-0.5">
                        Original: <span className="font-black text-slate-700">{booking.slotNumber}</span>
                        {' '}&middot;{' '}{booking.zone}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {formatDate(booking.bookingDate)}{' '}
                        &bull;{' '}{booking.arrivalTime} – {booking.leavingTime}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-400 font-semibold">Vehicle</p>
                      <p className="text-sm font-mono font-bold text-slate-600">
                        {booking.vehicleNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {selectedBooking?._id === booking._id && (
                    <p className="text-xs text-indigo-600 font-bold mt-2">
                      ← Selected · Choose an available slot on the right
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Reassignment Panel ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800">🔄 Reassign Slot</h3>
          </div>

          {!selectedBooking ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">👆</div>
              <p className="text-xl font-bold text-slate-700">Select a student</p>
              <p className="text-slate-500 mt-2 text-sm">
                Click a booking on the left to see available slots for reassignment.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Selected booking summary */}
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                  Reassigning booking for
                </p>
                <p className="text-lg font-black text-slate-800">{selectedBooking.studentId}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-slate-400 font-semibold">Original Slot: </span>
                    <span className="font-black text-slate-700">{selectedBooking.slotNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Zone: </span>
                    <span className="font-bold text-slate-700">{selectedBooking.zone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Date: </span>
                    <span className="font-bold text-slate-700">{formatDate(selectedBooking.bookingDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Time: </span>
                    <span className="font-mono font-bold text-slate-700">
                      {selectedBooking.arrivalTime} – {selectedBooking.leavingTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Available slots */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">
                  Available Slots in {selectedBooking.zone}
                  <span className="text-slate-400 font-normal ml-2">
                    (no time conflicts for {selectedBooking.arrivalTime}–{selectedBooking.leavingTime})
                  </span>
                </p>

                {spotsLoading ? (
                  <div className="animate-pulse text-indigo-400 font-bold text-sm py-4 text-center">
                    Checking available slots...
                  </div>
                ) : availableSpots.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-700 font-bold text-sm">
                      No available slots in {selectedBooking.zone} for this time window.
                    </p>
                    <p className="text-red-500 text-xs mt-1">
                      Try checking other zones manually or wait for a slot to free up.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableSpots.map((spot) => (
                      <button
                        key={spot._id}
                        onClick={() => setSelectedSpotId(spot._id)}
                        className={`rounded-xl border-2 p-3 text-center transition-all duration-200 font-bold text-sm ${
                          selectedSpotId === spot._id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400'
                        }`}
                      >
                        <span className="block text-base font-black">{spot.slotNumber}</span>
                        <span className="block text-xs opacity-80 mt-0.5">{spot.vehicleType}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm button */}
              <button
                onClick={handleReassign}
                disabled={!selectedSpotId || reassigning}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-600 text-white font-black text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {reassigning
                  ? '⏳ Reassigning...'
                  : selectedSpotId
                  ? `✓ Reassign to ${availableSpots.find((s) => s._id === selectedSpotId)?.slotNumber || '...'}`
                  : 'Select a slot above to confirm'}
              </button>

              <button
                onClick={() => { setSelectedBooking(null); setSelectedSpotId(''); setAvailableSpots([]); }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingSlotPanel;
