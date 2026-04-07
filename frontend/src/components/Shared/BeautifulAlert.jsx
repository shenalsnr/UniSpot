import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X, Lock, Calendar, Clock, Info } from 'lucide-react';

const BeautifulAlert = ({
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration = 5000,
  onClose,
  show = false
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const alertStyles = {
    success: {
      bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      title: 'text-emerald-900',
      message: 'text-emerald-700',
      shadow: 'shadow-emerald-200/50'
    },
    error: {
      bg: 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50',
      border: 'border-rose-200',
      icon: 'text-rose-600',
      title: 'text-rose-900',
      message: 'text-rose-700',
      shadow: 'shadow-rose-200/50'
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      message: 'text-amber-700',
      shadow: 'shadow-amber-200/50'
    },
    info: {
      bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      title: 'text-sky-900',
      message: 'text-sky-700',
      shadow: 'shadow-sky-200/50'
    }
  };

  const currentStyle = alertStyles[type] || alertStyles.info;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={28} className={currentStyle.icon} />;
      case 'error':
        return <AlertCircle size={28} className={currentStyle.icon} />;
      case 'warning':
        return <Lock size={28} className={currentStyle.icon} />;
      case 'info':
        return <Info size={28} className={currentStyle.icon} />;
      default:
        return <AlertCircle size={28} className={currentStyle.icon} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md animate-fade-in"
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
      />

      <div className={`relative max-w-md w-full ${currentStyle.bg} ${currentStyle.border} border-2 rounded-3xl shadow-2xl ${currentStyle.shadow} p-8 transform transition-all duration-500 ease-out animate-slide-up backdrop-blur-sm`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className={`w-3 h-3 rounded-full ${currentStyle.icon} animate-pulse`}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white/70 transition-all duration-200 group"
        >
          <X size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
        </button>

        {/* Icon and Title */}
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-2xl ${currentStyle.bg} ${currentStyle.border} border-2 shadow-lg`}>
            {getIcon()}
          </div>

          {title && (
            <h3 className={`ml-4 text-xl font-bold ${currentStyle.title}`}>
              {title}
            </h3>
          )}
        </div>

        {/* Message */}
        <div className={`text-base leading-relaxed ${currentStyle.message} font-medium`}>
          {message}
        </div>

        {/* Action Button for certain types */}
        {(type === 'warning' || type === 'error') && (
          <button
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            className={`mt-6 w-full py-3 px-4 rounded-xl ${currentStyle.bg} ${currentStyle.border} border-2 ${currentStyle.title} font-semibold hover:opacity-80 transition-all duration-200 transform hover:scale-[1.02]`}
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
};

// Global alert function
let alertInstance = null;

export const showAlert = (type, message, title = null, duration = 5000) => {
  // Remove existing alert if any
  if (alertInstance) {
    document.body.removeChild(alertInstance);
  }

  // Create new alert container
  const alertContainer = document.createElement('div');
  document.body.appendChild(alertContainer);

  // Import ReactDOM dynamically to avoid require issues
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(alertContainer);

    alertInstance = alertContainer;

    root.render(
      <BeautifulAlert
        type={type}
        title={title}
        message={message}
        duration={duration}
        onClose={() => {
          if (document.body.contains(alertContainer)) {
            document.body.removeChild(alertContainer);
          }
          alertInstance = null;
        }}
        show={true}
      />
    );
  }).catch(err => {
    console.error('Failed to load react-dom/client:', err);
    // Fallback to regular alert
    alert(message);
  });
};

export default BeautifulAlert;
