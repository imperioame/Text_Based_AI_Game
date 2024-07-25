// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Game from './pages/Game';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4">
          <Switch>
            <Route exact path="/" component={Game} />
            <Route path="/game/:id" component={Game} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;