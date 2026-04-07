import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MapDisplay from "./MapDisplay";
import { MapPin, ArrowLeft } from "lucide-react";
import UnifiedNavbar from "../Shared/UnifiedNavbar";


const LockerMap = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState('');

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/locker/maps");
        setMaps(response.data);
        if (response.data.length > 0) setSelectedMap(response.data[0]._id);
      } catch (error) {
        console.error("Error fetching maps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaps();
  }, []);

  const selectedMapData = maps.find(m => m._id === selectedMap);

  return (
    <>
      <UnifiedNavbar
        moduleName="LOCKER MAPS"
        centerModule={true}
        rightActions={
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <div className="relative min-h-screen bg-white">
        <div className="fixed inset-0 bg-linear-to-br from-white via-slate-50 to-slate-100"></div>
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.15) 0%, transparent 45%)`,
            backgroundSize: '420px 420px, 420px 420px'
          }}></div>
        </div>
        <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>

        <div className="relative pt-20 pb-12 px-8">


          <div className="max-w-full mx-auto space-y-8">
            {/* ── Controls ── */}
            <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-200/60 rounded-3xl shadow-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Map</label>
                  <select
                    value={selectedMap}
                    onChange={(e) => setSelectedMap(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-blue-400 transition-all bg-white font-medium text-slate-700"
                  >
                    <option value="">Choose a map…</option>
                    {maps.map(m => (
                      <option key={m._id} value={m._id}>{m.locationName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="w-full rounded-3xl p-5 bg-blue-50 border border-blue-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-3xl bg-linear-to-br from-blue-400 to-indigo-400 flex items-center justify-center shadow-md">
                      <span className="text-white font-black text-sm">{maps.length}</span>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">Total Maps</p>
                      <p className="text-sm text-slate-600">Configured locker layouts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Map Display ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Loading maps…</p>
              </div>
            </div>
          ) : !selectedMap ? (
            <div className="text-center py-20 text-slate-400 font-semibold">Select a map to view</div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 p-12 rounded-3xl shadow-2xl w-full max-w-full mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-400"></div>

              <div className="mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-black bg-linear-to-r from-slate-800 to-blue-400 bg-clip-text text-transparent mb-3">
                  {selectedMapData?.locationName || 'Locker Map'}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Interactive Map View</span>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <MapDisplay key={selectedMap} map={selectedMapData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LockerMap;