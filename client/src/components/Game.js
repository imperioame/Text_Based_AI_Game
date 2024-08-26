import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startNewGame, submitAction } from '../redux/gameSlice';
import Sidebar from './Sidebar';
import StoryDisplay from './StoryDisplay';
import ActionInput from './ActionInput';

function Game() {
  console.log('Game component rendering');
  const dispatch = useDispatch();
  const { conversationHistory, options, loading, loadTime, error } = useSelector((state) => state.game);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect in Game component triggered');
    dispatch(startNewGame())
      .then(() => {
        console.log('startNewGame action completed');
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error starting new game:', error);
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    console.log('Game state updated:', { conversationHistory, options, loading, loadTime, error });
  }, [conversationHistory, options, loading, loadTime, error]);

  const handleActionSubmit = useCallback((action) => {
    console.log('Action submitted:', action);
    dispatch(submitAction(action));
  }, [dispatch]);

  const handleNewGame = useCallback(() => {
    console.log('New game requested');
    dispatch(startNewGame());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNewGame={handleNewGame} 
      />
      <div className="flex-1 justify-center">
        <button
          className="mb-4 px-4 py-2 bg-green-700 text-white rounded"
          onClick={() => setSidebarOpen(true)}
        >
          Open Sidebar
        </button>
        <StoryDisplay 
          conversationHistory={conversationHistory} 
          loading={loading} 
          loadTime={loadTime} 
        />
        <ActionInput 
          options={options} 
          onSubmit={handleActionSubmit} 
          disabled={loading} 
        />
      </div>
    </div>
  );
}

export default React.memo(Game);