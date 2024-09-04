import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startNewGame,
  submitAction,
  getAvailableModels,
  getUserGames,
  clearGameState,
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

  const messageTimeoutRef = React.useRef();
  const lastRequestRef = React.useRef(null);
  const initializeGameRef = React.useRef(null);


  useEffect(() => {
    const initializeGame = async () => {
      if (initializeGameRef.current) return;
      initializeGameRef.current = true;

      try {
        await dispatch(checkAuth()).unwrap();
        const modelsResult = await dispatch(getAvailableModels()).unwrap();
        if (modelsResult.length > 0) {
          setSelectedModel(modelsResult[0].name);
          // Automatically start a new game with the first available model
          await startNewGameHandler(modelsResult[0].name);
        }

        if (token) {
          await dispatch(getUserGames()).unwrap();
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        addBackendMessage('Failed to initialize game. Please try again.', true);
      } finally {
        setIsInitializing(false);
        initializeGameRef.current = false;
      }
    };

    initializeGame();
  }, [dispatch, token, startNewGameHandler]);

  const handleActionSubmit = useCallback((action) => {
    if (!isSubmittingAction) {
      if (lastRequestRef.current) return;
      setLoadingMessage('Processing your action...');
      lastRequestRef.current = dispatch(submitAction(action));
      lastRequestRef.current.then(() => {
        lastRequestRef.current = null;
        setLoadingMessage('');
      });
  }}, [dispatch]);

  const startNewGameHandler = useCallback(async (model) => {
    if (isStartingNewGame) return;
    setLoadingMessage('Starting a new game...');
    try {
      await dispatch(startNewGame(model)).unwrap();
      if (token) {
        await dispatch(getUserGames()).unwrap();
      }
    } catch (error) {
      console.error('Failed to start new game:', error);
      addBackendMessage('Failed to start a new game. Please try again.', true);
    } finally {
      setLoadingMessage('');
    }
  }, [dispatch, isStartingNewGame, token]);

  const handleNewGame = useCallback(() => {
    if (selectedModel) {
      dispatch(clearGameState());
      startNewGameHandler(selectedModel);
    }
  }, [dispatch, selectedModel, startNewGameHandler]);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const addBackendMessage = useCallback((message, isError = false) => {
    const newMessage = { id: Date.now(), text: message, isError };
    setBackendMessages((prevMessages) => [...prevMessages, newMessage]);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setBackendMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== newMessage.id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (error) addBackendMessage(error, true);
  }, [error, addBackendMessage]);

  return (
    <div className={`flex flex-col h-screen ${sidebarPinned ? 'ml-64' : ''}`}>
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
      {isInitializing ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="vintage-spinner mb-4"></div>
              <p className="text-green-300">Loading your adventure...</p>
            </div>
          </div>
        ) : (
          <StoryDisplay 
            conversationHistory={conversationHistory} 
            loading={loading} 
          />
        )}
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