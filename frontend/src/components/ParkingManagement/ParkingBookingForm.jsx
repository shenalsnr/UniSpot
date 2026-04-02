import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import logoSrc from '../../assets/logo.png';

const ParkingBookingForm = () => {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [spot, setSpot] = useState(location.state?.spot || null);
  const [loadingSpot, setLoadingSpot] = useState(!location.state?.spot);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    phone: '',
    bookingDate: '',
    arrivalTime: '',
    leavingTime: '',
    spotId: spotId || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!spot && spotId) {
      const fetchSpot = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/parking/${spotId}`);
          if (res.ok) {
            const data = await res.json();
            setSpot(data.data);
          } else {
            navigate('/parking/zones');
          }
        } catch (error) {
          navigate('/parking/zones');
        } finally {
          setLoadingSpot(false);
        }
      };
      fetchSpot();
    } else if (!spot && !spotId) {
      navigate('/parking/zones');
    }
  }, [spot, spotId, navigate]);

  // Sync spotId from URL if it changes
  useEffect(() => {
    if (spotId && spotId !== formData.spotId) {
      setFormData(prev => ({ ...prev, spotId }));
    }
  }, [spotId, formData.spotId]);

  const downloadReceipt = () => {
    const doc = new jsPDF();
    
    
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 40, 210, 8, 'F');

    const finishPDF = (doc) => {
      doc.setFontSize(24);
      doc.setTextColor(30, 64, 175);
      doc.text('UniSpot Parking', 50, 26);
      
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text('Parking Booking Receipt', 20, 65);

      const refId = 'REF-' + Math.floor(100000 + Math.random() * 900000);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Reference ID: ${refId}`, 20, 75);
      doc.text(`Booking Date: ${new Date().toLocaleString()}`, 20, 85);
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 95, 170, 45, 3, 3, 'FD');
      
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Booking Details', 25, 105);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Student Name: ${formData.firstName} ${formData.lastName}`, 25, 115);
      doc.text(`Student ID: ${formData.studentId}`, 25, 123);
      doc.text(`Vehicle Type: ${spot?.vehicleType}`, 25, 131);
      
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 145, 170, 50, 3, 3, 'FD');
      
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Time & Location', 25, 155);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Slot Number: ${spot?.slotNumber}`, 25, 165);
      doc.text(`Zone: ${spot?.zone}`, 25, 173);
      doc.text(`Booking Date: ${formData.bookingDate}`, 25, 181);
      doc.text(`Time: ${formData.arrivalTime} to ${formData.leavingTime}`, 25, 189);
      
      doc.setFillColor(220, 252, 231);
      doc.rect(20, 205, 170, 15, 'F');
      doc.setTextColor(22, 101, 52);
      doc.setFont(undefined, 'bold');
      doc.text(`Status: CONFIRMED`, 25, 215);
      
      doc.save(`Parking_Receipt_${spot?.slotNumber}.pdf`);
    };

    const img = new Image();
    img.src = logoSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      
      const ratio = img.height / img.width;
      const renderWidth = 30;
      const renderHeight = renderWidth * ratio;
      const yPos = (40 - renderHeight) / 2;
      
      doc.addImage(dataUrl, 'PNG', 15, yPos, renderWidth, renderHeight);
      finishPDF(doc);
    };
    img.onerror = () => {
      finishPDF(doc);
    };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required.";
    
    if (!formData.bookingDate) {
      newErrors.bookingDate = "Booking date is required.";
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (formData.bookingDate < todayStr) {
        newErrors.bookingDate = "Booking date cannot be in the past.";
      }
    }
    
    if (!formData.arrivalTime) {
      newErrors.arrivalTime = "Arrival time is required.";
    }
    
    if (!formData.leavingTime) {
      newErrors.leavingTime = "Leaving time is required.";
    } else if (formData.arrivalTime && formData.leavingTime <= formData.arrivalTime) {
      newErrors.leavingTime = "Leaving time must be after arrival time.";
    }

    if (!formData.spotId.trim()) newErrors.spotId = "Spot ID is required. Please select a spot from the map.";
    
    // Student ID Validation (non-empty here)
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required.";
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone Validation(10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone Number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // API call to backend
      const res = await fetch(`http://localhost:5000/api/parking/${formData.spotId}/reserve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: formData.studentId, ...formData })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const errorData = await res.json();
        setErrors({ submit: errorData.message || "Failed to book the spot. It may already be occupied." });
      }
    } catch (err) {
      setErrors({ submit: "Server connection failed. Is the backend running?" });
    }
    
    setIsSubmitting(false);
  };

  if (loadingSpot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-pulse text-xl text-blue-500 font-bold">Loading booking details...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-xl shadow-xl border-t-4 border-blue-500 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6 font-medium">Your parking spot has been successfully secured.</p>
          <div className="flex flex-col gap-3">
            <button onClick={downloadReceipt} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors w-full">Download Receipt PDF</button>
            <button onClick={() => navigate('/parking/zones')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors w-full">Return to Map</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl p-8 border border-gray-100 mt-10">
        <div className="text-center mb-8 border-b border-gray-100 pb-5">
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">Booking Form</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Verify your details to secure your spot</p>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold text-center">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-2">
            <h3 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">Selected Spot Details</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="flex flex-col"><span className="text-blue-500 font-bold uppercase text-xs">Slot Number</span> <span className="font-extrabold text-blue-900 text-lg">{spot?.slotNumber}</span></div>
              <div className="flex flex-col"><span className="text-blue-500 font-bold uppercase text-xs">Zone</span> <span className="font-bold text-gray-800 font-mono">{spot?.zone}</span></div>
              <div className="flex flex-col"><span className="text-blue-500 font-bold uppercase text-xs">Vehicle Type</span> <span className="font-bold text-gray-800">{spot?.vehicleType}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <input 
                type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20  ${errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs font-bold mt-2">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <input 
                type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs font-bold mt-2">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Booking Date</label>
                <input
                  type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                  className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white ${errors.bookingDate ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                />
                {errors.bookingDate && <p className="text-red-500 text-xs font-bold mt-2">{errors.bookingDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Arrival Time</label>
                <input
                  type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white ${errors.arrivalTime ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                />
                {errors.arrivalTime && <p className="text-red-500 text-xs font-bold mt-2">{errors.arrivalTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Leaving Time</label>
                <input
                  type="time" name="leavingTime" value={formData.leavingTime} onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-white ${errors.leavingTime ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                />
                {errors.leavingTime && <p className="text-red-500 text-xs font-bold mt-2">{errors.leavingTime}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Student ID</label>
            <input 
              type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="e.g. IT21345678"
              className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.studentId ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.studentId && <p className="text-red-500 text-xs font-bold mt-2">{errors.studentId}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input 
              type="text" name="email" value={formData.email} onChange={handleChange} placeholder="student@university.edu"
              className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.email && <p className="text-red-500 text-xs font-bold mt-2">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
            <input 
              type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="07xxxxxxxx"
              className={`w-full border-2 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs font-bold mt-2">{errors.phone}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg py-4 px-4 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParkingBookingForm;
