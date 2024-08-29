import React, { useRef, useEffect, useState, useCallback } from 'react';

function StoryDisplay({ conversationHistory, loading }) {
  const storyDisplayRef = useRef(null);
  const [animatedHistory, setAnimatedHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  const animateText = useCallback((text, index) => {
    return new Promise((resolve) => {
      if (skipAnimation) {
        setAnimatedHistory(prev => {
          const newHistory = [...prev];
          newHistory[index] = { type: 'ai', content: text };
          return newHistory;
        });
        resolve();
        return;
      }

      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setAnimatedHistory(prev => {
            const newHistory = [...prev];
            if (!newHistory[index]) {
              newHistory[index] = { type: 'ai', content: '' };
            }
            newHistory[index].content = text.substring(0, i + 1);
            return newHistory;
          });
          i++;
        } else {
          clearInterval(intervalId);
          resolve();
        }
      }, 30);
    });
  }, [skipAnimation]);

  useEffect(() => {
    const animateNewEntries = async () => {
      if (!isAnimating && conversationHistory.length > animatedHistory.length) {
        setIsAnimating(true);
        for (let i = animatedHistory.length; i < conversationHistory.length; i++) {
          const entry = conversationHistory[i];
          if (entry.type === 'ai') {
            await animateText(entry.content, i);
          } else {
            setAnimatedHistory(prev => [...prev, entry]);
          }
        }
        setIsAnimating(false);
        setSkipAnimation(false);
      }
    };

    animateNewEntries();
  }, [conversationHistory, animatedHistory, isAnimating, animateText]);

  useEffect(() => {
    if (storyDisplayRef.current) {
      storyDisplayRef.current.scrollTop = storyDisplayRef.current.scrollHeight;
    }
  }, [animatedHistory]);

  const handleSkipAnimation = () => {
    setSkipAnimation(true);
    setAnimatedHistory(conversationHistory);
    setIsAnimating(false);
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      <div ref={storyDisplayRef} className="h-full overflow-y-auto font-mono p-4">
        {animatedHistory.map((entry, index) => (
          <p
            key={index}
            className={`mb-2 ${entry.type === 'ai' ? 'text-green-300' : 'text-blue-300'}`}
          >
            {entry.content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
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
          onClick={handleSkipAnimation}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Skip Animation
        </button>
      )}
    </div>
  );
}

export default React.memo(StoryDisplay);