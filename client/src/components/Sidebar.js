import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userSlice';
import LoginRegister from './LoginRegister';
import { getUserGames } from '../redux/userSlice'; // Assuming you've added this action to gameSlice

function Sidebar({ isOpen, onClose, onNewGame, isPinned, onPin }) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { userGames } = useSelector((state) => state.game);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (currentUser) {
      dispatch(getUserGames());
    }
  }, [currentUser, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowUserMenu(false);
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 transform ${isOpen || isPinned ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out drop-shadow-lg backdrop-blur-lg ${isPinned ? 'z-50' : 'z-40'}`}
      onMouseLeave={() => !isPinned && onClose()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-300">Your Adventures</h2>
        <button 
          className={`text-green-300 hover:text-green-200 ${isPinned ? 'opacity-100' : 'opacity-50'}`}
          onClick={onPin}
        >
          📌
        </button>
      </div>
      <button className="w-full px-4 py-2 bg-green-700 text-white rounded mb-4" onClick={onNewGame}>
        Start New Game
      </button>
      {currentUser ? (
        <div className="mb-4">
          <div 
            className="flex justify-between items-center cursor-pointer text-green-300 hover:text-green-200"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span>{currentUser.username}</span>
            <span>{showUserMenu ? '▲' : '▼'}</span>
          </div>
          {showUserMenu && (
            <div className="mt-2 space-y-2">
              <button 
                className="w-full text-left text-green-300 hover:text-green-200"
                onClick={handleLogout}
              >
                Logout
              </button>
              {/* Add more user options here */}
            </div>
          )}
        </div>
      ) : (
        <LoginRegister />
      )}
      {currentUser && userGames && userGames.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-green-300 mb-2">Your Games</h3>
          <ul className="space-y-2">
            {userGames.map((game) => (
              <li key={game.publicId} className="text-green-300 hover:text-green-200 cursor-pointer">
                {game.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Sidebar;