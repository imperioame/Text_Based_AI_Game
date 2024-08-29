import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startNewGame, submitAction, getAvailableModels } from '../redux/gameSlice';
import Sidebar from './Sidebar';
import StoryDisplay from './StoryDisplay';
import ActionInput from './ActionInput';

function Game() {
  const dispatch = useDispatch();
  const { conversationHistory, options, loading, error, availableModels } = useSelector((state) => state.game);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [backendMessages, setBackendMessages] = useState([]);
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const modelsResult = await dispatch(getAvailableModels()).unwrap();
        if (modelsResult.length > 0) {
          setSelectedModel(modelsResult[0].name);
          await dispatch(startNewGame(modelsResult[0].name)).unwrap();
        } else {
          setSelectedModel('');
          addBackendMessage('No models available', true);
        }
      } catch (error) {
        addBackendMessage(error.message, true);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeGame();
  }, [dispatch]);

  const handleActionSubmit = useCallback((action) => {
    dispatch(submitAction(action));
  }, [dispatch]);

  const handleNewGame = useCallback(() => {
    dispatch(startNewGame(selectedModel));
  }, [dispatch, selectedModel]);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const addBackendMessage = (message, isError = false) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      isError,
    };
    setBackendMessages((prevMessages) => [...prevMessages, newMessage]);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setBackendMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== newMessage.id));
    }, 5000);
  };

  useEffect(() => {
    if (error) {
      addBackendMessage(error, true);
    }
  }, [error]);

  return (
    <div className="flex h-full">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNewGame={handleNewGame}
        isPinned={sidebarPinned}
        onPin={() => setSidebarPinned(!sidebarPinned)}
      />
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className="px-4 py-2 bg-green-700 text-white rounded"
            onClick={() => setSidebarOpen(true)}
          >
            Open Sidebar
          </button>
          <h1 className="text-2xl font-bold text-green-300">
            {conversationHistory[0]?.content.split('\n')[0] || 'Your Adventure'}
          </h1>
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="px-4 py-2 bg-green-700 text-white rounded"
          >
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>{model.name}</option>
            ))}
          </select>
        </div>
        {isInitializing ? (
          <div className="flex-1 flex items-center justify-center">
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