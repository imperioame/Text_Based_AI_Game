import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startNewGame,
  submitAction,
  getAvailableModels,
  getUserGames,
  clearGameState,
  associateGameWithUser,
} from '../redux/gameSlice';
import { checkAuth } from '../redux/userSlice';
import Sidebar from './Sidebar';
import StoryDisplay from './StoryDisplay';
import ActionInput from './ActionInput';
import LoadingOverlay from './LoadingOverlay';

function Game() {
  const dispatch = useDispatch();
  const {
    title,
    conversationHistory,
    options,
    loading,
    error,
    availableModels,
    userGames,
    gameId,
    isStartingNewGame,
    isSubmittingAction,
  } = useSelector((state) => state.game);
  const { currentUser, token } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [backendMessages, setBackendMessages] = useState([]);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const messageTimeoutRef = useRef();
  const lastRequestRef = useRef(null);
  const initializationAttemptedRef = useRef(false);

  const addBackendMessage = useCallback((message, isError = false) => {
    const newMessage = { 
      id: Date.now(), 
      text: typeof message === 'string' ? message : JSON.stringify(message),
      isError 
    };
    setBackendMessages((prevMessages) => [...prevMessages, newMessage]);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setBackendMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== newMessage.id));
    }, 5000);
  }, []);


  const startNewGameHandler = useCallback(async (model) => {
    if (isStartingNewGame) return;
    setLoadingMessage('Starting a new game...');
    try {
      const action = await dispatch(startNewGame(model));
      if (action.error) {
        throw new Error(action.error.message || 'Failed to start new game');
      }
      const result = action.payload.data;
      console.log('Start new game result:', result);
      if (result && result.id) {
        if (token && currentUser) {
          await dispatch(associateGameWithUser({ gameId: result.id, userId: currentUser.id }));
          await dispatch(getUserGames());
        }
      } else {
        throw new Error('Invalid response from startNewGame');
      }
    } catch (error) {
      console.error('Failed to start new game:', error);
      addBackendMessage(error.message || 'An unexpected error occurred', true);
    } finally {
      setLoadingMessage('');
    }
  }, [dispatch, isStartingNewGame, token, currentUser, addBackendMessage]);

  useEffect(() => {
    const initializeGame = async () => {
      if (initializationAttemptedRef.current) return;
      initializationAttemptedRef.current = true;

      setIsInitializing(true);
      setLoadingMessage('Initializing game...');
      try {
        await dispatch(checkAuth());
        console.log('Auth checked');

        if (availableModels.length === 0) {
          const modelsAction = await dispatch(getAvailableModels());
          if (modelsAction.error) {
            throw new Error(modelsAction.error.message || 'Failed to get available models');
          }
          const modelsResult = modelsAction.payload;
          console.log('Available models:', modelsResult);

          if (modelsResult.length > 0) {
            setSelectedModel(modelsResult[0].name);
            console.log('Selected model:', modelsResult[0].name);

            await startNewGameHandler(modelsResult[0].name);
            console.log('New game started');
          } else {
            throw new Error('No AI models available');
          }
        }

        if (token && userGames.length === 0) {
          await dispatch(getUserGames());
          console.log('User games fetched');
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        addBackendMessage(`Failed to initialize game: ${error.message}`, true);
      } finally {
        setIsInitializing(false);
        setLoadingMessage('');
      }
    };

    initializeGame();
  }, [dispatch, token, startNewGameHandler, availableModels, userGames, addBackendMessage]);

  const handleActionSubmit = useCallback((action) => {
    if (!isSubmittingAction) {
      if (lastRequestRef.current) return;
      setLoadingMessage('Processing your action...');
      lastRequestRef.current = dispatch(submitAction(action));
      lastRequestRef.current.then(() => {
        lastRequestRef.current = null;
        setLoadingMessage('');
      });
    }
  }, [dispatch, isSubmittingAction]);

  const handleNewGame = useCallback(() => {
    if (selectedModel) {
      dispatch(clearGameState());
      startNewGameHandler(selectedModel);
    }
  }, [dispatch, selectedModel, startNewGameHandler]);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  useEffect(() => {
    if (error) addBackendMessage(error, true);
  }, [error, addBackendMessage]);

  return (
    <div className={`flex flex-col h-full ${sidebarPinned ? 'ml-64' : ''}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNewGame={handleNewGame}
        userGames={userGames}
        currentGameId={gameId}
        isPinned={sidebarPinned}
        onPin={() => setSidebarPinned(!sidebarPinned)}
      />
      {loadingMessage && <LoadingOverlay message={loadingMessage} />}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-800">
        <button
          className="px-4 py-2 bg-green-700 text-white rounded mb-2 md:mb-0"
          onClick={() => setSidebarOpen(true)}
        >
          Open Sidebar
        </button>
        <h1 className="text-2xl font-bold text-green-300 mb-2 md:mb-0">
          {title || 'New Adventure'}
        </h1>
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="px-4 py-2 bg-green-700 text-white rounded w-full md:w-auto"
        >
          {availableModels.map((model) => (
            <option key={model.name} value={model.name}>{model.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-grow overflow-hidden">
        <StoryDisplay 
          conversationHistory={conversationHistory} 
          loading={loading} 
        />
      </div>
      <div className="p-4 bg-gray-800">
        <ActionInput 
          options={options} 
          onSubmit={handleActionSubmit} 
          disabled={loading || isInitializing} 
        />
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        {backendMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg ${
              message.isError ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {message.isError ? '❗ ' : 'ℹ️ '}
            {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Game;