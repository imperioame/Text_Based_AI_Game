import React, { useRef, useEffect, useState } from 'react';

function StoryDisplay({ conversationHistory, loading, loadTime }) {
  const storyDisplayRef = useRef(null);
  const [animatedText, setAnimatedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log('StoryDisplay received:', { conversationHistory, loading, loadTime });
  }, [conversationHistory, loading, loadTime]);

  useEffect(() => {
    if (conversationHistory.length > 0 && !isAnimating) {
      const lastEntry = conversationHistory[conversationHistory.length - 1];
      setIsAnimating(true);
      setAnimatedText('');
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < lastEntry.content.length) {
          setAnimatedText(prev => prev + lastEntry.content[i]);
          i++;
        } else {
          clearInterval(intervalId);
          setIsAnimating(false);
        }
      }, 30);
      return () => clearInterval(intervalId);
    }
  }, [conversationHistory, isAnimating]);

  useEffect(() => {
    if (storyDisplayRef.current) {
      storyDisplayRef.current.scrollTop = storyDisplayRef.current.scrollHeight;
    }
  }, [animatedText]);

  if (!conversationHistory || conversationHistory.length === 0) {
    return <div>No story to display yet.</div>;
  }

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
        {conversationHistory.map((entry, index) => (
          <p
            key={index}
            className={`mb-2 ${entry.type === 'ai' ? 'text-green-300' : 'text-blue-300'}`}
          >
            {entry.content}
            {loading && index === conversationHistory.length - 1 && (
              <span className="vintage-ellipsis"></span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

export default React.memo(StoryDisplay);