import React from 'react';

function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="vintage-spinner mb-4"></div>
        <p className="text-green-300">{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;