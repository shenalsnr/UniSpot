import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, ArrowLeft, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../Admin/AdminLayout";

import { showAlert } from "../Shared/BeautifulAlert";

const AdminLockerMap = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    locationName: "",
    rows: "",
    lockersPerRow: ""
  });

  const [updateForm, setUpdateForm] = useState({
    locationName: "",
    rows: "",
    lockersPerRow: ""
  });

  const [loading, setLoading] = useState(false);
  const [maps, setMaps] = useState([]);
  const [editingMapId, setEditingMapId] = useState(null);

  // Fetch maps from the backend
  const fetchMaps = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/locker/maps");
      setMaps(response.data);
    } catch (error) {
      console.error("Error fetching maps:", error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  // handle input change for create
  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "locationName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }
    if ((name === "rows" || name === "lockersPerRow") && Number(value) > 10) {
      value = "10";
    }
    setForm({
      ...form,
      [name]: value
    });
  };

  // handle input change for update
  const handleUpdateChange = (e) => {
    let { name, value } = e.target;
    if (name === "locationName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }
    if ((name === "rows" || name === "lockersPerRow") && Number(value) > 10) {
      value = "10";
    }
    setUpdateForm({
      ...updateForm,
      [name]: value
    });
  };

  // submit create form
  const handleSubmit = async () => {
    // basic validation
    if (!form.locationName || form.rows <= 0 || form.lockersPerRow <= 0) {
      showAlert('warning', 'Please fill all fields correctly');
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/locker/create-map", {
        locationName: form.locationName,
        rows: Number(form.rows),
        lockersPerRow: Number(form.lockersPerRow)
      });

      showAlert('success', 'Map Created Successfully', 'Success');

      // clear form after submit
      setForm({
        locationName: "",
        rows: "",
        lockersPerRow: ""
      });

      // Refresh maps list immediately
      await fetchMaps();

    } catch (error) {
      console.error(error);
      showAlert('error', 'Error creating map', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // submit update form
  const handleUpdateSubmit = async () => {
    if (!updateForm.locationName || updateForm.rows <= 0 || updateForm.lockersPerRow <= 0) {
      showAlert('warning', 'Please fill all fields correctly');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/locker/update-map/${editingMapId}`, {
        locationName: updateForm.locationName,
        rows: Number(updateForm.rows),
        lockersPerRow: Number(updateForm.lockersPerRow)
      });
      showAlert('success', 'Map Updated Successfully', 'Success');

      setEditingMapId(null);
      await fetchMaps();
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error updating map', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Start inline editing
  const startEditing = (map) => {
    setEditingMapId(map._id);
    setUpdateForm({
      locationName: map.locationName,
      rows: map.rows,
      lockersPerRow: map.lockersPerRow
    });
  };

  // Delete map
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this map?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/locker/delete-map/${id}`);
      await fetchMaps();
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error deleting map', 'Error');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col items-center pb-20 w-full min-h-screen relative bg-white">
        {/* Professional White Background */}
        <div className="fixed inset-0 bg-linear-to-br from-white via-slate-50 to-white"></div>
        
        {/* Subtle Geometric Pattern */}
        <div className="fixed inset-0 opacity-3 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)`,
            backgroundSize: '400px 400px, 400px 400px'
          }}></div>
        </div>
        
        {/* Professional Border Accents */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-400 to-transparent opacity-20"></div>
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-400 to-transparent opacity-20"></div>

        {/* Main Header Topic */}
        <div className="w-full max-w-[95%] 2xl:max-w-1400 mx-auto px-8 mt-10 mb-6 relative z-10">
          <div className="bg-[oklch(48.8%_0.243_264.376)] text-white rounded-2xl p-8 shadow-xl shadow-blue-500/20 border border-white/10 overflow-hidden relative">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase">
                Add New Map
              </h1>
              <div className="flex items-center gap-2 text-white/80 font-medium">
                <span className="w-8 h-px bg-white/30"></span>
                <p>Locker Location Management & Configuration</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 max-w-[95%] 2xl:max-w-1400 mx-auto w-full px-8 relative z-10">

        {/* Left Side: Table View */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 shadow-2xl rounded-2xl p-8 flex flex-col relative overflow-hidden">
          {/* Professional Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-400 "></div>
          
          <h2 className="text-2xl font-black bg-linear-to-r from-slate-800 to-blue-400 bg-clip-text text-transparent mb-6 text-center">
            Configured Maps
          </h2>
          <p className="text-center text-slate-600 mb-8">Manage and monitor all locker configurations</p>

          <div className="flex-1 overflow-x-auto">
            {maps.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-max text-lg">
                <thead className="sticky top-0 bg-linear-to-r from-slate-50 to-blue-50 shadow-sm z-10 text-slate-700">
                  <tr>
                    <th className="p-4 border-b-2 font-bold w-1/3 uppercase tracking-wide text-sm">Location Name</th>
                    <th className="p-4 border-b-2 font-bold w-1/5 uppercase tracking-wide text-sm">Rows</th>
                    <th className="p-4 border-b-2 font-bold w-1/5 uppercase tracking-wide text-sm">Lockers/Row</th>
                    <th className="p-4 border-b-2 font-bold text-center w-auto uppercase tracking-wide text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maps.map((map) => (
                    <tr key={map._id} className={`transition border-b ${editingMapId === map._id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 text-slate-800 font-bold">{map.locationName}</td>
                      <td className="p-4 text-slate-600 font-medium">{map.rows}</td>
                      <td className="p-4 text-slate-600 font-medium">{map.lockersPerRow}</td>
                      <td className="p-4 text-center space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => startEditing(map)}
                          className="text-blue-600 hover:text-blue-800 font-bold px-5 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          Update
                        </button>
                        
                        <button
                          onClick={() => handleDelete(map._id)}
                          className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:text-red-700 hover:from-red-100 hover:to-red-200 font-bold px-5 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">No Maps Configured</h3>
                <p className="text-slate-600 text-center leading-relaxed">Create your first locker map using the configuration panel on the right.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Create / Update Form */}
        <div className="w-full md:w-96 flex-none bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 shadow-2xl rounded-2xl p-8 flex flex-col relative overflow-hidden">
          {/* Professional Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          {editingMapId ? (
            <>
              <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-6 text-center">
                Update Map
              </h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Location Name</label>
                  <input
                    name="locationName"
                    value={updateForm.locationName}
                    placeholder="e.g. Main Hall"
                    onChange={handleUpdateChange}
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Number of Rows</label>
                  <div className="relative">
                    <input
                      name="rows"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={updateForm.rows}
                      placeholder="e.g. 5"
                      onChange={handleUpdateChange}
                      className="w-full bg-white border-2 border-slate-200 p-3 pr-24 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">Max: 10</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Lockers Per Row</label>
                  <div className="relative">
                    <input
                      name="lockersPerRow"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={updateForm.lockersPerRow}
                      placeholder="e.g. 10"
                      onChange={handleUpdateChange}
                      className="w-full bg-white border-2 border-slate-200 p-3 pr-24 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">Max: 10</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={handleUpdateSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditingMapId(null)}
                    disabled={loading}
                    className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 p-3 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-300 font-bold text-lg shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-6 text-center">
                Configure Map Details
              </h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Location Name</label>
                  <input
                    name="locationName"
                    value={form.locationName}
                    placeholder="e.g. Main Hall"
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Number of Rows</label>
                  <div className="relative">
                    <input
                      name="rows"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={form.rows}
                      placeholder="e.g. 5"
                      onChange={handleChange}
                      className="w-full bg-white border-2 border-slate-200 p-3 pr-24 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">Max: 10</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Lockers Per Row</label>
                  <div className="relative">
                    <input
                      name="lockersPerRow"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={form.lockersPerRow}
                      placeholder="e.g. 10"
                      onChange={handleChange}
                      className="w-full bg-white border-2 border-slate-200 p-3 pr-24 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">Max: 10</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Map"}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminLockerMap;