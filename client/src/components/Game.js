import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startNewGame, continueGame, submitAction } from '../redux/gameSlice';
import Sidebar from './Sidebar';
import StoryDisplay from './StoryDisplay';
import ActionInput from './ActionInput';

function Game() {
  const dispatch = useDispatch();
  const { currentStory, options, gameState } = useSelector((state) => state.game);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(startNewGame());
    setLoading(false);
  }, [dispatch]);

  const handleActionSubmit = (action) => {
    dispatch(submitAction(action));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewGame={() => dispatch(startNewGame())} />
      <div className="flex-1 justify-center">
        <button
          className="mb-4 px-4 py-2 bg-green-700 text-white rounded"
          onClick={() => setSidebarOpen(true)}
        >
          Open Sidebar
        </button>
        <StoryDisplay story={currentStory} />
        <ActionInput options={options} onSubmit={handleActionSubmit} />
      </div>
    </div>
  );
}

export default Game;