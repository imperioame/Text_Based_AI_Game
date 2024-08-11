import React from 'react';

function StoryDisplay({ story }) {
  return (
    <div className="bg-gray-800 p-4 rounded mb-4 h-64 overflow-y-auto">
      <p id="storyDisplay" dangerouslySetInnerHTML={{ __html: story.replace(/\n/g, '<br>') }} />
    </div>
  );
}

export default StoryDisplay;