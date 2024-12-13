import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B4619] border-t-transparent"></div>
    </div>
  );
};

export default LoadingScreen;