import React, { useRef, useEffect, useState } from 'react';

function StoryDisplay({ conversationHistory, loading, loadTime }) {
  const storyDisplayRef = useRef(null);
  const [animatedText, setAnimatedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && conversationHistory.length > 0) {
      const lastEntry = conversationHistory[conversationHistory.length - 1];
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < lastEntry.content.length) {
          setAnimatedText(prev => prev + lastEntry.content[i]);
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, 30);
      return () => clearInterval(intervalId);
    }
  }, [loading, conversationHistory]);

  useEffect(() => {
    if (storyDisplayRef.current) {
      storyDisplayRef.current.scrollTop = storyDisplayRef.current.scrollHeight;
    }
  }, [animatedText]);

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 flex items-center">
        {loading && (
          <>
            <div className="vintage-spinner mr-2"></div>
            <div className="vintage-loadbar mr-2" style={{width: `${(loadTime / 5000) * 100}%`}}></div>
          </>
        )}
      </div>
      <div ref={storyDisplayRef} className="bg-gray-800 p-4 rounded mb-4 h-64 overflow-y-auto font-mono">
        {conversationHistory.slice(0, -1).map((entry, index) => (
          <p
            key={index}
            className={`mb-2 ${entry.type === 'ai' ? 'text-green-300' : 'text-blue-300'}`}
          >
            {entry.type === 'user' ? entry.content.replace(/^\d+\.\s*/, '') : entry.content}
          </p>
        ))}
        <p className={`mb-2 ${loading ? 'text-yellow-300' : conversationHistory[conversationHistory.length - 1]?.type === 'ai' ? 'text-green-300' : 'text-blue-300'}`}>
          {animatedText}
          {showCursor && <span className="vintage-cursor">█</span>}
          {loading && <span className="vintage-ellipsis">...</span>}
        </p>
      </div>
    </div>
  );
}

export default StoryDisplay;