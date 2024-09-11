import React, { useState } from 'react';
import { useSelector } from 'react-redux';

function ActionInput({ options, onSubmit, disabled }) {
  const [customAction, setCustomAction] = useState('');
  const isSubmittingAction = useSelector(state => state.game.isSubmittingAction);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSubmittingAction && customAction.trim()) {
      onSubmit(customAction);
      setCustomAction('');
    }
  };

  return (
    <div className="space-y-4">
      {Array.isArray(options) && options.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {options.map((option, index) => (
            <button
              key={index}
              className={`px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onSubmit(option)}
              disabled={disabled}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 rounded-l focus:outline-none focus:ring-2 focus:ring-green-500 text-green-300"
          placeholder="What would you do next?"
          disabled={disabled}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-green-700 text-white rounded-r hover:bg-green-600 transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled || !customAction.trim()}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ActionInput;