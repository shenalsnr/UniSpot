import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffRegister = () => {
  // State Management
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [generatedID, setGeneratedID] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    designation: 'Security Guard',
    shift: 'Day',
    gate: 'Gate A',
    phone: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState({});
  const API_URL = 'http://localhost:5000/api/security';

  // Fetch staff list on mount
  useEffect(() => {
    fetchAllStaff();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // API: Fetch all staff
  const fetchAllStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/staff`);
      setStaffList(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff records');
    } finally {
      setLoading(false);
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.nic.trim()) {
      errors.nic = 'NIC is required';
    } else if (!/^[0-9]{10,12}$/.test(formData.nic)) {
      errors.nic = 'NIC must be 10-12 digits only';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Phone Number must be exactly 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nic: '',
      designation: 'Security Guard',
      shift: 'Day',
      gate: 'Gate A',
      phone: '',
      status: 'Active',
    });
    setFormErrors({});
    setGeneratedID('');
    setSelectedStaff(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      nic: staff.nic,
      designation: staff.designation,
      shift: staff.shift,
      gate: staff.gate,
      phone: staff.phone,
      status: staff.status,
    });
    setGeneratedID(staff.staffID);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // API: Submit form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditMode && selectedStaff) {
        // UPDATE
        await axios.put(`${API_URL}/staff/${selectedStaff.staffID}`, formData);
        setSuccess('Staff Member Updated Successfully!');
      } else {
        // CREATE
        const response = await axios.post(`${API_URL}/staff`, formData);
        setGeneratedID(response.data.data?.staffID);
        setSuccess('Staff Member Registered Successfully!');
      }

      // Refresh data and close modal
      fetchAllStaff();
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // API: Delete staff
  const handleDeleteStaff = async (staffID) => {
    if (window.confirm('Are you absolutely sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/staff/${staffID}`);
        setSuccess('Staff Member Deleted Successfully!');
        fetchAllStaff();
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting staff member');
      }
    }
  };

  // API: Toggle status
  const toggleStatus = async (staff) => {
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.put(`${API_URL}/staff/${staff.staffID}`, { status: newStatus });
      setSuccess(`Staff Status Changed to ${newStatus}`);
      fetchAllStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating staff status');
    }
  };

  return (
    <div>
      {/* Success Notification */}
      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <p className="text-emerald-700 font-bold">{success}</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✕</span>
            <p className="text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800">System Records</h2>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          ➕ Add New Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4 font-semibold">Loading Staff Records...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-xl font-bold text-slate-800">No Staff Records Found</p>
            <p className="text-slate-600 mt-2">Click "➕ Add New Staff" to register your first security staff member</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Staff ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Designation</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">NIC</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Shift</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Gate</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff._id} className="border-b border-slate-200 hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="font-black text-blue-700 bg-blue-100 px-3 py-2 rounded-lg text-sm">
                        {staff.staffID}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{staff.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{staff.designation}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{staff.nic}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{staff.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full text-xs">
                        {staff.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-xs">
                        {staff.gate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(staff)}
                        className={`px-4 py-2 rounded-full text-white font-bold text-sm transition-all duration-300 transform hover:scale-110 ${
                          staff.status === 'Active'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 shadow-md'
                        }`}
                      >
                        {staff.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.staffID)}
                          className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">
                {isEditMode ? '✏️ Edit Staff Member' : '➕ Register New Staff'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Staff ID */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Staff ID
                </label>
                <input
                  type="text"
                  value={generatedID || 'Auto-Generated'}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-bold cursor-not-allowed"
                />
                <small className="text-slate-500 text-xs mt-1 block">Auto-generated in ST-XXXX format</small>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Full Name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    formErrors.name
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50'
                      : 'border-slate-300 focus:ring-blue-500 bg-white'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-rose-600 text-xs font-bold mt-1">⚠️ {formErrors.name}</p>
                )}
              </div>

              {/* NIC */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  National ID Card (NIC) - 10 Or 12 Digits *
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  placeholder="E.g., 1234567890"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    formErrors.nic
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50'
                      : 'border-slate-300 focus:ring-blue-500 bg-white'
                  }`}
                />
                {formErrors.nic && (
                  <p className="text-rose-600 text-xs font-bold mt-1">⚠️ {formErrors.nic}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Designation *
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="Security Guard">Security Guard</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Shift *
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              {/* Gate */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Assigned Gate *
                </label>
                <select
                  name="gate"
                  value={formData.gate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="Gate A">Gate A</option>
                  <option value="Gate B">Gate B</option>
                  <option value="Gate C">Gate C</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number - 10 Digits *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="E.g., 0712345678"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    formErrors.phone
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50'
                      : 'border-slate-300 focus:ring-blue-500 bg-white'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-rose-600 text-xs font-bold mt-1">⚠️ {formErrors.phone}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {loading ? '⏳ Processing...' : isEditMode ? '💾 Update' : '➕ Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRegister;
