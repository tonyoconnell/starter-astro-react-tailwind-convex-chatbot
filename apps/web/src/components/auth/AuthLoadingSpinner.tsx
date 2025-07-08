interface AuthLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function AuthLoadingSpinner({ 
  size = "md", 
  message = "Loading...", 
  className = "" 
}: AuthLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2`}
        ></div>
        {message && (
          <p className={`text-gray-600 ${textSizeClasses[size]}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}