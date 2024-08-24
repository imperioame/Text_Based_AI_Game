import React from 'react';

function Sidebar({ isOpen, onClose, onNewGame }) {
  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out drop-shadow-lg backdrop-blur-lg`}>
      <button className="absolute top-0 right-0 m-4 text-white" onClick={onClose}>
        X
      </button>
      <h2 className="text-xl font-bold mb-4 text-green-300">Your Adventures</h2>
      <button className="w-full px-4 py-2 bg-green-700 text-white rounded" onClick={onNewGame}>
        Start New Game
      </button>
      {/* TODO: Add list of saved games */}
    </div>
  );
}

export default Sidebar;
