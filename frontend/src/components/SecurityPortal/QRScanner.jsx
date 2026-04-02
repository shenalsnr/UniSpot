import React, { useState, useRef } from 'react';
import axios from 'axios';

const QRScanner = () => {
  // State Management
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const API_URL = 'http://localhost:5000/api/security';

  // Auto-dismiss notifications
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Initialize camera on mount
  React.useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [scanMode]);

  // Camera control
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions and try manual entry instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  // Capture frame from video
  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Simulate QR scanning by extracting image data
      // In production, use a library like jsQR or react-qr-reader
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // For demo: extract text from canvas (simplified)
      // In real scenario, use QR decoding library
      setError('Camera scanning requires QR library. Please use Manual Entry instead.');
    }
  };

  // Verify staff by QR or manual input
  const handleVerifyStaff = async (qrData) => {
    if (!qrData.trim()) {
      setError('Please Enter A Valid Staff ID Or QR Code');
      return;
    }

    setLoading(true);
    try {
      // In production, this would verify the QR scan
      // For now, we'll treat it as a staff ID lookup
      const response = await axios.get(`${API_URL}/staff`);
      const staff = response.data.data?.find(
        (s) => s.staffID === qrData.trim() || s.name.toLowerCase().includes(qrData.toLowerCase())
      );

      if (staff) {
        setScanResult(staff);
        setSuccess(`✓ Successfully Verified: ${staff.name}`);
        setManualInput('');
      } else {
        setError('Staff Member Not Found. Please Check The QR Code Or Staff ID.');
        setScanResult(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error Verifying Staff. Please Try Again.');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVerifyStaff(manualInput);
  };

  const resetScan = () => {
    setScanResult(null);
    setManualInput('');
    setError('');
    setSuccess('');
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

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setScanMode('camera')}
          className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            scanMode === 'camera'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          📷 Camera Scan
        </button>
        <button
          onClick={() => setScanMode('manual')}
          className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            scanMode === 'manual'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          ⌨️ Manual Entry
        </button>
      </div>

      {/* Camera Mode */}
      {scanMode === 'camera' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <div className="relative bg-black rounded-2xl overflow-hidden mb-6">
            {/* Animated Neon Frame */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg shadow-lg shadow-cyan-400/50"></div>
              
              {/* Animated Center Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30 animate-pulse"></div>
            </div>

            {/* Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-80 object-cover"
            />

            {/* Overlay Dark */}
            <div className="absolute inset-0 pointer-events-none bg-black/10"></div>
          </div>

          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="hidden"
          />

          <button
            onClick={captureAndScan}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? '⏳ Scanning...' : '🎯 Capture & Scan'}
          </button>

          <p className="text-center text-slate-600 text-sm mt-4">
            Position QR code within frame and click "Capture & Scan"
          </p>
        </div>
      )}

      {/* Manual Entry Mode */}
      {scanMode === 'manual' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Staff ID Or QR Code Value
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="E.g., ST-1001"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 font-semibold text-lg text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {loading ? '⏳ Verifying...' : '🔍 Verify Staff'}
            </button>
          </form>
        </div>
      )}

      {/* Scan Result - Success */}
      {scanResult && scanResult.status === 'Active' && (
        <div className="mb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-emerald-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">✅</div>
            <h3 className="text-3xl font-black text-emerald-700">Access Granted</h3>
            <p className="text-emerald-600 text-sm font-semibold mt-1">Staff Member Verified</p>
          </div>

          <div className="space-y-4">
            {/* Info Cards */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STAFF ID</p>
              <p className="text-2xl font-black text-emerald-700">{scanResult.staffID}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">NAME</p>
              <p className="text-xl font-bold text-slate-800">{scanResult.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">DESIGNATION</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.designation}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">SHIFT</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.shift}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">GATE</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.gate}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">PHONE</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.phone}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">NIC</p>
              <p className="text-lg font-bold text-slate-800">{scanResult.nic}</p>
            </div>
          </div>

          <button
            onClick={resetScan}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔄 Scan Another
          </button>
        </div>
      )}

      {/* Scan Result - Inactive Staff */}
      {scanResult && scanResult.status !== 'Active' && (
        <div className="mb-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl shadow-xl border-2 border-yellow-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">⚠️</div>
            <h3 className="text-3xl font-black text-yellow-700">Access Restricted</h3>
            <p className="text-yellow-600 text-sm font-semibold mt-1">Staff Member Status: Inactive</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-yellow-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STAFF ID</p>
              <p className="text-2xl font-black text-yellow-700">{scanResult.staffID}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-yellow-200">
              <p className="text-xs font-bold text-slate-600 mb-1">NAME</p>
              <p className="text-xl font-bold text-slate-800">{scanResult.name}</p>
            </div>

            <div className="bg-yellow-100 rounded-xl p-4 border-2 border-yellow-300">
              <p className="text-yellow-800 font-bold text-center">
                ⚠️ This Staff Member Is Currently Inactive. Contact Administration To Activate.
              </p>
            </div>
          </div>

          <button
            onClick={resetScan}
            className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔄 Try Another Scan
          </button>
        </div>
      )}

      {/* Empty State */}
      {!scanResult && !loading && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
          <p className="text-5xl mb-4">📱</p>
          <p className="text-xl font-bold text-slate-800">Ready To Scan</p>
          <p className="text-slate-600 mt-2">
            {scanMode === 'camera'
              ? 'Position a QR code in the camera frame'
              : 'Enter staff ID or scan QR code data'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
