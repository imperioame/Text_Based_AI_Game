import React from 'react';

function StoryDisplay({ story }) {
  return (
    <div className="bg-gray-800 p-4 rounded mb-4 h-64 overflow-y-auto">
      <p id="storyDisplay" className="whitespace-pre-wrap">{story}</p>
    </div>
  );
}

export default StoryDisplay;