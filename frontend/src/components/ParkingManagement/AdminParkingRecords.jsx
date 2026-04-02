import React, { useState, useEffect } from 'react';

const AdminParkingRecords = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newSpot, setNewSpot] = useState({
    slotNumber: '',
    zone: 'Zone 01',
    latitude: 6.9001,
    longitude: 79.8001,
    vehicleType: 'Car'
  });

  const zoneCoordinates = {
    'Zone 01': { latitude: 6.9001, longitude: 79.8001 },
    'Zone 02': { latitude: 6.9002, longitude: 79.8002 },
    'Zone 03': { latitude: 6.9003, longitude: 79.8003 },
    'Zone 03.02': { latitude: 6.9004, longitude: 79.8004 },
    'Zone 08': { latitude: 6.9005, longitude: 79.8005 },
    'Zone 08.02': { latitude: 6.9006, longitude: 79.8006 }
  };

  const generateSlotNumber = (zoneLabel, currentSpots) => {
    const zoneNum = zoneLabel.replace(/\D/g, '');
    
    const zoneSpots = currentSpots.filter(s => s.zone === zoneLabel);
    const existingNumbers = zoneSpots.map(s => {
      const match = s.slotNumber.match(/S(\d{2})$/);
      return match ? parseInt(match[1], 10) : null;
    }).filter(n => n !== null).sort((a,b) => a - b);

    let nextNumInt = 1;
    for (let i = 0; i < existingNumbers.length; i++) {
        if (existingNumbers[i] === nextNumInt) {
            nextNumInt++;
        } else if (existingNumbers[i] > nextNumInt) {
            break;
        }
    }
    
    const nextNum = nextNumInt.toString().padStart(2, '0');
    return `Z${zoneNum}-S${nextNum}`;
  };

  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    const coords = zoneCoordinates[selectedZone];
    setNewSpot({
      ...newSpot,
      zone: selectedZone,
      latitude: coords.latitude,
      longitude: coords.longitude,
      slotNumber: generateSlotNumber(selectedZone, spots)
    });
  };

  const openAddModal = () => {
    const initialZone = 'Zone 01';
    const coords = zoneCoordinates[initialZone];
    setNewSpot({
      slotNumber: generateSlotNumber(initialZone, spots),
      zone: initialZone,
      latitude: coords.latitude,
      longitude: coords.longitude,
      vehicleType: 'Car'
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  useEffect(() => {
    if (showModal || viewModalOpen || editModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal, viewModalOpen, editModalOpen]);

  const fetchSpots = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/parking');
      if (res.ok) {
        const data = await res.json();
        setSpots(data.data);
      } else {
        console.error("Failed to fetch admin spots");
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
    setLoading(false);
  };

  const handleDeleteOrRelease = async (spotId) => {
    if (!window.confirm("Are you sure you want to release this spot?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/parking/${spotId}/release`, { method: 'PUT' });
      if (res.ok) {
         setSpots(spots.map(s => s._id === spotId ? { ...s, isOccupied: false, reservedBy: null } : s));
      } else {
         const errorData = await res.json();
        alert(errorData.message || "Failed to release the spot.");
      }
    } catch (err) {
      alert("Server connection failed. Is the backend running?");
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (!window.confirm("Are you sure you want to delete this parking spot configuration?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/parking/${spotId}`, { method: 'DELETE' });
      if (res.ok) {
         setSpots(spots.filter(s => s._id !== spotId));
      } else {
         alert("Failed to delete the spot.");
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  };

  const handleCreateSpot = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        slotNumber: newSpot.slotNumber,
        zone: newSpot.zone,
        locationCoords: {
          latitude: Number(newSpot.latitude),
          longitude: Number(newSpot.longitude)
        },
        vehicleType: newSpot.vehicleType
      };
      const res = await fetch('http://localhost:5000/api/parking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setNewSpot({ slotNumber: '', zone: 'Zone 01', latitude: '', longitude: '', vehicleType: 'Car' });
        fetchSpots(); // refresh
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create spot");
      }
    } catch (error) {
      alert("Server connection failed");
    }
  };

  const handleViewClick = (spot) => {
    setSelectedSpot(spot);
    setViewModalOpen(true);
  };

  const handleEditClick = (spot, e) => {
    if (e) e.stopPropagation();
    setSelectedSpot(spot);
    setEditForm({
      vehicleNumber: spot.vehicleNumber || '',
      slotNumber: spot.slotNumber,
      zone: spot.zone,
      arrivalTime: spot.arrivalTime || '',
      leavingTime: spot.leavingTime || '',
      isOccupied: spot.isOccupied,
      reservedBy: spot.reservedBy || '',
      createdAt: spot.createdAt || ''
    });
    setEditModalOpen(true);
    setViewModalOpen(false);
  };

  const handleUpdateSpot = async (e) => {
    e.preventDefault();
    if (editForm.arrivalTime && editForm.leavingTime) {
      if (editForm.leavingTime <= editForm.arrivalTime) {
        alert("Leaving time must be after arrival time");
        return;
      }
    }
    try {
      const payload = {
        vehicleNumber: editForm.vehicleNumber,
        arrivalTime: editForm.arrivalTime,
        leavingTime: editForm.leavingTime,
        isOccupied: editForm.isOccupied,
        reservedBy: editForm.reservedBy,
      };
      const res = await fetch(`http://localhost:5000/api/parking/${selectedSpot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchSpots();
        alert("Spot updated successfully");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update spot");
      }
    } catch (error) {
      alert("Server connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 pl-2">
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">Admin Console</h1>
          <p className="text-gray-500 font-medium mt-2">Manage all parking spot records and occupancy status</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-blue-50/40 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-900">System Records</h2>
            <button 
              onClick={openAddModal}
              className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[oklch(48.8%_0.243_264.376)] hover:text-white transition-colors"
            >
              + Add New Spot
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-16 text-center text-blue-500 font-bold animate-pulse text-lg">Fetching records...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs font-extrabold uppercase tracking-widest border-b-2 border-gray-200">
                  <tr>
                    <th className="py-5 px-6">Spot ID</th>
                    <th className="py-5 px-6">Zone Area</th>
                    <th className="py-5 px-6">Current Status</th>
                    <th className="py-5 px-6">Reserved By (Student ID)</th>
                    <th className="py-5 px-6 text-center">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {spots.map((spot) => (
                    <tr key={spot._id} onClick={() => handleViewClick(spot)} className="hover:bg-blue-50/60 transition-colors duration-150 cursor-pointer">
                      <td className="py-5 px-6 font-bold text-blue-900 text-lg">
                        {spot.slotNumber}
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                          {spot.zone}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {spot.isOccupied ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Occupied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6 font-mono text-gray-500 text-sm">
                        {spot.isOccupied ? (spot.reservedBy || 'N/A') : '-'}
                      </td>
                      <td className="py-5 px-6 text-center space-x-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleViewClick(spot); }}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                          title="View Details"
                        >
                          View
                        </button>
                        <button 
                          onClick={(e) => handleEditClick(spot, e)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                          title="Edit Spot"
                        >
                          Edit
                        </button>
                        {spot.isOccupied ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrRelease(spot._id); }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                            title="Force Release Spot"
                          >
                            Release
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSpot(spot._id); }}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                            title="Delete Spot Config"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {spots.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-gray-400 font-semibold text-lg">
                        No database records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Create Parking Spot</h2>
            <form onSubmit={handleCreateSpot} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slot Number (Auto-Generated)</label>
                <input readOnly type="text" value={newSpot.slotNumber} className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed font-mono font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Zone</label>
                <select value={newSpot.zone} onChange={handleZoneChange} className="w-full border p-2 rounded">
                  <option value="Zone 01">Zone 01</option>
                  <option value="Zone 02">Zone 02</option>
                  <option value="Zone 03">Zone 03</option>
                  <option value="Zone 03.02">Zone 03.02</option>
                  <option value="Zone 08">Zone 08</option>
                  <option value="Zone 08.02">Zone 08.02</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
                  <input readOnly type="number" step="any" value={newSpot.latitude} className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
                  <input readOnly type="number" step="any" value={newSpot.longitude} className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Type</label>
                <select value={newSpot.vehicleType} onChange={e => setNewSpot({...newSpot, vehicleType: e.target.value})} className="w-full border p-2 rounded">
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded hover:opacity-90">Save Spot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedSpot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">Booking Details</h2>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Booking ID</p>
                  <p className="font-mono text-sm text-gray-800">{selectedSpot._id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Created Date</p>
                  <p className="font-medium text-gray-800">
                    {selectedSpot.createdAt ? new Date(selectedSpot.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">User / Student ID</p>
                  <p className="font-medium text-gray-800">{selectedSpot.reservedBy || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Vehicle Number</p>
                  <p className="font-medium text-gray-800">{selectedSpot.vehicleNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Slot / Zone</p>
                  <p className="font-medium text-blue-600 font-bold">{selectedSpot.slotNumber} ({selectedSpot.zone})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                  <p className="font-medium">
                    {selectedSpot.isOccupied ? (
                      <span className="text-red-600 font-bold">Occupied</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Available</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Arrival Time</p>
                  <p className="font-medium text-gray-800">{selectedSpot.arrivalTime || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Leaving Time</p>
                  <p className="font-medium text-gray-800">{selectedSpot.leavingTime || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <button onClick={() => setViewModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded transition-colors">Close</button>
              <button onClick={(e) => handleEditClick(selectedSpot, e)} className="px-5 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded hover:opacity-90 transition-colors">Edit Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full my-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Edit Booking Details</h2>
            <form onSubmit={handleUpdateSpot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Slot Number</label>
                  <input readOnly type="text" value={editForm.slotNumber} className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Zone</label>
                  <input readOnly type="text" value={editForm.zone} className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Number</label>
                <input type="text" value={editForm.vehicleNumber} onChange={(e) => setEditForm({...editForm, vehicleNumber: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. ABC 1234" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Reserved By (User ID)</label>
                <input type="text" value={editForm.reservedBy} onChange={(e) => setEditForm({...editForm, reservedBy: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required={editForm.isOccupied} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Arrival Time</label>
                  <input type="time" value={editForm.arrivalTime} onChange={(e) => setEditForm({...editForm, arrivalTime: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required={editForm.isOccupied} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Leaving Time</label>
                  <input type="time" value={editForm.leavingTime} onChange={(e) => setEditForm({...editForm, leavingTime: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required={editForm.isOccupied} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <input type="checkbox" checked={editForm.isOccupied} onChange={(e) => setEditForm({...editForm, isOccupied: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                  Is Occupied
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded hover:opacity-90 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParkingRecords;
