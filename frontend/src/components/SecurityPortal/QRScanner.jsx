import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const PARKING_API = 'http://localhost:5000/api/parking';

const QRScanner = () => {
  // Default to 'manual' mode - only start camera when Camera Scan tab is clicked
  const [scanMode, setScanMode] = useState('manual');
  const [manualInput, setManualInput] = useState('');
  const [parkingScanResult, setParkingScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const qrCodeRef = useRef(null);
  const scanCooldownRef = useRef(false);
  const isScannerInitializingRef = useRef(false);

  // Auto-dismiss notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Master cleanup on component unmount - ensures camera is properly closed
  useEffect(() => {
    // Component has mounted - initialization can proceed if needed
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  // Camera initialization - ONLY when Camera Scan tab becomes active
  useEffect(() => {
    let cleanedUp = false;

    const initializeCamera = async () => {
      // Prevent double initialization
      if (cleanedUp || isScannerInitializingRef.current) {
        return;
      }

      if (scanMode === 'camera') {
        isScannerInitializingRef.current = true;
        await startScanning();
        isScannerInitializingRef.current = false;
      }
    };

    const stopCamera = async () => {
      if (scanMode !== 'camera') {
        await stopScanning();
      }
    };

    if (scanMode === 'camera') {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      cleanedUp = true;
      // Don't stop here - let the mode-specific cleanup handle it
    };
  }, [scanMode]);

  const startScanning = async () => {
    try {
      const container = document.getElementById('qr-scanner-container');
      if (!container) {
        console.error('Scanner container not found');
        return;
      }

      // Guard: If scanner is already running, don't start again
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        console.warn('Scanner is already running, skipping initialization');
        return;
      }

      // Guard: Check if there's already an active video element in the container
      const existingVideo = container.querySelector('video');
      if (existingVideo) {
        console.warn('Existing video element found, clearing container');
        container.innerHTML = '';
      }

      // CLEANUP: Stop and clear any existing scanner instance
      if (qrCodeRef.current) {
        try {
          if (qrCodeRef.current.isScanning) {
            await qrCodeRef.current.stop();
          }
          await qrCodeRef.current.clear();
        } catch (err) {
          console.error('Error cleaning up previous scanner:', err);
        }
        qrCodeRef.current = null;
      }

      // Final HTML cleanup to remove any orphaned elements
      container.innerHTML = '';

      // Create new Html5Qrcode instance
      qrCodeRef.current = new Html5Qrcode('qr-scanner-container', {
        formFactor: 'portrait',
        aspectRatio: 1.0,
      });

      // Start scanning with environment camera
      await qrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code detected
          handleQRCodeDetected(decodedText);
        },
        () => {
          // Silent - don't show scanning errors
        }
      );
    } catch (err) {
      console.error('Scanner initialization error:', err);
      // Don't show error to user - camera permission or device issue
    }
  };

  const stopScanning = async () => {
    try {
      if (qrCodeRef.current) {
        // Attempt to stop the scanner if it's running
        try {
          if (qrCodeRef.current.isScanning) {
            await qrCodeRef.current.stop();
          }
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }

        // Attempt to clear the scanner
        try {
          await qrCodeRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }

        qrCodeRef.current = null;
      }

      // MANUAL CLEANUP: Force clear the container's HTML
      const container = document.getElementById('qr-scanner-container');
      if (container) {
        container.innerHTML = '';
      }
    } catch (err) {
      console.error('Error in stopScanning:', err);
    }
  };

  // Handle when QR code is detected
  const handleQRCodeDetected = (qrData) => {
    if (!qrData || !qrData.trim()) {
      return;
    }

    // Check if we're in cooldown period (prevent duplicate scans)
    if (scanCooldownRef.current === true) {
      return;
    }

    // Activate cooldown period
    scanCooldownRef.current = true;

    // Trigger the parking scan with the detected QR data
    handleParkingScan(qrData.trim());

    // Reset cooldown after 4 seconds to allow next scan
    setTimeout(() => {
      scanCooldownRef.current = false;
    }, 4000);
  };

  // ── PARKING scan handler ──────────────────────────────────────────────────
  const handleParkingScan = async (qrData) => {
    if (!qrData.trim()) {
      setError('Please Enter A Valid Student ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${PARKING_API}/security/scan-qr`, {
        studentId: qrData.trim(),
      });

      const { data } = response;
      setParkingScanResult(data);

      if (data.scanType === 'arrival') {
        setSuccess(`✓ Arrival recorded for ${data.data?.studentName || qrData}`);
      } else if (data.scanType === 'departure') {
        setSuccess(`✓ Departure confirmed for ${data.data?.studentName || qrData}`);
      } else {
        setSuccess(data.message || '✓ Scan processed');
      }
      setManualInput('');
    } catch (err) {
      setParkingScanResult(null);
      setError(err.response?.data?.message || 'Error processing parking scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleParkingScan(manualInput);
  };

  const resetScan = async () => {
    // Clear the UI state first
    setParkingScanResult(null);
    setManualInput('');
    setError('');
    setSuccess('');
    
    // Reset the cooldown flag to allow immediate next scan
    scanCooldownRef.current = false;

    // If in camera mode, restart the scanner cleanly
    if (scanMode === 'camera') {
      // Stop the current scanner first
      await stopScanning();
      
      // Give a small delay for cleanup to complete
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };

  // ── Parking scan result card ──────────────────────────────────────────────
  const renderParkingScanResult = () => {
    if (!parkingScanResult) return null;

    const { scanType, data, message } = parkingScanResult;

    if (scanType === 'arrival') {
      return (
        <div className="mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-blue-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🚗</div>
            <h3 className="text-3xl font-black text-blue-700">Arrival Recorded</h3>
            <p className="text-blue-600 text-sm font-semibold mt-1">Student Has Entered Parking</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STUDENT</p>
              <p className="text-xl font-bold text-slate-800">{data?.studentName} <span className="text-sm text-slate-500 font-mono">({data?.studentId})</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">SLOT</p>
                <p className="text-lg font-black text-blue-700">{data?.slotNumber}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">ZONE</p>
                <p className="text-sm font-bold text-slate-700">{data?.zone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">BOOKED ARRIVAL</p>
                <p className="text-sm font-bold text-slate-700">{data?.arrivalTime}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">BOOKED LEAVING</p>
                <p className="text-sm font-bold text-slate-700">{data?.leavingTime}</p>
              </div>
            </div>
            <div className="bg-blue-100 rounded-xl p-4 border border-blue-300 text-center">
              <p className="text-blue-800 font-bold text-sm">📲 Scan this QR again when student departs to confirm departure</p>
            </div>
          </div>
          <button onClick={resetScan} className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            🔄 Scan Next
          </button>
        </div>
      );
    }

    if (scanType === 'departure') {
      return (
        <div className="mb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-emerald-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">✅</div>
            <h3 className="text-3xl font-black text-emerald-700">Departure Confirmed</h3>
            <p className="text-emerald-600 text-sm font-semibold mt-1">Slot Is Now Available</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STUDENT</p>
              <p className="text-xl font-bold text-slate-800">{data?.studentName} <span className="text-sm text-slate-500 font-mono">({data?.studentId})</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">SLOT RELEASED</p>
                <p className="text-lg font-black text-emerald-700">{data?.slotNumber}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">ZONE</p>
                <p className="text-sm font-bold text-slate-700">{data?.zone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">ARRIVAL TIME</p>
                <p className="text-xs font-semibold text-slate-700">{data?.actualArrivalTime ? new Date(data.actualArrivalTime).toLocaleTimeString() : 'N/A'}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">DEPARTURE TIME</p>
                <p className="text-xs font-semibold text-slate-700">{data?.actualDepartureTime ? new Date(data.actualDepartureTime).toLocaleTimeString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-emerald-100 rounded-xl p-3 border border-emerald-300 text-center">
              <p className="text-emerald-800 font-bold text-sm">✉️ Departure notification sent to student</p>
            </div>
          </div>
          <button onClick={resetScan} className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            🔄 Scan Next
          </button>
        </div>
      );
    }

    // already_completed or other
    return (
      <div className="mb-8 bg-white/90 rounded-2xl shadow-xl border-2 border-slate-200 p-8">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">ℹ️</div>
          <h3 className="text-2xl font-black text-slate-700">Scan Info</h3>
        </div>
        <p className="text-slate-600 text-center font-medium">{message}</p>
        <button onClick={resetScan} className="w-full mt-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
          🔄 Scan Next
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Success Notification */}
      {success && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <p className="text-emerald-700 font-bold">{success}</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✕</span>
            <p className="text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Mode Toggle: Camera vs Manual - Centered */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setScanMode('camera')}
          className={`py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${
            scanMode === 'camera'
              ? 'bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          📷 Camera Scan
        </button>
        <button
          onClick={() => setScanMode('manual')}
          className={`py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${
            scanMode === 'manual'
              ? 'bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          ⌨️ Manual Entry
        </button>
      </div>

      {/* Camera Mode */}
      {scanMode === 'camera' && (
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 w-full max-w-2xl">
            <style>{`
              #qr-scanner-container {
                border-radius: 1rem;
                overflow: hidden;
                border: 2px solid rgb(226 232 240);
              }
              #qr-scanner-container video {
                border-radius: 1rem !important;
              }
            `}</style>
            
            <div
              id="qr-scanner-container"
              style={{ 
                minHeight: '400px',
                background: '#000',
                borderRadius: '1rem',
                overflow: 'hidden',
                position: 'relative'
              }}
            />

            <p className="text-center text-slate-600 text-sm mt-4 font-semibold">
              📷 Position QR code in frame - scans automatically
            </p>
          </div>
        </div>
      )}

      {/* Manual Entry Mode */}
      {scanMode === 'manual' && (
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 w-full max-w-2xl">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Student ID (from QR)
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="E.g., IT21345678"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 font-semibold text-lg text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? '⏳ Processing...' : '🚗 Scan Parking QR'}
            </button>
          </form>
          </div>
        </div>
      )}

      {/* Parking Scan Result */}
      {parkingScanResult && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {renderParkingScanResult()}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!parkingScanResult && !loading && (
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center w-full max-w-2xl">
            <p className="text-6xl mb-4">🚗</p>
            <p className="text-2xl font-bold text-slate-800">Ready To Scan Vehicle Entry</p>
            <p className="text-slate-600 mt-3 text-base">
              {scanMode === 'camera'
                ? 'Position a student QR code in the camera frame'
                : 'Enter student ID from QR code'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
