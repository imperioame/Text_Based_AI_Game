import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Game from './components/Game';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="crt-screen h-full">
          <div className="flex flex-col h-full bg-gray-900">
            <div className="flex-grow overflow-auto h-full">
              <Routes>
                <Route path="/" element={<Game />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
        <div className="crt-frame"></div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;