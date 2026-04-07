import { useEffect, useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';

const BeautifulBooking = ({ 
  show = false,
  lockerId = '',
  onConfirm,
  onCancel,
  todayDate = ''
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      setBookingDate("");
      setBookingStartTime("");
      setBookingEndTime("");
    }
  }, [show]);

  if (!isVisible) return null;

  const handleConfirm = () => {
    if (!bookingDate || !bookingStartTime || !bookingEndTime) {
      return; // Let parent handle validation
    }
    
    setIsVisible(false);
    if (onConfirm) {
      onConfirm({
        date: bookingDate,
        startTime: bookingStartTime,
        endTime: bookingEndTime
      });
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
        onClick={handleCancel} 
      />
      
      <div className="relative max-w-md w-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-200 rounded-3xl shadow-2xl shadow-sky-200/50 p-8 transform transition-all duration-500 ease-out animate-slide-up backdrop-blur-sm">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-sky-600 animate-pulse"></div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white/70 transition-all duration-200 group"
        >
          <X size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
        </button>

        {/* Icon and Title */}
        <div className="flex items-center mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-200 shadow-lg">
            <Calendar size={32} className="text-sky-600" />
          </div>
          
          <h3 className="ml-4 text-xl font-bold text-sky-900">
            Book Locker {lockerId}
          </h3>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-sky-600 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} />
              Schedule Date
            </label>
            <input
              type="date"
              min={todayDate}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full border-2 border-sky-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-sm bg-white hover:border-sky-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-sky-600 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                Start Time
              </label>
              <input
                type="time"
                min="06:00"
                max="22:00"
                value={bookingStartTime}
                onChange={(e) => setBookingStartTime(e.target.value)}
                className="w-full border-2 border-sky-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-sm bg-white hover:border-sky-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-sky-600 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                End Time
              </label>
              <input
                type="time"
                min="06:00"
                max="22:00"
                value={bookingEndTime}
                onChange={(e) => setBookingEndTime(e.target.value)}
                className="w-full border-2 border-sky-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-sm bg-white hover:border-sky-300"
              />
            </div>
          </div>

          {/* Time Range Info */}
          <div className="bg-sky-100 border border-sky-200 rounded-xl p-4">
            <p className="text-sm text-sky-700 font-medium text-center">
              ⏰ Booking hours: 6:00 AM - 10:00 PM
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg bg-sky-600 hover:bg-sky-700 text-white"
          >
            <div className="flex items-center justify-center gap-2">
              <Check size={18} />
              Confirm Booking
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Global booking function
let bookingInstance = null;

export const showBooking = (lockerId, todayDate) => {
  return new Promise((resolve, reject) => {
    // Remove existing booking if any
    if (bookingInstance) {
      document.body.removeChild(bookingInstance);
    }

    // Create new booking container
    const bookingContainer = document.createElement('div');
    document.body.appendChild(bookingContainer);
    
    // Import ReactDOM dynamically to avoid require issues
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(bookingContainer);
      
      bookingInstance = bookingContainer;
      
      root.render(
        <BeautifulBooking 
          show={true}
          lockerId={lockerId}
          todayDate={todayDate}
          onConfirm={(bookingData) => {
            document.body.removeChild(bookingContainer);
            bookingInstance = null;
            resolve(bookingData);
          }}
          onCancel={() => {
            document.body.removeChild(bookingContainer);
            bookingInstance = null;
            reject(new Error('Booking cancelled'));
          }}
        />
      );
    }).catch(err => {
      console.error('Failed to load react-dom/client:', err);
      reject(err);
    });
  });
};

export default BeautifulBooking;
