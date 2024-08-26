import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Game from './components/Game';

function App() {
  return (
    <Router>
      <div className="p-16 rounded-xl h-full bg-gray-900 text-indigo-300">
        <Routes>
          <Route path="/" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;