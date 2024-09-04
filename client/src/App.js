import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Game from './components/Game';
import Footer from './components/Footer';


function App() {
  return (
    <Router>
      <div className="crt-screen">
        <div className="flex flex-col h-screen bg-gray-900">
          <div className="flex-grow overflow-auto">
            <Routes>
              <Route path="/" element={<Game />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
      <div className="crt-frame"></div>
    </Router>
  );
}

export default App;