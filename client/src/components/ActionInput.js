import React, { useState } from 'react';

function ActionInput({ options, onSubmit }) {
  const [customAction, setCustomAction] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(customAction);
    setCustomAction('');
  };

  return (
    <div>
      <div className="mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            className="mr-2 mb-2 px-4 py-2 bg-green-700 text-white rounded option_button"
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
          className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l"
          placeholder="Enter your action..."
        />
        <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-r">
          Submit
        </button>
      </form>
    </div>
  );
}

export default ActionInput;