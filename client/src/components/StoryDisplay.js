import React, { useRef, useEffect } from 'react';
import useAnimationState from './useAnimationState';

function StoryDisplay({ conversationHistory, loading }) {
  const storyDisplayRef = useRef(null);
  const {
    animatedHistory,
    isAnimating,
    queueAnimation,
    skipAnimation,
    setAnimatedHistory
  } = useAnimationState([]);

  useEffect(() => {
    const animateNewEntries = async () => {
      if (conversationHistory.length === 0) {
        setAnimatedHistory([]);
        return;
      }
      
      for (let i = animatedHistory.length; i < conversationHistory.length; i++) {
        const entry = conversationHistory[i];
        setAnimatedHistory(prev => [...prev, { ...entry, content: '' }]);
        if (entry.type === 'ai') {
          await queueAnimation(entry, i);
        } else {
          setAnimatedHistory(prev => prev.map((e, j) => 
            j === i ? { ...e, content: entry.content } : e
          ));
        }
      }
    };

    if (Array.isArray(conversationHistory)) {
      animateNewEntries();
    }
  }, [conversationHistory, animatedHistory, queueAnimation, setAnimatedHistory]);

  useEffect(() => {
    if (storyDisplayRef.current) {
      storyDisplayRef.current.scrollTop = storyDisplayRef.current.scrollHeight;
    }
  }, [animatedHistory]);

  return (
    <div className="h-full overflow-hidden relative">
      <div ref={storyDisplayRef} className="h-full overflow-y-auto font-mono p-4">
        {animatedHistory.map((entry, index) => (
          <p
            key={`${entry.type}-${index}`}
            className={`mb-2 ${entry.type === 'ai' ? 'text-green-300' : 'text-blue-300'}`}
          >
            {entry.content.split('\n').map((line, i) => (
              <React.Fragment key={`${entry.type}-${index}-${i}`}>
                {line}
                {i < entry.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ))}
        {loading && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-300"></div>
          </div>
        )}
      </div>
      {isAnimating && (
        <button
          onClick={skipAnimation}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Skip Animation
        </button>
      )}
    </div>
  );
}

export default React.memo(StoryDisplay);