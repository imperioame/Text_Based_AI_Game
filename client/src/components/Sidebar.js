// client/src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Sidebar() {
  const { savedGames } = useSelector((state) => state.game);

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Your Adventures</h2>
        <Link to="/" className="block mb-2 text-blue-600 hover:underline">
          Start New Adventure
        </Link>
        <ul>
          {savedGames.map((game) => (
            <li key={game.id}>
              <Link to={`/game/${game.id}`} className="block py-2 hover:bg-gray-100">
                {game.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;