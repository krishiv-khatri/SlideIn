"use client";

export function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 relative">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-200 rounded-full opacity-25 animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 border-4 border-t-pink-500 border-r-pink-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading your experience...</p>
      </div>
    </div>
  );
} 