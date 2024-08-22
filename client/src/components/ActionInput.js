import React, { useState } from 'react';

function ActionInput({ options, onSubmit }) {
  const [customAction, setCustomAction] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(customAction);
    setCustomAction('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((option, index) => (
          <button
            key={index}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition-colors duration-200 option_button"
            onClick={() => onSubmit(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 rounded-l focus:outline-none focus:ring-2 focus:ring-green-500 text-green-500"
          placeholder="What would you do next?"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-700 text-white rounded-r hover:bg-green-600 transition-colors duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default ActionInput;