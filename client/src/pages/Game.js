// client/src/pages/Game.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { startNewGame, continueGame, submitAction } from '../redux/gameSlice';
import StoryDisplay from '../components/StoryDisplay';
import ActionInput from '../components/ActionInput';

function Game() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentStory, options, gameState } = useSelector((state) => state.game);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(continueGame(id));
    } else {
      dispatch(startNewGame());
    }
    setLoading(false);
  }, [dispatch, id]);

  const handleActionSubmit = (action) => {
    dispatch(submitAction(action));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StoryDisplay story={currentStory} />
      <ActionInput options={options} onSubmit={handleActionSubmit} />
    </div>
  );
}

export default Game;