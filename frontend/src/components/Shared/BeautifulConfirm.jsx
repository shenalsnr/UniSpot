import { useEffect, useState } from 'react';
import { AlertTriangle, X, Check, XCircle } from 'lucide-react';

const BeautifulConfirm = ({ 
  show = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  onConfirm,
  onCancel
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  const confirmStyles = {
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      message: 'text-amber-700',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      cancelBtn: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    },
    danger: {
      bg: 'bg-gradient-to-br from-rose-50 via-red-50 to-pink-50',
      border: 'border-rose-200',
      icon: 'text-rose-600',
      title: 'text-rose-900',
      message: 'text-rose-700',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      cancelBtn: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    },
    info: {
      bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      title: 'text-sky-900',
      message: 'text-sky-700',
      confirmBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
      cancelBtn: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }
  };

  const currentStyle = confirmStyles[type] || confirmStyles.warning;

  const getIcon = () => {
    switch(type) {
      case 'danger':
        return <XCircle size={32} className={currentStyle.icon} />;
      case 'warning':
        return <AlertTriangle size={32} className={currentStyle.icon} />;
      case 'info':
        return <AlertTriangle size={32} className={currentStyle.icon} />;
      default:
        return <AlertTriangle size={32} className={currentStyle.icon} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
        onClick={() => {
          setIsVisible(false);
          if (onCancel) onCancel();
        }} 
      />
      
      <div className={`relative max-w-md w-full ${currentStyle.bg} ${currentStyle.border} border-2 rounded-3xl shadow-2xl p-8 transform transition-all duration-500 ease-out animate-slide-up backdrop-blur-sm`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            if (onCancel) onCancel();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white/70 transition-all duration-200 group"
        >
          <X size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
        </button>

        {/* Icon and Title */}
        <div className="flex items-center mb-6">
          <div className={`p-4 rounded-2xl ${currentStyle.bg} ${currentStyle.border} border-2 shadow-lg`}>
            {getIcon()}
          </div>
          
          <h3 className={`ml-4 text-xl font-bold ${currentStyle.title}`}>
            {title}
          </h3>
        </div>

        {/* Message */}
        <div className={`text-base leading-relaxed ${currentStyle.message} font-medium mb-8`}>
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsVisible(false);
              if (onCancel) onCancel();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] ${currentStyle.cancelBtn}`}
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              setIsVisible(false);
              if (onConfirm) onConfirm();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${currentStyle.confirmBtn}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Check size={18} />
              {confirmText}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Global confirm function
let confirmInstance = null;

export const showConfirm = (options) => {
  return new Promise((resolve) => {
    // Remove existing confirm if any
    if (confirmInstance) {
      document.body.removeChild(confirmInstance);
    }

    // Create new confirm container
    const confirmContainer = document.createElement('div');
    document.body.appendChild(confirmContainer);
    
    // Import ReactDOM dynamically to avoid require issues
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(confirmContainer);
      
      confirmInstance = confirmContainer;
      
      root.render(
        <BeautifulConfirm 
          {...options}
          show={true}
          onConfirm={() => {
            document.body.removeChild(confirmContainer);
            confirmInstance = null;
            resolve(true);
          }}
          onCancel={() => {
            document.body.removeChild(confirmContainer);
            confirmInstance = null;
            resolve(false);
          }}
        />
      );
    }).catch(err => {
      console.error('Failed to load react-dom/client:', err);
      // Fallback to regular confirm
      resolve(window.confirm(options.message));
    });
  });
};

export default BeautifulConfirm;
