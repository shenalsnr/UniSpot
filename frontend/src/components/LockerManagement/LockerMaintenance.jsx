import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wrench, CheckCircle, Clock, Lock, Unlock, ArrowLeft, Shield, Search } from 'lucide-react';
import { showAlert } from '../Shared/BeautifulAlert';
import { showConfirm } from '../Shared/BeautifulConfirm';
import UnifiedNavbar from '../Shared/UnifiedNavbar';

const API = 'http://localhost:5000';

const LockerMaintenance = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState('');
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null); // lockerId currently being actioned

  // ── Fetch maps ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await axios.get(`${API}/api/locker/maps`);
        setMaps(res.data);
        if (res.data.length > 0) setSelectedMap(res.data[0]._id);
      } catch (err) {
        showAlert('error', 'Failed to fetch maps');
      } finally {
        setLoading(false);
      }
    };
    fetchMaps();
  }, []);

  // ── Generate lockers from map config (fallback) ───────────────────────────
  const generateLockers = useCallback((map) => {
    const list = [];
    for (let i = 0; i < map.rows; i++) {
      const row = String.fromCharCode(65 + i);
      for (let j = 1; j <= map.lockersPerRow; j++) {
        list.push({ id: `${row}${j}`, mapId: map._id, status: 'available', maintenanceReason: '', maintenanceStartTime: null, isBooked: false });
      }
    }
    return list;
  }, []);

  // ── Fetch lockers for selected map (merge DB status + bookings) ───────────
  const fetchLockers = useCallback(async () => {
    if (!selectedMap) return;
    setLoading(true);
    try {
      const map = maps.find(m => m._id === selectedMap);
      if (!map) return;

      // Generate the full locker grid from map config
      const baseLockers = generateLockers(map);

      // Fetch maintenance statuses and bookings in parallel
      const [maintenanceRes, bookingsRes] = await Promise.allSettled([
        axios.get(`${API}/api/lockers?mapId=${selectedMap}`),
        axios.get(`${API}/api/locker/bookings/map/${selectedMap}`)
      ]);

      // Build maintenance lookup
      let maintenanceMap = {};
      if (maintenanceRes.status === 'fulfilled' && maintenanceRes.value.data?.success) {
        maintenanceRes.value.data.data.forEach(l => {
          maintenanceMap[l.id] = l;
        });
      }

      // Build booking lookup
      let bookingSet = new Set();
      if (bookingsRes.status === 'fulfilled') {
        (bookingsRes.value.data || []).forEach(b => bookingSet.add(b.lockerId));
      }

      // Merge
      const merged = baseLockers.map(locker => {
        const dbLocker = maintenanceMap[locker.id];
        return {
          ...locker,
          status: dbLocker?.status || 'available',
          maintenanceReason: dbLocker?.maintenanceReason || '',
          maintenanceStartTime: dbLocker?.maintenanceStartTime || null,
          isBooked: bookingSet.has(locker.id)
        };
      });

      setLockers(merged);
    } catch (err) {
      // fallback
      const map = maps.find(m => m._id === selectedMap);
      if (map) setLockers(generateLockers(map));
    } finally {
      setLoading(false);
    }
  }, [selectedMap, maps, generateLockers]);

  useEffect(() => { fetchLockers(); }, [fetchLockers]);

  // ── Block locker ──────────────────────────────────────────────────────────
  const blockLocker = async (lockerId) => {
    const confirmed = await showConfirm({
      title: 'Block Locker for Maintenance',
      message: `Block locker ${lockerId} for maintenance? Students will not be able to book it.`,
      confirmText: 'Yes, Block',
      cancelText: 'Cancel',
      type: 'warning'
    });
    if (!confirmed) return;

    setActionLoading(lockerId);
    try {
      const res = await axios.patch(`${API}/api/lockers/${lockerId}/block`, {
        mapId: selectedMap,
        reason: 'Admin maintenance block'
      });
      if (res.data.success) {
        showAlert('success', `Locker ${lockerId} blocked for maintenance`, 'Blocked');
        await fetchLockers();
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to block locker');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Unblock locker ────────────────────────────────────────────────────────
  const unblockLocker = async (lockerId) => {
    const confirmed = await showConfirm({
      title: 'Unblock Locker',
      message: `Unblock locker ${lockerId}? It will be available for booking again.`,
      confirmText: 'Yes, Unblock',
      cancelText: 'Cancel',
      type: 'info'
    });
    if (!confirmed) return;

    setActionLoading(lockerId);
    try {
      const res = await axios.patch(`${API}/api/lockers/${lockerId}/unblock`, {
        mapId: selectedMap
      });
      if (res.data.success) {
        showAlert('success', `Locker ${lockerId} is now available`, 'Unblocked');
        await fetchLockers();
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to unblock locker');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredLockers = lockers.filter(l => {
    const matchSearch = l.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'maintenance' && l.status === 'maintenance') ||
      (filterStatus === 'booked' && l.isBooked) ||
      (filterStatus === 'available' && l.status === 'available' && !l.isBooked);
    return matchSearch && matchStatus;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: lockers.length,
    available: lockers.filter(l => l.status === 'available' && !l.isBooked).length,
    booked: lockers.filter(l => l.isBooked).length,
    maintenance: lockers.filter(l => l.status === 'maintenance').length
  };

  // ── Locker card style ─────────────────────────────────────────────────────
  const getCardStyle = (locker) => {
    if (locker.status === 'maintenance')
      return {
        card: 'border-yellow-200 bg-yellow-50/80 shadow-yellow-100',
        badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        icon: <Wrench size={16} className="text-yellow-600" />,
        label: 'Maintenance',
        glow: ''
      };
    if (locker.isBooked)
      return {
        card: 'border-red-200 bg-red-50/80 shadow-red-100',
        badge: 'bg-red-100 text-red-700 border border-red-300',
        icon: <Clock size={16} className="text-red-500" />,
        label: 'Booked',
        glow: ''
      };
    return {
      card: 'border-blue-200 bg-blue-50/80 shadow-blue-100',
      badge: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: <CheckCircle size={16} className="text-blue-500" />,
      label: 'Available',
      glow: ''
    };
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <UnifiedNavbar
        moduleName="LOCKER MAINTENANCE"
        centerModule={true}
        rightActions={
          <button
            onClick={() => navigate('/AdminLockerMap')}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <div className="min-h-screen bg-linear-to-br from-white via-slate-50 to-white pt-24 pb-16 px-8">
       
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ── Stats Bar ── */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200/70">
            <h3 className="text-2xl font-bold text-slate-900 mb-5">Locker Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: stats.total, accent: 'border-blue-200 bg-blue-50/80 text-blue-800' },
                { label: 'Available', value: stats.available, accent: 'border-blue-200 bg-blue-50/80 text-blue-800' },
                { label: 'Booked', value: stats.booked, accent: 'border-red-200 bg-red-50/80 text-red-800' },
                { label: 'Maintenance', value: stats.maintenance, accent: 'border-yellow-200 bg-yellow-50/80 text-yellow-800' }
              ].map(stat => (
                <div key={stat.label} className={`${stat.accent} rounded-3xl p-5 shadow-sm border transition-all duration-300 hover:shadow-md`}>
                  <div className="text-3xl font-black mb-2 text-slate-900">{stat.value}</div>
                  <div className="text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Map selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Map</label>
                <select
                  value={selectedMap}
                  onChange={(e) => setSelectedMap(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all bg-white font-medium text-slate-700"
                >
                  <option value="">Choose a map…</option>
                  {maps.map(m => (
                    <option key={m._id} value={m._id}>{m.locationName}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Search Locker</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. A1, B3…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all bg-white font-medium text-slate-700"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filter Status</label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'available', 'booked', 'maintenance'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition-all duration-200 capitalize
                        ${filterStatus === f
                          ? f === 'maintenance' ? 'bg-yellow-400 border-yellow-500 text-white shadow-inner shadow-yellow-200/40'
                            : f === 'booked' ? 'bg-red-500 border-red-500 text-white shadow-inner shadow-red-200/40'
                            : f === 'available' ? 'bg-blue-400 border-blue-400 text-white shadow-inner shadow-blue-200/40'
                            : 'bg-slate-700 border-slate-800 text-white shadow-inner shadow-slate-200/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Locker Grid (Full Width) ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-500 font-medium">Loading lockers…</p>
            </div>
          </div>
        ) : !selectedMap ? (
          <div className="text-center py-20 text-slate-400 font-semibold">Select a map to view lockers</div>
        ) : filteredLockers.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold">No lockers match your filters</div>
        ) : (
          <div className="w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200/70">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredLockers.map(locker => {
                const style = getCardStyle(locker);
                const isActioning = actionLoading === locker.id;
                return (
                  <div
                    key={locker.id}
                    className={`border-2 rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${style.card} ${style.glow} flex flex-col gap-3 min-h-50`}
                  >
                    {/* Locker ID + status badge */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-black text-slate-800">{locker.id}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge} flex items-center gap-1`}>
                        {style.icon}
                        {style.label}
                      </span>
                    </div>

                    {/* Maintenance reason */}
                    {locker.status === 'maintenance' && locker.maintenanceReason && (
                      <p className="text-[11px] text-yellow-700 bg-yellow-100 rounded-lg px-2 py-1 leading-snug">
                        {locker.maintenanceReason}
                      </p>
                    )}

                    {/* Action button */}
                    <div className="mt-auto">
                      {locker.isBooked ? (
                        <button disabled className="w-full py-2 rounded-2xl bg-slate-100 text-slate-500 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1 border border-slate-200">
                          <Clock size={12} /> Booked
                        </button>
                      ) : locker.status === 'maintenance' ? (
                        <button
                          onClick={() => unblockLocker(locker.id)}
                          disabled={isActioning}
                          className="w-full py-2 rounded-2xl bg-linear-to-r from-blue-500 to-blue-500 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-md shadow-blue-300/30 flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isActioning ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Unlock size={12} />}
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => blockLocker(locker.id)}
                          disabled={isActioning}
                          className="w-full py-2 rounded-2xl bg-linear-to-r from-blue-500 to-blue-700 text-white text-xs font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-300 hover:scale-105 shadow-md shadow-blue-300/30 flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isActioning ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={12} />}
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LockerMaintenance;
