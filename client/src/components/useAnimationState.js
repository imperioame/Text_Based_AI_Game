import { useState, useCallback, useRef } from 'react';

function useAnimationState(initialHistory) {
  const [animatedHistory, setAnimatedHistory] = useState(initialHistory);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationQueue = useRef([]);
  const cancelAnimation = useRef(() => {});

  const processNextAnimation = () => {
    if (animationQueue.current.length === 0) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const { entry, index, resolve } = animationQueue.current.shift();
    let i = 0;
    const intervalId = setInterval(() => {
      if (i <= entry.content.length) {
        setAnimatedHistory(prev => prev.map((e, j) => 
          j === index ? { ...e, content: entry.content.substring(0, i) } : e
        ));
        i++;
      } else {
        clearInterval(intervalId);
        resolve();
        processNextAnimation();
      }
    }, 30);

    cancelAnimation.current = () => {
      clearInterval(intervalId);
      setAnimatedHistory(prev => prev.map((e, j) => 
        j === index ? { ...e, content: entry.content } : e
      ));
      resolve();
      processNextAnimation();
    };
  };

  const queueAnimation = useCallback((entry, index) => {
    return new Promise((resolve) => {
      animationQueue.current.push({ entry, index, resolve });
      if (!isAnimating) {
        processNextAnimation();
      }
    });
  }, [isAnimating]);

  const skipAnimation = useCallback(() => {
    cancelAnimation.current();
    animationQueue.current.forEach(({ entry, index, resolve }) => {
      setAnimatedHistory(prev => prev.map((e, j) => 
        j === index ? { ...e, content: entry.content } : e
      ));
      resolve();
    });
    animationQueue.current = [];
    setIsAnimating(false);
  }, []);

  return {
    animatedHistory,
    isAnimating,
    queueAnimation,
    skipAnimation,
    setAnimatedHistory
  };
}

export default useAnimationState;