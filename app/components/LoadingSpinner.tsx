import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = "default", 
  text,
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-5 w-5",
    default: "h-8 w-8",
    large: "h-12 w-12"
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer circle */}
        <div className={`rounded-full border-4 border-blue-100 ${sizeClasses[size]}`} />
        {/* Spinning inner circle */}
        <div 
          className={`absolute top-0 left-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin ${sizeClasses[size]}`} 
        />
        {/* Center logo or icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <FontAwesomeIcon 
            icon={faSpinner} 
            className={`text-blue-600 animate-pulse ${
              size === "small" ? "text-xs" : 
              size === "large" ? "text-lg" : 
              "text-base"
            }`} 
          />
        </div>
      </div>
      {text && (
        <p className="text-gray-600 font-medium text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="bg-white/90 rounded-lg p-8 shadow-xl">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
}